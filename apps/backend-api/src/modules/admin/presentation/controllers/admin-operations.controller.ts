import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole, DriverStatus, RideStatus } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOperationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('location/live')
  async getLiveLocations() {
    const onlineDrivers = await this.prisma.driver.findMany({
      where: {
        status: {
          not: DriverStatus.OFFLINE,
        },
        user: {
          status: {
            notIn: ['TRASHED', 'SUSPENDED'],
          },
          NOT: {
            fullName: {
              startsWith: 'Deleted User (',
            },
          },
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return onlineDrivers.map((d) => ({
      driverId: d.id,
      userId: d.userId,
      lat: d.currentLat,
      lng: d.currentLng,
      status: d.status,
      fullName: d.user.fullName,
      lastUpdate: d.lastLocationAt,
    }));
  }

  @Get('dashboard/summary')
  async getDashboardSummary() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      onlineDriversCount,
      totalDriversCount,
      activeRidesCount,
      todayRidesCount,
      criticalAlertsCount,
      pendingVerificationsCount,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.driver.count({
        where: {
          status: { not: DriverStatus.OFFLINE },
          user: {
            status: { notIn: ['TRASHED', 'SUSPENDED'] },
            NOT: { fullName: { startsWith: 'Deleted User (' } },
          },
        },
      }),
      this.prisma.driver.count({
        where: {
          user: {
            status: { notIn: ['TRASHED', 'SUSPENDED'] },
            NOT: { fullName: { startsWith: 'Deleted User (' } },
          },
        },
      }),
      this.prisma.ride.count({
        where: {
          status: {
            in: [
              RideStatus.REQUESTED,
              RideStatus.DISPATCHED,
              RideStatus.DRIVER_ACCEPTED,
              RideStatus.ARRIVED,
              RideStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.ride.count({
        where: { requestedAt: { gte: startOfDay } },
      }),
      this.prisma.fraudEvent.count({
        where: { severity: { in: ['HIGH', 'CRITICAL'] } },
      }),
      this.prisma.driverVerification.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      systemHealth: {
        status: 'HEALTHY',
        database: 'Connected (MySQL)',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      liveRides: {
        active: activeRidesCount,
        todayTotal: todayRidesCount,
      },
      drivers: {
        online: onlineDriversCount,
        total: totalDriversCount,
      },
      alerts: {
        criticalSecurity: criticalAlertsCount,
        pendingVerifications: pendingVerificationsCount,
      },
      recentEvents: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        actorId: log.actorId || 'SYSTEM',
        createdAt: log.createdAt,
      })),
    };
  }
}
