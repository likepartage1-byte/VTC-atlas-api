import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://187.124.34.118';

// ─── Event Contract (must match backend SocketGateway exactly) ───────────────
// Backend listens for:  driver.location_update  → @SubscribeMessage('driver.location_update')
// Backend emits:        ride.offer              ← RideDispatcher.sendToUser(...)
// Backend listens for:  driver.presence         → @SubscribeMessage('driver.presence')  [to be added]
// ─────────────────────────────────────────────────────────────────────────────

class SocketService {
  private socket: Socket | null = null;
  public status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  async connect(onEvent?: (event: string, data: any) => void) {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem('driver_access_token');

    if (!token) {
      console.warn('[Socket] Connect failed: No access token found');
      return;
    }

    this.status = 'connecting';
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.status = 'connected';
      console.log('✅ Socket connected:', this.socket?.id);
      onEvent?.('status', 'connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      console.log('❌ Socket disconnected:', reason);
      onEvent?.('status', 'disconnected');
    });

    this.socket.on('connect_error', (err) => {
      this.status = 'disconnected';
      console.error('[Socket] Connection error:', err.message);
    });

    // ── Inbound: Ride offer from dispatcher ────────────────────────────────
    // Backend emits 'ride.offer' via SocketGateway.sendToUser(...)
    this.socket.on('ride.offer', (data) => {
      console.log('📢 [Socket] Ride offer received:', data);
      onEvent?.('ride_offer', data);
    });
  }

  /** Send driver availability status to backend */
  setPresence(status: 'AVAILABLE' | 'ONLINE' | 'BUSY') {
    if (!this.socket?.connected) {
      console.warn('[Socket] setPresence called but socket is not connected');
      return;
    }
    // Backend SocketGateway subscribes to 'driver.presence'
    this.socket.emit('driver.presence', { status }, (res: any) => {
      console.log('[Socket] Presence update ACK:', res);
    });
  }

  /** Send GPS coordinates to backend — throttled by LocationIngestionService */
  sendLocation(lat: number, lng: number) {
    if (!this.socket?.connected) return;
    // Backend SocketGateway subscribes to 'driver.location_update'
    this.socket.emit('driver.location_update', {
      lat,
      lng,
      timestamp: Date.now(),
    });
  }

  /** Attempt to accept a dispatched ride offer (atomic on backend) */
  async acceptRide(rideId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('ride_accept_attempt', { rideId }, (res: any) => {
        resolve(res);
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.status = 'disconnected';
  }
}

export const socketService = new SocketService();
