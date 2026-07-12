import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletSpacing } from '../theme/WalletSpacing';
import { WalletTypography } from '../theme/WalletTypography';

interface RechargeButtonProps {
  label: string;
  onPress: () => void;
}

export const RechargeButton = memo(({ label, onPress }: RechargeButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#32FF7E', // Beautiful Lime/Neon Green like inDrive
    height: 48,
    borderRadius: 24, // Rounded pill layout
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center',
    shadowColor: '#32FF7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 32,
  },
  text: {
    ...WalletTypography.amount,
    color: '#000000', // Black text on lime background
    fontWeight: '900',
  },
});
