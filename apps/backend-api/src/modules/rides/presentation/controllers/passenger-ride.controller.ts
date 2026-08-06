import { Controller, Post, Get, Body, Param, HttpCode, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { RideService } from '../../application/ride.service';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import { RequestRideDto } from '../dtos/request-ride.dto';
import { RideResponseDto } from '../dtos/ride-response.dto';

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
}
