import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { LocationService } from '../../application/location.service';
import type { LocationPingDto } from '../../application/location.service';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('ping')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('DRIVER')
  async handlePing(
    @Request() req,
    @Body() data: LocationPingDto,
  ): Promise<void> {
    // Current userId/driverId is attached by AuthGuard
    const driverId = req.user.userId;
    await this.locationService.updateDriverLocation(driverId, data);
  }
}
