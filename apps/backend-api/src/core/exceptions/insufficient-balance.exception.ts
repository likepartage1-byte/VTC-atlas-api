import { HttpException, HttpStatus } from '@nestjs/common';

export interface InsufficientBalanceErrorPayload {
  message: string;
  requiredCommission: number;
  currentBalance: number;
  missingAmount: number;
}

export class InsufficientBalanceException extends HttpException {
  constructor(payload: InsufficientBalanceErrorPayload) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        errorCode: 'INSUFFICIENT_BALANCE',
        message: payload.message,
        requiredCommission: payload.requiredCommission,
        currentBalance: payload.currentBalance,
        missingAmount: payload.missingAmount,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
