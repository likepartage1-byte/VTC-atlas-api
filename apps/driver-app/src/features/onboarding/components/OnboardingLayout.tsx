import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react-native';
import { AtlasLightColors } from '../../../theme/ThemeContext';
import { LaserLogo } from '../../../components/LaserLogo';
import { LanguageSelectorModal } from '../../../components/LanguageSelectorModal';
import { OnboardingContent } from './OnboardingContent';
import { OnboardingIndicator } from './OnboardingIndicator';
import { OnboardingFooter } from './OnboardingFooter';

interface Props {
  illustration: React.ReactNode;
  title: string;
  description: string;
  currentPageIndex: number;
  totalPagesCount: number;
  continueLabel: string;
  skipLabel: string;
  onContinue: () => void;
  onSkip: () => void;
}

export const OnboardingLayout = ({
  illustration,
  title,
  description,
  currentPageIndex,
  totalPagesCount,
  continueLabel,
  skipLabel,
  onContinue,
  onSkip,
}: Props) => {
  const colors = AtlasLightColors;
  const { i18n } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const currentLang = (i18n.language || 'ar').substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {/* Zone 1: Logo Badge area (15%) + Language Switcher */}
      <View style={styles.logoZone}>
        <View style={styles.logoCard}>
          <LaserLogo fontSize={18} showTagline={false} />
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.8}
        >
          <Globe size={18} color={colors.textPrimary} />
          <Text style={[styles.langText, { color: colors.textPrimary }]}>
            {currentLang}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zone 2: Illustration hero (40%) */}
      <View style={styles.illustrationZone}>
        {illustration}
      </View>

      {/* Zone 3: Text Content (18%) */}
      <View style={styles.textZone}>
        <OnboardingContent
          title={title}
          description={description}
          colors={colors}
        />
      </View>

      {/* Zone 4: Progress Indicator dots (7%) */}
      <View style={styles.indicatorZone}>
        <OnboardingIndicator
          currentPage={currentPageIndex}
          totalPages={totalPagesCount}
          colors={colors}
        />
      </View>

      {/* Zone 5: Actions (20%) */}
      <View style={styles.footerZone}>
        <OnboardingFooter
          continueLabel={continueLabel}
          skipLabel={skipLabel}
          onContinue={onContinue}
          onSkip={onSkip}
          colors={colors}
        />
      </View>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  logoZone: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  logoCard: {
    backgroundColor: '#0F172A', // Dark Slate Card
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 4,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // Cozy soft shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  langBtn: {
    position: 'absolute',
    right: 20,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  langText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  illustrationZone: {
    flex: 4.0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textZone: {
    flex: 1.8,
    justifyContent: 'center',
  },
  indicatorZone: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerZone: {
    flex: 2.0,
    justifyContent: 'flex-end',
  },
});
