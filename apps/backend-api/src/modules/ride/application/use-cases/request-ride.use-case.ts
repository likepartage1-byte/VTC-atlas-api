import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IRideRepository } from '../../domain/repositories/ride.repository.interface';
import { PricingService } from '../../domain/services/pricing.service';
import { Ride } from '../../domain/entities/ride.entity';
import { Location } from '../../domain/value-objects/location.vo';
import { Price } from '../../domain/value-objects/price.vo';
import { OutboxService } from '../../../../core/outbox/services/outbox.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RequestRideUseCase {
  constructor(
    @Inject('IRideRepository') private readonly rideRepository: IRideRepository,
    private readonly pricingService: PricingService,
    private readonly outbox: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(passengerId: string, pickup: Location, destination: Location) {
    return this.prisma.$transaction(async (tx) => {
      const activeRide = await this.rideRepository.findActiveByPassengerId(passengerId, tx);
      if (activeRide) {
        throw new BadRequestException('RIDE.ERRORS.ALREADY_HAS_ACTIVE_RIDE');
      }

      const estimatedPrice = this.pricingService.calculateFare(5, 15); 

      const rideId = crypto.randomUUID();
      const ride = new Ride(rideId, passengerId, pickup, destination);
      ride.setPrice(new Price(estimatedPrice));

      await this.rideRepository.save(ride, tx);

      await this.outbox.schedule(tx, 'Ride', rideId, 'ride.requested', {
        rideId,
        passengerId,
        pickup: { lat: pickup.lat, lng: pickup.lng },
      });

      return {
        rideId,
        status: ride.status,
        message: 'RIDE.MESSAGES.REQUESTED'
      };
    });
  }
}
