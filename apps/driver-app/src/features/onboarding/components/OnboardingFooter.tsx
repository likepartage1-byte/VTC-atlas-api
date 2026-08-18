import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomButton } from '../../../components/CustomButton';
import { ThemeColorsType } from '../../../theme/ThemeContext';

interface Props {
  continueLabel: string;
  skipLabel: string;
  onContinue: () => void;
  onSkip: () => void;
  colors: ThemeColorsType;
}

/**
 * OnboardingFooter
 *
 * Two-action footer:
 *   Continue → primary full-width button (clear call-to-action)
 *   Skip     → plain text only, no border / background / underline
 *              kept intentionally quiet so visual focus stays on Continue
 */
export const OnboardingFooter = ({
  continueLabel,
  skipLabel,
  onContinue,
  onSkip,
  colors,
}: Props) => {
  return (
    <View style={styles.container}>
      {/* Primary action */}
      <CustomButton
        title={continueLabel}
        onPress={onContinue}
        style={styles.continueButton}
      />

      {/* Secondary action — text only, intentionally understated */}
      <TouchableOpacity
        onPress={onSkip}
        style={styles.skipTouchable}
        activeOpacity={0.5}
        accessibilityRole="button"
        accessibilityLabel={skipLabel}
      >
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>
          {skipLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  continueButton: {
    // CustomButton already provides height:56, borderRadius:16, elevation, and shadow.
    // We only need to set width here.
    width: '100%',
    marginBottom: 4,
  },
  skipTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    // Generous touch target height without visual height
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    // No underline, no border, no background — purely understated
  },
});
