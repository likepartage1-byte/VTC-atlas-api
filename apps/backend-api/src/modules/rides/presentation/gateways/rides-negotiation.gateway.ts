import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'rides',
})
export class RidesNegotiationGateway {
  @WebSocketServer()
  server: Server;

  /**
   * تقديم مزايدة من السائق
   */
  @SubscribeMessage('submit_bid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string; amount: number }
  ) {
    const { rideId, amount } = data;
    
    // 1. Validation Logic (70% - 150%)
    // وسيتم سحب السعر الأصلي من قاعدة البيانات (هنا محاكاة للمنطق)
    // if (amount < original * 0.7 || amount > original * 1.5) throw Error;

    console.log(`[Bid] Driver ${data.driverId} bid ${amount} MAD for ride ${rideId}`);

    // إرسال العرض للراكب المستهدف فقط
    this.server.to(`passenger_${rideId}`).emit('bid_received', {
      driverId: data.driverId,
      amount: Math.ceil(amount), // التقريب السوقي
      timestamp: new Date(),
    });
  }

  /**
   * قبول الراكب لعرض السائق
   */
  @SubscribeMessage('accept_bid')
  async handleAcceptBid(
    @MessageBody() data: { rideId: string; driverId: string }
  ) {
    console.log(`[Success] Ride ${data.rideId} assigned to driver ${data.driverId}`);

    // إخبار السائق الفائز
    this.server.to(`driver_${data.driverId}`).emit('bid_accepted', { rideId: data.rideId });

    // إخبار باقي السائقين بحذف الطلب
    this.server.emit('ride_request_assigned', { rideId: data.rideId });
  }
}
