import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LaserLogo } from '../../../components/LaserLogo';
import { ONBOARDING_LOGO_FONT_SIZE, ONBOARDING_LOGO_HEIGHT } from '../constants';

/**
 * OnboardingHeader
 *
 * Renders the centered Yalla VTC logo at a fixed, consistent height
 * so it never shifts or resizes between onboarding pages.
 * Logo size is controlled via constants.ts — never set directly here.
 */
export const OnboardingHeader = () => {
  return (
    <View style={[styles.container, { height: ONBOARDING_LOGO_HEIGHT }]}>
      <LaserLogo fontSize={ONBOARDING_LOGO_FONT_SIZE} showTagline={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
