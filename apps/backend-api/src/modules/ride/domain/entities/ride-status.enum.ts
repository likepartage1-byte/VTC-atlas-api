export enum RideStatus {
  REQUESTED = 'REQUESTED',             // Client asked
  DISPATCHED = 'DISPATCHED',           // Matching/Searching for drivers
  DRIVER_ACCEPTED = 'DRIVER_ACCEPTED', // Driver agreed
  ARRIVED = 'ARRIVED',                 // Driver at pickup
  IN_PROGRESS = 'IN_PROGRESS',         // Trip started
  COMPLETED = 'COMPLETED',             // Finished
  CANCELLED = 'CANCELLED',             // Aborted
}
