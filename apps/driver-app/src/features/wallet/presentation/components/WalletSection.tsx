import React, { memo } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';

interface WalletSectionProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const WalletSection = memo(({
  title,
  children,
  style,
}: WalletSectionProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
});
