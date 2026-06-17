import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { SessionService } from '../../../identity/application/services/session.service';
import { Logger } from '@nestjs/common';

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const WSAuthMiddleware = (
  jwtService: JwtService,
  sessionService: SessionService,
  logger: Logger,
): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        throw new Error('Unauthorized: No token provided');
      }

      const payload = await jwtService.verifyAsync(token);
      
      // CRITICAL: Session Validation vs Redis
      const isSessionValid = await sessionService.isSessionValid(payload.userId, payload.deviceId);
      if (!isSessionValid) {
        throw new Error('Unauthorized: Session revoked or expired');
      }

      // Attach data for future use
      socket.data.user = payload;
      next();
    } catch (error) {
      logger.error(`WS Handshake failed: ${error.message}`);
      next(new Error('Unauthorized'));
    }
  };
};
