import { useEffect, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { socketService } from '../../services/socket.service';
import { api } from '../../api/axios.instance';

export const useLocationTracking = (isOnline: boolean) => {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isOnline]);

  const startTracking = () => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });

    watchId.current = Geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, heading, speed } = position.coords;

        // 1. Send to Socket for real-time dispatching
        socketService.sendLocation(latitude, longitude);

        // 2. Persist to API periodically (Buffer/Throttling handled on server usually)
        try {
          await api.post('/driver/location', {
            latitude,
            longitude,
          });
        } catch (error) {
          console.log('Location API update failed', error);
        }
      },
      (error) => console.log('Location Error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000,     // Or every 5 seconds
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
};
