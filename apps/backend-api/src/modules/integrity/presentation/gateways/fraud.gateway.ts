import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@WebSocketGateway({
  namespace: 'admin/fraud',
  cors: { origin: '*' },
})
export class FraudGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(FraudGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Admin connected to Fraud Stream: ${client.id}`);
  }

  /**
   * Broadcasts a fraud event to all connected admin clients
   */
  broadcastFraudAlert(event: any) {
    this.server.emit('new-fraud-event', event);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { status: 'alive' };
  }
}
