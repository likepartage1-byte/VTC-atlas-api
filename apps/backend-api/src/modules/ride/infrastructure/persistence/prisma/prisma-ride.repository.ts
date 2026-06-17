import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IRideRepository } from '../../../domain/repositories/ride.repository.interface';
import { Ride } from '../../../domain/entities/ride.entity';
import { RideStatus } from '../../../domain/entities/ride-status.enum';
import { Location } from '../../../domain/value-objects/location.vo';
import { Price } from '../../../domain/value-objects/price.vo';
import { Ride as PrismaRide, RideStatus as PrismaStatus } from '@prisma/client';

@Injectable()
export class PrismaRideRepository implements IRideRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: any) {
    return tx || this.prisma;
  }

  async save(ride: Ride, tx?: any): Promise<void> {
    const client = this.getClient(tx);
    await client.ride.upsert({
      where: { id: ride.id },
      update: this.mapToPrisma(ride),
      create: this.mapToPrisma(ride),
    });
  }

  async findById(id: string, tx?: any): Promise<Ride | null> {
    const client = this.getClient(tx);
    const data = await client.ride.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  async findActiveByPassengerId(passengerId: string, tx?: any): Promise<Ride | null> {
    const client = this.getClient(tx);
    const data = await client.ride.findFirst({
      where: {
        passengerId,
        status: { in: [PrismaStatus.REQUESTED, PrismaStatus.DISPATCHED, PrismaStatus.DRIVER_ACCEPTED, PrismaStatus.ARRIVED, PrismaStatus.IN_PROGRESS] }
      },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findActiveByDriverId(driverId: string, tx?: any): Promise<Ride | null> {
    const client = this.getClient(tx);
    const data = await client.ride.findFirst({
      where: {
        driverId,
        status: { in: [PrismaStatus.DRIVER_ACCEPTED, PrismaStatus.ARRIVED, PrismaStatus.IN_PROGRESS] }
      }
    });
    return data ? this.mapToDomain(data) : null;
  }

  async updateStatus(id: string, status: RideStatus, tx?: any): Promise<void> {
    const client = this.getClient(tx);
    await client.ride.update({
      where: { id },
      data: { status: status as PrismaStatus }
    });
  }

  private mapToPrisma(ride: Ride) {
    return {
      id: ride.id,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      status: ride.status as PrismaStatus,
      pickupLat: ride.pickup.lat,
      pickupLng: ride.pickup.lng,
      pickupAddress: ride.pickup.address,
      dropoffLat: ride.destination.lat,
      dropoffLng: ride.destination.lng,
      dropoffAddress: ride.destination.address,
      estimatedPrice: ride.price?.amount || 0,
      currency: ride.price?.currency || 'MAD',
    };
  }

  private mapToDomain(data: PrismaRide): Ride {
    return new Ride(
      data.id,
      data.passengerId,
      new Location(data.pickupLat, data.pickupLng, data.pickupAddress),
      new Location(data.dropoffLat, data.dropoffLng, data.dropoffAddress),
      data.status as unknown as RideStatus,
      data.driverId || undefined,
      new Price(Number(data.estimatedPrice), data.currency)
    );
  }
}
