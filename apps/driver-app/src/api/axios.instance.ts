import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateToLogin } from '../navigation/navigationRef';
import { tokenManager } from '../services/token.manager';

// Production Hostinger Server IP (Active since deployment is complete)
export const BASE_URL = 'http://187.124.34.118/api/v1';

// Local Development Server (Use http://10.0.2.2:3000/api/v1 for Android Emulator, or http://localhost:3000/api/v1 with adb reverse)
// export const BASE_URL = 'http://10.0.2.2:3000/api/v1';

/**
 * Primary API client.
 * All requests automatically carry the stored JWT access token.
 * On 401, the response interceptor silently refreshes the token and retries.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: inject access token ──────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('driver_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        `⚠️  [API] No token in storage\n` +
        `    → ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: automatic token refresh lifecycle ───────────────
api.interceptors.response.use(
  // Pass through all successful responses without touching them
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── Step 1: Detect access token expiry ──────────────────────────────────
    // Do not attempt to refresh if the request was to the auth endpoints themselves:
    // /auth/otp/request, /auth/otp/verify, or /auth/refresh.
    const isAuthRoute =
      originalRequest.url?.includes('/auth/otp/') ||
      originalRequest.url?.includes('/auth/refresh');

    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;

      // Delegate to TokenManager (mutex prevents double-refresh with socket)
      const newAccessToken = await tokenManager.refresh();

      if (!newAccessToken) {
        console.warn(
          `⚠️ [Auth] Refresh failed — clearing session and redirecting to Login`
        );
        await clearSessionAndLogout();
        return Promise.reject(error);
      }

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      try {
        return await axios(originalRequest);
      } catch (retryError: any) {
        console.error(
          `❌ [Auth] Retry failed after refresh\n` +
          `    → ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\n` +
          `    → Status: ${retryError?.response?.status ?? 'network error'}`
        );
        throw retryError;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Wipe stored credentials and redirect the user to the Login screen. */
async function clearSessionAndLogout() {
  await AsyncStorage.multiRemove(['driver_access_token', 'driver_refresh_token']);
  navigateToLogin();
}

