import { Module, Global, Controller, Get, Res } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import * as express from 'express';

@Controller('metrics')
class MetricsController {
  constructor(private readonly obs: ObservabilityService) {}

  @Get()
  async getMetrics(@Res() res: express.Response) {
    res.set('Content-Type', 'text/plain');
    res.end(await this.obs.getMetrics());
  }
}

@Global()
@Module({
  providers: [ObservabilityService],
  controllers: [MetricsController],
  exports: [ObservabilityService],
})
export class MonitoringModule {}
