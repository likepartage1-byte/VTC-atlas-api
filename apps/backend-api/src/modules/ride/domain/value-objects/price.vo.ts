import { BadRequestException } from '@nestjs/common';

export class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'MAD'
  ) {
    if (amount <= 0) throw new BadRequestException('PRICE_MUST_BE_POSITIVE');
  }

  public add(other: Price): Price {
    if (this.currency !== other.currency) throw new Error('CURRENCY_MISMATCH');
    return new Price(this.amount + other.amount, this.currency);
  }
}
