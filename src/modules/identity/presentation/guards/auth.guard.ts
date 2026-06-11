import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../../core/redis/redis.service';

export interface JwtPayload {
  userId: string;
  role: string;
  deviceId: string;
  sid: string; // Session ID
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token.');
    }

    try {
      // 1. REAL JWT Verification — cryptographic signature + expiry check
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      // 2. Redis Session Validation (STRICT ARCHITECTURAL RULE)
      // Redis is the source of truth for "active status"
      const sessionKey = `session:${payload.userId}:${payload.deviceId}`;
      const sessionExists = await this.redis.getClient().exists(sessionKey);

      if (!sessionExists) {
        this.logger.warn(`Revoked or missing session for user: ${payload.userId}`);
        throw new UnauthorizedException('Session has been revoked or expired.');
      }

      // 3. Attach User to Request for downstream Guards & Decorators
      request['user'] = payload;
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`JWT verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
