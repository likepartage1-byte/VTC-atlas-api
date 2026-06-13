import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

export interface JwtPayload {
  userId: string;
  role: string;
  deviceId: string;
  sid: string; // Session ID
}

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Run Passport logic
    const isValid = (await super.canActivate(context)) as boolean;
    if (!isValid) return false;

    // 2. Extra custom validation could go here if needed
    // The JwtStrategy already handles Redis session check
    
    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token.');
    }
    return user;
  }
}
