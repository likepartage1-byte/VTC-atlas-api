import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';

interface EmptyWalletProps {
  title: string;
  subtitle: string;
}

export const EmptyWallet = memo(({ title, subtitle }: EmptyWalletProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Wallet size={32} color={WalletColors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
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
    backgroundColor: WalletColors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...WalletTypography.amount,
    color: WalletColors.textPrimary,
    fontSize: 16,
  },
  subtitle: {
    ...WalletTypography.caption,
    color: WalletColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
