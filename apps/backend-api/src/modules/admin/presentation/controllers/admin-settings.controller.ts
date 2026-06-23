import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SystemSettingsService } from '../../application/services/system-settings.service';

@Controller('admin/settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSettingsController {
  constructor(private readonly settings: SystemSettingsService) {}

  @Get()
  async getAllSettings() {
    return {
      commission: await this.settings.getCommissionRate(),
      theme: await this.settings.getThemeConfig(),
    };
  }

  @Get('commission')
  async getCommission() {
    return { 
      commission: await this.settings.getCommissionRate() 
    };
  }

  /**
   * Financial Control: Update Commission
   */
  @Patch('commission')
  async updateCommission(
    @Body('rate') rate: number,
    @Req() req: any,
  ) {
    await this.settings.updateCommissionRate(rate, req.user.userId);
    return { success: true, newRate: rate };
  }

  /**
   * UI Control: Update Theme
   */
  @Patch('theme')
  async updateTheme(@Body() config: any, @Req() req: any) {
    await this.settings.updateSetting('theme_config', config, req.user.userId);
    return { success: true };
  }

  /**
   * Feature Flags & Notifications
   */
  @Patch('features')
  async updateFeatures(@Body() flags: any, @Req() req: any) {
    await this.settings.updateSetting('feature_flags', flags, req.user.userId);
    return { success: true };
  }
}
