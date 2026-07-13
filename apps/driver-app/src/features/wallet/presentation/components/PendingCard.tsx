import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';
import { CurrencyCode } from '../../domain/entities/wallet.types';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { useTranslation } from 'react-i18next';

interface PendingCardProps {
  amount: number;
  currency: CurrencyCode;
  onPress?: () => void;
  label: string;
}

export const PendingCard = memo(({ amount, currency, onPress, label }: PendingCardProps) => {
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  if (amount === 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: colors.bg === '#0A0F1E' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          shadowColor: '#000',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
          <AlertTriangle size={18} color="#F59E0B" />
        </View>

        <View style={styles.textWrapper}>
          <Text style={[styles.amountText, { color: colors.textPrimary }]}>
            {formatCurrency(amount, currency)}
          </Text>
          <Text style={[styles.descText, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </View>

        {onPress && (
          <View style={styles.chevronWrapper}>
            {isRTL ? (
              <ChevronLeft size={18} color={wColors.pending} />
            ) : (
              <ChevronRight size={18} color={wColors.pending} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
    textAlign: 'left',
  },
  amountText: {
    ...WalletTypography.amount,
    fontSize: 16,
    fontWeight: '700',
  },
  descText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chevronWrapper: {
    paddingLeft: 8,
  },
});
