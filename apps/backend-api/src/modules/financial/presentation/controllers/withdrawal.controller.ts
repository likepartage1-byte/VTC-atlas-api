import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { WithdrawalService } from '../../application/withdrawal.service';

@Controller('driver/wallet')
@UseGuards(AuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriverWalletController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post('withdraw')
  async requestWithdrawal(@Request() req: any, @Body() body: { amount: number; bankDetails: any }) {
    // Note: req.user.driverId should be available if the driver is verified
    return this.withdrawalService.requestWithdrawal(req.user.driverId, body.amount, body.bankDetails);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.withdrawalService.getDriverRequests(req.user.driverId);
  }

  @Post('topup')
  async initiateTopup(@Request() req: any, @Body() body: { amount: number; paymentMethod: string }) {
    return this.withdrawalService.initiateTopup(req.user.driverId, body.amount, body.paymentMethod);
  }
}

@Controller('admin/withdrawals')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminWithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get('pending')
  async getPending() {
    return this.withdrawalService.getAdminPendingRequests();
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Request() req: any, @Body() body: { notes?: string }) {
    // For now, approval and payment are handled in one step in 'markAsPaid'
    // but we can split them if an external payment gateway check is needed.
    return this.withdrawalService.markAsPaid(id, req.user.id, body.notes);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Request() req: any, @Body() body: { reason: string }) {
    return this.withdrawalService.rejectWithdrawal(id, body.reason, req.user.id);
  }
}
