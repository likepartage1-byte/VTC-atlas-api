import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ArrowDownLeft, Percent, Wallet } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { Transaction } from '../../domain/entities/wallet.types';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';

interface TransactionItemProps {
  transaction: Transaction;
  statusLabel: string;
}

export const TransactionItem = memo(({ transaction, statusLabel }: TransactionItemProps) => {
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);

  const isCredit = transaction.amount > 0;
  
  // Icon and Color decisions
  const renderIcon = () => {
    const iconSize = 16;
    const color = colors.textSecondary;
    switch (transaction.type) {
      case 'vat':
        return <Percent size={iconSize} color={color} />;
      case 'recharge':
        return <Wallet size={iconSize} color={color} />;
      default:
        return <ArrowDownLeft size={iconSize} color={color} />;
    }
  };

  const amountColor = isCredit ? wColors.credit : colors.textPrimary;
  const prefix = isCredit ? '+' : '';

  const timeString = transaction.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, { borderBottomColor: wColors.separator }]}>
      <View style={styles.leftRow}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
          {renderIcon()}
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{transaction.label}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {transaction.status === 'pending' ? statusLabel : transaction.description}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}{formatCurrency(transaction.amount, transaction.currency)}
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
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    justifyContent: 'center',
  },
  label: {
    ...WalletTypography.amount,
    fontSize: 14,
  },
  sub: {
    ...WalletTypography.caption,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    ...WalletTypography.amount,
    fontSize: 15,
  },
  time: {
    ...WalletTypography.caption,
    marginTop: 2,
  },
});
