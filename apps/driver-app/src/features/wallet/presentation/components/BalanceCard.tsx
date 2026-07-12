import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletSpacing } from '../theme/WalletSpacing';
import { WalletTypography } from '../theme/WalletTypography';
import { WalletShadows } from '../theme/WalletShadows';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

interface BalanceCardProps {
  amount: number;
  currency: CurrencyCode;
}

// ─── Sub-Component: BalanceAmount ────────────────────────────────────────────
export const BalanceAmount = memo(({ amount, currency }: BalanceCardProps) => {
  return (
    <Text style={styles.amountText}>
      {formatCurrency(amount, currency)}
    </Text>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
export const BalanceCard = memo(({ amount, currency }: BalanceCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Solde</Text>
      
      {/* Dynamic Amount Rendering */}
      <BalanceAmount amount={amount} currency={currency} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: WalletSpacing.gap * 2,
    marginBottom: WalletSpacing.gap,
  },
  label: {
    ...WalletTypography.caption,
    color: WalletColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountText: {
    ...WalletTypography.balance,
    color: WalletColors.balanceText,
  },
});
