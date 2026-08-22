import { Controller, Get, Post, Param, Body, BadRequestException, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';

import { SystemSettingsService } from '../../application/services/system-settings.service';

export class GrantDistanceBenefitDto {
  driverBenefitMeters?: number;   // 0 to 1000 meters
  passengerCreditMeters?: number; // 0 to 1000 meters
  reason: string;                 // Mandatory
}

export class BulkDistanceBenefitDto {
  enabled: boolean;
  driverBenefitMeters?: number;
  passengerCreditMeters?: number;
  reason: string;
}

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPassengerDistanceBenefitController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  /**
   * Get Bulk Distance Benefit global configuration
   */
  @Get('passengers/bulk-distance-benefit/config')
  async getBulkConfig() {
    const config = await this.systemSettingsService.getBulkDistanceBenefitConfig();
    const count = await this.prisma.user.count({ where: { role: UserRole.PASSENGER } });
    return { ...config, affectedPassengersCount: count };
  }

  /**
   * Enable / Disable or update Bulk Distance Benefit for all passengers
   */
  @Post('passengers/bulk-distance-benefit')
  async updateBulkConfig(
    @Body() dto: BulkDistanceBenefitDto,
    @Req() req: any
  ) {
    const actorId = req?.user?.id || 'Control Panel User';
    return await this.systemSettingsService.updateBulkDistanceBenefitConfig(dto, actorId);
  }

  /**
   * Get all registered passengers
   */
  @Get('passengers')
  async getAllPassengers() {
    const passengers = await this.prisma.user.findMany({
      where: { role: UserRole.PASSENGER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { customerRides: true } },
      },
    });

    return passengers.map((p) => ({
      id: p.id,
      fullName: p.fullName || 'Passenger User',
      phoneNumber: p.phoneNumber || '—',
      role: p.role,
      status: p.status,
      createdAt: p.createdAt,
      totalTrips: p._count?.customerRides || 0,
      totalSpend: '—',
      rating: 5.0,
    }));
  }

  /**
   * Grant, update, or remove Distance Benefit & Credit for a specific ride
   */
  @Post('rides/:id/distance-benefit')
  async grantDistanceBenefit(
    @Param('id') rideId: string,
    @Body() dto: GrantDistanceBenefitDto,
    @Req() req: any
  ) {
    if (!dto.reason || dto.reason.trim().length < 3) {
      throw new BadRequestException('Reason is mandatory and must be at least 3 characters long.');
    }

    const driverBenefit = Math.max(0, Math.min(1000, Number(dto.driverBenefitMeters || 0)));
    const passengerCredit = Math.max(0, Math.min(1000, Number(dto.passengerCreditMeters || 0)));

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { passenger: true, driver: { include: { user: true } } },
    });

    if (!ride) {
      throw new NotFoundException(`Ride with ID ${rideId} not found.`);
    }

    // Default physical distance to 10000m (10 km) if not explicitly set
    const originalDistMeters = ride.originalDistanceMeters || 10000;
    const newDriverDisplayMeters = Math.max(0, originalDistMeters - driverBenefit);
    const newPassengerDisplayMeters = originalDistMeters + passengerCredit;

    const actorId = req?.user?.id || 'Control Panel User';
    const now = new Date();

    // 1. Immutable Audit Log Recording
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'GRANT_DISTANCE_BENEFIT',
        entityType: 'Ride',
        entityId: ride.id,
        oldValue: {
          originalDistanceMeters: originalDistMeters,
          driverBenefitMeters: ride.driverBenefitMeters || 0,
          passengerCreditMeters: ride.passengerCreditMeters || 0,
          driverDisplayDistanceMeters: ride.driverDisplayDistanceMeters || originalDistMeters,
          passengerDisplayDistanceMeters: ride.passengerDisplayDistanceMeters || originalDistMeters,
        },
        newValue: {
          originalDistanceMeters: originalDistMeters,
          driverBenefitMeters: driverBenefit,
          passengerCreditMeters: passengerCredit,
          driverDisplayDistanceMeters: newDriverDisplayMeters,
          passengerDisplayDistanceMeters: newPassengerDisplayMeters,
          reason: dto.reason,
        },
      },
    });

    // 2. Update Ride in Database (Preserving fixed passenger fare estimatedPrice untouched)
    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        originalDistanceMeters: originalDistMeters,
        driverBenefitMeters: driverBenefit,
        passengerCreditMeters: passengerCredit,
        driverDisplayDistanceMeters: newDriverDisplayMeters,
        passengerDisplayDistanceMeters: newPassengerDisplayMeters,
        benefitReason: dto.reason,
        benefitGrantedBy: actorId,
        benefitGrantedAt: now,
      },
      include: { passenger: true, driver: { include: { user: true } } },
    });

    return {
      success: true,
      rideId: updatedRide.id,
      originalDistanceKm: (originalDistMeters / 1000).toFixed(2),
      driverDisplayDistanceKm: (newDriverDisplayMeters / 1000).toFixed(2),
      passengerDisplayDistanceKm: (newPassengerDisplayMeters / 1000).toFixed(2),
      driverBenefitKm: (driverBenefit / 1000).toFixed(2),
      passengerCreditKm: (passengerCredit / 1000).toFixed(2),
      fareMAD: Number(updatedRide.estimatedPrice),
      reason: updatedRide.benefitReason,
      grantedAt: updatedRide.benefitGrantedAt,
    };
  }

  /**
   * Get all rides for a specific passenger with full Distance Benefit details
   */
  @Get('passengers/:id/rides')
  async getPassengerRides(@Param('id') passengerId: string) {
    const rides = await this.prisma.ride.findMany({
      where: { passengerId },
      orderBy: { requestedAt: 'desc' },
      include: {
        driver: {
          include: { user: { select: { fullName: true, phoneNumber: true } } },
        },
      },
    });

    return rides.map((r) => {
      const origMeters = r.originalDistanceMeters || 10000;
      const driverBenefitMeters = r.driverBenefitMeters || 0;
      const passengerCreditMeters = r.passengerCreditMeters || 0;
      const driverDispMeters = r.driverDisplayDistanceMeters || Math.max(0, origMeters - driverBenefitMeters);
      const passengerDispMeters = r.passengerDisplayDistanceMeters || (origMeters + passengerCreditMeters);

      return {
        id: r.id,
        serviceType: r.serviceType,
        pickupAddress: r.pickupAddress,
        dropoffAddress: r.dropoffAddress,
        fareMAD: Number(r.estimatedPrice),
        status: r.status,
        requestedAt: r.requestedAt,
        originalDistanceKm: (origMeters / 1000).toFixed(2),
        driverDisplayDistanceKm: (driverDispMeters / 1000).toFixed(2),
        passengerDisplayDistanceKm: (passengerDispMeters / 1000).toFixed(2),
        driverBenefitMeters,
        passengerCreditMeters,
        benefitReason: r.benefitReason,
        driverName: r.driver?.user?.fullName || null,
      };
    });
  }

  /**
   * Fetch immutable audit log history for a specific ride
   */
  @Get('rides/:id/benefit-audit')
  async getRideBenefitAudit(@Param('id') rideId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Ride',
        entityId: rideId,
        action: 'GRANT_DISTANCE_BENEFIT',
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((l) => ({
      id: l.id,
      actorId: l.actorId,
      oldValue: l.oldValue,
      newValue: l.newValue,
      createdAt: l.createdAt,
    }));
  }
}
