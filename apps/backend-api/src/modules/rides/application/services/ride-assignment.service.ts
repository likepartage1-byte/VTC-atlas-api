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

    // تصحيح نداء ioredis ليتوافق مع الـ Types (EX تأتي قبل NX في هذا التوقيع)
    // نستخدم 'EX' (ثواني) و 'NX' (فقط إذا لم يكن موجوداً)
    const acquired = await client.set(lockKey, driverId, 'EX', 5, 'NX');

    if (acquired !== 'OK') {
      this.logger.warn(`Race condition detected: Driver ${driverId} failed to lock ride ${rideId}`);
      throw new ConflictException('Désolé, cette course est en cours de traitement.');
    }

    try {
      // تحديث ذرّي في قاعدة البيانات
      return await this.prisma.$transaction(async (tx) => {
        const ride = await tx.ride.findUnique({
          where: { id: rideId },
          select: { status: true }
        });

        // التحقق من أن الحالة هي REQUESTED (أي متاحة للمزايدة)
        if (!ride || ride.status !== RideStatus.REQUESTED) {
          throw new ConflictException('La course n’est plus disponible.');
        }

        return await tx.ride.update({
          where: { id: rideId },
          data: {
            driverId,
            status: RideStatus.DRIVER_ACCEPTED,
            acceptedAt: new Date()
          }
        });
      });
    } catch (error) {
      this.logger.error(`Assignment failed for Driver ${driverId} on Ride ${rideId}: ${error.message}`);
      throw error;
    } finally {
      await client.del(lockKey);
    }
  }
}
