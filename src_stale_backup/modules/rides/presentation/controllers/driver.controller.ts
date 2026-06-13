import { Controller, Post, Patch, Body, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { RideOrchestrator } from '../../application/orchestration/ride.orchestrator';
import type { LocationPingDto } from '../../../location/application/location.service';
import { UpdateDriverStatusDto } from '../../presentation/dtos/update-driver-status.dto';

@Controller('driver')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriverController {
  constructor(private readonly orchestrator: RideOrchestrator) {}

  @Patch('status')
  @Version('1')
  async updateAvailability(
    @CurrentUser('userId') driverId: string,
    @Body() dto: UpdateDriverStatusDto,
  ) {
    await this.orchestrator.updateDriverStatus(driverId, dto);
    return { status: 'availability_updated' };
  }

  @Post('location')
  @Version('1')
  async pingLocation(
    @CurrentUser('userId') driverId: string,
    @Body() dto: LocationPingDto,
  ) {
    await this.orchestrator.updateDriverLocation(driverId, dto);
    return { status: 'location_synced' };
  }
}
