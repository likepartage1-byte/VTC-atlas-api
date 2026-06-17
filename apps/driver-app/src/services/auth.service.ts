import { api } from '../api/axios.instance';

export interface AuthResponse {
  token: string;
  driver: {
    id: string;
    phone: string;
    name?: string;
  };
}

export const authService = {
  requestOtp: (phoneNumber: string) => {
    return api.post('/auth/otp/request', { phoneNumber });
  },

  verifyOtp: (phoneNumber: string, code: string, deviceId: string = 'unique-device-id') => {
    return api.post<AuthResponse>('/auth/otp/verify', {
      phoneNumber,
      code,
      deviceId,
    });
  },
};
