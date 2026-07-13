import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';

interface WalletEmptyProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}

export const WalletEmpty = memo(({
  title,
  subtitle,
  icon: IconComponent = Inbox,
}: WalletEmptyProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
        <IconComponent size={28} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...WalletTypography.amount,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    ...WalletTypography.caption,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
