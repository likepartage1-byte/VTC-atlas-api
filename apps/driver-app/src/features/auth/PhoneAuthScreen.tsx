import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  I18nManager,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Phone, Globe, ChevronDown, Check, UserPlus } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { authService } from '../../services/auth.service';

type PhoneAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneAuth'>;
interface Props { navigation: PhoneAuthScreenNavigationProp; }

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#FFFFFF',
  primary:     '#683EE6',
  primaryLight:'#F3F0FF',
  primaryMid:  '#EDE9FF',
  text:        '#111827',
  textSub:     '#6B7280',
  border:      '#E5E7EB',
  inputBg:     '#FAFAFA',
  success:     '#10B981',
  error:       '#EF4444',
  white:       '#FFFFFF',
};

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const TRANSLATIONS: Record<string, Record<'ar' | 'fr' | 'en' | 'es', string>> = {
  welcome: {
    ar: 'مرحباً بك في Yalla VTC',
    fr: 'Bienvenue sur Yalla VTC',
    en: 'Welcome to Yalla VTC',
    es: 'Bienvenido a Yalla VTC',
  },
  tagline: {
    ar: 'تنقّل بسهولة وأمان في مراكش',
    fr: 'Déplacez-vous facilement et en sécurité à Marrakech',
    en: 'Travel easily and safely in Marrakech',
    es: 'Viaja fácil y seguro en Marrakech',
  },
  phoneLabel: {
    ar: 'رقم الهاتف',
    fr: 'Numéro de téléphone',
    en: 'Phone Number',
    es: 'Número de teléfono',
  },
  phonePlaceholder: {
    ar: '6XX XX XX XX',
    fr: '6XX XX XX XX',
    en: '6XX XX XX XX',
    es: '6XX XX XX XX',
  },
  continueBtn: {
    ar: 'متابعة',
    fr: 'Continuer',
    en: 'Continue',
    es: 'Continuar',
  },
  loadingBtn: {
    ar: 'جاري الإرسال...',
    fr: 'Envoi en cours...',
    en: 'Sending...',
    es: 'Enviando...',
  },
  newToApp: {
    ar: 'ليس لديك حساب؟',
    fr: 'Pas encore de compte ?',
    en: "Don't have an account?",
    es: '¿No tienes cuenta?',
  },
  createAccountLink: {
    ar: 'إنشاء حساب جديد',
    fr: 'Créer un compte',
    en: 'Create Account',
    es: 'Crear cuenta',
  },
  alertTitle: {
    ar: 'تنبيه',
    fr: 'Numéro requis',
    en: 'Phone Required',
    es: 'Teléfono requerido',
  },
  alertPhoneMsg: {
    ar: 'يرجى إدخال رقم هاتف صحيح مكوّن من 9 أرقام على الأقل.',
    fr: 'Veuillez saisir un numéro de téléphone valide à 9 chiffres minimum.',
    en: 'Please enter a valid phone number with at least 9 digits.',
    es: 'Por favor ingrese un número de teléfono válido de al menos 9 dígitos.',
  },
  langModalTitle: {
    ar: 'اختر اللغة',
    fr: 'Choisir la langue',
    en: 'Select Language',
    es: 'Seleccionar idioma',
  },
};

export const PhoneAuthScreen: React.FC<Props> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'ar').toLowerCase().substring(0, 2);
  const activeLang: 'ar' | 'fr' | 'en' | 'es' =
    rawLang === 'fr' || rawLang === 'en' || rawLang === 'es' ? rawLang : 'ar';
  const isRTL = activeLang === 'ar';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getT = (key: string): string =>
    TRANSLATIONS[key]?.[activeLang] || TRANSLATIONS[key]?.['ar'] || '';

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);
    const shouldBeRTL = langCode === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
    setShowLangModal(false);
  };

  const validatePhone = (): boolean => {
    const cleanNumber = phoneNumber.trim();
    if (!cleanNumber || cleanNumber.length < 9) {
      Alert.alert(getT('alertTitle'), getT('alertPhoneMsg'));
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validatePhone()) return;
    const cleanNumber = phoneNumber.trim().replace(/^0+/, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+212${cleanNumber}`;
    setIsLoading(true);
    try {
      await authService.requestOtp(formattedPhone);
    } catch (_) {}
    finally {
      setIsLoading(false);
      navigation.navigate('OTPVerify', { phoneNumber: formattedPhone, isRegistration: false });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Language Picker — top right */}
      <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setShowLangModal(true)}
          activeOpacity={0.75}
        >
          <Globe size={15} color={C.primary} />
          <Text style={styles.langBtnText}>
            {LANGUAGES.find(l => l.code === activeLang)?.flag} {activeLang.toUpperCase()}
          </Text>
          <ChevronDown size={13} color={C.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>Y</Text>
          </View>
          <Text style={styles.logoWordmark}>Yalla VTC</Text>
          <Text style={styles.logoTagline}>{getT('tagline')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={[styles.welcome, { textAlign: isRTL ? 'right' : 'left' }]}>
            {getT('welcome')}
          </Text>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('phoneLabel')}
            </Text>
            <View style={[
              styles.phoneRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              isFocused && styles.phoneRowFocused,
            ]}>
              {/* Country badge */}
              <View style={[styles.countryBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.flag}>🇲🇦</Text>
                <Text style={styles.countryCode}>+212</Text>
              </View>
              <View style={styles.divider} />
              <Phone size={16} color={isFocused ? C.primary : C.textSub} style={{ marginHorizontal: 6 }} />
              <TextInput
                style={[styles.textInput, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={getT('phonePlaceholder')}
                placeholderTextColor={C.textSub}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={12}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.primaryBtnLoading]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={C.white} size="small" />
              : <Text style={styles.primaryBtnText}>{getT('continueBtn')}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{getT('newToApp')}</Text>
          <TouchableOpacity
            style={styles.footerLinkBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.75}
          >
            <UserPlus size={15} color={C.primary} />
            <Text style={styles.footerLink}>{getT('createAccountLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={styles.langModalCard}>
            <Text style={styles.langModalTitle}>{getT('langModalTitle')}</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, lang.code === activeLang && styles.langOptionActive]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.75}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, lang.code === activeLang && styles.langLabelActive]}>
                  {lang.label}
                </Text>
                {lang.code === activeLang && <Check size={16} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D0FA',
  },
  langBtnText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  logoArea: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -1,
  },
  logoWordmark: {
    fontSize: 26,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 14,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  phoneRowFocused: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flag: { fontSize: 18 },
  countryCode: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: C.border,
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnLoading: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 10,
  },
  footerText: {
    color: C.textSub,
    fontSize: 14,
  },
  footerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D8D0FA',
  },
  footerLink: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  /* Language Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  langModalCard: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 8,
  },
  langModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langOptionActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  langFlag: { fontSize: 20 },
  langLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  langLabelActive: {
    color: C.primary,
    fontWeight: '800',
  },
});
