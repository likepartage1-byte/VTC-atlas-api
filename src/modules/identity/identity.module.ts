import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/services/auth.service';
import { SessionService } from './application/services/session.service';
import { OtpService } from './infrastructure/otp/otp.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthGuard } from './presentation/guards/auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, OtpService, JwtStrategy, AuthGuard, RolesGuard],
  exports: [AuthService, SessionService, AuthGuard, RolesGuard, JwtModule],
})
export class IdentityModule {}
