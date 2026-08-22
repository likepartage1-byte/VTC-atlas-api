import { Controller, Get, Put, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SystemSettingsService } from '../../application/services/system-settings.service';

@Controller('admin/homepage')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminHomepageController {
  constructor(private readonly settings: SystemSettingsService) {}

  @Get('config')
  async getDraftConfig() {
    const draft = await this.settings.getHomepageDraftConfig();
    return draft || { status: 'DEFAULT_FALLBACK' };
  }

  @Put('config')
  async saveDraftConfig(@Body() body: any, @Req() req: any) {
    await this.settings.updateHomepageDraftConfig(body, req.user?.userId);
    return { success: true, message: 'Draft configuration saved to database.' };
  }

  @Post('publish')
  async publishConfig(@Req() req: any) {
    const published = await this.settings.publishHomepageConfig(req.user?.userId);
    return {
      success: true,
      message: `Published successfully as version ${published.version}`,
      version: published.version,
      publishedAt: published.publishedAt,
    };
  }
}
