import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://api.magda-guide.com'; // أو رابط السيرفر الخاص بك

class SocketService {
  private socket: Socket | null = null;
  public status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  async connect(onEvent?: (event: string, data: any) => void) {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem('driver_access_token');
    
    if (!token) {
      console.warn('Socket connect failed: No token found');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.status = 'connected';
      console.log('✅ Socket connected');
      onEvent?.('status', 'connected');
    });

    this.socket.on('disconnect', () => {
      this.status = 'disconnected';
      console.log('❌ Socket disconnected');
      onEvent?.('status', 'disconnected');
    });

    // استقبال عروض الرحلات
    this.socket.on('ride_offer', (data) => {
      console.log('📢 NEW RIDE OFFER:', data);
      onEvent?.('ride_offer', data);
    });
  }

  setPresence(status: 'AVAILABLE' | 'ONLINE' | 'BUSY') {
    this.socket?.emit('driver_set_presence', { status }, (res: any) => {
      console.log('Presence update result:', res);
    });
  }

  sendLocation(lat: number, lng: number) {
    this.socket?.emit('driver_location_update', {
      lat,
      lng,
      timestamp: Date.now()
    });
  }

  async acceptRide(rideId: string) {
    return new Promise((resolve) => {
      this.socket?.emit('ride_accept_attempt', { rideId }, (res: any) => {
        resolve(res);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
