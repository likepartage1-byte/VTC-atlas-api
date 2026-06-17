import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { spawn, ChildProcess } from 'child_process';
import { RequestRideUseCase } from '../../ride/application/use-cases/request-ride.use-case';
import { Location } from '../../ride/domain/value-objects/location.vo';
import * as path from 'path';
import { DiagnosticService } from '../../../core/common/services/diagnostic.service';

@Injectable()
export class WarEngineService {
  private readonly logger = new Logger(WarEngineService.name);
  private activeWorkers: ChildProcess[] = [];

  constructor(
    private readonly jwtService: JwtService,
    private readonly requestRide: RequestRideUseCase,
    private readonly diagnostics: DiagnosticService,
  ) {}

  async launchIsolatedWar(config: { driverCount: number; rideCount: number; scenario: string; durationSec: number }) {
    await this.diagnostics.captureBaseline();
    this.logger.warn(`[WarEngine] 🚨 Launching ISOLATED war: ${config.scenario}`);

    const workersToSpawn = 5;
    const driversPerWorker = Math.floor(config.driverCount / workersToSpawn);
    
    const masterToken = this.jwtService.sign({ userId: 'war-master', role: 'DRIVER', deviceId: 'war-device' });

    for (let i = 0; i < workersToSpawn; i++) {
        const workerPath = path.join(process.cwd(), 'apps/backend-api/scripts/war-worker.js');
        const worker = spawn('node', [workerPath, driversPerWorker.toString(), masterToken]);

        worker.stdout.on('data', (data) => this.logger.log(`[Worker-${i}] ${data}`));
        worker.stderr.on('data', (data) => this.logger.error(`[Worker-${i}] ${data}`));
        
        this.activeWorkers.push(worker);
    }

    this.logger.log(`[WarEngine] ⚔️ ${workersToSpawn} Load Workers deployed. Total drivers: ${config.driverCount}`);

    setTimeout(() => this.triggerRideBlitz(config.rideCount), 10000);
  }

  private async triggerRideBlitz(count: number) {
    this.logger.warn(`[WarEngine] ⛈️ RIDE BLITZ: Triggering ${count} requests.`);
    for (let i = 0; i < count; i++) {
      const pickup = new Location(33.5731, -7.5898, 'Blitz Origin');
      const dropoff = new Location(33.5850, -7.6000, 'Blitz Destination');
      
      this.requestRide.execute(`blitz-passenger-${i}`, pickup, dropoff)
          .catch(e => this.logger.error(`Ride fail: ${e.message}`));
      
      await new Promise(r => setTimeout(r, 100)); 
    }
  }

  stopWar() {
    this.logger.warn(`[WarEngine] 🕊️ Terminating ${this.activeWorkers.length} workers.`);
    this.activeWorkers.forEach(w => w.kill('SIGINT'));
    this.activeWorkers = [];
  }
}
