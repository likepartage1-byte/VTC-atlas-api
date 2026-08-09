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
              },
              orderBy: { version: 'desc' },
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Load system configurations & driver statistics in parallel
    const [
      silverCommSetting,
      goldCommSetting,
      premierCommSetting,
      priorityEnabledSetting,
      premierWeeklyTargetSetting,
      completedRides,
      weeklyCompletedRides,
      weeklyLedgers,
      totalOffers,
      acceptedOffers,
      totalDriverRides,
      cancelledCount,
      locMinMax,
    ] = await Promise.all([
      this.getSystemSetting('silver_commission', 15),
      this.getSystemSetting('gold_commission', 10),
      this.getSystemSetting('premier_commission', 8),
      this.getSystemSetting('priority_enabled', true),
      this.getSystemSetting('premier_weekly_target', 30),
      this.prisma.ride.count({
        where: { driverId: driver.id, status: 'COMPLETED' },
      }),
      this.prisma.ride.count({
        where: {
          driverId: driver.id,
          status: 'COMPLETED',
          completedAt: { gte: startOfWeek },
        },
      }),
      this.prisma.rideLedger.aggregate({
        where: {
          driverId: driver.id,
          status: 'PROCESSED',
          createdAt: { gte: startOfWeek },
        },
        _sum: { driverEarnings: true },
      }),
      this.prisma.negotiation.count({
        where: { driverId: driver.id },
      }),
      this.prisma.negotiation.count({
        where: { driverId: driver.id, status: 'ACCEPTED' },
      }),
      this.prisma.ride.count({
        where: { driverId: driver.id },
      }),
      this.prisma.ride.count({
        where: { driverId: driver.id, status: 'CANCELLED' },
      }),
      this.prisma.driverLocationHistory.aggregate({
        where: {
          driverId: driver.id,
          timestamp: { gte: startOfToday },
        },
        _min: { timestamp: true },
        _max: { timestamp: true },
      }),
    ]);

    const silverCommission  = Number(silverCommSetting);
    const goldCommission    = Number(goldCommSetting);
    const premierCommission = Number(premierCommSetting);
    const priorityEnabled   = Boolean(priorityEnabledSetting);
    const premierWeeklyTarget = Number(premierWeeklyTargetSetting);

    // 5. Calculate total earnings
    const totalEarnings = driver.account ? Number(driver.account.totalEarned) : 0;
    const weekEarnings = weeklyLedgers._sum.driverEarnings ? Number(weeklyLedgers._sum.driverEarnings) : 0;

    // 7. Calculate Acceptance and Cancellation rates dynamically
    const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 94;
    const cancellationRate = totalDriverRides > 0 ? Math.round((cancelledCount / totalDriverRides) * 100) : 3;

    // 8. Calculate Online Hours Today using fast _min and _max aggregates
    let onlineHoursToday = 0;
    if (locMinMax._min?.timestamp && locMinMax._max?.timestamp) {
      const start = locMinMax._min.timestamp.getTime();
      const end = locMinMax._max.timestamp.getTime();
      const diffHours = (end - start) / (1000 * 60 * 60);
      onlineHoursToday = diffHours > 0 ? Number(diffHours.toFixed(1)) : 0.1;
    }

    // 9. Extract profile photo URL — prefer driver.avatar (updated on upload), then latest document
    const docPhoto = driver.verification?.documents?.[0];
    const profilePhoto = (driver as any).avatar
      || docPhoto?.url
      || (docPhoto?.storageKey ? `/uploads/${docPhoto.storageKey}` : null);

    // 10. Verification status & driver tier
    const isVerified = driver.verification?.status === 'APPROVED';

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
        vehicleType: (driver.vehicleInfo as any)?.type || 'CAR',
        vehicle_type: (driver.vehicleInfo as any)?.type || 'CAR',
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

    // Check if this is the initial profile name setup for a "New User"
    const currentFullName = driver.user?.fullName;
    const isInitialSetup = !currentFullName || currentFullName === 'New User' || currentFullName.trim() === '';

    if (isInitialSetup && fields.fullName && fields.fullName !== 'New User') {
      // Direct update for initial name setup — no admin approval needed to exit "New User" status
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: fields.firstName ?? driver.user?.firstName,
          lastName: fields.lastName ?? driver.user?.lastName,
          fullName: fields.fullName,
          email: fields.email ?? driver.user?.email,
          city: fields.city ?? driver.user?.city,
        },
      });
      // Remove any pending state since initial setup is approved immediately
      delete metadata.profileUpdateRequest;
    } else {
      metadata.profileUpdateRequest = {
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        fields,
      };
    }

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

    const systemVal = await this.getSystemSetting('max_vehicle_age', { ageLimit: 20 });
    let ageLimit = 20;
    if (systemVal && typeof systemVal === 'object' && systemVal.ageLimit !== undefined) {
      ageLimit = Number(systemVal.ageLimit);
    } else if (typeof systemVal === 'number') {
      ageLimit = systemVal;
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
      maxVehicleAge: ageLimit,
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

    const fields: any = {};
    if (data.type !== undefined) fields.type = data.type;
    if (data.manufacturer !== undefined) fields.manufacturer = String(data.manufacturer).trim().substring(0, 30);
    if (data.brand !== undefined) fields.brand = String(data.brand).trim().substring(0, 30);
    if (data.model !== undefined) fields.model = String(data.model).trim().substring(0, 30);
    if (data.year !== undefined) {
      const yearVal = Number(data.year);
      if (yearVal) {
        const currentYear = new Date().getFullYear();
        const systemVal = await this.getSystemSetting('max_vehicle_age', { ageLimit: 20 });
        let ageLimit = 20;
        if (systemVal && typeof systemVal === 'object' && systemVal.ageLimit !== undefined) {
          ageLimit = Number(systemVal.ageLimit);
        } else if (typeof systemVal === 'number') {
          ageLimit = systemVal;
        }
        const vehicleAge = currentYear - yearVal;
        const backendStrictLimit = ageLimit + 2;

        if (vehicleAge > backendStrictLimit) {
          throw new BadRequestException(
            `❌ This vehicle is not eligible to operate on Yalla VTC because it exceeds the maximum allowed vehicle age of ${ageLimit} years.`
          );
        }
      }
      fields.year = yearVal || data.year;
    }
    if (data.color !== undefined) fields.color = data.color;
    if (data.fuelType !== undefined) fields.fuelType = data.fuelType;
    if (data.transmission !== undefined) fields.transmission = data.transmission;
    if (data.seats !== undefined) fields.seats = Number(data.seats) || data.seats;
    if (data.plateNumber !== undefined) fields.plateNumber = data.plateNumber;
    if (data.registrationNumber !== undefined) fields.registrationNumber = data.registrationNumber;

    const currentVIN = (driver.vehicleInfo as any)?.vin || '';
    fields.vin = currentVIN;

    const photos: any = {
      vehicle: data.photos?.vehicle || (driver.vehicleInfo as any)?.photos?.vehicle || null,
      registration: data.photos?.registration || (driver.vehicleInfo as any)?.photos?.registration || null,
    };

    metadata.vehicleUpdateRequest = {
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      fields,
      photos,
    };

    // Save directly to driver.vehicleInfo so changes take effect immediately
    const currentVehicleInfo = (driver.vehicleInfo as any) || {};
    const updatedVehicleInfo = {
      ...currentVehicleInfo,
      ...fields,
      photos: {
        ...(currentVehicleInfo.photos || {}),
        ...photos,
      },
    };

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        vehicleInfo: updatedVehicleInfo,
      },
    });

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

  async getManufacturers() {
    let list = await this.prisma.manufacturer.findMany({
      orderBy: { name: 'asc' },
    });

    if (list.length === 0) {
      await this.seedManufacturersAndModels();
      list = await this.prisma.manufacturer.findMany({
        orderBy: { name: 'asc' },
      });
    }
    return list;
  }

  async getModels(manufacturerNameOrId?: string) {
    if (!manufacturerNameOrId) {
      return this.prisma.vehicleModel.findMany({
        orderBy: { name: 'asc' },
      });
    }

    const isUuid = manufacturerNameOrId.length === 36 && manufacturerNameOrId.includes('-');
    if (isUuid) {
      return this.prisma.vehicleModel.findMany({
        where: { manufacturerId: manufacturerNameOrId },
        orderBy: { name: 'asc' },
      });
    }

    const manufacturers = await this.prisma.manufacturer.findMany();
    const queryLower = manufacturerNameOrId.toLowerCase().trim();
    const matchedMfr = manufacturers.find(
      (m) => m.name.toLowerCase().trim() === queryLower || m.name.toLowerCase().includes(queryLower) || queryLower.includes(m.name.toLowerCase())
    );

    if (matchedMfr) {
      return this.prisma.vehicleModel.findMany({
        where: { manufacturerId: matchedMfr.id },
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.vehicleModel.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async suggestModel(userId: string, manufacturerName: string, modelName: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.vehicleModelSuggestion.create({
      data: {
        driverId: driver.id,
        manufacturerName,
        modelName,
        status: 'PENDING',
      },
    });
  }

  private async seedManufacturersAndModels() {
    const seedData: Record<string, { logo: string; models: string[] }> = {
      'Renault': { logo: 'renault', models: ['Clio', 'Clio Campus', 'Clio IV', 'Clio V', 'Megane', 'Megane II', 'Megane III', 'Megane IV', 'Captur', 'Kadjar', 'Koleos', 'Arkana', 'Austral', 'Express', 'Kangoo', 'Trafic', 'Master', 'Symbol', 'Talisman', 'Laguna', 'Scenic', 'Grand Scenic', 'Zoe'] },
      'Dacia': { logo: 'dacia', models: ['Logan', 'Sandero', 'Duster', 'Lodgy', 'Jogger', 'Dokker', 'Solenza', 'Nova'] },
      'Peugeot': { logo: 'peugeot', models: ['206', '207', '208', '301', '307', '308', '407', '508', '2008', '3008', '5008', 'Partner', 'Rifter', 'Expert', 'Boxer'] },
      'Citroën': { logo: 'citroen', models: ['C3', 'C4', 'C5', 'C-Elysée', 'Berlingo', 'Jumpy', 'Jumper', 'C3 Aircross', 'C4 Cactus', 'Ds3'] },
      'DS Automobiles': { logo: 'ds', models: ['DS 3', 'DS 4', 'DS 7 Crossback', 'DS 9'] },
      'Opel': { logo: 'opel', models: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Grandland', 'Combo', 'Vivaro', 'Zafira'] },
      'Fiat': { logo: 'fiat', models: ['Fiat 500', 'Panda', 'Punto', 'Marea', 'Uno', 'Doblo', 'Fiorino', 'Ducato', 'Tipo'] },
      'Volkswagen': { logo: 'volkswagen', models: ['Golf v', 'Golf vi', 'Golf vii', 'Golf viii', 'Polo', 'Passat', 'Touareg', 'Tiguan', 'Caddy', 'Crafter', 'Transporter', 'T-Roc', 'Taigo', 'Arteon'] },
      'Seat': { logo: 'seat', models: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'] },
      'Cupra': { logo: 'cupra', models: ['Formentor', 'Leon', 'Ateca', 'Born'] },
      'Skoda': { logo: 'skoda', models: ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'] },
      'Mercedes-Benz': { logo: 'mercedes', models: ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'CLA', 'GLA', 'GLB', 'GLC', 'GLE', 'Classe V', 'Vito', 'Sprinter'] },
      'BMW': { logo: 'bmw', models: ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 7', 'X1', 'X3', 'X4', 'X5', 'X6', 'iX'] },
      'Audi': { logo: 'audi', models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'] },
      'Toyota': { logo: 'toyota', models: ['Yaris', 'Corolla', 'Camry', 'Prius', 'C-HR', 'RAV4', 'Land Cruiser', 'Hilux', 'Proace'] },
      'Hyundai': { logo: 'hyundai', models: ['i10', 'i20', 'i30', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Kona', 'H1'] },
      'Kia': { logo: 'kia', models: ['Picanto', 'Rio', 'Ceed', 'Cerato', 'Sportage', 'Sorento', 'K5', 'Sonet', 'Seltos'] },
      'Nissan': { logo: 'nissan', models: ['Micra', 'Sunny', 'Qashqai', 'Juke', 'X-Trail', 'Patrol', 'Navara'] },
      'Ford': { logo: 'ford', models: ['Fiesta', 'Focus', 'Fusion', 'Mondeo', 'Kuga', 'Explorer', 'Mustang', 'Transit', 'Ranger'] },
      'Suzuki': { logo: 'suzuki', models: ['Swift', 'Celerio', 'Ignis', 'Baleno', 'Jimny', 'Vitara', 'S-Cross', 'Ertiga'] },
      'Honda': { logo: 'honda', models: ['Jazz', 'Civic', 'Accord', 'CR-V', 'HR-V'] },
      'Mitsubishi': { logo: 'mitsubishi', models: ['Space Star', 'Lancer', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200'] },
      'Mazda': { logo: 'mazda', models: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-30', 'CX-5', 'CX-9'] },
      'Volvo': { logo: 'volvo', models: ['XC40', 'XC60', 'XC90', 'V40', 'S60', 'S90'] },
      'Jeep': { logo: 'jeep', models: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'] },
      'Land Rover': { logo: 'landrover', models: ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Evoque', 'Discovery', 'Defender'] },
      'Porsche': { logo: 'porsche', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
      'Lexus': { logo: 'lexus', models: ['UX', 'NX', 'RX', 'ES', 'LS'] },
      'Tesla': { logo: 'tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
    };

    for (const [mName, mInfo] of Object.entries(seedData)) {
      const createdManufacturer = await this.prisma.manufacturer.upsert({
        where: { name: mName },
        update: { logo: mInfo.logo },
        create: { name: mName, logo: mInfo.logo },
      });

      for (const mModel of mInfo.models) {
        await this.prisma.vehicleModel.upsert({
          where: {
            name_manufacturerId: {
              name: mModel,
              manufacturerId: createdManufacturer.id,
            },
          },
          update: {},
          create: {
            name: mModel,
            manufacturerId: createdManufacturer.id,
          },
        });
      }
    }
  }
}

