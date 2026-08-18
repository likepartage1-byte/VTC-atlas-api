import { Controller, Get, Patch, Post, Body, Query, UseGuards, Version, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { ProfileService } from '../../application/services/profile.service';

@Controller('driver/profile')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER', 'PASSENGER')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @Version('1')
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getDriverProfile(userId);
  }

  @Patch()
  @Version('1')
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() data: any,
  ) {
    return this.profileService.updateDriverProfile(userId, data);
  }

  @Get('vehicle/manufacturers')
  @Version('1')
  async getManufacturers() {
    return this.profileService.getManufacturers();
  }

  @Get('vehicle/models')
  @Version('1')
  async getModels(@Query('manufacturer') manufacturer?: string) {
    return this.profileService.getModels(manufacturer);
  }

  @Post('vehicle/models/suggest')
  @Version('1')
  async suggestModel(
    @CurrentUser('userId') userId: string,
    @Body() body: { manufacturerName: string; modelName: string },
  ) {
    return this.profileService.suggestModel(userId, body.manufacturerName, body.modelName);
  }

  @Get('vehicle')
  @Version('1')
  async getVehicle(@CurrentUser('userId') userId: string) {
    return this.profileService.getVehicleProfile(userId);
  }

  @Patch('vehicle')
  @Version('1')
  async updateVehicle(
    @CurrentUser('userId') userId: string,
    @Body() data: any,
  ) {
    return this.profileService.updateVehicleProfile(userId, data);
  }

  @Post('vehicle/photo')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVehiclePhoto(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.uploadVehiclePhoto(userId, file);
  }
}
