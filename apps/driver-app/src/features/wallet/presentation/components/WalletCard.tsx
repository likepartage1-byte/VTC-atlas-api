import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';

interface WalletCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outline' | 'flat';
  interactive?: boolean;
}

export const WalletCard = memo(({
  children,
  style,
  onPress,
  variant = 'outline',
  interactive = false,
}: WalletCardProps) => {
  const { colors } = useTheme();

  const cardStyles = [
    styles.card,
    variant === 'outline' && { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
    variant === 'elevated' && {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    variant === 'flat' && { backgroundColor: colors.surfaceAlt },
    style,
  ];

  if (onPress || interactive) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.75}
        disabled={!onPress}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
});
