import { create } from 'zustand';

export interface RideOrder {
  id: string;
  passengerName: string;
  passengerRating: number;
  passengerAvatar?: string;
  isNewPassenger: boolean;
  distanceToPickup: string;
  pickupEta: string;
  tripDistance: string;
  tripDuration: string;
  offeredPrice: number;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

interface OrdersState {
  orders: RideOrder[];
  addOrder: (order: RideOrder) => void;
  removeOrder: (rideId: string) => void;
  updateOrder: (rideId: string, updates: Partial<RideOrder>) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  addOrder: (order) => 
    set((state) => ({ 
      orders: state.orders.some(o => o.id === order.id) 
        ? state.orders 
        : [order, ...state.orders] 
    })),
  removeOrder: (rideId) => 
    set((state) => ({ 
      orders: state.orders.filter(o => o.id !== rideId) 
    })),
  updateOrder: (rideId, updates) =>
    set((state) => ({
      orders: state.orders.map(o => o.id === rideId ? { ...o, ...updates } : o)
    })),
}));
