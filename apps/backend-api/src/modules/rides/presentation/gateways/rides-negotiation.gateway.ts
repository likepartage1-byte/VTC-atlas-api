import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { RideAssignmentService } from '../../application/services/ride-assignment.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'rides',
})
export class RidesNegotiationGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly rideAssignmentService: RideAssignmentService
  ) {}

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
   * قبول الراكب لعرض السائق (الجوهر الذري)
   */
  @SubscribeMessage('accept_bid')
  async handleAcceptBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; driverId: string }
  ) {
    try {
      await this.rideAssignmentService.assignRide(data.rideId, data.driverId);
      
      console.log(`[Success] Ride ${data.rideId} atomically assigned to driver ${data.driverId}`);

      // 1. إبلاغ السائق الفائز
      this.server.to(`driver_${data.driverId}`).emit('assignment_success', { rideId: data.rideId });

      // 2. إبلاغ جميع السائقين الآخرين بأن الطلب قد تم تعيينه (لحذفه من القائمة)
      this.server.emit('ride_request_assigned', { rideId: data.rideId });
      
    } catch (error) {
      // إبلاغ السائق بحدوث تعارض (خسارة السباق التاريخية)
      client.emit('assignment_failed', { 
        message: 'Désolé, cette course a déjà été acceptée par un autre chauffeur.',
        code: 'RACE_CONDITION_LOST'
      });
    }
  }
}
