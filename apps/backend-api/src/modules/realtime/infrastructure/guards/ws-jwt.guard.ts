import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // استخراج التوكن من الهاندشيك أو الهيدرز
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.error('Socket connection attempt without token');
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // إرفاق بيانات المستخدم بالسوكت لاستخدامها لاحقاً
      client.data.user = payload;
      
      return true;
    } catch (err) {
      this.logger.error(`Invalid socket token: ${err.message}`);
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
