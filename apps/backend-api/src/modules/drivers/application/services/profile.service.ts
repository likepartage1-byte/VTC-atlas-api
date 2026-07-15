import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { LocalStorageProvider } from '../../infrastructure/storage/storage.provider';
import * as path from 'path';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageProvider,
  ) {}

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
    const dbDriver = await this.prisma.driver.findUnique({
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

    let driver = dbDriver;

    if (!driver) {
      // Auto-initialize Driver profile for self-healing (robust user promotion protection)
      driver = await this.prisma.$transaction(async (tx) => {
        const d = await tx.driver.create({
          data: {
            userId,
            status: 'OFFLINE',
            rating: 5.0,
            vehicleInfo: {},
          },
        });

        // Initialize verification record
        await tx.driverVerification.create({
          data: {
            driverId: d.id,
            status: 'PENDING',
          },
        });

        // Initialize driver account
        await tx.driverAccount.create({
          data: {
            driverId: d.id,
            balance: 0,
            totalEarned: 0,
          },
        });

        return tx.driver.findUnique({
          where: { id: d.id },
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
      }) as any;
    }

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

    // 10. Verification status & driver tier
    const isVerified = driver.verification?.status === 'APPROVED';

    // ── Tier Logic ─────────────────────────────────────────────────────────────
    // Gold & Silver are PERMANENT (based on total lifetime rides):
    //   🥈 Silver  : total < 3
    //   🥇 Gold    : total >= 3
    //
    // Premier is WEEKLY (based on rides completed this week Mon–Sun 23:59):
    //   💎 Premier : weeklyCompletedRides >= premierWeeklyTarget (default 30)
    //   Resets every Monday. Falls back to Gold/Silver baseline automatically.
    const premierWeeklyTarget = Number(await this.getSystemSetting('premier_weekly_target', 30));

    let currentLevel: string;
    let challengeTarget: number;    // rides required to reach next tier
    let challengeCompleted: number; // relevant counter for progress bar
    let isPremier: boolean;

    if (weeklyCompletedRides >= premierWeeklyTarget) {
      // Premier: achieved this week — show weekly progress against 30
      currentLevel       = 'PREMIER';
      challengeTarget    = premierWeeklyTarget;
      challengeCompleted = weeklyCompletedRides;
      isPremier          = true;
    } else if (completedRides >= 3) {
      // Gold: permanent. Progress bar shows weekly rides toward Premier this week
      currentLevel       = 'GOLD';
      challengeTarget    = premierWeeklyTarget;
      challengeCompleted = weeklyCompletedRides;
      isPremier          = false;
    } else {
      // Silver: permanent. Progress bar shows total rides toward Gold (target 3)
      currentLevel       = 'SILVER';
      challengeTarget    = 3;
      challengeCompleted = completedRides;
      isPremier          = false;
    }

    const remaining = Math.max(0, challengeTarget - challengeCompleted);
    const progress  = Number(Math.min(challengeCompleted / challengeTarget, 1).toFixed(2));

    const commission = isPremier
      ? premierCommission
      : currentLevel === 'GOLD' ? goldCommission : silverCommission;

    const verificationMetadata = (driver.verification?.metadata as any) || {};
    const req = verificationMetadata.profileUpdateRequest;
    let pendingProfileUpdate = null;
    let rejectedProfileUpdate = null;

    if (req) {
      if (req.status === 'PENDING') {
        pendingProfileUpdate = req;
      } else if (req.status === 'REJECTED') {
        rejectedProfileUpdate = req;
      }
    }

    return {
      driver: {
        id: `DRV-${driver.id.substring(0, 5).toUpperCase()}`,
        name: driver.user.fullName,
        phone: driver.user.phoneNumber,
        email: driver.user.email || '',
        avatar: profilePhoto,
        rating: (() => {
          if (completedRides === 0) return 4.8;
          if (completedRides === 1) return 4.99;
          return 5.0;
        })(),
        verified: isVerified,
        badge: currentLevel,
      },
      personalInfo: {
        firstName: driver.user.firstName || '',
        lastName: driver.user.lastName || '',
        fullName: driver.user.fullName || '',
        phone: driver.user.phoneNumber || '',
        email: driver.user.email || '',
        birthDate: driver.user.birthDate || '',
        gender: driver.user.gender || '',
        language: driver.user.language || 'FR',
        city: driver.user.city || '',
        address: driver.user.address || '',
      },
      pendingProfileUpdate,
      rejectedProfileUpdate,
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
        target:    challengeTarget,
        completed: challengeCompleted,
        remaining,
        progress,
        weekStart: startOfWeek.toISOString(),
        weekEnd:   endOfWeek.toISOString(),
        isPlatinum: isPremier, // frontend uses isPlatinum to trigger Crown/confetti
      },
      benefits: {
        commission,
        priorityMatching: isPremier && priorityEnabled,
      },
    };
  }

  async updateDriverProfile(userId: string, data: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { verification: true, user: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    let verification = driver.verification;
    if (!verification) {
      verification = await this.prisma.driverVerification.create({
        data: {
          driverId: driver.id,
          status: 'PENDING',
        },
      });
    }

    const fields: any = {};
    if (data.firstName !== undefined) fields.firstName = data.firstName;
    if (data.lastName !== undefined) fields.lastName = data.lastName;

    if (data.fullName !== undefined && data.fullName.trim() !== '') {
      fields.fullName = data.fullName;
    } else if (data.firstName !== undefined || data.lastName !== undefined) {
      const first = data.firstName !== undefined ? data.firstName : ((verification.metadata as any)?.profileUpdateRequest?.fields?.firstName || driver.user?.firstName || '');
      const last = data.lastName !== undefined ? data.lastName : ((verification.metadata as any)?.profileUpdateRequest?.fields?.lastName || driver.user?.lastName || '');
      fields.fullName = `${first} ${last}`.trim() || 'New User';
    }

    if (data.email !== undefined) fields.email = data.email || null;
    if (data.birthDate !== undefined) fields.birthDate = data.birthDate;
    if (data.gender !== undefined) fields.gender = data.gender;
    if (data.language !== undefined) fields.language = data.language;
    if (data.city !== undefined) fields.city = data.city;
    if (data.address !== undefined) fields.address = data.address;

    const metadata = (verification.metadata as any) || {};
    metadata.profileUpdateRequest = {
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      fields,
    };

    await this.prisma.driverVerification.update({
      where: { id: verification.id },
      data: { metadata },
    });

    return this.getDriverProfile(userId);
  }

  /**
   * Retrieves vehicle info and requests.
   */
  async getVehicleProfile(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { verification: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const currentVehicle = (driver.vehicleInfo as any) || {};

    const verificationMetadata = (driver.verification?.metadata as any) || {};
    const req = verificationMetadata.vehicleUpdateRequest;
    let pendingVehicleUpdate = null;
    let rejectedVehicleUpdate = null;

    if (req) {
      if (req.status === 'PENDING') {
        pendingVehicleUpdate = req;
      } else if (req.status === 'REJECTED') {
        rejectedVehicleUpdate = req;
      }
    }

    return {
      vehicleInfo: {
        type: currentVehicle.type || 'CAR',
        manufacturer: currentVehicle.manufacturer || '',
        brand: currentVehicle.brand || '',
        model: currentVehicle.model || '',
        year: currentVehicle.year || '',
        color: currentVehicle.color || '',
        fuelType: currentVehicle.fuelType || '',
        transmission: currentVehicle.transmission || '',
        seats: currentVehicle.seats || 4,
        plateNumber: currentVehicle.plateNumber || '',
        registrationNumber: currentVehicle.registrationNumber || '',
        vin: currentVehicle.vin || '',
        photos: currentVehicle.photos || {
          front: null,
          back: null,
          right: null,
          left: null,
          interior: null,
          plate: null,
        },
      },
      pendingVehicleUpdate,
      rejectedVehicleUpdate,
    };
  }

  /**
   * Submit an update request for vehicle details and photos.
   */
  async updateVehicleProfile(userId: string, data: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { verification: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    let verification = driver.verification;
    if (!verification) {
      verification = await this.prisma.driverVerification.create({
        data: {
          driverId: driver.id,
          status: 'PENDING',
        },
      });
    }

    const metadata = (verification.metadata as any) || {};
    const existingReq = metadata.vehicleUpdateRequest;
    if (existingReq && existingReq.status === 'PENDING') {
      throw new BadRequestException('You already have a pending vehicle update request');
    }

    const fields: any = {};
    if (data.type !== undefined) fields.type = data.type;
    if (data.manufacturer !== undefined) fields.manufacturer = data.manufacturer;
    if (data.brand !== undefined) fields.brand = data.brand;
    if (data.model !== undefined) fields.model = data.model;
    if (data.year !== undefined) fields.year = Number(data.year) || data.year;
    if (data.color !== undefined) fields.color = data.color;
    if (data.fuelType !== undefined) fields.fuelType = data.fuelType;
    if (data.transmission !== undefined) fields.transmission = data.transmission;
    if (data.seats !== undefined) fields.seats = Number(data.seats) || data.seats;
    if (data.plateNumber !== undefined) fields.plateNumber = data.plateNumber;
    if (data.registrationNumber !== undefined) fields.registrationNumber = data.registrationNumber;

    // VIN is view-only, retrieve from existing configuration.
    const currentVIN = (driver.vehicleInfo as any)?.vin || '';
    fields.vin = currentVIN;

    const photos: any = {
      front: data.photos?.front || (driver.vehicleInfo as any)?.photos?.front || null,
      back: data.photos?.back || (driver.vehicleInfo as any)?.photos?.back || null,
      right: data.photos?.right || (driver.vehicleInfo as any)?.photos?.right || null,
      left: data.photos?.left || (driver.vehicleInfo as any)?.photos?.left || null,
      plate: data.photos?.plate || (driver.vehicleInfo as any)?.photos?.plate || null,
    };
    if (data.type === 'MOTORCYCLE') {
      photos.interior = null;
    } else {
      photos.interior = data.photos?.interior || (driver.vehicleInfo as any)?.photos?.interior || null;
    }

    metadata.vehicleUpdateRequest = {
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      fields,
      photos,
    };

    await this.prisma.driverVerification.update({
      where: { id: verification.id },
      data: { metadata },
    });

    return this.getVehicleProfile(userId);
  }

  /**
   * Upload an image for a vehicle photo slot.
   */
  async uploadVehiclePhoto(userId: string, file: Express.Multer.File) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.jpg';
    const storageKey = `drivers/${driver.id}/vehicle_${timestamp}${ext}`;

    const { url } = await this.storage.uploadFile(file, storageKey);
    return { url };
  }
}

