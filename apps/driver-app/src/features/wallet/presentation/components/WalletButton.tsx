import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';

interface WalletButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ComponentType<{ size: number; color: string }>;
}

export const WalletButton = memo(({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon: IconComponent,
}: WalletButtonProps) => {
  const { colors } = useTheme();

  // Compute theme colors dynamically
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surfaceAlt,
          text: colors.textPrimary,
          border: colors.border,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.primary,
          border: colors.primary,
        };
      case 'danger':
        return {
          bg: colors.offline,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  const currentColors = getColors();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentColors.text} />
      ) : (
        <>
          {IconComponent && <IconComponent size={18} color={currentColors.text} />}
          <Text style={[styles.text, { color: currentColors.text }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    width: '100%',
  },
  text: {
    ...WalletTypography.amount,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
