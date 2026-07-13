import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletSpacing } from '../theme/WalletSpacing';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

interface BalanceCardProps {
  amount: number;
  currency: CurrencyCode;
}

export const BalanceCard = memo(({ amount, currency }: BalanceCardProps) => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('balance')}
      </Text>
      <Text style={[styles.amountText, { color: colors.textPrimary }]}>
        {formatCurrency(amount, currency)}
      </Text>
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
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountText: {
    ...WalletTypography.balance,
  },
});
