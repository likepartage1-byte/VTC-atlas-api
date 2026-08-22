/**
 * TokenManager — Single source of truth for JWT lifecycle.
 *
 * Both Axios and Socket must use this instead of calling /auth/refresh directly.
 * A mutex prevents double-refresh: if one caller is already refreshing,
 * all subsequent callers wait for the same promise.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://api.yallavtc.com/api/v1';

class TokenManager {
  /** In-flight refresh promise — null when no refresh is in progress */
  private refreshPromise: Promise<string | null> | null = null;

  /** Return the current access token from storage */
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem('driver_access_token');
  }

  /**
   * Refresh the access token.
   * Uses a mutex: if a refresh is already in progress, the caller joins
   * that same promise instead of issuing a second /auth/refresh request.
   * Returns the new access token, or null if refresh failed due to revoked token.
   */
  async refresh(): Promise<string | null> {
    if (this.refreshPromise) {
      // Another caller is already refreshing — wait for their result
      console.log('[TokenManager] Refresh already in progress, waiting…');
      return this.refreshPromise;
    }

    this.refreshPromise = this._doRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _doRefresh(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('driver_refresh_token');
      if (!refreshToken) {
        console.warn('[TokenManager] No refresh token — cannot refresh');
        return null;
      }

      console.log('[TokenManager] 🔄 Calling /auth/refresh…');
      const res = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const { accessToken, refreshToken: newRefreshToken } = res.data;
      if (accessToken) {
        await AsyncStorage.setItem('driver_access_token', accessToken);
      }
      if (newRefreshToken) {
        await AsyncStorage.setItem('driver_refresh_token', newRefreshToken);
      }
      console.log('[TokenManager] ✅ Tokens updated');
      return accessToken;
    } catch (err: any) {
      const status = err?.response?.status;
      console.warn(`[TokenManager] ⚠️ Refresh failed (status: ${status ?? 'network_error'}): ${err.message}`);
      // Only return null if server explicitly confirms the refresh token is invalid / revoked (401 or 403)
      if (status === 401 || status === 403) {
        return null;
      }
      // Network errors, timeouts, 5xx: throw error so session is NOT wiped
      throw err;
    }
  }

  /** Wipe all stored credentials (called on hard logout) */
  async clearSession() {
    await AsyncStorage.multiRemove(['driver_access_token', 'driver_refresh_token']);
  }
}

export const tokenManager = new TokenManager();
