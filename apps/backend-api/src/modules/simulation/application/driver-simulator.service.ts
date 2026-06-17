import { Injectable, Logger } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class DriverSimulator {
  private readonly logger = new Logger(DriverSimulator.name);
  private activeSockets: Socket[] = [];

  /**
   * SPAWN: Create a virtual driver and start its lifecycle.
   */
  async spawn(driverId: string, token: string, initialCoords: { lat: number, lng: number }) {
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      this.logger.log(`[VirtualDriver] Driver ${driverId} connected.`);
      this.activeSockets.push(socket);
      this.startReporting(socket, driverId, initialCoords);
    });

    socket.on('ride.offer', (ride) => {
      // Simulate human reaction time (2-5 seconds) then accept
      setTimeout(() => {
        socket.emit('ride.accept', { rideId: ride.rideId });
      }, Math.random() * 3000 + 2000);
    });

    socket.on('disconnect', () => {
      this.logger.warn(`[VirtualDriver] Driver ${driverId} disconnected.`);
    });
  }

  private startReporting(socket: Socket, driverId: string, coords: { lat: number, lng: number }) {
    // Report location every 2-5 seconds
    const interval = setInterval(() => {
      if (!socket.connected) {
        clearInterval(interval);
        return;
      }

      // Inflict small movement
      coords.lat += (Math.random() - 0.5) * 0.001;
      coords.lng += (Math.random() - 0.5) * 0.001;

      socket.emit('driver.location_update', { lat: coords.lat, lng: coords.lng });
    }, Math.random() * 3000 + 2000);
  }

  cleanup() {
    this.activeSockets.forEach(s => s.disconnect());
    this.activeSockets = [];
  }
}
