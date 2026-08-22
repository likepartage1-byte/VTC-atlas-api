import { Controller, Get } from '@nestjs/common';
import { SystemSettingsService } from '../admin/application/services/system-settings.service';

@Controller('homepage')
export class PublicHomepageController {
  constructor(private readonly settings: SystemSettingsService) {}

  @Get('config')
  async getPublishedConfig() {
    const published = await this.settings.getHomepagePublishedConfig();
    return published || { status: 'DEFAULT_FALLBACK' };
  }
}
