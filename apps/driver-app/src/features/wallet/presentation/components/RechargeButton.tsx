import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';

interface RechargeButtonProps {
  label: string;
  onPress: () => void;
}

export const RechargeButton = memo(({ label, onPress }: RechargeButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: colors.white }]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 0,
  },
  text: {
    ...WalletTypography.amount,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
