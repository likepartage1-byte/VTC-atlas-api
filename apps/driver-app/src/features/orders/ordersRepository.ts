import { api } from '../../api/axios.instance';
import { DriverRide, mapRideResponseToDriverRide } from './domain/entities/driverRide';

export const ordersRepository = {
  /**
   * Fetch the driver's current active ride from NestJS backend
   * Endpoint: GET /api/v1/driver/rides/active
   */
  getActiveRide: async (): Promise<DriverRide | null> => {
    try {
      const response = await api.get('/driver/rides/active');
      if (response.data) {
        return mapRideResponseToDriverRide(response.data);
      }
      return null;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null; // No active ride assigned
      }
      console.warn('⚠️ [ordersRepository] Active ride fetch warning:', err?.message || err);
      return null;
    }
  },

  /**
   * Accept an assigned ride
   * Endpoint: POST /api/v1/driver/rides/:id/accept
   */
  acceptRide: async (rideId: string): Promise<boolean> => {
    try {
      await api.post(`/driver/rides/${rideId}/accept`);
      return true;
    } catch (err: any) {
      console.error('❌ [ordersRepository] Accept ride failed:', err?.response?.data || err.message);
      return false;
    }
  },

  /**
   * Report arrival at pickup location (triggers OTP generation on backend)
   * Endpoint: POST /api/v1/driver/rides/:id/arrive
   */
  reportArrival: async (rideId: string): Promise<{ success: boolean; message?: string; otpRequired?: boolean }> => {
    try {
      const response = await api.post(`/driver/rides/${rideId}/arrive`);
      return {
        success: true,
        message: response.data?.message || 'Arrival reported',
        otpRequired: response.data?.otp_required ?? true,
      };
    } catch (err: any) {
      console.error('❌ [ordersRepository] Report arrival failed:', err?.response?.data || err.message);
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
      };
    }
  },

  /**
   * Start trip with physical OTP validation
   * Endpoint: POST /api/v1/driver/rides/:id/start
   */
  startTrip: async (rideId: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/driver/rides/${rideId}/start`, { otp });
      return {
        success: true,
        message: response.data?.message || 'Trip started',
      };
    } catch (err: any) {
      console.error('❌ [ordersRepository] Start trip failed:', err?.response?.data || err.message);
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
      };
    }
  },

  /**
   * Complete trip and release driver
   * Endpoint: POST /api/v1/driver/rides/:id/complete
   */
  completeTrip: async (rideId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/driver/rides/${rideId}/complete`);
      return {
        success: true,
        message: response.data?.message || 'Trip completed',
      };
    } catch (err: any) {
      console.error('❌ [ordersRepository] Complete trip failed:', err?.response?.data || err.message);
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
      };
    }
  },
};
