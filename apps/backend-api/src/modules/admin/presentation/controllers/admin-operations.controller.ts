import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole, DriverStatus } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('admin/location')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOperationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  async getLiveLocations() {
    const onlineDrivers = await this.prisma.driver.findMany({
      where: {
        status: {
          not: DriverStatus.OFFLINE
        }
      },
      include: {
        user: {
          select: {
            fullName: true
          }
        }
      }
    });

    return onlineDrivers.map(d => ({
      driverId: d.id,
      lat: d.currentLat,
      lng: d.currentLng,
      status: d.status,
      fullName: d.user.fullName,
      lastUpdate: d.lastLocationAt
    }));
  }
}
