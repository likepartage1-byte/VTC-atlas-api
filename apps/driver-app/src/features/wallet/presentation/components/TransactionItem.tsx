import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Clock, CheckCircle2, XCircle, ArrowDownLeft, Percent, Wallet } from 'lucide-react-native';
import { Transaction } from '../../domain/entities/wallet.types';
import { WalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';

interface TransactionItemProps {
  transaction: Transaction;
  statusLabel: string;
}

export const TransactionItem = memo(({ transaction, statusLabel }: TransactionItemProps) => {
  const isCredit = transaction.amount > 0;
  
  // Icon and Color decisions
  const renderIcon = () => {
    const iconSize = 16;
    const color = WalletColors.textSecondary;
    switch (transaction.type) {
      case 'vat':
        return <Percent size={iconSize} color={color} />;
      case 'recharge':
        return <Wallet size={iconSize} color={color} />;
      default:
        return <ArrowDownLeft size={iconSize} color={color} />;
    }
  };

  const amountColor = isCredit ? WalletColors.credit : WalletColors.balanceText;
  const prefix = isCredit ? '+' : '';

  const timeString = transaction.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          {renderIcon()}
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>{transaction.label}</Text>
          <Text style={styles.sub}>{transaction.status === 'pending' ? statusLabel : transaction.description}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}{formatCurrency(transaction.amount, transaction.currency)}
        </Text>
        <Text style={styles.time}>{timeString}</Text>
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
    borderBottomColor: WalletColors.separator,
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
    backgroundColor: WalletColors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    justifyContent: 'center',
  },
  label: {
    ...WalletTypography.amount,
    color: WalletColors.textPrimary,
    fontSize: 14,
  },
  sub: {
    ...WalletTypography.caption,
    color: WalletColors.textSecondary,
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
    color: WalletColors.textMuted,
    marginTop: 2,
  },
});
