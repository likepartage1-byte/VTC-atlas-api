import { RideOrder } from '../../../store/useOrdersStore';

export type DriverTier = 'BASIC' | 'GOLD' | 'PREMIER';

export interface MockPassenger {
  name: string;
  avatar: string;
  rating: number;
  tripsCount: number;
  isVerified: boolean;
  isNewPassenger: boolean;
  memberSince: string;
  paymentMethod: string;
}

export interface MockOrder extends RideOrder {
  passengerDetail: MockPassenger;
  isFairPrice: boolean;
  distanceKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'IGNORED' | 'EXPIRED';
}

// ─── Centralized Configuration ──────────────────────────────────────────────
export const MOCK_CONFIG = {
  USE_MOCK_ORDERS: true,
  MAX_BID_PERCENTAGE: 0.30, // Max +30% price bidding ceiling
  NOTIFICATION_LIFETIME_SECONDS: 10, // Always 10 seconds lifetime for alert notification
  TIER_PRIORITY_WINDOWS: {
    BASIC: 0,   // 0 seconds private priority
    GOLD: 3,    // 3 seconds private priority
    PREMIER: 5, // 5 seconds private priority
  },
};

// Helper: parse distance string to numeric km for exact sorting
const parseDist = (distStr: string): number => {
  const clean = distStr.replace(/[^0-9.,]/g, '').replace(',', '.');
  const val = parseFloat(clean);
  if (isNaN(val)) return 999;
  if (distStr.toLowerCase().includes('m') && !distStr.toLowerCase().includes('km')) {
    return val / 1000;
  }
  return val;
};

// ─── 8 Realistic Marrakech Mock Passengers & Rides ──────────────────────────
const MARRAKECH_MOCK_ORDERS: MockOrder[] = [
  {
    id: 'mk-order-001',
    passengerName: 'Amina B.',
    passengerRating: 4.85,
    passengerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 60,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '284 m',
    pickupEta: '2 min',
    tripDistance: '3.2 km',
    tripDuration: '8 min',
    offeredPrice: 30,
    pickupAddress: 'Rue des Ecoles, Marrakech',
    dropoffAddress: 'McDonald’s (Route de Targa)',
    pickupLat: 31.6342,
    pickupLng: -8.0089,
    dropoffLat: 31.6410,
    dropoffLng: -8.0190,
    isFairPrice: false,
    distanceKm: 0.284,
    status: 'PENDING',
    passengerDetail: {
      name: 'Amina B.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      rating: 4.85,
      tripsCount: 60,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2023',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-002',
    passengerName: 'Meissane K.',
    passengerRating: 4.88,
    passengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 34,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '1.2 km',
    pickupEta: '4 min',
    tripDistance: '8.4 km',
    tripDuration: '16 min',
    offeredPrice: 50,
    pickupAddress: 'Rte du Barrage, Marrakech',
    dropoffAddress: 'Eden Club Marrakech (en face consulat de France)',
    pickupLat: 31.6150,
    pickupLng: -8.0010,
    dropoffLat: 31.5900,
    dropoffLng: -7.9800,
    isFairPrice: true,
    distanceKm: 1.2,
    status: 'PENDING',
    passengerDetail: {
      name: 'Meissane K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: 4.88,
      tripsCount: 34,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2024',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-003',
    passengerName: 'Enrico M.',
    passengerRating: 4.73,
    passengerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 12,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '1.8 km',
    pickupEta: '5 min',
    tripDistance: '6.1 km',
    tripDuration: '14 min',
    offeredPrice: 70,
    pickupAddress: 'Marrakesh Menara Airport, Terminal Arrival',
    dropoffAddress: 'Riad Marrakech House (Medina)',
    pickupLat: 31.6069,
    pickupLng: -8.0363,
    dropoffLat: 31.6258,
    dropoffLng: -7.9891,
    isFairPrice: true,
    distanceKm: 1.8,
    status: 'PENDING',
    passengerDetail: {
      name: 'Enrico M.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      rating: 4.73,
      tripsCount: 12,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2024',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-004',
    passengerName: 'Malak S.',
    passengerRating: 5.0,
    passengerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: true,
    passengerTripsCount: 8,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '2.3 km',
    pickupEta: '6 min',
    tripDistance: '5.4 km',
    tripDuration: '11 min',
    offeredPrice: 70,
    pickupAddress: 'Marrakesh Menara Airport, Terminal Arrival',
    dropoffAddress: 'Résidence Menara Garden (Hivernage)',
    pickupLat: 31.6069,
    pickupLng: -8.0363,
    dropoffLat: 31.6200,
    dropoffLng: -8.0100,
    isFairPrice: true,
    distanceKm: 2.3,
    status: 'PENDING',
    passengerDetail: {
      name: 'Malak S.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
      rating: 5.0,
      tripsCount: 8,
      isVerified: true,
      isNewPassenger: true,
      memberSince: '2024',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-005',
    passengerName: 'Noamane H.',
    passengerRating: 4.86,
    passengerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 52,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '3.1 km',
    pickupEta: '7 min',
    tripDistance: '4.8 km',
    tripDuration: '10 min',
    offeredPrice: 40,
    pickupAddress: 'Marrakesh Menara Airport (Arrivals)',
    dropoffAddress: 'Gare MARRAKECH (Centre, Bd Mohamed VI)',
    pickupLat: 31.6069,
    pickupLng: -8.0363,
    dropoffLat: 31.6300,
    dropoffLng: -8.0150,
    isFairPrice: false,
    distanceKm: 3.1,
    status: 'PENDING',
    passengerDetail: {
      name: 'Noamane H.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      rating: 4.86,
      tripsCount: 52,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2023',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-006',
    passengerName: 'Sarah R.',
    passengerRating: 5.0,
    passengerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 5,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '4.4 km',
    pickupEta: '9 min',
    tripDistance: '5.4 km',
    tripDuration: '12 min',
    offeredPrice: 50,
    pickupAddress: 'Avenue Guemassa (Ménara)',
    dropoffAddress: 'Résidence Menara Garden (Marrakech)',
    pickupLat: 31.6258,
    pickupLng: -7.9891,
    dropoffLat: 31.6200,
    dropoffLng: -8.0100,
    isFairPrice: true,
    distanceKm: 4.4,
    status: 'PENDING',
    passengerDetail: {
      name: 'Sarah R.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      rating: 5.0,
      tripsCount: 5,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2024',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-007',
    passengerName: 'Youssef L.',
    passengerRating: 4.91,
    passengerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 118,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '5.0 km',
    pickupEta: '11 min',
    tripDistance: '9.8 km',
    tripDuration: '22 min',
    offeredPrice: 60,
    pickupAddress: 'Avenue Guemassa (Ménara)',
    dropoffAddress: 'Palmeraie Resort & Golf (Annakhil)',
    pickupLat: 31.6258,
    pickupLng: -7.9891,
    dropoffLat: 31.6667,
    dropoffLng: -7.9500,
    isFairPrice: false,
    distanceKm: 5.0,
    status: 'PENDING',
    passengerDetail: {
      name: 'Youssef L.',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      rating: 4.91,
      tripsCount: 118,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2023',
      paymentMethod: 'Cash payment',
    },
  },
  {
    id: 'mk-order-008',
    passengerName: 'Karima T.',
    passengerRating: 4.95,
    passengerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    isNewPassenger: false,
    passengerTripsCount: 210,
    isVerified: true,
    expiresAt: Date.now() + 60_000,
    distanceToPickup: '7.8 km',
    pickupEta: '15 min',
    tripDistance: '12.3 km',
    tripDuration: '26 min',
    offeredPrice: 85,
    pickupAddress: 'Gueliz Avenue Mohammed V',
    dropoffAddress: 'Hivernage Luxury Hotel',
    pickupLat: 31.6342,
    pickupLng: -8.0089,
    dropoffLat: 31.6200,
    dropoffLng: -8.0100,
    isFairPrice: true,
    distanceKm: 7.8,
    status: 'PENDING',
    passengerDetail: {
      name: 'Karima T.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      rating: 4.95,
      tripsCount: 210,
      isVerified: true,
      isNewPassenger: false,
      memberSince: '2022',
      paymentMethod: 'Cash payment',
    },
  },
];

let localMockOrdersState = [...MARRAKECH_MOCK_ORDERS];

export const mockOrdersRepository = {
  /**
   * Get all active mock orders sorted ascending by distance to driver (Rule #3)
   */
  getSortedOrders: (): MockOrder[] => {
    return [...localMockOrdersState]
      .filter(o => o.status === 'PENDING')
      .sort((a, b) => parseDist(a.distanceToPickup) - parseDist(b.distanceToPickup));
  },

  /**
   * Get the nearest eligible private order (distanceToDriver <= 5.0 km) (Rule #4)
   */
  getNearestEligiblePrivateOrder: (tier: DriverTier = 'GOLD'): { order: MockOrder | null; priorityWindowSeconds: number } => {
    const active = mockOrdersRepository.getSortedOrders();
    const eligible = active.find(o => parseDist(o.distanceToPickup) <= 5.0);

    const priorityWindowSeconds = MOCK_CONFIG.TIER_PRIORITY_WINDOWS[tier] || 0;

    return {
      order: eligible || null,
      priorityWindowSeconds,
    };
  },

  /**
   * Update order status to ACCEPTED (Rule #11)
   */
  acceptOrder: (orderId: string): boolean => {
    const target = localMockOrdersState.find(o => o.id === orderId);
    if (target) {
      target.status = 'ACCEPTED';
      return true;
    }
    return false;
  },

  /**
   * Update order status to IGNORED (Rule #12)
   */
  ignoreOrder: (orderId: string): void => {
    const target = localMockOrdersState.find(o => o.id === orderId);
    if (target) {
      target.status = 'IGNORED';
    }
  },

  /**
   * Reset mock orders dataset (for testing resets)
   */
  resetMockData: (): void => {
    localMockOrdersState = MARRAKECH_MOCK_ORDERS.map(o => ({ ...o, status: 'PENDING' }));
  },
};
