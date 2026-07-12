import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

export type GpsStatus = 'OFF' | 'ACTIVE' | 'STALE' | 'PERMISSION_DENIED';

// How often (ms) we actively ping getCurrentPosition to detect GPS toggle
const GPS_POLL_INTERVAL_MS = 2_000;
// Quick timeout for the poll — if GPS is off, it fails fast
const GPS_POLL_TIMEOUT_MS  = 1_500;

export const useLocationTracking = (isOnline: boolean) => {
  const watchId       = useRef<number | null>(null);
  const pollTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('OFF');
  const prevStatusRef = useRef<GpsStatus>('OFF');

  const updateStatus = (next: GpsStatus) => {
    if (prevStatusRef.current !== next) {
      console.log(`[GPS] ${prevStatusRef.current} → ${next}`);
      prevStatusRef.current = next;
      setGpsStatus(next);
    }
  };

  /* ── Polling: called every GPS_POLL_INTERVAL_MS ─────────────────────── */
  const pollGpsAvailability = () => {
    Geolocation.getCurrentPosition(
      () => {
        // GPS responded → it is ON. watchPosition callback drives ACTIVE status.
        // Only un-stale here if we were stale (GPS was re-enabled).
        if (prevStatusRef.current === 'STALE') {
          console.log('[GPS] GPS restored — resuming watch');
          updateStatus('ACTIVE');
        }
      },
      (err) => {
        if (err.code === 1) {
          updateStatus('PERMISSION_DENIED');
        } else {
          // code 2 = POSITION_UNAVAILABLE (GPS off), code 3 = TIMEOUT
          updateStatus('STALE');
        }
      },
      { enableHighAccuracy: true, timeout: GPS_POLL_TIMEOUT_MS, maximumAge: 0 }
    );
  };

  const startPoll = () => {
    if (pollTimer.current) return;
    pollTimer.current = setInterval(pollGpsAvailability, GPS_POLL_INTERVAL_MS);
  };

  const stopPoll = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  /* ── Effect: start/stop on availability toggle ───────────────────────── */
  useEffect(() => {
    if (isOnline) {
      requestAndStartTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [isOnline]);

  /* ── Permission request ───────────────────────────────────────────────── */
  const requestAndStartTracking = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Atlas Driver needs your location to dispatch rides.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        updateStatus('PERMISSION_DENIED');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location permission in your phone settings to receive ride requests.'
        );
        return;
      }
    }
    startTracking();
  };

  /* ── watchPosition: continuous high-accuracy stream ─────────────────── */
  const startTracking = () => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    // Start the GPS-availability poll immediately
    pollGpsAvailability();
    startPoll();

    watchId.current = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        updateStatus('ACTIVE');

        // 1. Real-time socket dispatch
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
        if (error.code === 1) {
          updateStatus('PERMISSION_DENIED');
        } else {
          updateStatus('STALE');
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  /* ── Cleanup ─────────────────────────────────────────────────────────── */
  const stopTracking = () => {
    stopPoll();
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    updateStatus('OFF');
  };

  return { location, gpsStatus };
};
