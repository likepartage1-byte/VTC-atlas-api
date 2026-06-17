import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class DriverOnboardingService {
  private readonly logger = new Logger(DriverOnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * يحول مستخدم عادي إلى سائق بشكل متسق برمجياً
   */
  async promoteUserToDriver(userId: string): Promise<void> {
    this.logger.log(`Promoting user [${userId}] to DRIVER role...`);

    await this.prisma.$transaction(async (tx) => {
      // 1. تحديث الـ Role في جدول المستخدمين
      await tx.user.update({
        where: { id: userId },
        data: { role: 'DRIVER' },
      });

      // 2. إنشاء سجل السائق إذا لم يكن موجوداً
      const existingDriver = await tx.driver.findUnique({
        where: { userId },
      });

      if (!existingDriver) {
        await tx.driver.create({
          data: {
            userId,
            status: 'OFFLINE',
            rating: 5.0,
            vehicleInfo: {}, // تهيئة الحقل ليكون جاهزاً للـ JSON
          },
        });
      }

      // 3. (مستقبلاً) إنشاء المحفظة المالية DriverAccount هنا
      this.logger.log(`User [${userId}] is now a verified DRIVER.`);
    });
  }
}
