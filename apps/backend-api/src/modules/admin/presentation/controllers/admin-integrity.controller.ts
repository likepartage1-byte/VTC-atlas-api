import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('admin/integrity')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminIntegrityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('events')
  async getFraudEvents(
    @Query('severity') severity?: string,
    @Query('type') type?: string,
  ) {
    return this.prisma.fraudEvent.findMany({
      where: {
        ...(severity && { severity: severity as any }),
        ...(type && { eventType: type as any }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Get('stats')
  async getIntegrityStats() {
    const totalEvents = await this.prisma.fraudEvent.count();
    const criticalEvents = await this.prisma.fraudEvent.count({ where: { severity: 'CRITICAL' } });
    
    return {
      totalEvents,
      criticalEvents,
      ratio: totalEvents > 0 ? (criticalEvents / totalEvents) : 0,
    };
  }
}
