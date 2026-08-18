import React from 'react';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { RootStackParamList } from '../../../../App';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { DriverEarningsIllustration } from '../components/DriverEarningsIllustration';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingPage3'>;
};

export const OnboardingPage3Screen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleContinue = () => {
    navigation.replace('PhoneAuth');
  };

  const handleSkip = () => {
    navigation.replace('PhoneAuth');
  };

  return (
    <OnboardingLayout
      illustration={<DriverEarningsIllustration colors={colors} />}
      title={t('onboarding_title3')}
      description={t('onboarding_desc3')}
      currentPageIndex={2}
      totalPagesCount={3}
      continueLabel={t('onboarding_start_reg')}
      skipLabel={t('onboarding_skip')}
      onContinue={handleContinue}
      onSkip={handleSkip}
    />
  );
};
