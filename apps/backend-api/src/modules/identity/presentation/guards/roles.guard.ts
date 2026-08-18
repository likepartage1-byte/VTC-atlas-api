import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required for this endpoint
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: No role found for this identity.');
    }

    let hasRole = requiredRoles.includes(user.role as UserRole);

    // If DRIVER role is required but user role in token is PASSENGER (e.g., driver onboarding),
    // check if a Driver record exists for this user in the database.
    if (!hasRole && requiredRoles.includes('DRIVER' as UserRole) && user.userId) {
      const driverRecord = await this.prisma.driver.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (driverRecord) {
        hasRole = true;
        // Sync user role in DB in background so future JWT tokens inherit DRIVER role
        this.prisma.user.update({
          where: { id: user.userId },
          data: { role: 'DRIVER' },
        }).catch(() => null);
      }
    }

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: This endpoint requires one of the following roles: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}

