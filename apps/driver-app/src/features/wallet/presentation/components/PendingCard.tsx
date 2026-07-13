import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';
import { CurrencyCode } from '../../domain/entities/wallet.types';
import { formatCurrency } from '../utils/CurrencyFormatter';

interface PendingCardProps {
  amount: number;
  currency: CurrencyCode;
  onPress?: () => void;
  label: string;
}

export const PendingCard = memo(({ amount, currency, onPress, label }: PendingCardProps) => {
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);

  if (amount === 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: isDarkModeColor(colors.bg) ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
          borderColor: 'rgba(245, 158, 11, 0.15)' 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.row}>
        <Text style={[styles.subtitleText, { color: wColors.pending }]}>
          {label.replace('{{amount}}', formatCurrency(amount, currency))}
        </Text>
        <HelpCircle size={14} color={wColors.pending} style={styles.iconMargin} />
      </View>
    </TouchableOpacity>
  );
});

// Simple color helper to detect dark mode context inside components
const isDarkModeColor = (bgColor: string) => {
  return bgColor === '#0A0F1E';
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    ...WalletTypography.subBalance,
  },
  iconMargin: {
    marginLeft: 6,
  },
});
