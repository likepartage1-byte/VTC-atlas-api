import { IsNumber, IsString, IsNotEmpty, IsOptional, Min, Max, IsIn, IsDateString } from 'class-validator';

export class RequestRideDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLng: number;

  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  dropoffLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  dropoffLng: number;

  @IsString()
  @IsNotEmpty()
  dropoffAddress: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string; // e.g., 'ECONOMY', 'VIP'

  @IsOptional()
  @IsNumber()
  @Min(5, { message: 'offeredPrice must be at least 5 MAD' })
  offeredPrice?: number | null;

  // ── Intercity fields (optional — null = standard city ride) ────────

  @IsOptional()
  @IsString()
  @IsIn(['CITY', 'INTERCITY'], { message: 'tripType must be CITY or INTERCITY' })
  tripType?: 'CITY' | 'INTERCITY';

  @IsOptional()
  @IsString()
  departureCity?: string;

  @IsOptional()
  @IsString()
  arrivalCity?: string;

  /** ISO 8601 datetime string e.g. "2026-09-03T14:45:00Z" */
  @IsOptional()
  @IsDateString()
  departureDateTime?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SHARED', 'PRIVATE'], { message: 'rideMode must be SHARED or PRIVATE' })
  rideMode?: 'SHARED' | 'PRIVATE';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  seatsBooked?: number;

  @IsOptional()
  @IsString()
  passengerNotes?: string;
}
