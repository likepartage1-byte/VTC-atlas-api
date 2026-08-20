/**
 * DEVELOPMENT ONLY MOCK REPOSITORY
 * This file is for offline development and local storybook testing only.
 * DO NOT import in production app flows.
 */

import { DriverRide } from '../domain/entities/driverRide';

export interface DevMockOrder extends DriverRide {
  isFairPrice: boolean;
  distanceToPickup: string;
  pickupEta: string;
  tripDistance: string;
  tripDuration: string;
}

export const DEV_MOCK_ORDERS: DevMockOrder[] = [
  {
    id: 'dev-order-001',
    status: 'REQUESTED',
    passengerId: 'p-101',
    passenger: {
      id: 'p-101',
      name: 'Amina B.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      rating: 4.85,
      tripsCount: 60,
      isVerified: true,
    },
    pickupAddress: 'Gueliz Plaza (Marrakech)',
    pickupLat: 31.6342,
    pickupLng: -8.0089,
    dropoffAddress: 'Jemaa el-Fnaa (Médina)',
    dropoffLat: 31.6258,
    dropoffLng: -7.9891,
    estimatedPrice: 45,
    actualPrice: 45,
    currency: 'MAD',
    distanceKm: 3.2,
    durationMins: 8,
    createdAt: new Date().toISOString(),
    isFairPrice: true,
    distanceToPickup: '284 m',
    pickupEta: '2 min',
    tripDistance: '3.2 km',
    tripDuration: '8 min',
  },
  {
    id: 'dev-order-002',
    status: 'REQUESTED',
    passengerId: 'p-102',
    passenger: {
      id: 'p-102',
      name: 'Omar K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      rating: 4.9,
      tripsCount: 142,
      isVerified: true,
    },
    pickupAddress: 'Hivernage Avenue Echouhada',
    pickupLat: 31.6200,
    pickupLng: -8.0100,
    dropoffAddress: 'Aéroport Marrakech Ménara (RAK)',
    dropoffLat: 31.6069,
    dropoffLng: -8.0358,
    estimatedPrice: 70,
    actualPrice: 70,
    currency: 'MAD',
    distanceKm: 8.5,
    durationMins: 18,
    createdAt: new Date().toISOString(),
    isFairPrice: true,
    distanceToPickup: '1.2 km',
    pickupEta: '4 min',
    tripDistance: '8.5 km',
    tripDuration: '18 min',
  },
];
