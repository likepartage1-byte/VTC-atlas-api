import { Controller, Post, Get, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditLogService } from '../../application/services/audit-log.service';

@Controller('admin/growth')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminGrowthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // --- Campaign Management ---

  @Post('campaigns')
  async createCampaign(@Body() data: any, @Body('actorId') actorId: string) {
    const campaign = await this.prisma.rewardCampaign.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
    });

    await this.auditLog.log({
      actorId,
      action: 'CREATE_CAMPAIGN',
      entityType: 'RewardCampaign',
      entityId: campaign.id,
      newValue: campaign,
    });

    return campaign;
  }

  @Get('campaigns')
  async listCampaigns() {
    return this.prisma.rewardCampaign.findMany({
      include: { _count: { select: { prizes: true, promoCodes: true } } },
    });
  }

  @Post('campaigns/:id/prizes')
  async addPrize(@Param('id') campaignId: string, @Body() data: any, @Body('actorId') actorId: string) {
    const prize = await this.prisma.rewardPrize.create({
      data: {
        campaignId,
        type: data.type,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        probWeight: data.probWeight,
        stockLimit: data.stockLimit,
        value: data.value,
      },
    });

    await this.auditLog.log({
      actorId,
      action: 'ADD_PRIZE_TO_CAMPAIGN',
      entityType: 'RewardPrize',
      entityId: prize.id,
      newValue: prize,
    });

    return prize;
  }

  // --- Promo Code Management ---

  @Post('promos')
  async createPromo(@Body() data: any, @Body('actorId') actorId: string) {
    const promo = await this.prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        campaignId: data.campaignId,
        type: data.type || 'DISCOUNT',
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUsageTotal: data.maxUsageTotal,
        maxUsagePerUser: data.maxUsagePerUser || 1,
        minRideValue: data.minRideValue,
        cityRestrictions: data.cityRestrictions,
        serviceTypes: data.serviceTypes,
        expiresAt: new Date(data.expiresAt),
        isActive: true,
      },
    });

    await this.auditLog.log({
      actorId,
      action: 'CREATE_PROMO',
      entityType: 'PromoCode',
      entityId: promo.id,
      newValue: promo,
    });

    return promo;
  }

  @Get('promos')
  async listPromos() {
    return this.prisma.promoCode.findMany({
      include: { campaign: { select: { name: true } } },
    });
  }
}
