export interface PassengerInfo {
  id?: string;
  name: string;
  avatar?: string;
  rating?: number;
  tripsCount?: number;
  isVerified?: boolean;
}

export interface DriverRide {
  id: string;
  status: 'REQUESTED' | 'DISPATCHED' | 'DRIVER_ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  passengerId: string;
  driverId?: string;
  passenger: PassengerInfo;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  estimatedPrice: number;
  actualPrice?: number;
  currency: string;
  verificationCode?: string; // 4-digit arrival OTP
  distanceKm?: number;
  durationMins?: number;
  createdAt: string;
}

/**
 * Maps NestJS Backend RideResponseDto to production DriverRide entity
 */
export const mapRideResponseToDriverRide = (data: any): DriverRide => {
  const passengerObj = data.passenger || {};
  const name = passengerObj.fullName || data.passengerName || 'Passenger';
  const price = typeof data.estimatedPrice === 'number'
    ? data.estimatedPrice
    : (parseFloat(data.estimatedPrice) || parseFloat(data.actualPrice) || 0);

  return {
    id: data.id,
    status: data.status || 'REQUESTED',
    passengerId: data.passengerId || passengerObj.id || '',
    driverId: data.driverId || undefined,
    passenger: {
      id: data.passengerId || passengerObj.id,
      name,
      avatar: passengerObj.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      rating: passengerObj.rating || 4.9,
      tripsCount: passengerObj.tripsCount || 12,
      isVerified: true,
    },
    pickupAddress: data.pickupAddress || 'Pickup Location',
    pickupLat: data.pickupLat || 31.6295,
    pickupLng: data.pickupLng || -7.9811,
    dropoffAddress: data.dropoffAddress || 'Destination',
    dropoffLat: data.dropoffLat || 31.6148,
    dropoffLng: data.dropoffLng || -7.9912,
    estimatedPrice: price,
    actualPrice: data.actualPrice ? parseFloat(data.actualPrice) : price,
    currency: data.currency || 'MAD',
    verificationCode: data.verificationCode || undefined,
    distanceKm: data.distanceKm || 5.8,
    durationMins: data.durationMins || 14,
    createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
  };
};
