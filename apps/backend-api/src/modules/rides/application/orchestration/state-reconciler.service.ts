import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DomainEventBus } from '../../../../core/events/domain-event-bus';
import { RideStatusChangedEvent } from '../../domain/events/ride-status-changed.event';

@Injectable()
export class StateReconcilerService {
  private readonly logger = new Logger(StateReconcilerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: DomainEventBus,
  ) {}

  /**
   * System Self-Healing Gate
   * Scans for rides stuck in non-final states for too long.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async reconcileState() {
    this.logger.debug('Running global state reconciliation job...');

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // 1. Recover "Stuck Dispatch": REQUESTED but no driver assigned for 10m
    const stuckRides = await this.prisma.ride.findMany({
      where: {
        status: 'REQUESTED',
        requestedAt: { lt: tenMinutesAgo },
      },
      take: 20,
    });

    for (const ride of stuckRides) {
      this.logger.warn(`Healer: Ride ${ride.id} is stuck. Force-cancelling due to timeout.`);
      
      await this.prisma.ride.update({
        where: { id: ride.id },
        data: { 
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      this.eventBus.publish(new RideStatusChangedEvent(ride.id, {
        from: 'REQUESTED' as any,
        to: 'CANCELLED' as any,
        timestamp: new Date(),
        reason: 'SYSTEM_RECONCILIATION_TIMEOUT',
      }));
    }

    // 2. Validate Ledger Consistency
    // (Logic to check for COMPLETED rides without a Ledger entry)
    const completedWithoutLedger = await this.prisma.ride.findMany({
      where: {
        status: 'COMPLETED',
        ledgerRecord: { is: null },
      },
      take: 10,
    });

    if (completedWithoutLedger.length > 0) {
      this.logger.error(`Critical Inconsistency: ${completedWithoutLedger.length} rides COMPLETED but missing Ledger!`);
      // In a real system, trigger an alert or auto-fix
    }
  }
}
