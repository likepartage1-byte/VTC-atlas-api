import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Check, X } from 'lucide-react-native';
import { AtlasLightColors } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const LanguageSelectorModal = ({ visible, onClose }: Props) => {
  const { i18n, t } = useTranslation();
  const colors = AtlasLightColors;
  const currentLang = i18n.language || 'ar';
  const isRTL = I18nManager.isRTL;

  const handleSelectLanguage = async (langCode: string) => {
    onClose();
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);

    const nextIsRTL = langCode === 'ar';
    if (I18nManager.isRTL !== nextIsRTL) {
      I18nManager.allowRTL(nextIsRTL);
      I18nManager.forceRTL(nextIsRTL);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: '#FFFFFF' }]}>
              {/* Header */}
              <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Globe size={22} color={colors.primary} />
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {t('language', 'اللغات / Preferred Language')}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Language Options List */}
              <View style={styles.optionsList}>
                {LANGUAGES.map((lang) => {
                  const isSelected = currentLang.startsWith(lang.code);
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => handleSelectLanguage(lang.code)}
                      style={[
                        styles.langItem,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          borderColor: isSelected
                            ? colors.primary
                            : 'rgba(15, 23, 42, 0.08)',
                          backgroundColor: isSelected
                            ? 'rgba(41, 233, 246, 0.08)'
                            : '#F8FAFC',
                        },
                      ]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.langLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={styles.flag}>{lang.flag}</Text>
                        <Text
                          style={[
                            styles.langLabel,
                            {
                              color: isSelected
                                ? colors.primary
                                : colors.textPrimary,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {lang.label}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={styles.uncheckCircle} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleRow: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 12,
  },
  langItem: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langLeft: {
    alignItems: 'center',
    gap: 14,
  },
  flag: {
    fontSize: 22,
  },
  langLabel: {
    fontSize: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.15)',
  },
});
