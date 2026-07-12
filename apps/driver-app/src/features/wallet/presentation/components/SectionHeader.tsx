import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader = memo(({ title }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  text: {
    ...WalletTypography.label,
    color: WalletColors.textSecondary,
  },
});
