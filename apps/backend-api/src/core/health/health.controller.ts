import { Controller, Get, Version } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Version('1')
  @Get()
  async getHealth() {
    return this.healthService.check();
  }
}
