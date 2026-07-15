import { RideOrder } from '../../store/useOrdersStore';
import { CompletedRide } from './domain/entities/completedRide';

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
}

const MOCK_PASSENGERS: MockPassenger[] = [
  {
    name: 'Mohamed A.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    tripsCount: 327,
    isVerified: true,
    isNewPassenger: false,
    memberSince: '2023',
    paymentMethod: 'Cash payment',
  },
  {
    name: 'Sara L.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 4.8,
    tripsCount: 142,
    isVerified: true,
    isNewPassenger: false,
    memberSince: '2024',
    paymentMethod: 'Cash payment',
  },
  {
    name: 'Youssef K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 4.7,
    tripsCount: 89,
    isVerified: false,
    isNewPassenger: true,
    memberSince: '2024',
    paymentMethod: 'Credit Card',
  },
  {
    name: 'Karima B.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    rating: 4.95,
    tripsCount: 512,
    isVerified: true,
    isNewPassenger: false,
    memberSince: '2022',
    paymentMethod: 'Cash payment',
  }
];

export const ordersRepository = {
  getNearbyOrders: async (): Promise<MockOrder[]> => {
    // Simulating API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return [
      {
        id: 'order-201',
        passengerName: MOCK_PASSENGERS[0].name,
        passengerRating: MOCK_PASSENGERS[0].rating,
        passengerAvatar: MOCK_PASSENGERS[0].avatar,
        isNewPassenger: MOCK_PASSENGERS[0].isNewPassenger,
        passengerTripsCount: MOCK_PASSENGERS[0].tripsCount,
        isVerified: MOCK_PASSENGERS[0].isVerified,
        expiresAt: Date.now() + 60_000,
        distanceToPickup: '2.3 km',
        pickupEta: '9 min',
        tripDistance: '13.5 km',
        tripDuration: '29 min',
        offeredPrice: 75,
        pickupAddress: 'Reservation transport (Ménara)',
        dropoffAddress: 'Hotel Riu Tikida Palmeraie (Annakhil)',
        pickupLat: 31.6214,
        pickupLng: -7.9945,
        dropoffLat: 31.6521,
        dropoffLng: -7.9515,
        isFairPrice: true,
        passengerDetail: MOCK_PASSENGERS[0],
      },
      {
        id: 'order-202',
        passengerName: MOCK_PASSENGERS[1].name,
        passengerRating: MOCK_PASSENGERS[1].rating,
        passengerAvatar: MOCK_PASSENGERS[1].avatar,
        isNewPassenger: MOCK_PASSENGERS[1].isNewPassenger,
        passengerTripsCount: MOCK_PASSENGERS[1].tripsCount,
        isVerified: MOCK_PASSENGERS[1].isVerified,
        expiresAt: Date.now() + 45_000,
        distanceToPickup: '2.5 km',
        pickupEta: '8 min',
        tripDistance: '8.2 km',
        tripDuration: '18 min',
        offeredPrice: 55,
        pickupAddress: 'DAR SARSAR Airport (Ménara)',
        dropoffAddress: 'OI Application (Ménara)',
        pickupLat: 31.6069,
        pickupLng: -8.0358,
        dropoffLat: 31.6148,
        dropoffLng: -7.9912,
        isFairPrice: true,
        passengerDetail: MOCK_PASSENGERS[1],
      },
      {
        id: 'order-203',
        passengerName: MOCK_PASSENGERS[2].name,
        passengerRating: MOCK_PASSENGERS[2].rating,
        passengerAvatar: MOCK_PASSENGERS[2].avatar,
        isNewPassenger: MOCK_PASSENGERS[2].isNewPassenger,
        passengerTripsCount: MOCK_PASSENGERS[2].tripsCount,
        isVerified: MOCK_PASSENGERS[2].isVerified,
        expiresAt: Date.now() + 90_000,
        distanceToPickup: '3.2 km',
        pickupEta: '11 min',
        tripDistance: '6.4 km',
        tripDuration: '14 min',
        offeredPrice: 35,
        pickupAddress: 'Marrakech (Maroc)',
        dropoffAddress: 'Bab Agnaou (Méchouar-Kasbah)',
        pickupLat: 31.6295,
        pickupLng: -7.9811,
        dropoffLat: 31.6148,
        dropoffLng: -7.9912,
        isFairPrice: false,
        passengerDetail: MOCK_PASSENGERS[2],
      },
      {
        id: 'order-204',
        passengerName: MOCK_PASSENGERS[3].name,
        passengerRating: MOCK_PASSENGERS[3].rating,
        passengerAvatar: MOCK_PASSENGERS[3].avatar,
        isNewPassenger: MOCK_PASSENGERS[3].isNewPassenger,
        passengerTripsCount: MOCK_PASSENGERS[3].tripsCount,
        isVerified: MOCK_PASSENGERS[3].isVerified,
        expiresAt: Date.now() + 120_000,
        distanceToPickup: '7.4 km',
        pickupEta: '16 min',
        tripDistance: '18.1 km',
        tripDuration: '32 min',
        offeredPrice: 180,
        pickupAddress: 'Place Al Massira (Marrakech)',
        dropoffAddress: 'Budget Marrakech Airport (Ménara)',
        pickupLat: 31.6343,
        pickupLng: -8.0142,
        dropoffLat: 31.6069,
        dropoffLng: -8.0358,
        isFairPrice: true,
        passengerDetail: MOCK_PASSENGERS[3],
      }
    ];
  },
  getCompletedRidesForRange: async (startDate: Date, endDate: Date): Promise<CompletedRide[]> => {
    // Simulating API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result: CompletedRide[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current.getTime() <= end.getTime()) {
      result.push(...generateCompletedRidesForDate(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }
};

// Deterministic mock generator for rides on a given Date
const generateCompletedRidesForDate = (date: Date): CompletedRide[] => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const timeVal = d.getTime();

  if (dayOfWeek === 0) {
    return []; // No rides completed on Sunday (default holiday)
  }

  const ridesCount = (dayOfWeek * 2) + 2; // Mon (1) -> 4 rides, Sat (6) -> 14 rides
  const result: CompletedRide[] = [];

  for (let i = 0; i < ridesCount; i++) {
    const fare = 35 + (i * 15); // e.g. 35, 50, 65, 80 MAD ...
    
    // Services: Index even is Course (commission 8.4%, tva 1.48%), odd is Coursier en voiture (commission 7.99%, tva 0.5%)
    const isCourse = i % 2 === 0;
    const commRate = isCourse ? 0.084 : 0.0799;
    const tvaRate = isCourse ? 0.0148 : 0.005;

    const commission = Math.round(fare * commRate * 100) / 100;
    const tva = Math.round(fare * tvaRate * 100) / 100;
    const serviceFee = 0;
    const netIncome = Math.round((fare - commission - tva) * 100) / 100;

    const distance = 4 + i * 2.5; // e.g. 4km, 6.5km, 9km...
    const duration = 8 + i * 4;  // e.g. 8, 12, 16 mins...

    const rideDate = new Date(d);
    rideDate.setHours(8 + i * 1.5, (i * 12) % 60, 0, 0);

    result.push({
      id: `ride-${timeVal}-${i}`,
      passengerName: i % 2 === 0 ? 'Mohamed A.' : 'Karima B.',
      pickupAddress: isCourse ? 'Reservation transport (Ménara)' : 'Gueliz',
      dropoffAddress: isCourse ? 'Hotel Riu Tikida Palmeraie' : 'Marrakech Mall',
      fare,
      commission,
      tva,
      serviceFee,
      netIncome,
      distance,
      duration,
      createdAt: rideDate,
      status: 'completed',
    });
  }

  return result;
};

