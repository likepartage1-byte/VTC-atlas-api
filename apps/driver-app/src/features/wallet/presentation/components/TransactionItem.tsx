import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ArrowDownLeft, Percent, Wallet, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { Transaction } from '../../domain/entities/wallet.types';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';

// Unified icon size — no mixing 18/20/24
const ICON_SIZE = 20;

interface TransactionItemProps {
  transaction: Transaction;
  statusLabel: string;
}

export const TransactionItem = memo(({ transaction, statusLabel }: TransactionItemProps) => {
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);

  const isCredit = transaction.amount > 0;

  const renderIcon = () => {
    switch (transaction.type) {
      case 'vat':
        return <Percent size={ICON_SIZE} color={colors.textSecondary} />;
      case 'recharge':
        return <ArrowUpRight size={ICON_SIZE} color={wColors.credit} />;
      default:
        return <ArrowDownLeft size={ICON_SIZE} color={colors.textSecondary} />;
    }
  };

  const amountColor = isCredit ? wColors.credit : colors.textPrimary;
  const prefix = isCredit ? '+' : '';
  const timeString = new Date(transaction.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, { borderBottomColor: wColors.separator }]}>
      <View style={styles.leftRow}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
          {renderIcon()}
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            {transaction.label}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {transaction.status === 'pending' ? statusLabel : transaction.description}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>{timeString}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...WalletTypography.amount,
    fontSize: 14,
  },
  sub: {
    ...WalletTypography.caption,
    marginTop: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...WalletTypography.amount,
    fontSize: 15,
  },
  time: {
    ...WalletTypography.caption,
  },
});
