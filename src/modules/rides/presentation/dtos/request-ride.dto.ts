import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';

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
}
