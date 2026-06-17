import { Controller, Post, Body, Delete, Get, Logger } from '@nestjs/common';
import { WarEngineService } from '../../application/war-engine.service';

@Controller('simulation/war')
export class SimulationController {
  private readonly logger = new Logger(SimulationController.name);

  constructor(private readonly warEngine: WarEngineService) {}

  @Post('start')
  async startWar(@Body() config: { 
    drivers: number; 
    rides: number; 
    scenario: string;
    durationSec: number;
  }) {
    this.logger.warn(`[WarControl] 🛡️ Received Start Order: ${config.scenario}`);
    
    // We delegate the heavy lifting to the service which will spawn EXTERNAL workers
    this.warEngine.launchIsolatedWar({
        driverCount: config.drivers || 500,
        rideCount: config.rides || 50,
        scenario: config.scenario || 'casablanca_peak',
        durationSec: config.durationSec || 60
    });

    return {
      status: 'WAR_INITIATED',
      config,
      message: 'External workers are being deployed to isolate load.'
    };
  }

  @Delete('stop')
  stopWar() {
    this.warEngine.stopWar();
    return { status: 'WAR_STOPPED', message: 'All external workers recalled.' };
  }

  @Get('status')
  getStatus() {
    return {
      activeWorkers: 0, // Will be linked to worker registry
      systemPulse: 'STABLE'
    };
  }
}
