import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

export type GpsStatus = 'OFF' | 'ACTIVE' | 'DISABLED' | 'PERMISSION_DENIED';

export const useLocationTracking = (isOnline: boolean) => {
  const watchId = useRef<number | null>(null);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('OFF');

  // Track status ref to avoid alert loops in callbacks
  const prevStatusRef = useRef<GpsStatus>('OFF');

  const updateStatus = (newStatus: GpsStatus) => {
    if (prevStatusRef.current !== newStatus) {
      console.log(`[GPS] Status transition: ${prevStatusRef.current} -> ${newStatus}`);
      prevStatusRef.current = newStatus;
      setGpsStatus(newStatus);
    }
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
        console.warn('⚠️ [Location] Permission denied — GPS tracking disabled');
        updateStatus('PERMISSION_DENIED');
        Alert.alert(
          'Location Permission Denied',
          'Atlas Driver requires location permissions to work. Please grant permission in your system settings.'
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

    watchId.current = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update local state
        setLocation({ latitude, longitude });

        // If transitioning into ACTIVE from an error state, show a clean alert/log
        if (prevStatusRef.current !== 'ACTIVE') {
          console.log('[GPS] Connected successfully');
        }
        updateStatus('ACTIVE');

        // 1. Send to Socket for real-time dispatching
        socketService.sendLocation(latitude, longitude);

        // 2. Persist to API periodically
        try {
          await api.post('/driver/location', { latitude, longitude });
        } catch (error) {
          console.log('Location API update failed', error);
        }
      },
      (error) => {
        console.warn('⚠️ [Location Error]:', error.message, 'Code:', error.code);
        
        if (error.code === 1) { // PERMISSION_DENIED
          updateStatus('PERMISSION_DENIED');
          Alert.alert(
            'Permissions Required',
            'Location permission is not granted. Please go to settings and allow location access.'
          );
        } else if (error.code === 2) { // POSITION_UNAVAILABLE (GPS turned off)
          const wasDisabled = prevStatusRef.current === 'DISABLED';
          updateStatus('DISABLED');
          if (!wasDisabled) {
            Alert.alert(
              'GPS Disabled',
              'Your location services are currently turned off. Please turn on GPS/Location services to receive ride requests.'
            );
          }
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
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    updateStatus('OFF');
  };

  return { location, gpsStatus };
};
