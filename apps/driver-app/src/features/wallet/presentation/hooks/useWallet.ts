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
  const store = useWalletStore();

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

      store.setBalance(balanceRes.data);
      store.setTransactions(txnsRes.data);
      store.setPendingPayments(pendingRes.data);
      store.setPaymentMethods(methodsRes.data);

      setState({
        status:       txnsRes.data.length === 0 ? 'empty' : 'loaded',
        error:        null,
        isRefreshing: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setState({ status: 'error', error: message, isRefreshing: false });
    }
  }, [store]);

  const refresh = useCallback(() => load(true), [load]);

  return {
    // State
    status:       state.status,
    error:        state.error,
    isRefreshing: state.isRefreshing,
    // Data (from store)
    balance:         store.balance,
    transactions:    store.transactions,
    pendingPayments: store.pendingPayments,
    paymentMethods:  store.paymentMethods,
    // Actions
    load,
    refresh,
  };
};
