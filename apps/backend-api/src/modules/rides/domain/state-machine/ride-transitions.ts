// ============================================================
// Atlas Ride-Hailing Platform
// Domain: Rides — Unified State Machine (v2.0)
// Single Source of Truth for Ride State Transitions
// ============================================================

export type RideStatus =
  | 'REQUESTED'
  | 'DISPATCHED'
  | 'DRIVER_ACCEPTED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Canonical transition graph.
 * Every possible (from → to[]) mapping is defined here.
 */
export const ALLOWED_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  REQUESTED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DRIVER_ACCEPTED', 'CANCELLED'],
  DRIVER_ACCEPTED: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Unified RideStateMachine — Single Authority for all state logic.
 *
 * Responsibilities:
 * - Transition validation (transition / validate)
 * - Terminal state detection
 * - Cancellation rules
 * - Geofencing threshold checks
 */
export class RideStateMachine {
  /**
   * Validates if a transition is allowed and returns the target state if valid.
   * Throws if transition is illegal.
   */
  public static transition(from: RideStatus, to: RideStatus): RideStatus {
    const allowed = ALLOWED_TRANSITIONS[from];

    if (!allowed || !allowed.includes(to)) {
      throw new Error(
        `Illegal state transition: Cannot move from ${from} to ${to}`,
      );
    }

    return to;
  }

  /**
   * Alias for `transition` — validates without returning.
   * Used in lifecycle services where the return value is not needed.
   */
  public static validate(from: RideStatus, to: RideStatus): void {
    this.transition(from, to);
  }

  /**
   * Helper to check if a state is terminal (no further transitions possible).
   */
  public static isTerminal(status: RideStatus): boolean {
    return ALLOWED_TRANSITIONS[status].length === 0;
  }

  /**
   * Business Rule: Which states allow cancellation?
   */
  public static canCancel(status: RideStatus): boolean {
    const cancelableStates: RideStatus[] = [
      'REQUESTED',
      'DISPATCHED',
      'DRIVER_ACCEPTED',
      'ARRIVED',
    ];
    return cancelableStates.includes(status);
  }

  /**
   * Geofence Guard: Is the driver within acceptable distance of pickup?
   * Threshold: 150 meters.
   */
  public static checkGeofence(distanceMeters: number): boolean {
    return distanceMeters <= 150;
  }
}
