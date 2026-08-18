import React from 'react';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { RootStackParamList } from '../../../../App';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { DriverWelcomeIllustration } from '../components/DriverWelcomeIllustration';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingPage1'>;
};

export const OnboardingPage1Screen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleContinue = () => {
    navigation.navigate('OnboardingPage2');
  };

  const handleSkip = () => {
    navigation.replace('PhoneAuth');
  };

  return (
    <OnboardingLayout
      illustration={<DriverWelcomeIllustration colors={colors} />}
      title={t('onboarding_title1')}
      description={t('onboarding_desc1')}
      currentPageIndex={0}
      totalPagesCount={3}
      continueLabel={t('onboarding_continue')}
      skipLabel={t('onboarding_skip')}
      onContinue={handleContinue}
      onSkip={handleSkip}
    />
  );
};
