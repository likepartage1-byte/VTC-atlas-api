// ─────────────────────────────────────────────────────────────────────────────
// Atlas Driver · Wallet Domain Entities
// ─────────────────────────────────────────────────────────────────────────────

export type CurrencyCode = 'MAD' | 'EUR' | 'USD' | 'SAR';

export type TransactionType =
  | 'service_fee'
  | 'vat'
  | 'recharge'
  | 'bonus'
  | 'refund'
  | 'commission';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethodType = 'visa' | 'mastercard' | 'google_pay' | 'apple_pay' | 'bank_transfer' | 'cash';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface WalletBalance {
  amount:    number;
  currency:  CurrencyCode;
  pending:   number;
}

export interface Transaction {
  id:          string;
  type:        TransactionType;
  status:      TransactionStatus;
  amount:      number;
  currency:    CurrencyCode;
  label:       string;
  description: string;
  createdAt:   Date;
  rideId?:     string;
}

export interface PendingPayment {
  id:                    string;
  amount:                number;
  currency:              CurrencyCode;
  reason:                string;
  status:                TransactionStatus;
  estimatedProcessingAt: Date;
}

export interface PaymentMethod {
  id:        string;
  type:      PaymentMethodType;
  label:     string;
  isDefault: boolean;
  last4?:    string;
}

// ─── Repository Response ──────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: string; code?: number };

// ─── Aggregated Wallet Data ───────────────────────────────────────────────────

export interface WalletData {
  balance:        WalletBalance;
  transactions:   Transaction[];
  pendingPayments: PendingPayment[];
  paymentMethods: PaymentMethod[];
}
