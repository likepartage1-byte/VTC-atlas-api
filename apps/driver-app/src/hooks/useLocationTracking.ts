import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

export type GpsStatus = 'OFF' | 'ACTIVE' | 'STALE' | 'PERMISSION_DENIED';

// If no position update arrives within this window, GPS is considered stale/disabled
const GPS_STALENESS_TIMEOUT_MS = 15_000;

export const useLocationTracking = (isOnline: boolean) => {
  const watchId = useRef<number | null>(null);
  const stalenessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('OFF');
  const prevStatusRef = useRef<GpsStatus>('OFF');

  const updateStatus = (newStatus: GpsStatus) => {
    if (prevStatusRef.current !== newStatus) {
      console.log(`[GPS] Status: ${prevStatusRef.current} → ${newStatus}`);
      prevStatusRef.current = newStatus;
      setGpsStatus(newStatus);
    }
  };

  const clearStalenessTimer = () => {
    if (stalenessTimer.current) {
      clearTimeout(stalenessTimer.current);
      stalenessTimer.current = null;
    }
  };

  /**
   * Arm a staleness timer. Each time a fresh position arrives it is reset.
   * If it fires it means GPS stopped sending updates (user disabled it).
   */
  const armStalenessTimer = () => {
    clearStalenessTimer();
    stalenessTimer.current = setTimeout(() => {
      console.warn('[GPS] No position update received — GPS likely disabled');
      updateStatus('STALE');
    }, GPS_STALENESS_TIMEOUT_MS);
  };

  useEffect(() => {
    if (isOnline) {
      requestAndStartTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [isOnline]);

  const requestAndStartTracking = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Atlas Driver needs access to your location to dispatch rides.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('⚠️ [Location] Permission denied');
        updateStatus('PERMISSION_DENIED');
        Alert.alert(
          'Location Permission Denied',
          'Atlas Driver requires location permission to work. Please enable it in your phone settings.'
        );
        return;
      }
    }
    startTracking();
  };

  const startTracking = () => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    // Arm the first staleness check immediately
    armStalenessTimer();

    watchId.current = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Got a fresh fix — reset the stale timer and mark as active
        armStalenessTimer();
        updateStatus('ACTIVE');

        // 1. Real-time dispatch via socket
        socketService.sendLocation(latitude, longitude);

        // 2. Persist to REST API
        try {
          await api.post('/driver/location', { latitude, longitude });
        } catch (err) {
          console.log('[GPS] Location API update failed:', err);
        }
      },
      (error) => {
        console.warn('⚠️ [Location Error]', error.code, error.message);
        clearStalenessTimer();
        if (error.code === 1) {
          updateStatus('PERMISSION_DENIED');
          Alert.alert(
            'Permissions Required',
            'Location permission was revoked. Please re-enable it in your settings.'
          );
        } else {
          // code 2 = POSITION_UNAVAILABLE, code 3 = TIMEOUT
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

  const stopTracking = () => {
    clearStalenessTimer();
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    updateStatus('OFF');
  };

  return { location, gpsStatus };
};
