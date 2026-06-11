import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationRouter {
  private readonly logger = new Logger(NotificationRouter.name);

  constructor() {}

  /**
   * Translates internal domain events into user-facing notifications.
   */
  
  @OnEvent('Identity.OTPRequested')
  handleOtpRequested(payload: any) {
    this.logger.log(`Routing OTP SMS to ${payload.phone}: Code is [SIMULATED]`);
    // Logic: Call SmsAdapter
  }

  @OnEvent('ride.status.changed.DRIVER_ACCEPTED')
  handleRideAccepted(event: any) {
    this.logger.log(`Routing Push to Passenger ${event.passengerId}: Driver is on the way!`);
    // Logic: Call PushAdapter + WebSocketAdapter
  }

  @OnEvent('ride.status.changed.ARRIVED')
  handleDriverArrived(event: any) {
    this.logger.log(`Routing Push to Passenger: Driver has arrived at pickup point.`);
    // Logic: Call WebSocket (Sound alert)
  }

  @OnEvent('ride.eta.updated')
  handleEtaUpdate(event: any) {
    // This is high-frequency, routed only via WebSocket
    this.logger.debug(`Routing ETA Update via WS: ${event.etaMinutes} mins remaining.`);
  }

  @OnEvent('ride.status.changed.COMPLETED')
  handleRideCompleted(event: any) {
    this.logger.log(`Routing Receipt to Passenger: Your ride is complete.`);
    // Logic: Call Email/Push Adapter
  }
}
