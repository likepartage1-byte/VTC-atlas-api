import { Controller, Post, Get, Body, Param, HttpCode, UseGuards, Version, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { RideService } from '../../application/ride.service';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import { RequestRideDto } from '../dtos/request-ride.dto';
import { RideResponseDto } from '../dtos/ride-response.dto';

import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Passenger Rides')
@ApiBearerAuth()
@Controller('passenger/rides')
@UseGuards(AuthGuard, RolesGuard)
@Roles('PASSENGER', 'DRIVER')
export class PassengerRideController {
  constructor(
    private readonly rideService: RideService,
    private readonly rideOrchestrator: RideOrchestrator,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Version('1')
  async requestRide(
    @CurrentUser('userId') userId: string,
    @Body() dto: RequestRideDto,
  ): Promise<RideResponseDto> {
    return this.rideOrchestrator.requestRide(userId, dto);
  }

  // NOTE: @Get('active') MUST be declared BEFORE @Get(':id') to prevent
  // NestJS matching 'active' as a :id path parameter.
  @Get('active')
  @Version('1')
  async getActiveRide(
    @CurrentUser('userId') userId: string,
  ): Promise<RideResponseDto | null> {
    return this.rideService.getActiveRideForPassenger(userId);
  }

  @Get('history')
  @Version('1')
  async getRideHistory(
    @CurrentUser('userId') userId: string,
  ): Promise<RideResponseDto[]> {
    return this.rideService.getRideHistoryForPassenger(userId);
  }

  @Get(':id')
  @Version('1')
  async getRideStatus(
    @Param('id') rideId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<RideResponseDto> {
    return this.rideService.getRideForPassenger(rideId, userId);
  }

  @Post(':id/cancel')
  @Version('1')
  @HttpCode(200)
  async cancelRide(
    @Param('id') rideId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.rideService.updateStatus(rideId, 'CANCELLED', userId);
    return { message: 'Ride cancelled successfully.' };
  }

  @Post(':id/dev-accept')
  @Version('1')
  @HttpCode(200)
  async devAcceptRide(
    @Param('id') rideId: string,
  ): Promise<{ message: string; ride: any }> {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev test endpoints are strictly disabled in production.');
    }

    let driver = await this.prisma.driver.findFirst({
      include: { user: true },
    });

    if (!driver) {
      const testUser = await this.prisma.user.create({
        data: {
          fullName: 'Sami Driver (Test)',
          phoneNumber: '+212600000000',
          role: 'DRIVER',
        },
      });
      driver = await this.prisma.driver.create({
        data: {
          userId: testUser.id,
          status: 'AVAILABLE',
          vehicleInfo: { make: 'Dacia', model: 'Logan', plate: 'Marrakech 44-A-12345' },
        },
        include: { user: true },
      });
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'DRIVER_ACCEPTED',
        driverId: driver.id,
        acceptedAt: new Date(),
      },
      include: { driver: { include: { user: true } } },
    });

    return { message: 'Ride accepted by test driver successfully', ride: updatedRide };
  }
}
