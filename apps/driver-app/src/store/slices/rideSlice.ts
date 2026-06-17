import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RideRequest {
  id: string;
  pickup: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  fare: number;
  distance: number;
  duration: number;
  passenger: { name: string; rating: number; avatar?: string };
}

interface RideState {
  currentRequest: RideRequest | null;
  activeRide: RideRequest | null;
  status: 'IDLE' | 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'STARTED' | 'COMPLETED';
}

const initialState: RideState = {
  currentRequest: null,
  activeRide: null,
  status: 'IDLE',
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setNewRequest: (state, action: PayloadAction<RideRequest | null>) => {
      state.currentRequest = action.payload;
      state.status = action.payload ? 'PENDING' : 'IDLE';
    },
    acceptRide: (state) => {
      if (state.currentRequest) {
        state.activeRide = state.currentRequest;
        state.currentRequest = null;
        state.status = 'ACCEPTED';
      }
    },
    updateRideStatus: (state, action: PayloadAction<RideState['status']>) => {
      state.status = action.payload;
    },
    clearRide: (state) => {
      state.activeRide = null;
      state.currentRequest = null;
      state.status = 'IDLE';
    },
  },
});

export const { setNewRequest, acceptRide, updateRideStatus, clearRide } = rideSlice.actions;
export default rideSlice.reducer;
