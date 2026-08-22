import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateToLogin } from '../navigation/navigationRef';
import { tokenManager } from '../services/token.manager';

// Production Domain Server (HTTPS)
export const BASE_URL = 'https://api.yallavtc.com/api/v1';

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

      try {
        // Delegate to TokenManager (mutex prevents double-refresh with socket)
        const newAccessToken = await tokenManager.refresh();

        if (newAccessToken) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return await axios(originalRequest);
        } else {
          // Server explicitly returned 401/403 on /auth/refresh -> session is revoked
          console.warn(
            `⚠️ [Auth] Refresh token revoked by server — clearing session and redirecting to Login`
          );
          await clearSessionAndLogout();
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Network error / timeout during token refresh -> DO NOT log out! Preserve session
        console.warn(
          `⚠️ [Auth] Refresh encountered network glitch (${refreshError.message}) — preserving local session`
        );
        return Promise.reject(error);
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

