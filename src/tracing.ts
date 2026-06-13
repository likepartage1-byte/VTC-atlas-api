import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

export const otelSDK = new NodeSDK({
  // Temporarily simplified to fix build blocker
  serviceName: 'atlas-backend-api',
  instrumentations: [getNodeAutoInstrumentations()],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => logger.log('SDK shut down successfully'),
      (err) => logger.error('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
