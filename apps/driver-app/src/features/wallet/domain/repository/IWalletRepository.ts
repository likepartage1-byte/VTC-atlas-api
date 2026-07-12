import {
  WalletBalance,
  Transaction,
  PendingPayment,
  PaymentMethod,
  PaymentMethodType,
  ApiResponse,
} from '../entities/wallet.types';

export interface IWalletRepository {
  getBalance():                                              Promise<ApiResponse<WalletBalance>>;
  getTransactions(limit?: number):                          Promise<ApiResponse<Transaction[]>>;
  getPendingPayments():                                     Promise<ApiResponse<PendingPayment[]>>;
  getPaymentMethods():                                      Promise<ApiResponse<PaymentMethod[]>>;
  recharge(method: PaymentMethodType, amount: number):      Promise<ApiResponse<{ newBalance: number }>>;
}
