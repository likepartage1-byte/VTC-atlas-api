import { create } from 'zustand';
import {
  WalletBalance,
  Transaction,
  PendingPayment,
  PaymentMethod,
} from '../../domain/entities/wallet.types';

interface WalletStoreData {
  balance:         WalletBalance | null;
  transactions:    Transaction[];
  pendingPayments: PendingPayment[];
  paymentMethods:  PaymentMethod[];
}

interface WalletStoreActions {
  setBalance:         (balance: WalletBalance) => void;
  setTransactions:    (txns: Transaction[]) => void;
  setPendingPayments: (pending: PendingPayment[]) => void;
  setPaymentMethods:  (methods: PaymentMethod[]) => void;
  setWalletData: (data: {
    balance: WalletBalance;
    transactions: Transaction[];
    pendingPayments: PendingPayment[];
    paymentMethods: PaymentMethod[];
  }) => void;
  reset:              () => void;
}

const INITIAL_DATA: WalletStoreData = {
  balance:         null,
  transactions:    [],
  pendingPayments: [],
  paymentMethods:  [],
};

export const useWalletStore = create<WalletStoreData & WalletStoreActions>((set) => ({
  ...INITIAL_DATA,

  setBalance:         (balance) => set({ balance }),
  setTransactions:    (transactions) => set({ transactions }),
  setPendingPayments: (pendingPayments) => set({ pendingPayments }),
  setPaymentMethods:  (paymentMethods) => set({ paymentMethods }),
  setWalletData:      (data) => set({
    balance: data.balance,
    transactions: data.transactions,
    pendingPayments: data.pendingPayments,
    paymentMethods: data.paymentMethods,
  }),
  reset:              () => set(INITIAL_DATA),
}));
