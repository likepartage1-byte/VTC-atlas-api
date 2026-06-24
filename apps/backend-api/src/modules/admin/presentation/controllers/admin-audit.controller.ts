import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('admin/audit')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('logs')
  async getLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('limit') limit: string = '100',
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(action && { action }),
        ...(entityType && { entityType }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });
  }
}
