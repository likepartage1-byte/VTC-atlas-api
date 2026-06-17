import { BadRequestException } from '@nestjs/common';
import { RideStatus } from './ride-status.enum';
import { Location } from '../value-objects/location.vo';
import { Price } from '../value-objects/price.vo';

export class Ride {
  constructor(
    public readonly id: string,
    public readonly passengerId: string,
    public readonly pickup: Location,
    public readonly destination: Location,
    public status: RideStatus = RideStatus.REQUESTED,
    public driverId?: string,
    public price?: Price,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  /**
   * DOMAIN LOGIC: Strict State Transition
   */
  public transitionTo(newStatus: RideStatus) {
    const allowedTransitions: Record<RideStatus, RideStatus[]> = {
      [RideStatus.REQUESTED]: [RideStatus.DISPATCHED, RideStatus.CANCELLED],
      [RideStatus.DISPATCHED]: [RideStatus.DRIVER_ACCEPTED, RideStatus.CANCELLED],
      [RideStatus.DRIVER_ACCEPTED]: [RideStatus.ARRIVED, RideStatus.CANCELLED],
      [RideStatus.ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
      [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[this.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(`INVALID_STATUS_TRANSITION|${this.status}->${newStatus}`);
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  public setPrice(price: Price) {
    if (this.status !== RideStatus.REQUESTED && this.status !== RideStatus.DISPATCHED) {
      throw new BadRequestException('CANNOT_CHANGE_PRICE_AFTER_ACCEPTANCE');
    }
    this.price = price;
  }
}
