import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { ProfileService } from '../../application/services/profile.service';

@Controller('driver/profile')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @Version('1')
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getDriverProfile(userId);
  }
}
