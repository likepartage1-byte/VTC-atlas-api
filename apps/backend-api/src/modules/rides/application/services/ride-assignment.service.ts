import { Injectable, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RedisService } from '../../../../core/redis/redis.service';
import { DriverAcceptanceService } from '../../../drivers/application/driver-acceptance.service';

@Injectable()
export class RideAssignmentService {
  private readonly logger = new Logger(RideAssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(forwardRef(() => DriverAcceptanceService))
    private readonly driverAcceptance: DriverAcceptanceService,
  ) {}

  /**
   * Delegates ride assignment to the unified DriverAcceptanceService pipeline
   * to guarantee wallet balance checking, 10% commission debit, driver eligibility, and state logging.
   */
  async assignRide(rideId: string, driverId: string, agreedPrice?: number) {
    return this.driverAcceptance.acceptRide(driverId, rideId, {
      agreedPrice,
      isNegotiationAccepted: true,
    });
  }

  /**
   * جلب بيانات الرحلة مع تفاصيل الراكب وإحصائياته (TASK-UX-001)
   */
  async getRideWithPassengerDetails(rideId: string) {
    return await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        passenger: {
          select: {
            fullName: true,
            _count: {
              select: { customerRides: true }
            }
          }
        }
      }
    });
  }
}
