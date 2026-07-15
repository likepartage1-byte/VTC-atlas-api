import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';
import { WalletAnimations } from '../theme/WalletAnimations';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

interface BalanceCardProps {
  amount: number;
  currency: CurrencyCode;
  lastUpdated?: string;
  pendingAmount?: number;
}

export const BalanceCard = memo(({ amount, currency, lastUpdated, pendingAmount }: BalanceCardProps) => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 12;
    opacity.value = withTiming(1, { duration: WalletAnimations.timing.duration });
    translateY.value = withSpring(0, WalletAnimations.spring);
  }, [amount, pendingAmount]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.textPrimary,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('balance')}
      </Text>
      <Text style={[styles.amountText, { color: colors.textPrimary }]}>
        {formatCurrency(amount, currency)}
      </Text>
      {lastUpdated ? (
        <Text style={[styles.updatedText, { color: colors.textMuted }]}>
          {lastUpdated}
        </Text>
      ) : null}

      {/* 🟠 Pending authorization request banner */}
      {pendingAmount && pendingAmount > 0 ? (
        <View style={styles.pendingContainer}>
          <View style={styles.badgeRow}>
            <View style={[styles.orangeDot, { backgroundColor: '#EA580C' }]} />
            <Text style={[styles.pendingText, { color: '#92400E' }]}>
              {formatCurrency(pendingAmount, currency)} {t('pending_validation')}
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
    width: '100%',
  },
  label: {
    ...WalletTypography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 8,
  },
  amountText: {
    ...WalletTypography.balance,
  },
  updatedText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 10,
  },
  pendingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
