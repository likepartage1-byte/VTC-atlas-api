import React from 'react';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { RootStackParamList } from '../../../../App';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { DriverSafetyIllustration } from '../components/DriverSafetyIllustration';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingPage2'>;
};

export const OnboardingPage2Screen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleContinue = () => {
    navigation.navigate('OnboardingPage3');
  };

  const handleSkip = () => {
    navigation.replace('PhoneAuth');
  };

  return (
    <OnboardingLayout
      illustration={<DriverSafetyIllustration colors={colors} />}
      title={t('onboarding_title2')}
      description={t('onboarding_desc2')}
      currentPageIndex={1}
      totalPagesCount={3}
      continueLabel={t('onboarding_continue')}
      skipLabel={t('onboarding_skip')}
      onContinue={handleContinue}
      onSkip={handleSkip}
    />
  );
};
