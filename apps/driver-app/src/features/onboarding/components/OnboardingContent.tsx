import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColorsType } from '../../../theme/ThemeContext';

interface Props {
  title: string;
  description: string;
  colors: ThemeColorsType;
}

/**
 * OnboardingContent
 *
 * Typography hierarchy:
 *   - Title: large, heavy weight, tight letter-spacing — maximum visual impact
 *   - Description: smaller, soft secondary color, generous line-height for comfort
 *
 * React Native wraps text automatically — no manual line breaks needed.
 */
export const OnboardingContent = ({ title, description, colors }: Props) => {
  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: colors.textPrimary }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {title}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 8,
  },
});
