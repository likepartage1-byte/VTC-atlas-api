import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class FinancialDashboardService {
  private readonly logger = new Logger(FinancialDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRevenueInsights() {
    const [counts, sums] = await Promise.all([
      this.prisma.ride.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.rideLedger.aggregate({
        _sum: {
          totalAmount: true,
          companyFee: true,
          driverEarnings: true,
        },
      }),
    ]);

    const stats = {
      totalRevenue: Number(sums._sum.totalAmount || 0),
      totalCommission: Number(sums._sum.companyFee || 0),
      totalDriverEarnings: Number(sums._sum.driverEarnings || 0),
      rideCounts: counts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
    };

    return stats;
  }

  async getTopDrivers(limit = 10) {
    return this.prisma.driverAccount.findMany({
      orderBy: { totalEarned: 'desc' },
      take: limit,
      include: {
        driver: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } }
          }
        }
      }
    });
  }

  async getLedgerSummary() {
    return this.prisma.rideLedger.groupBy({
      by: ['status'],
      _count: true,
    });
  }
}
