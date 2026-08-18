import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from './token.manager';

const SOCKET_URL = 'http://187.124.34.118';

// ─── Event Contract (Backend SocketGateway) ───────────────────────────────
// Emits to backend:   driver.location_update  driver.presence
// Receives from backend: ride.offer
// ─────────────────────────────────────────────────────────────────────────

class SocketService {
  private socket: Socket | null = null;
  public status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  // Store event callback so we can reattach on reconnect
  private onEvent: ((event: string, data: any) => void) | undefined;

  /** Build and wire a new socket instance with a fresh token */
  private buildSocket(token: string): Socket {
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false, // We handle reconnection manually to always use the latest token
    });

    s.on('connect', () => {
      this.status = 'connected';
      console.log('✅ Socket connected:', s.id);
      this.onEvent?.('status', 'connected');
    });

    s.on('disconnect', (reason) => {
      this.status = 'disconnected';
      console.log('❌ Socket disconnected:', reason);
      this.onEvent?.('status', 'disconnected');

      // Auto-reconnect for non-auth failures (network blip, server restart, etc.)
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    s.on('connect_error', async (err) => {
      this.status = 'disconnected';
      console.warn('[Socket] Connection error:', err.message);

      if (err.message === 'Unauthorized') {
        // Access token expired — try to refresh it, then reconnect
        await this.refreshAndReconnect();
      } else {
        // Other errors (network, server down) — retry after delay
        this.scheduleReconnect();
      }
    });

    // ── Inbound: Ride offer from dispatcher ──────────────────────────────
    s.on('ride.offer', (data) => {
      console.log('📢 [Socket] Ride offer received:', data);
      // Normalise: ensure serviceType and parcelInfo are forwarded
      const enriched = {
        ...data,
        serviceType: data.serviceType ?? 'ECONOMY',
        parcelInfo: data.parcelInfo ?? null,
      };
      this.onEvent?.('ride_offer', enriched);
    });

    // ── Inbound: Passenger Realtime Event Isolation ───────────────────────
    s.on('ride:statusChanged', (data) => {
      console.log('📢 [Socket] Passenger ride statusChanged:', data);
      try {
        const { usePassengerRideStore } = require('../store/usePassengerRideStore');
        const store = usePassengerRideStore.getState();
        if (data?.status) {
          store.setRideStatus(data.status);
        }
        if (data?.driver) {
          store.setAssignedDriver(data.driver);
        }
      } catch (err) {
        console.warn('[Socket] Failed to process passenger statusChanged:', err);
      }
    });

    s.on('driver:location', (data) => {
      try {
        const { usePassengerRideStore } = require('../store/usePassengerRideStore');
        if (data?.lat && data?.lng) {
          usePassengerRideStore.getState().updateDriverLocation(data.lat, data.lng);
        }
      } catch (_) {}
    });

    return s;
  }

  /** Public connect — called once from DashboardScreen on mount */
  async connect(onEvent?: (event: string, data: any) => void) {
    if (this.socket?.connected) return;

    this.onEvent = onEvent;

    const token = await AsyncStorage.getItem('driver_access_token');
    if (!token) {
      console.warn('[Socket] Connect failed: No access token found');
      return;
    }

    this.status = 'connecting';
    this.socket = this.buildSocket(token);
  }

  /** Reconnect after a delay (network blip / server restart) */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private scheduleReconnect(delayMs = 4000) {
    if (this.reconnectTimer) return; // Already scheduled
    console.log(`[Socket] Reconnecting in ${delayMs / 1000}s…`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.socket?.connected) return; // Connected in the meantime
      const token = await AsyncStorage.getItem('driver_access_token');
      if (!token) return;
      this.socket?.removeAllListeners();
      this.socket?.disconnect();
      this.status = 'connecting';
      this.socket = this.buildSocket(token);
    }, delayMs);
  }

  /** On Unauthorized connect_error: refresh via TokenManager then reconnect */
  private async refreshAndReconnect() {
    console.log('[Socket] Access token expired — delegating refresh to TokenManager…');
    const newToken = await tokenManager.refresh();

    if (!newToken) {
      console.error('[Socket] Token refresh failed — socket will remain disconnected');
      return;
    }

    console.log('[Socket] Token refreshed — reconnecting socket…');
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.status = 'connecting';
    this.socket = this.buildSocket(newToken);
  }

  /** Send driver availability to backend */
  setPresence(status: 'AVAILABLE' | 'ONLINE' | 'BUSY') {
    if (!this.socket?.connected) {
      console.warn('[Socket] setPresence called but socket is not connected');
      return;
    }
    this.socket.emit('driver.presence', { status }, (res: any) => {
      console.log('[Socket] Presence ACK:', res);
    });
  }

  /** Send GPS coordinates — throttled server-side */
  sendLocation(lat: number, lng: number) {
    if (!this.socket?.connected) return;
    this.socket.emit('driver.location_update', { lat, lng, timestamp: Date.now() });
  }

  /** Accept a dispatched ride via the REST API (atomic on backend) */
  async acceptRide(rideId: string): Promise<any> {
    // Import inline to avoid circular dep at module level
    const { api } = await import('../api/axios.instance');
    const response = await api.post(`/driver/rides/${rideId}/accept`);
    return response.data;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.status = 'disconnected';
  }
}

export const socketService = new SocketService();
