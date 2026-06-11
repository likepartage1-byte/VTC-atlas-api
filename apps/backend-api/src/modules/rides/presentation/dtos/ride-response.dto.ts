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
}
