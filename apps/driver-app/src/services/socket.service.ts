import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from './token.manager';

const SOCKET_URL = 'https://api.yallavtc.com';

// ─── Event Contract (Backend SocketGateway) ───────────────────────────────
// Default namespace "/":
//   Emits to backend:      driver.location_update  driver.presence
//   Receives from backend: ride.offer
//
// Rides namespace "/rides":  (P1.3)
//   Emits to backend:      joinRide
//   Receives from backend: statusChanged
// ─────────────────────────────────────────────────────────────────────────

class SocketService {
  private socket: Socket | null = null;
  public status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  // Store event callback so we can reattach on reconnect
  private onEvent: ((event: string, data: any) => void) | undefined;

  // ── /rides namespace ──────────────────────────────────────────────────────
  private ridesSocket: Socket | null = null;
  private activeRideId: string | null = null;
  private onRideStatusChanged: ((data: any) => void) | undefined;

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

    // Also disconnect /rides namespace when the service shuts down
    this.disconnectRidesNamespace();
  }

  // ── /rides Namespace (P1.3) ──────────────────────────────────────────────

  /**
   * Build a socket for the /rides namespace using the same token
   * and the same refresh strategy as the default "/" socket.
   */
  private buildRidesSocket(token: string): Socket {
    const s = io(`${SOCKET_URL}/rides`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false, // Manual reconnect to always use latest token
    });

    s.on('connect', () => {
      console.log('✅ [Rides] /rides socket connected:', s.id);
      // Re-join the active ride room after (re)connect
      if (this.activeRideId) {
        this.emitJoinRide(this.activeRideId);
      }
    });

    s.on('disconnect', (reason) => {
      console.log('❌ [Rides] /rides socket disconnected:', reason);
      if (reason !== 'io client disconnect') {
        this.scheduleRidesReconnect();
      }
    });

    s.on('connect_error', async (err) => {
      console.warn('[Rides] Connection error:', err.message);
      if (err.message === 'Unauthorized') {
        await this.refreshAndReconnectRides();
      } else {
        this.scheduleRidesReconnect();
      }
    });

    // ── Inbound: Ride status changes from backend ────────────────────────
    s.on('statusChanged', (data) => {
      console.log('📡 [Rides] statusChanged received:', data);
      this.onRideStatusChanged?.(data);
    });

    return s;
  }

  /**
   * Connect to the /rides namespace.
   * Call this once after the driver logs in.
   * The onStatusChanged callback receives every statusChanged event
   * for the ride room the driver has joined.
   */
  async connectRidesNamespace(onStatusChanged?: (data: any) => void) {
    if (this.ridesSocket?.connected) return;

    this.onRideStatusChanged = onStatusChanged;

    const token = await AsyncStorage.getItem('driver_access_token');
    if (!token) {
      console.warn('[Rides] connectRidesNamespace: no access token');
      return;
    }

    this.ridesSocket = this.buildRidesSocket(token);
  }

  /**
   * Emit joinRide to the /rides namespace.
   * Called by DashboardScreen (P1.4) after acceptRide() succeeds.
   */
  joinRideRoom(rideId: string) {
    this.activeRideId = rideId;
    if (!this.ridesSocket?.connected) {
      console.warn('[Rides] joinRideRoom called but /rides socket is not connected');
      return;
    }
    this.emitJoinRide(rideId);
  }

  /** Internal — emits joinRide and logs */
  private emitJoinRide(rideId: string) {
    console.log(`📤 [Rides] Emitting joinRide for ride ${rideId}`);
    this.ridesSocket?.emit('joinRide', rideId);
  }

  isRidesConnected(): boolean {
    return this.ridesSocket?.connected ?? false;
  }

  /** Disconnect /rides namespace only — does not affect the default "/" socket */
  disconnectRidesNamespace() {
    this.ridesSocket?.removeAllListeners();
    this.ridesSocket?.disconnect();
    this.ridesSocket = null;
    this.activeRideId = null;
  }

  /** Reconnect /rides after a network blip */
  private ridesReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private scheduleRidesReconnect(delayMs = 4000) {
    if (this.ridesReconnectTimer) return;
    console.log(`[Rides] Reconnecting in ${delayMs / 1000}s…`);
    this.ridesReconnectTimer = setTimeout(async () => {
      this.ridesReconnectTimer = null;
      if (this.ridesSocket?.connected) return;
      const token = await AsyncStorage.getItem('driver_access_token');
      if (!token) return;
      this.ridesSocket?.removeAllListeners();
      this.ridesSocket?.disconnect();
      this.ridesSocket = this.buildRidesSocket(token);
    }, delayMs);
  }

  /** On Unauthorized on /rides: refresh via TokenManager then reconnect /rides */
  private async refreshAndReconnectRides() {
    console.log('[Rides] Token expired — refreshing via TokenManager…');
    const newToken = await tokenManager.refresh();

    if (!newToken) {
      console.error('[Rides] Token refresh failed — /rides socket disconnected');
      return;
    }

    console.log('[Rides] Token refreshed — reconnecting /rides…');
    this.ridesSocket?.removeAllListeners();
    this.ridesSocket?.disconnect();
    this.ridesSocket = this.buildRidesSocket(newToken);
  }
}

export const socketService = new SocketService();
