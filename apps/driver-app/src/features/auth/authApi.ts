import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOTP: builder.mutation<{ success: boolean }, { phoneNumber: string }>({
      query: (body) => ({
        url: '/auth/otp/request',
        method: 'POST',
        body,
      }),
    }),
    verifyOTP: builder.mutation<{ token: string; driver: any }, { phoneNumber: string; code: string }>({
      query: (body) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRequestOTPMutation, useVerifyOTPMutation } = authApi;
