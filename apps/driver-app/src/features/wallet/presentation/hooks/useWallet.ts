import { useState, useCallback } from 'react';
import { WalletMockRepository } from '../../data/repository/WalletMockRepository';
import { useWalletStore } from '../store/useWalletStore';

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
  const setBalance = useWalletStore((s) => s.setBalance);
  const setTransactions = useWalletStore((s) => s.setTransactions);
  const setPendingPayments = useWalletStore((s) => s.setPendingPayments);
  const setPaymentMethods = useWalletStore((s) => s.setPaymentMethods);

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

      if (!balanceRes.success) throw new Error(balanceRes.error);
      if (!txnsRes.success)    throw new Error(txnsRes.error);
      if (!pendingRes.success) throw new Error(pendingRes.error);
      if (!methodsRes.success) throw new Error(methodsRes.error);

      setBalance(balanceRes.data);
      setTransactions(txnsRes.data);
      setPendingPayments(pendingRes.data);
      setPaymentMethods(methodsRes.data);

      setState({
        status:       txnsRes.data.length === 0 ? 'empty' : 'loaded',
        error:        null,
        isRefreshing: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setState({ status: 'error', error: message, isRefreshing: false });
    }
  }, [setBalance, setTransactions, setPendingPayments, setPaymentMethods]);

  const refresh = useCallback(() => load(true), [load]);

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
    // Actions
    load,
    refresh,
  };
};
