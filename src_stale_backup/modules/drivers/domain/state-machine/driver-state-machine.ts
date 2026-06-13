// ============================================================
// Domain: Drivers
// Layer: Domain / State Machine (Pure — No NestJS Dependencies)
// ============================================================

export type DriverStatus =
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'OFFLINE'
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'SUSPENDED';

export const LEGAL_DRIVER_TRANSITIONS: Record<DriverStatus, DriverStatus[]> = {
  PENDING_APPROVAL: ['UNDER_REVIEW', 'SUSPENDED'],
  UNDER_REVIEW: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'],
  ACTIVE: ['OFFLINE', 'SUSPENDED'],
  OFFLINE: ['AVAILABLE', 'SUSPENDED'],
  AVAILABLE: ['OFFLINE', 'ON_TRIP', 'SUSPENDED'],
  ON_TRIP: ['AVAILABLE', 'SUSPENDED'],
  SUSPENDED: ['PENDING_APPROVAL', 'UNDER_REVIEW'],
};

export class DriverStateMachine {
  static validateTransition(from: DriverStatus, to: DriverStatus): void {
    const allowed = LEGAL_DRIVER_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new Error(`Illegal driver transition: [${from}] → [${to}]`);
    }
  }

  static canBecomeActive(docs: { licenseExpiry: Date; insuranceExpiry: Date }): boolean {
    const now = new Date();
    return docs.licenseExpiry > now && docs.insuranceExpiry > now;
  }
}
