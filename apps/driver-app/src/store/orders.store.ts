import { create } from 'zustand';

export interface RideOrder {
  id: string;
  passengerName: string;
  passengerRating: number;
  distanceToPickup: string;
  pickupEta: string;
  tripDistance: string;
  tripDuration: string;
  offeredPrice: number;
  pickupAddress: string;
  dropoffAddress: string;
}

interface OrdersState {
  orders: RideOrder[];
  addOrder: (order: RideOrder) => void;
  removeOrder: (rideId: string) => void;
  clearOrders: () => void;
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
  clearOrders: () => set({ orders: [] }),
}));
