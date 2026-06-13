import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches pre-aggregated operational insights.
   * High performance: No complex JOINs or SUMs over billion-row tables.
   */
  @Get('insights')
  async getInsights(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Read from the Analytics Store (Read Model)
    const revenueStats = { value: '0' }; // Placeholder for now

    const totalRides = await this.prisma.ride.count({
      where: {
        requestedAt: {
          gte: new Date(targetDate),
        },
      },
    });

    return {
      date: targetDate,
      revenue: revenueStats?.value || '0',
      currency: 'MAD',
      completedRides: totalRides,
      health: 'OPTIMAL',
    };
  }
}
