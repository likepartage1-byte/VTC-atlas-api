import { api } from '../../../api/axios.instance';

export interface CreateRidePayload {
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  serviceType: 'ECO' | 'COURSE_PLUS' | 'CONFORT' | 'TAXI' | 'MOTO' | 'CARGO' | 'COMFORT';
  estimatedFareMAD: number;
}

export const passengerRideService = {
  createRide: async (payload: CreateRidePayload) => {
    const response = await api.post('/passenger/rides', {
      pickupLocation: payload.pickup,
      destinationLocation: payload.destination,
      serviceType: payload.serviceType,
      estimatedPrice: payload.estimatedFareMAD,
    });
    return response.data;
  },

  cancelRide: async (rideId: string) => {
    const response = await api.post(`/passenger/rides/${rideId}/cancel`);
    return response.data;
  },

  getActiveRide: async () => {
    try {
      const response = await api.get('/passenger/rides/active');
      return response.data;
    } catch (_) {
      return null;
    }
  },
};
