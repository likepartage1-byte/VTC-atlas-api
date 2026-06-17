import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { calculateHaversineDistance } from '../../../../core/common/geo.utils';
import { RiskLevel, FraudType } from '@prisma/client';
import { FraudGateway } from '../../presentation/gateways/fraud.gateway';

@Injectable()
export class IntegrityService {
  private readonly logger = new Logger(IntegrityService.name);
  private readonly MAX_SPEED_KMH = 180; // Reasonable max speed for a car in most cities

  constructor(
    private readonly prisma: PrismaService,
    private readonly fraudGateway: FraudGateway,
  ) {}

  /**
   * Analyzes a location update for potential fraud
   */
  async checkLocationIntegrity(
    userId: string,
    entityType: 'DRIVER' | 'PASSENGER',
    newLat: number,
    newLng: number,
    isMock: boolean,
    deviceId?: string
  ): Promise<boolean> {
    
    // 1. Check for explicit Mock Location flag from Device SDK
    if (isMock) {
      this.logger.warn(`GPS Spoofing detected for ${entityType} ${userId}. Device reported MOCK location.`);
      await this.reportFraud(userId, entityType, FraudType.GPS_SPOOFING, RiskLevel.HIGH, { deviceId });
      return false;
    }

    // 2. Velocity Check (Impossible Travel)
    const lastLocation = await this.prisma.driverLocationHistory.findFirst({
      where: { driverId: userId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastLocation) {
      const distanceKm = calculateHaversineDistance(
        lastLocation.lat, lastLocation.lng,
        newLat, newLng
      );
      
      const timeDiffHours = (Date.now() - new Date(lastLocation.timestamp).getTime()) / (1000 * 60 * 60);
      
      if (timeDiffHours > 0) {
        const speedKmh = distanceKm / timeDiffHours;
        
        if (speedKmh > this.MAX_SPEED_KMH) {
          this.logger.warn(`Impossible travel detected for ${userId}: ${speedKmh.toFixed(0)} km/h`);
          await this.reportFraud(userId, entityType, FraudType.IMPOSSIBLE_TRAVEL, RiskLevel.CRITICAL, {
            speed: speedKmh,
            distance: distanceKm,
            timeDiff: timeDiffHours
          });
          return false;
        }
      }
    }

    return true;
  }

  /**
   * CORE: Risk Scoring Engine (Uber-style)
   */
  public calculateRisk(params: {
    speed?: number;
    gpsJump?: boolean;
    isMock?: boolean;
    priceDeviation?: number;
  }): { score: number; level: RiskLevel } {
    let score = 0;

    if (params.isMock) score += 60;
    if (params.gpsJump) score += 50;
    if (params.speed && params.speed > 160) score += 40;
    if (params.priceDeviation && params.priceDeviation > 0.3) score += 45;

    score = Math.min(score, 100);

    let level: RiskLevel = RiskLevel.LOW;
    if (score >= 80) level = RiskLevel.CRITICAL;
    else if (score >= 50) level = RiskLevel.HIGH; // High = Suspicious
    else if (score >= 20) level = RiskLevel.MEDIUM;

    return { score, level };
  }

  /**
   * Generic fraud reporting with Risk Score
   */
  async reportFraud(
    userId: string, 
    entityType: string, 
    type: FraudType, 
    severity: RiskLevel, 
    metadata: any
  ) {
    const event = await this.prisma.fraudEvent.create({
      data: {
        userId,
        entityType,
        eventType: type,
        severity,
        metadata,
      }
    });

    this.fraudGateway.broadcastFraudAlert(event);
    this.logger.warn(`FRAUD ALERT: ${type} by ${userId} - Severity: ${severity}`);
    return event;
  }
}
