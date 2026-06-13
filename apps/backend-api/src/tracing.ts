import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'atlas-backend-api',
  }),
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
