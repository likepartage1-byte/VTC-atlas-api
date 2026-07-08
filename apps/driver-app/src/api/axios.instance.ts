import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://187.124.34.118/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token into all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('driver_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized errors Automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('driver_refresh_token');
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        console.log('🔄 [Auth] Attempting token refresh...');
        
        // Use standard axios to avoid interceptor loop
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        await AsyncStorage.setItem('driver_access_token', accessToken);
        await AsyncStorage.setItem('driver_refresh_token', newRefreshToken);

        // Update current request and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ [Auth] Refresh failed — logging out', refreshError);
        // Optional: trigger logout here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
