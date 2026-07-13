import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader = memo(({ title }: SectionHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{title}</Text>
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
  },
});
