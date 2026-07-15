export interface CompletedRide {
  id:              string;
  passengerName:   string;
  pickupAddress:   string;
  dropoffAddress:  string;
  fare:            number; // Gross fare in MAD
  distance:        number; // in km
  duration:        number; // in minutes (trip duration)
  createdAt:       Date;
  status:          'completed' | 'cancelled';
  commission:      number; // Deducted (8.4% or 7.99% based on ride type)
  tva:             number; // Tax rate (1.48% or 0.5%)
  serviceFee:      number; // Other fees
  netIncome:       number; // fare - commission - tva - serviceFee
}
