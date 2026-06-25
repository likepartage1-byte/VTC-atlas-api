import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { FinancialDashboardService } from '../../application/financial-dashboard.service';

@Controller('admin/financial')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminFinancialController {
  constructor(private readonly dashboardService: FinancialDashboardService) {}

  @Get('insights')
  async getInsights() {
    return this.dashboardService.getRevenueInsights();
  }

  @Get('top-drivers')
  async getTopDrivers(@Query('limit') limit?: string) {
    return this.dashboardService.getTopDrivers(limit ? parseInt(limit) : 10);
  }

  @Get('ledger-summary')
  async getLedgerSummary() {
    return this.dashboardService.getLedgerSummary();
  }
}
