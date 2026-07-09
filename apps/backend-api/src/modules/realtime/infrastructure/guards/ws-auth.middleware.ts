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
    const ip = socket.handshake.address;
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      // ① No token at all
      if (!token) {
        logger.warn(`[WS] Handshake rejected — no token (ip: ${ip})`);
        return next(new Error('Unauthorized'));
      }

      // ② Verify JWT signature & expiry
      let payload: any;
      try {
        payload = await jwtService.verifyAsync(token);
      } catch (jwtErr: any) {
        // JsonWebTokenError = bad sig | TokenExpiredError = expired
        logger.warn(
          `[WS] Handshake rejected — JWT ${jwtErr.name}: ${jwtErr.message} (ip: ${ip})`
        );
        return next(new Error('Unauthorized'));
      }

      // ③ Validate session in Redis
      const isSessionValid = await sessionService.isSessionValid(
        payload.userId,
        payload.deviceId,
      );
      if (!isSessionValid) {
        logger.warn(
          `[WS] Handshake rejected — session revoked or not found ` +
          `(userId: ${payload.userId}, deviceId: ${payload.deviceId})`
        );
        return next(new Error('Unauthorized'));
      }

      // ✅ Handshake accepted
      socket.data.user = payload;
      logger.log(
        `[WS] Handshake accepted — userId: ${payload.userId}, role: ${payload.role}`
      );
      next();
    } catch (error: any) {
      logger.error(`[WS] Handshake unexpected error: ${error.message}`);
      next(new Error('Unauthorized'));
    }
  };
};
