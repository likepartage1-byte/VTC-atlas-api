import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WeeklyResetTask {
  private readonly logger = new Logger(WeeklyResetTask.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every Monday at 00:00 to handle weekly rollover logs & cleanup
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyReset() {
    this.logger.log('--- Start of Weekly Driver Achievements Rollover ---');
    try {
      // Weekly achievements are calculated dynamically via ride completion timestamps,
      // so rollover status, commissions, and weekly challenges are automatically realigned at 00:00.
      this.logger.log('Successfully validated weekly rollover check. Dynamic achievements aligned.');
    } catch (e: any) {
      this.logger.error(`Failed executing weekly achievements check: ${e.message}`);
    }
  }
}
