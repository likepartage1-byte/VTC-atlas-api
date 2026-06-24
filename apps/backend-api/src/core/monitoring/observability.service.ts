import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as client from 'prom-client';

@Injectable()
export class ObservabilityService implements OnModuleInit {
  private readonly registry = client.register;

  // --- Prometheus Metrics ---
  private readonly httpRequestsTotal = new client.Counter({
    name: 'atlas_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
  });

  private readonly activeRides = new client.Gauge({
    name: 'atlas_active_rides',
    help: 'Number of currently active rides',
  });

  private readonly rideCompletionCounter = new client.Counter({
    name: 'atlas_rides_completed_total',
    help: 'Total number of completed rides',
  });

  private readonly walletTransactions = new client.Counter({
    name: 'atlas_wallet_transactions_total',
    help: 'Total number of wallet transactions',
    labelNames: ['type', 'status'],
  });

  private readonly fraudAlerts = new client.Counter({
    name: 'atlas_fraud_alerts_total',
    help: 'Total number of fraud alerts generated',
    labelNames: ['type', 'severity'],
  });

  onModuleInit() {
    // Initialize Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
          nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
      });
    }

    // Initialize Prometheus Default Metrics
    client.collectDefaultMetrics({ prefix: 'atlas_' });
  }

  // --- Helper Methods for Metrics ---

  logHttpRequest(method: string, path: string, status: number) {
    this.httpRequestsTotal.inc({ method, path, status: status.toString() });
  }

  trackActiveRide(count: number) {
    this.activeRides.set(count);
  }

  incrementRideCompletion() {
    this.rideCompletionCounter.inc();
  }

  logWalletTransaction(type: string, status: string) {
    this.walletTransactions.inc({ type, status });
  }

  logFraudAlert(type: string, severity: string) {
    this.fraudAlerts.inc({ type, severity });
  }

  getMetrics() {
    return this.registry.metrics();
  }

  // --- Sentry Wrappers ---

  captureException(exception: any, context?: any) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(exception, { extra: context });
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(message, level);
    }
  }
}
