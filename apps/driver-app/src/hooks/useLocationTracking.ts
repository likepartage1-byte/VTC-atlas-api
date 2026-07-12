import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

// ── Types ─────────────────────────────────────────────────────────────────────
export type GpsStatus        = 'SEARCHING' | 'ON' | 'OFF';
export type PermissionStatus = 'UNKNOWN'   | 'GRANTED' | 'DENIED';

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS  = 1_500;

/**
 * useLocationTracking
 *
 * Single Responsibility: GPS hardware & permission state only.
 *
 * Returns:
 *   gpsStatus        – is the GPS hardware providing fixes?
 *   permissionStatus – has the user granted location access?
 *   location         – last known coordinates
 *   lastUpdate       – timestamp of last GPS fix (null if none yet)
 *
 * Side-effects:
 *   Forwards location to socket + REST only when `isOnline` = true.
 *   GPS monitoring itself is ALWAYS active regardless of `isOnline`.
 */
export const useLocationTracking = (isOnline: boolean) => {
  const watchId   = useRef<number | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnlineRef = useRef(isOnline);

  const [location,          setLocation]          = useState<{ latitude: number; longitude: number } | null>(null);
  const [lastUpdate,        setLastUpdate]         = useState<Date | null>(null);
  const [gpsStatus,         setGpsStatus]          = useState<GpsStatus>('SEARCHING');
  const [permissionStatus,  setPermissionStatus]   = useState<PermissionStatus>('UNKNOWN');

  const prevGpsRef = useRef<GpsStatus>('SEARCHING');

  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);

  /* ── GPS status setter (deduplicated) ───────────────────────────────── */
  const setGps = (next: GpsStatus) => {
    if (prevGpsRef.current !== next) {
      console.log(`[GPS] ${prevGpsRef.current} → ${next}`);
      prevGpsRef.current = next;
      setGpsStatus(next);
    }
  };

  /* ── Active poll: detects GPS icon toggle within POLL_INTERVAL_MS ───── */
  const pollGps = () => {
    Geolocation.getCurrentPosition(
      () => { if (prevGpsRef.current === 'OFF') setGps('ON'); },
      (err) => {
        if (err.code === 1) {
          setPermissionStatus('DENIED');
          setGps('OFF');
        } else {
          setGps('OFF'); // code 2 = GPS disabled, code 3 = timeout
        }
      },
      { enableHighAccuracy: true, timeout: POLL_TIMEOUT_MS, maximumAge: 0 }
    );
  };

  /* ── Lifecycle ────────────────────────────────────────────────────────── */
  useEffect(() => {
    requestPermissionAndStart();
    return () => {
      if (pollTimer.current)  clearInterval(pollTimer.current);
      if (watchId.current !== null) Geolocation.clearWatch(watchId.current);
    };
  }, []);

  /* ── Permission request ───────────────────────────────────────────────── */
  const requestPermissionAndStart = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Atlas Driver needs your location to receive ride requests.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      setPermissionStatus(granted ? 'GRANTED' : 'DENIED');
      if (!granted) {
        setGps('OFF');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location access in your system settings to receive ride requests.'
        );
        return;
      }
    } else {
      setPermissionStatus('GRANTED');
    }
    startTracking();
  };

  /* ── watchPosition: continuous updates ───────────────────────────────── */
  const startTracking = () => {
    Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: 'always' });

    pollGps();
    pollTimer.current = setInterval(pollGps, POLL_INTERVAL_MS);

    watchId.current = Geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLastUpdate(new Date());
        setGps('ON');

        // ── Forward to backend ONLY when the driver is AVAILABLE ──────
        if (!isOnlineRef.current) return;
        socketService.sendLocation(latitude, longitude);
        try { await api.post('/driver/location', { latitude, longitude }); }
        catch (e) { console.log('[GPS] REST update failed:', e); }
      },
      (err) => {
        console.warn('[GPS] watchPosition error:', err.code, err.message);
        setGps(err.code === 1 ? 'OFF' : 'OFF');
        if (err.code === 1) setPermissionStatus('DENIED');
      },
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
    );
  };

  return { location, lastUpdate, gpsStatus, permissionStatus };
};
