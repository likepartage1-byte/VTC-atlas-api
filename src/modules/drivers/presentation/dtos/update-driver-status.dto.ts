import { IsBoolean, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateDriverStatusDto {
  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}
