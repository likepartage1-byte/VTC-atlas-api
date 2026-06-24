import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from '../../application/services/notification.service';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  async registerToken(
    @Req() req: any,
    @Body() body: { token: string; platform: string; deviceId?: string },
  ) {
    const userId = req.user.id;
    return this.notificationService.registerToken(
      userId,
      body.token,
      body.platform,
      body.deviceId,
    );
  }

  @Post('token/deactivate')
  async deactivateToken(@Body() body: { token: string }) {
    return this.notificationService.deactivateToken(body.token);
  }
}
