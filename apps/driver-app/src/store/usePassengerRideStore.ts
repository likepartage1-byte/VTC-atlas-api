import { create } from 'zustand';

export type PassengerRideStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface AssignedDriver {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  rating?: number;
  vehicleInfo?: {
    make?: string;
    model?: string;
    plate?: string;
    color?: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

interface PassengerRideState {
  rideId: string | null;
  status: PassengerRideStatus;
  pickup: LocationPoint | null;
  destination: LocationPoint | null;
  assignedDriver: AssignedDriver | null;
  estimatedFareMAD: number;
  serviceType: 'ECO' | 'COMFORT' | 'MOTO' | 'CARGO';

  setSearching: (data: {
    rideId: string;
    pickup: LocationPoint;
    destination: LocationPoint;
    estimatedFareMAD: number;
    serviceType: 'ECO' | 'COMFORT' | 'MOTO' | 'CARGO';
  }) => void;

  setAssignedDriver: (driver: AssignedDriver) => void;
  updateDriverLocation: (lat: number, lng: number) => void;
  setRideStatus: (status: PassengerRideStatus) => void;
  resetRide: () => void;
}

export const usePassengerRideStore = create<PassengerRideState>((set) => ({
  rideId: null,
  status: 'IDLE',
  pickup: null,
  destination: null,
  assignedDriver: null,
  estimatedFareMAD: 0,
  serviceType: 'ECO',

  setSearching: (data) =>
    set({
      rideId: data.rideId,
      status: 'SEARCHING',
      pickup: data.pickup,
      destination: data.destination,
      estimatedFareMAD: data.estimatedFareMAD,
      serviceType: data.serviceType,
    }),

  setAssignedDriver: (driver) =>
    set((state) => ({
      assignedDriver: driver,
      status: 'ACCEPTED',
    })),

  updateDriverLocation: (lat, lng) =>
    set((state) => ({
      assignedDriver: state.assignedDriver
        ? {
            ...state.assignedDriver,
            currentLocation: { lat, lng },
          }
        : null,
    })),

  setRideStatus: (status) => set({ status }),

  resetRide: () =>
    set({
      rideId: null,
      status: 'IDLE',
      pickup: null,
      destination: null,
      assignedDriver: null,
      estimatedFareMAD: 0,
    }),
}));
