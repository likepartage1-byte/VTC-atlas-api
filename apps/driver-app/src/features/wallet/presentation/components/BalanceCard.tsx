import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

interface BalanceCardProps {
  amount: number;
  currency: CurrencyCode;
  lastUpdated?: string;
}

export const BalanceCard = memo(({ amount, currency, lastUpdated }: BalanceCardProps) => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(8);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [amount, fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('balance')}
      </Text>
      <Text style={[styles.amountText, { color: colors.textPrimary }]}>
        {formatCurrency(amount, currency)}
      </Text>
      {lastUpdated && (
        <Text style={[styles.updatedText, { color: colors.textMuted }]}>
          {lastUpdated}
        </Text>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    ...WalletTypography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
  },
  amountText: {
    ...WalletTypography.balance,
  },
  updatedText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
});
