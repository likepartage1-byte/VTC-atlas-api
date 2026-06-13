import { Controller, Post, Patch, Body, Param, UseGuards, Version, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import { UpdateDriverStatusDto } from '../dtos/update-driver-status.dto';

@Controller('driver/rides')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriverRideController {
  constructor(private readonly orchestrator: RideOrchestrator) {}

  @Post(':id/accept')
  @Version('1')
  async acceptRide(
    @Param('id') rideId: string,
    @CurrentUser('userId') driverId: string,
  ) {
    return this.orchestrator.acceptRide(driverId, rideId);
  }

  @Post(':id/arrive')
  @Version('1')
  async reportArrival(
    @Param('id') rideId: string,
    @CurrentUser('userId') driverId: string,
  ) {
    const otp = await this.orchestrator.reportArrival(driverId, rideId);
    return { message: 'Arrival reported. Waiting for OTP.', otp_required: true };
  }

  @Post(':id/start')
  @Version('1')
  async startTrip(
    @Param('id') rideId: string,
    @CurrentUser('userId') driverId: string,
    @Body('otp') otp: string,
  ) {
    if (!otp) throw new BadRequestException('OTP is required to start the trip.');
    await this.orchestrator.startTrip(rideId, driverId, otp);
    return { message: 'Trip started successfully.' };
  }

  @Post(':id/complete')
  @Version('1')
  async completeTrip(
    @Param('id') rideId: string,
    @CurrentUser('userId') driverId: string,  // NOW REQUIRED — Authorization fix
  ) {
    await this.orchestrator.completeRide(rideId, driverId);
    return { message: 'Trip completed.' };
  }
}
