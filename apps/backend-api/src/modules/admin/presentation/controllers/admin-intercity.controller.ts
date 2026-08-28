import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditService } from '../../../audit/audit.service';
import { RideStateMachine } from '../../../rides/domain/state-machine/ride-state-machine';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';

@Controller('admin/intercity')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminIntercityController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly driverAcceptance: DriverAcceptanceService,
  ) {}

  /**
   * List paginated Intercity orders with real-time filters
   */
  @Get('orders')
  async getIntercityOrders(
    @Query('status') status?: string,
    @Query('rideMode') rideMode?: string,
    @Query('departureCity') departureCity?: string,
    @Query('arrivalCity') arrivalCity?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const page = Math.max(1, parseInt(pageRaw || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      tripType: 'INTERCITY',
    };

    if (status) where.status = status;
    if (rideMode) where.rideMode = rideMode;
    if (departureCity) where.departureCity = { contains: departureCity };
    if (arrivalCity) where.arrivalCity = { contains: arrivalCity };

    const [total, items] = await Promise.all([
      this.prisma.ride.count({ where }),
      this.prisma.ride.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          passenger: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                },
              },
              vehicleInfo: true,
            },
          },
          _count: {
            select: { negotiations: true },
          },
        },
      }),
    ]);

    return {
      data: items.map((ride) => ({
        id: ride.id,
        status: ride.status,
        rideMode: ride.rideMode || 'SHARED',
        departureCity: ride.departureCity || ride.pickupAddress.split(',')[0],
        arrivalCity: ride.arrivalCity || ride.dropoffAddress.split(',')[0],
        departureDateTime: ride.departureDateTime,
        requestedAt: ride.requestedAt,
        offeredPrice: Number(ride.estimatedPrice),
        actualPrice: ride.actualPrice ? Number(ride.actualPrice) : null,
        passenger: ride.passenger,
        driver: ride.driver
          ? {
              id: ride.driver.id,
              fullName: ride.driver.user.fullName,
              phoneNumber: ride.driver.user.phoneNumber,
              vehicle: ride.driver.vehicleInfo,
            }
          : null,
        negotiationsCount: ride._count.negotiations,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Single Intercity Order Detail with full negotiation and audit history
   */
  @Get('orders/:id')
  async getIntercityOrderDetail(@Param('id') rideId: string) {
    const ride = await this.prisma.ride.findFirst({
      where: { id: rideId, tripType: 'INTERCITY' },
      include: {
        passenger: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                phoneNumber: true,
              },
            },
            vehicleInfo: true,
          },
        },
        negotiations: {
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException(`Intercity ride ${rideId} not found.`);
    }

    return ride;
  }

  /**
   * Admin Override: Cancel Intercity Order
   */
  @Post('orders/:id/cancel')
  async cancelIntercityOrder(
    @Param('id') rideId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const actorId = req.user?.userId || 'Admin User';
    const cancelReason = reason?.trim() || 'Cancelled by Operational Control Center';

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException(`Ride ${rideId} not found.`);
    }

    if (!RideStateMachine.canCancel(ride.status as any)) {
      throw new BadRequestException(
        `Ride cannot be cancelled from current status: ${ride.status}`,
      );
    }

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId,
      action: 'ADMIN_CANCEL_INTERCITY_ORDER',
      entityType: 'Ride',
      entityId: rideId,
      oldValue: { status: ride.status },
      newValue: { status: 'CANCELLED', reason: cancelReason },
    });

    return { success: true, rideId, status: 'CANCELLED', reason: cancelReason };
  }

  /**
   * Admin Override: Force Assign Driver to Intercity Order
   */
  @Post('orders/:id/assign-driver')
  async forceAssignDriver(
    @Param('id') rideId: string,
    @Body('driverId') driverId: string,
    @Req() req: any,
  ) {
    const actorId = req.user?.userId || 'Admin User';

    if (!driverId) {
      throw new BadRequestException('driverId is required.');
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException(`Driver ${driverId} not found.`);
    }

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException(`Ride ${rideId} not found.`);
    }

    // Single Source of Truth Acceptance Pipeline
    await this.driverAcceptance.acceptRide(driver.id, rideId, { isNegotiationAccepted: true });

    await this.auditService.log({
      actorId,
      action: 'ADMIN_FORCE_ASSIGN_INTERCITY_DRIVER',
      entityType: 'Ride',
      entityId: rideId,
      oldValue: { driverId: ride.driverId, status: ride.status },
      newValue: { driverId: driver.id, status: 'DRIVER_ACCEPTED' },
    });

    return { success: true, rideId, driverId: driver.id, status: 'DRIVER_ACCEPTED' };
  }
}
