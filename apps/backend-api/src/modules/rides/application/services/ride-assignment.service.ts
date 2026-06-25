import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { RideStatus } from '@prisma/client';

@Injectable()
export class RideAssignmentService {
  private readonly logger = new Logger(RideAssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * التعيين الذري للرحلة باستخدام Redis Lock و Conditional Update
   */
  async assignRide(rideId: string, driverId: string) {
    const lockKey = `lock:ride_assignment:${rideId}`;
    const client = this.redis.getClient();

    // 1. صمام الأمان الأول: Redis Atomic Lock (NX EX)
    const acquired = await client.set(lockKey, driverId, 'EX', 5, 'NX');

    if (acquired !== 'OK') {
      this.logger.warn(`Race condition detected: Driver ${driverId} failed to lock ride ${rideId}`);
      throw new ConflictException('Désolé, cette course est en cours de traitement.');
    }

    try {
      // 2. التحديث المشروط الذرّي (Conditional Update)
      // نضمن على مستوى الـ Query أن القاعدة لن تُحدّث إلا إذا كانت الحالة REQUESTED
      const result = await this.prisma.ride.updateMany({
        where: { 
          id: rideId, 
          status: RideStatus.REQUESTED 
        },
        data: {
          driverId,
          status: RideStatus.DRIVER_ACCEPTED,
          acceptedAt: new Date()
        }
      });

      if (result.count === 0) {
        throw new ConflictException('Désolé, la course a déjà été acceptée.');
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Assignment failed for Driver ${driverId} on Ride ${rideId}: ${error.message}`);
      throw error;
    } finally {
      // 3. تحرير القفل
      await client.del(lockKey);
    }
  }
}
