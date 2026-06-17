import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

export const otelSDK = new NodeSDK({
  serviceName: 'atlas-backend-api',
  instrumentations: [
    getNodeAutoInstrumentations({
      // إسكات الضجيج الناتج عن طلبات الـ Health Check المتكررة
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      // محاولة تقليل تحذيرات الـ Legacy Route Converter
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      }
    }),
  ],
});

// التعامل مع الإغلاق النظيف
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => logger.log('SDK shut down successfully'),
      (err) => logger.error('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
