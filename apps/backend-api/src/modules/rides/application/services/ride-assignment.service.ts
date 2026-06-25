import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service'; // يتم تعديله حسب المسار الفعلي
import { RedisService } from '../../../core/redis/redis.service';   // يتم تعديله حسب المسار الفعلي

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

    // 1. محاولة الحصول على قفل Redis (NX = Only if not exists, EX = Expire in 5 seconds)
    const acquired = await client.set(lockKey, driverId, 'NX', 'EX', 5);

    if (!acquired) {
      this.logger.warn(`Race condition detected: Driver ${driverId} failed to lock ride ${rideId}`);
      throw new ConflictException('Désolé, cette course est en cours de traitement.');
    }

    try {
      // 2. تحديث ذرّي في قاعدة البيانات (Atomic Transaction)
      // نتحقق من أن الحالة لا تزال 'AVAILABLE' داخل العملية نفسها
      return await this.prisma.$transaction(async (tx) => {
        const ride = await tx.ride.findUnique({
          where: { id: rideId },
          select: { status: true }
        });

        if (!ride || ride.status !== 'AVAILABLE') {
          throw new ConflictException('La course n’est plus disponible.');
        }

        return await tx.ride.update({
          where: { id: rideId },
          data: {
            driverId,
            status: 'ASSIGNED',
            assignedAt: new Date()
          }
        });
      });
    } catch (error) {
      this.logger.error(`Assignment failed for Driver ${driverId} on Ride ${rideId}: ${error.message}`);
      throw error;
    } finally {
      // 3. تحرير القفل فور الانتهاء
      await client.del(lockKey);
    }
  }
}
