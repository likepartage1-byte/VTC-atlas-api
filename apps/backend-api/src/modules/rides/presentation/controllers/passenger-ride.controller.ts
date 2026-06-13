import { Controller, Post, Get, Body, Param, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { RideService } from '../../application/ride.service';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import { RequestRideDto } from '../dtos/request-ride.dto';
import { RideResponseDto } from '../dtos/ride-response.dto';

@Controller('passenger/rides')
@UseGuards(AuthGuard, RolesGuard)
@Roles('PASSENGER')
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

  @Get(':id')
  @Version('1')
  async getRideStatus(
    @Param('id') rideId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<RideResponseDto> {
    return this.rideService.getRideForPassenger(rideId, userId);
  }

  @Get('active')
  @Version('1')
  async getActiveRide(
    @CurrentUser('userId') userId: string,
  ): Promise<RideResponseDto | null> {
    return this.rideService.getActiveRideForPassenger(userId);
  }
}
