import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';

interface EmptyWalletProps {
  title: string;
  subtitle: string;
}

export const EmptyWallet = memo(({ title, subtitle }: EmptyWalletProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
        <Wallet size={32} color={colors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...WalletTypography.amount,
    fontSize: 16,
  },
  subtitle: {
    ...WalletTypography.caption,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
