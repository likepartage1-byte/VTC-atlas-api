import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';
import { CurrencyCode } from '../../domain/entities/wallet.types';
import { formatCurrency } from '../utils/CurrencyFormatter';

interface PendingCardProps {
  amount: number;
  currency: CurrencyCode;
  onPress?: () => void;
  label: string;
}

// ─── Sub-Component: BalanceSubtitle ──────────────────────────────────────────
export const BalanceSubtitle = memo(({ amount, currency, label }: PendingCardProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.subtitleText}>
        {label.replace('{{amount}}', formatCurrency(amount, currency))}
      </Text>
      <HelpCircle size={14} color={WalletColors.pending} style={styles.iconMargin} />
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
export const PendingCard = memo(({ amount, currency, onPress, label }: PendingCardProps) => {
  if (amount === 0) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <BalanceSubtitle amount={amount} currency={currency} label={label} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    ...WalletTypography.subBalance,
    color: WalletColors.pending,
  },
  iconMargin: {
    marginLeft: 6,
  },
});
