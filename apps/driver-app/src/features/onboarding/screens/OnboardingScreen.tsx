import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { RootStackParamList } from '../../../../App';
import { OnboardingHeader } from '../components/OnboardingHeader';
import { DriverWelcomeIllustration } from '../components/DriverWelcomeIllustration';
import { OnboardingContent } from '../components/OnboardingContent';
import { OnboardingIndicator } from '../components/OnboardingIndicator';
import { OnboardingFooter } from '../components/OnboardingFooter';
import { ONBOARDING_TOTAL_PAGES, ONBOARDING_CURRENT_PAGE } from '../constants';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
};

/**
 * OnboardingScreen — Page 1
 *
 * Layout is built entirely on proportional flex zones so it adapts
 * naturally to every screen size without a single fixed margin.
 *
 * Zone proportions (total = 10):
 *   Logo        → flex 1   (~10%)
 *   Illustration → flex 4.5 (~45%)
 *   Text        → flex 1.5 (~15%)
 *   Indicator   → flex 0.5 (~5%)
 *   Footer      → flex 2.5 (~25%)
 */
export const OnboardingScreen = ({ navigation }: Props) => {
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const handleContinue = () => {
    // When Page 2 is ready, replace this single line with:
    //   navigation.navigate('OnboardingPage2');
    navigation.replace('PhoneAuth');
  };

  const handleSkip = () => {
    navigation.replace('PhoneAuth');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* ── Zone 1: Logo ─────────────────────────────── ~10% */}
      <View style={styles.logoZone}>
        <OnboardingHeader />
      </View>

      {/* ── Zone 2: Hero Illustration ────────────────── ~45% */}
      <View style={styles.illustrationZone}>
        <DriverWelcomeIllustration colors={colors} />
      </View>

      {/* ── Zone 3: Text Content ─────────────────────── ~15% */}
      <View style={styles.textZone}>
        <OnboardingContent
          title={t('onboarding_title')}
          description={t('onboarding_description')}
          colors={colors}
        />
      </View>

      {/* ── Zone 4: Page Indicator ───────────────────── ~5% */}
      <View style={styles.indicatorZone}>
        <OnboardingIndicator
          currentPage={ONBOARDING_CURRENT_PAGE}
          totalPages={ONBOARDING_TOTAL_PAGES}
          colors={colors}
        />
      </View>

      {/* ── Zone 5: Action Buttons ───────────────────── ~25% */}
      <View style={styles.footerZone}>
        <OnboardingFooter
          continueLabel={t('onboarding_continue')}
          skipLabel={t('onboarding_skip')}
          onContinue={handleContinue}
          onSkip={handleSkip}
          colors={colors}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  logoZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationZone: {
    flex: 4.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textZone: {
    flex: 1.5,
    justifyContent: 'center',
  },
  indicatorZone: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerZone: {
    flex: 2.5,
    justifyContent: 'flex-end',
  },
});
