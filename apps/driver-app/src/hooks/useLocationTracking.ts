import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../services/socket.service';
import { api } from '../api/axios.instance';

export const useLocationTracking = (isOnline: boolean) => {
  const watchId = useRef<number | null>(null);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    if (isOnline) {
      requestAndStartTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isOnline]);

  const requestAndStartTracking = async () => {
    // Android requires an explicit runtime permission request,
    // even if the permission is declared in AndroidManifest.xml.
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Atlas Driver needs access to your location to dispatch rides.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
          buttonPositive: 'Allow',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('⚠️ [Location] Permission denied — GPS tracking disabled');
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
        
        // Update local state so hook consumers can render current coords
        setLocation({ latitude, longitude });

        // 1. Send to Socket for real-time dispatching
        socketService.sendLocation(latitude, longitude);

        // 2. Persist to API periodically
        try {
          await api.post('/driver/location', { latitude, longitude });
        } catch (error) {
          console.log('Location API update failed', error);
        }
      },
      (error) => console.log('Location Error:', error),
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
  };

  return location;
};
