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

  /**
   * HOMEPAGE BUILDER & PERSISTENCE CONTROL (Phase 7-B.6.3)
   */
  async getHomepageDraftConfig(): Promise<any> {
    return await this.getSetting('homepage_draft_config');
  }

  async updateHomepageDraftConfig(draftData: any, actorId?: string): Promise<void> {
    const current = await this.getHomepageDraftConfig() || {};
    const updated = {
      ...current,
      ...draftData,
      isDraft: true,
      lastSavedAt: new Date().toISOString(),
    };
    await this.updateSetting('homepage_draft_config', updated, actorId);
  }

  async publishHomepageConfig(actorId?: string): Promise<any> {
    const draft = await this.getHomepageDraftConfig();
    if (!draft) {
      throw new BadRequestException('No draft configuration available to publish.');
    }

    const currentPublished = await this.getHomepagePublishedConfig() || {};
    const currentVersion = currentPublished.version || 0;

    const published = {
      ...draft,
      isDraft: false,
      version: currentVersion + 1,
      publishedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    };

    // Transactional save to published key & draft sync
    await this.updateSetting('homepage_published_config', published, actorId);
    await this.updateSetting('homepage_draft_config', published, actorId);

    // Audit Logging
    await this.auditService.log({
      actorId,
      action: 'PUBLISH_HOMEPAGE_CONFIG',
      entityType: 'HomepageConfig',
      entityId: 'homepage_published_config',
      oldValue: { version: currentVersion },
      newValue: { version: published.version, publishedAt: published.publishedAt },
    });

    this.logger.log(`Homepage config v${published.version} published by ${actorId}`);
    return published;
  }

  async getHomepagePublishedConfig(): Promise<any> {
    return await this.getSetting('homepage_published_config');
  }
}
