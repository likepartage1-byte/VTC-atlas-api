export class RideResponseDto {
  id: string;
  status: string;
  passengerId: string;
  driverId?: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  estimatedPrice: number;
  verificationCode?: string; // Only visible to passenger when driver arrives
  createdAt: Date;

  // ── Distance Benefit Display Fields ───────────────────────────────────────
  // These values are display-only: GPS route, ETA, and pricing remain unchanged.
  originalDistanceMeters?: number;           // Real GPS/OSRM distance in meters
  driverDisplayDistanceMeters?: number;      // Distance shown to driver (originalDistance - driverBenefitMeters)
  passengerDisplayDistanceMeters?: number;   // Distance shown to passenger (originalDistance + passengerCreditMeters)
  driverBenefitMeters?: number;              // How many meters were subtracted from driver display
  passengerCreditMeters?: number;            // How many meters were added to passenger display
  distanceKm?: number;                       // Convenience: driverDisplayDistanceMeters / 1000
}
