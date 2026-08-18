import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColorsType } from '../../../theme/ThemeContext';

interface Props {
  currentPage: number;
  totalPages: number;
  colors: ThemeColorsType;
}

/**
 * OnboardingIndicator
 *
 * Minimal, clean page-position dots.
 *   Active dot  → wide pill shape in brand primary color
 *   Inactive dot → small circle in muted/border color
 *
 * No animations yet — those will be added once all pages are ready.
 */
export const OnboardingIndicator = ({ currentPage, totalPages, colors }: Props) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalPages }).map((_, index) => {
        const isActive = index === currentPage;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive
                ? [styles.dotActive, { backgroundColor: colors.primary }]
                : [styles.dotInactive, { backgroundColor: colors.textMuted }],
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    opacity: 1,
  },
  dotInactive: {
    width: 8,
    opacity: 0.4,
  },
});
