import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the start of the current week (Monday 00:00)
   */
  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Calculates the end of the current week (Sunday 23:59:59)
   */
  private getEndOfWeek(): Date {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }

  /**
   * Helper to retrieve value from SystemSetting
   */
  private async getSystemSetting(key: string, defaultValue: any): Promise<any> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key },
      });
      if (setting && setting.value !== undefined && setting.value !== null) {
        // Value might be parsed JSON structure already
        return setting.value;
      }
    } catch (e) {
      // Graceful fallback
    }
    return defaultValue;
  }

  /**
   * Retrieves all driver statistics and profiles in a single query
   */
  async getDriverProfile(userId: string) {
    // 1. Fetch driver profile with user & account & verification details
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        user: true,
        account: true,
        verification: {
          include: {
            documents: {
              where: {
                type: 'PROFILE_PHOTO',
                status: 'APPROVED',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const startOfWeek = this.getStartOfWeek();
    const endOfWeek = this.getEndOfWeek();

    // 2. Load system configurations with fallbacks
    const silverCommission  = Number(await this.getSystemSetting('silver_commission', 15));
    const goldCommission    = Number(await this.getSystemSetting('gold_commission', 10));
    const premierCommission = Number(await this.getSystemSetting('premier_commission', 8));
    const priorityEnabled   = Boolean(await this.getSystemSetting('priority_enabled', true));

    // 3. Count total completed rides
    const completedRides = await this.prisma.ride.count({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
      },
    });

    // 4. Count weekly completed rides (since Monday 00:00)
    const weeklyCompletedRides = await this.prisma.ride.count({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfWeek,
        },
      },
    });

    // 5. Calculate total earnings (sum of driverEarnings in RideLedger or account totalEarned)
    const totalEarnings = driver.account ? Number(driver.account.totalEarned) : 0;

    // 6. Calculate current week's earnings
    const weeklyLedgers = await this.prisma.rideLedger.aggregate({
      where: {
        driverId: driver.id,
        status: 'PROCESSED',
        createdAt: {
          gte: startOfWeek,
        },
      },
      _sum: {
        driverEarnings: true,
      },
    });
    const weekEarnings = weeklyLedgers._sum.driverEarnings ? Number(weeklyLedgers._sum.driverEarnings) : 0;

    // 7. Calculate Acceptance and Cancellation rates dynamically
    const totalOffers = await this.prisma.negotiation.count({
      where: { driverId: driver.id },
    });
    const acceptedOffers = await this.prisma.negotiation.count({
      where: { driverId: driver.id, status: 'ACCEPTED' },
    });
    const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 94; // fallback

    const totalDriverRides = await this.prisma.ride.count({
      where: { driverId: driver.id },
    });
    const cancelledCount = await this.prisma.ride.count({
      where: { driverId: driver.id, status: 'CANCELLED' },
    });
    const cancellationRate = totalDriverRides > 0 ? Math.round((cancelledCount / totalDriverRides) * 100) : 3; // fallback

    // 8. Calculate Online Hours Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const locationHistory = await this.prisma.driverLocationHistory.findMany({
      where: {
        driverId: driver.id,
        timestamp: {
          gte: startOfToday,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    let onlineHoursToday = 0;
    if (locationHistory.length > 1) {
      const start = locationHistory[0].timestamp.getTime();
      const end = locationHistory[locationHistory.length - 1].timestamp.getTime();
      onlineHoursToday = Number(((end - start) / (1000 * 60 * 60)).toFixed(1));
    } else if (locationHistory.length === 1) {
      onlineHoursToday = 0.1;
    }

    // 9. Extract profile photo URL
    const docPhoto = driver.verification?.documents?.[0];
    const profilePhoto = docPhoto?.url || (docPhoto?.storageKey ? `/uploads/${docPhoto.storageKey}` : null);

    // 10. Verification status & driver tier (based on total completed rides)
    const isVerified = driver.verification?.status === 'APPROVED';

    // Tier thresholds:
    //   Silver  : 0–2   total completed rides
    //   Gold    : 3–29  total completed rides
    //   Premier : ≥ 30  total completed rides
    let currentLevel: string;
    let target: number;
    let isPremier: boolean;

    if (completedRides >= 30) {
      currentLevel = 'PREMIER';
      target       = 30;
      isPremier    = true;
    } else if (completedRides >= 3) {
      currentLevel = 'GOLD';
      target       = 30;
      isPremier    = false;
    } else {
      currentLevel = 'SILVER';
      target       = 3;
      isPremier    = false;
    }

    const remaining = Math.max(0, target - completedRides);
    const progress  = Number(Math.min(completedRides / target, 1).toFixed(2));

    const commission = isPremier
      ? premierCommission
      : currentLevel === 'GOLD' ? goldCommission : silverCommission;

    return {
      driver: {
        id: `DRV-${driver.id.substring(0, 5).toUpperCase()}`,
        name: driver.user.fullName,
        avatar: profilePhoto,
        rating: (() => {
          if (completedRides === 0) return 4.8;
          if (completedRides === 1) return 4.99;
          return 5.0;
        })(),
        verified: isVerified,
        badge: currentLevel,
      },
      statistics: {
        completedRides,
        weeklyCompletedRides,
        acceptanceRate,
        cancellationRate,
        onlineHoursToday,
        totalEarnings,
        weekEarnings,
      },
      weeklyChallenge: {
        currentLevel,
        target,
        completed: completedRides,
        remaining,
        progress,
        weekStart: startOfWeek.toISOString(),
        weekEnd: endOfWeek.toISOString(),
        isPlatinum: isPremier, // kept as `isPlatinum` so frontend works without changes
      },
      benefits: {
        commission,
        priorityMatching: isPremier && priorityEnabled,
      },
    };
  }
}
