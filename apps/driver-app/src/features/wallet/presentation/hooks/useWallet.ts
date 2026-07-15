import { useState, useCallback } from 'react';
import { WalletMockRepository } from '../../data/repository/WalletMockRepository';
import { useWalletStore } from '../store/useWalletStore';
import { PaymentMethodType, DailyIncomeSummary, WeeklyIncomeSummary } from '../../domain/entities/wallet.types';
import { ordersRepository } from '../../../orders/ordersRepository';
import { IncomeAggregationService } from '../../services/IncomeAggregationService';


// ─── State Machine ─────────────────────────────────────────────────────────────
type WalletStatus = 'idle' | 'loading' | 'refreshing' | 'loaded' | 'empty' | 'error';

interface WalletHookState {
  status:       WalletStatus;
  error:        string | null;
  isRefreshing: boolean;
}

// ─── Repository instance (swap for API repo when backend is ready) ────────────
const repo = new WalletMockRepository();

// ─────────────────────────────────────────────────────────────────────────────
export const useWallet = () => {
  // Stable Actions (never change)
  const setWalletData = useWalletStore((s) => s.setWalletData);

  // Selected State Values
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const pendingPayments = useWalletStore((s) => s.pendingPayments);
  const paymentMethods = useWalletStore((s) => s.paymentMethods);

  const [state, setState] = useState<WalletHookState>({
    status:       'idle',
    error:        null,
    isRefreshing: false,
  });

  const load = useCallback(async (silent = false) => {
    // ── PERF PROBE ──────────────────────────────────────────────────────────
    console.log(`[WALLET PERF] [5] Repository.load() start — silent=${silent} — t=+${Date.now() - ((global as any).walletNavStartTime || Date.now())}ms`);
    // ────────────────────────────────────────────────────────────────────────

    setState((s) => ({
      ...s,
      status:       silent ? 'refreshing' : 'loading',
      isRefreshing: silent,
      error:        null,
    }));

    try {
      // Parallel fetch for all wallet data
      const [balanceRes, txnsRes, pendingRes, methodsRes] = await Promise.all([
        repo.getBalance(),
        repo.getTransactions(10),
        repo.getPendingPayments(),
        repo.getPaymentMethods(),
      ]);

      // ── PERF PROBE ────────────────────────────────────────────────────────
      console.log(`[WALLET PERF] [6] Promise.all finished — t=+${Date.now() - ((global as any).walletNavStartTime || Date.now())}ms`);
      // ──────────────────────────────────────────────────────────────────────

      if (!balanceRes.success) throw new Error((balanceRes as any).error);
      if (!txnsRes.success)    throw new Error((txnsRes as any).error);
      if (!pendingRes.success) throw new Error((pendingRes as any).error);
      if (!methodsRes.success) throw new Error((methodsRes as any).error);

      const navStart = (global as any).walletNavStartTime || Date.now();
      console.log(`[WALLET PERF] [A] before setWalletData — t=+${Date.now() - navStart}ms`);

      setWalletData({
        balance: balanceRes.data,
        transactions: txnsRes.data,
        pendingPayments: pendingRes.data,
        paymentMethods: methodsRes.data,
      });

      console.log(`[WALLET PERF] [B] after setWalletData — t=+${Date.now() - navStart}ms`);

      setState({
        status:       txnsRes.data.length === 0 ? 'empty' : 'loaded',
        error:        null,
        isRefreshing: false,
      });

      console.log(`[WALLET PERF] [C] after setState — t=+${Date.now() - navStart}ms`);

      // ── PERF PROBE ────────────────────────────────────────────────────────
      console.log(`[WALLET PERF] [7] Zustand updated — t=+${Date.now() - navStart}ms`);
      if ((global as any).walletNavStartTime) {
        try {
          console.timeEnd("Wallet Navigation");
        } catch (e) {}
        (global as any).walletNavStartTime = undefined;
      }
      // ──────────────────────────────────────────────────────────────────────
    } catch (err: unknown) {
      if ((global as any).walletNavStartTime) {
        try {
          console.timeEnd("Wallet Navigation");
        } catch (e) {}
        (global as any).walletNavStartTime = undefined;
      }
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setState({ status: 'error', error: message, isRefreshing: false });
    }
  }, [setWalletData]);

  const refresh = useCallback(() => load(true), [load]);

  const recharge = useCallback(async (method: PaymentMethodType, amount: number) => {
    setState((s) => ({ ...s, isRefreshing: true }));
    try {
      const res = await repo.recharge(method, amount);
      if (res.success) {
        await load(true);
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment simulation failed' };
    } finally {
      setState((s) => ({ ...s, isRefreshing: false }));
    }
  }, [load]);

  const [dailySummary, setDailySummary] = useState<DailyIncomeSummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyIncomeSummary | null>(null);
  const [isLoadingIncome, setIsLoadingIncome] = useState<boolean>(false);

  const fetchIncomeData = useCallback(async (date: Date, isArabic: boolean) => {
    setIsLoadingIncome(true);
    try {
      const dateCopy = new Date(date);
      const day = dateCopy.getDay();
      const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dateCopy.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const [rides, txnsRes] = await Promise.all([
        ordersRepository.getCompletedRidesForRange(monday, sunday),
        repo.getTransactions(100),
      ]);

      const txns = txnsRes.success ? txnsRes.data : [];

      const daily = IncomeAggregationService.aggregateDaily(date, rides, txns);
      const weekly = IncomeAggregationService.aggregateWeekly(date, rides, txns, isArabic);

      setDailySummary(daily);
      setWeeklySummary(weekly);
    } catch (err) {
      console.error('[useWallet] fetchIncomeData error:', err);
    } finally {
      setIsLoadingIncome(false);
    }
  }, []);

  return {
    // State
    status:       state.status,
    error:        state.error,
    isRefreshing: state.isRefreshing,
    // Data (from selectors)
    balance,
    transactions,
    pendingPayments,
    paymentMethods,
    dailySummary,
    weeklySummary,
    isLoadingIncome,
    // Actions
    load,
    refresh,
    recharge,
    fetchIncomeData,
  };
};
