import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

export type GpsStatus = 'CHECKING' | 'ACTIVE' | 'STALE' | 'PERMISSION_DENIED';

// Poll every 2s to actively detect GPS toggle changes
const GPS_POLL_INTERVAL_MS = 2_000;
const GPS_POLL_TIMEOUT_MS  = 1_500;

/**
 * useLocationTracking
 *
 * GPS monitoring is ALWAYS active regardless of isOnline.
 * Location data (socket + API) is only sent to the backend when isOnline = true.
 *
 * This separates two independent concerns:
 *   1. GPS availability (always monitored → badge color/text)
 *   2. Dispatch presence (only when driver goes AVAILABLE)
 */
export const useLocationTracking = (isOnline: boolean) => {
  const watchId    = useRef<number | null>(null);
  const pollTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('CHECKING');

  const prevStatusRef = useRef<GpsStatus>('CHECKING');
  // Keep live ref of isOnline to avoid stale closure inside watchPosition callback
  const isOnlineRef = useRef(isOnline);
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  /* ─── Status helper ──────────────────────────────────────────────────── */
  const updateStatus = (next: GpsStatus) => {
    if (prevStatusRef.current !== next) {
      console.log(`[GPS] ${prevStatusRef.current} → ${next}`);
      prevStatusRef.current = next;
      setGpsStatus(next);
    }
  };

  /* ─── Active poll: instantly detects GPS icon toggle ─────────────────── */
  const pollGps = () => {
    Geolocation.getCurrentPosition(
      () => {
        // GPS is on → watchPosition drives ACTIVE; here we only un-stale
        if (prevStatusRef.current === 'STALE') {
          updateStatus('ACTIVE');
        }
      },
      (err) => {
        if (err.code === 1) {
          updateStatus('PERMISSION_DENIED');
        } else {
          // code 2 (GPS off) or 3 (timeout) → signal lost
          updateStatus('STALE');
        }
      },
      { enableHighAccuracy: true, timeout: GPS_POLL_TIMEOUT_MS, maximumAge: 0 }
    );
  };

  const startPoll = () => {
    if (pollTimer.current) return;
    pollTimer.current = setInterval(pollGps, GPS_POLL_INTERVAL_MS);
  };

  const stopPoll = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  /* ─── Mount: start GPS monitoring immediately, always ────────────────── */
  useEffect(() => {
    requestPermissionAndStart();
    return () => {
      stopPoll();
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  /* ─── Permission & startup ───────────────────────────────────────────── */
  const requestPermissionAndStart = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Atlas Driver needs your location to receive ride requests.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        updateStatus('PERMISSION_DENIED');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location access in your phone settings to use Atlas Driver.'
        );
        return;
      }
    }

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    // Start availability polling immediately
    pollGps();
    startPoll();

    // watchPosition: runs always, but only forwards data when driver is AVAILABLE
    watchId.current = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        updateStatus('ACTIVE');

        // ── Only send to backend when the driver has gone AVAILABLE ──────
        if (!isOnlineRef.current) return;

        // 1. Real-time dispatch (socket)
        socketService.sendLocation(latitude, longitude);

        // 2. REST persistence
        try {
          await api.post('/driver/location', { latitude, longitude });
        } catch (err) {
          console.log('[GPS] Location API update failed:', err);
        }
      },
      (error) => {
        console.warn('[GPS] watchPosition error:', error.code, error.message);
        updateStatus(error.code === 1 ? 'PERMISSION_DENIED' : 'STALE');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  return { location, gpsStatus };
};
