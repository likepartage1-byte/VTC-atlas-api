import { Module } from '@nestjs/common';
import { SimulationController } from './presentation/controllers/simulation.controller';
import { WarEngineService } from './application/war-engine.service';
import { DriverSimulator } from './application/driver-simulator.service';
import { RidesModule } from '../rides/rides.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // We only import what's strictly necessary for commanding
    RidesModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [SimulationController],
  providers: [
    WarEngineService, 
    DriverSimulator
  ],
})
export class SimulationModule {}
