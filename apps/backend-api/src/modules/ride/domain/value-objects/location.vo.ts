import { BadRequestException } from '@nestjs/common';

export class Location {
  constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly address: string
  ) {
    this.validate();
  }

  private validate() {
    if (this.lat < -90 || this.lat > 90) throw new BadRequestException('INVALID_LATITUDE');
    if (this.lng < -180 || this.lng > 180) throw new BadRequestException('INVALID_LONGITUDE');
    if (!this.address || this.address.length < 5) throw new BadRequestException('ADDRESS_TOO_SHORT');
  }

  public getCoords(): string {
    return `${this.lat},${this.lng}`;
  }
}
