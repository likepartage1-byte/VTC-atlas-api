import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';
import { CurrencyCode } from '../../domain/entities/wallet.types';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { useTranslation } from 'react-i18next';

// Icon size unified to 20px
const ICON_SIZE = 20;

interface PendingCardProps {
  amount: number;
  currency: CurrencyCode;
  onPress?: () => void;
}

export const PendingCard = memo(({ amount, currency, onPress }: PendingCardProps) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('wallet');
  const isRTL = i18n.language === 'ar';

  if (amount <= 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.warning,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceAlt }]}>
          <AlertTriangle size={ICON_SIZE} color={colors.warning} />
        </View>

        {/* Text */}
        <View style={styles.textWrapper}>
          <Text style={[styles.amountLabel, { color: colors.textPrimary }]}>
            {formatCurrency(amount, currency)}
          </Text>
          <Text style={[styles.descLabel, { color: colors.textSecondary }]}>
            {t('pending_desc')}
          </Text>
        </View>

        {/* Chevron */}
        {onPress ? (
          isRTL
            ? <ChevronLeft size={ICON_SIZE} color={colors.textMuted} />
            : <ChevronRight size={ICON_SIZE} color={colors.textMuted} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  amountLabel: {
    ...WalletTypography.amount,
    fontSize: 15,
    fontWeight: '700',
  },
  descLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
