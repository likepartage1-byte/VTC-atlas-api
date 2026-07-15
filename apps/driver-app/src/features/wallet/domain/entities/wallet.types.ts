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

// ─── Daily & Weekly summaries for Income module ──────────────────────────────

export interface DailyIncomeSummary {
  date:             string; // YYYY-MM-DD
  grossIncome:      number; // إجمالي الدخل
  netIncome:        number; // صافي الدخل
  ridesCount:       number; // عدد الرحلات
  workHours:        number; // ساعات العمل (محسوبة بشكل مستقل عن مدة الرحلة)
  avgProfitPerRide: number; // متوسط الربح لكل رحلة
  totalCommissions: number; // إجمالي العمولات
  totalTaxes:       number; // إجمالي الضرائب (TVA)
  totalFees:        number; // إجمالي الرسوم (خدمات المنصة)
  distanceCovered:  number; // المسافة المقطوعة (كم)
}

export interface WeeklyIncomeSummary {
  startDate:        string; // YYYY-MM-DD
  endDate:          string; // YYYY-MM-DD
  totalGrossIncome: number; // إجمالي الدخل الإسبوعي
  totalNetIncome:   number; // إجمالي الدخل الصافي الأسبوعي
  totalRidesCount:  number; // عدد الرحلات الإسبوعية
  totalWorkHours:   number; // ساعات العمل الأسبوعية
  bestDay:          string; // أفضل يوم في الأسبوع
  peakHour:         string; // أفضل ساعة عمل
  dailySummaries:   DailyIncomeSummary[]; // 7 items representing Mon-Sun
}

