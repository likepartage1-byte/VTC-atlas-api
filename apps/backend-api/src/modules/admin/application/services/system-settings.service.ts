import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getSetting<T>(key: string): Promise<T | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting || !setting.value) {
      return null;
    }

    return setting.value as unknown as T;
  }

  async updateSetting(key: string, value: any, actorId?: string): Promise<void> {
    const oldValue = await this.getSetting(key);

    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await this.auditService.log({
      actorId,
      action: 'UPDATE_SETTING',
      entityType: 'SystemSetting',
      entityId: key,
      oldValue,
      newValue: value,
    });

    this.logger.log(`System Setting updated: ${key}`);
  }

  /**
   * CORE FINANCIAL CONTROL: Commission Rate
   */
  async getCommissionRate(): Promise<number> {
    const rate = await this.getSetting<{ rate: number }>('commission_rate');
    return rate?.rate ?? 0.08; // Default 8%
  }

  async updateCommissionRate(rate: number, actorId?: string): Promise<void> {
    // Business Rule Validation
    if (rate < 0 || rate > 0.5) {
      throw new BadRequestException('Commission rate must be between 0% and 50%');
    }

    await this.updateSetting('commission_rate', { rate }, actorId);
    this.logger.warn(`CRITICAL: Commission rate updated to ${rate * 100}% by ${actorId}`);
  }

  /**
   * UI/UX THEME CONTROL: Design Tokens
   */
  async getThemeConfig() {
    return await this.getSetting('theme_config') || { mode: 'light', primary: '#3B82F6' };
  }
}
