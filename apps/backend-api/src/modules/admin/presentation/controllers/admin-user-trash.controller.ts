import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { AuthGuard } from '../../../identity/presentation/guards/auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { AdminUserTrashService } from '../../application/services/admin-user-trash.service';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUserTrashController {
  constructor(private readonly trashService: AdminUserTrashService) {}

  @Post('users/bulk-trash')
  async bulkTrash(@Body() body: { userIds: string[] }, @Req() req: any) {
    if (!body?.userIds || !Array.isArray(body.userIds)) {
      throw new BadRequestException('userIds must be an array of string IDs.');
    }
    const adminId = req.user?.userId || 'system-admin';
    return this.trashService.bulkTrashUsers(body.userIds, adminId);
  }

  @Post('users/bulk-restore')
  async bulkRestore(@Body() body: { userIds: string[] }) {
    if (!body?.userIds || !Array.isArray(body.userIds)) {
      throw new BadRequestException('userIds must be an array of string IDs.');
    }
    return this.trashService.bulkRestoreUsers(body.userIds);
  }

  @Post('users/bulk-wipe-sessions')
  async bulkWipeSessions(@Body() body: { userIds: string[] }) {
    if (!body?.userIds || !Array.isArray(body.userIds)) {
      throw new BadRequestException('userIds must be an array of string IDs.');
    }
    return this.trashService.bulkWipeSessions(body.userIds);
  }

  @Get('trash')
  async getTrashBin() {
    return this.trashService.getTrashBinItems();
  }

  @Delete('trash/permanent')
  async permanentDelete(@Body() body: { userIds: string[] }) {
    if (!body?.userIds || !Array.isArray(body.userIds)) {
      throw new BadRequestException('userIds must be an array of string IDs.');
    }
    return this.trashService.permanentDeleteUsers(body.userIds);
  }

  @Delete('trash/empty')
  async emptyTrash() {
    return this.trashService.emptyTrash();
  }
}
