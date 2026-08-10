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
  Dimensions,
  Alert,
  ImageBackground,
  ActivityIndicator,
  Modal,
  I18nManager,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Phone, ArrowRight, ArrowLeft, Globe, ChevronDown, Check, UserPlus } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { LaserLogo } from '../../components/LaserLogo';
import { authService } from '../../services/auth.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PhoneAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneAuth'>;

interface Props {
  navigation: PhoneAuthScreenNavigationProp;
}

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const TRANSLATIONS: Record<string, Record<'ar' | 'fr' | 'en' | 'es', string>> = {
  logoTagline: {
    ar: 'تسجيل الدخول ومصادقة الحساب',
    fr: 'AUTHENTIFICATION DU COMPTE',
    en: 'ACCOUNT AUTHENTICATION',
    es: 'AUTENTICACIÓN DE LA CUENTA',
  },
  logoSubTagline: {
    ar: 'رحلتك تبدأ هنا',
    fr: 'Votre voyage commence ici',
    en: 'Your journey starts here',
    es: 'Tu viaje comienza aquí',
  },
  mainTitle: {
    ar: 'تسجيل الدخول برقم الهاتف',
    fr: 'Connexion par téléphone',
    en: 'Sign In with Phone',
    es: 'Iniciar sesión con teléfono',
  },
  subTitle: {
    ar: 'يرجى إدخال رقم هاتفك للمتابعة وتلقي رمز التحقق عبر SMS.',
    fr: 'Veuillez saisir votre numéro de téléphone pour recevoir le code de vérification SMS.',
    en: 'Please enter your phone number to receive the SMS verification code.',
    es: 'Por favor ingrese su número de teléfono para recibir el código de verificación SMS.',
  },
  phoneLabel: {
    ar: 'رقم الهاتف',
    fr: 'Numéro de téléphone',
    en: 'Phone Number',
    es: 'Número de teléfono',
  },
  continueBtn: {
    ar: 'متابعة وإرسال الرمز ➔',
    fr: 'Continuer et envoyer ➔',
    en: 'Continue & Send Code ➔',
    es: 'Continuar y enviar código ➔',
  },
  loadingBtn: {
    ar: 'جاري إرسال الرمز...',
    fr: 'Envoi du code...',
    en: 'Sending code...',
    es: 'Enviando código...',
  },
  newToApp: {
    ar: 'ليس لديك حساب على Yalla VTC بعد؟',
    fr: 'Nouveau sur Yalla VTC ?',
    en: 'New to Yalla VTC?',
    es: '¿Nuevo en Yalla VTC?',
  },
  createAccountLink: {
    ar: 'إنشاء حساب جديد الآن ⚡',
    fr: 'Créer un compte maintenant ⚡',
    en: 'Create an account now ⚡',
    es: 'Crear una cuenta ahora ⚡',
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
    ar: '🌐 اختر اللغة',
    fr: '🌐 Choisir la langue',
    en: '🌐 Select Language',
    es: '🌐 Seleccionar idioma',
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

  const getT = (key: string): string => {
    return TRANSLATIONS[key]?.[activeLang] || TRANSLATIONS[key]?.['ar'] || '';
  };

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

  // Validate Phone Number
  const validatePhone = (): boolean => {
    const cleanNumber = phoneNumber.trim();
    if (!cleanNumber || cleanNumber.length < 9) {
      Alert.alert(getT('alertTitle'), getT('alertPhoneMsg'));
      return false;
    }
    return true;
  };

  // Continue Handler
  const handleContinue = async () => {
    if (!validatePhone()) return;

    const cleanNumber = phoneNumber.trim().replace(/^0+/, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+212${cleanNumber}`;

    setIsLoading(true);
    try {
      await authService.requestOtp(formattedPhone);
    } catch (_) {
      // Continue to OTP screen gracefully
    } finally {
      setIsLoading(false);
      navigation.navigate('OTPVerify', { phoneNumber: formattedPhone, isRegistration: false });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Top Header Banner with marrakech_bg.jpg (Identical to RegisterScreen) ── */}
      <View style={styles.topHeaderBannerContainer}>
        <ImageBackground
          source={require('../../assets/marrakech_bg.jpg')}
          style={styles.topHeaderBannerBg}
          resizeMode="cover"
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="headerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#2D2D2D" stopOpacity="0.3" />
                <Stop offset="65%" stopColor="#3A3A3A" stopOpacity="0.55" />
                <Stop offset="100%" stopColor="#404040" stopOpacity="0.85" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#headerGradient)" />
          </Svg>

          <View style={styles.topHeaderContent}>
            {/* Top Bar: Back Button & Language Picker */}
            <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                {isRTL ? <ArrowRight size={20} color="#FFFFFF" /> : <ArrowLeft size={20} color="#FFFFFF" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langPickerBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => setShowLangModal(true)}
                activeOpacity={0.8}
              >
                <Globe size={18} color="#A78BFA" />
                <Text style={styles.langBtnText}>
                  {LANGUAGES.find((l) => l.code === activeLang)?.flag || '🌐'}{' '}
                  {activeLang.toUpperCase()}
                </Text>
                <ChevronDown size={14} color="#A78BFA" />
              </TouchableOpacity>
            </View>

            {/* Lightweight Vector LaserLogo */}
            <View style={styles.logoWrapper}>
              <LaserLogo
                fontSize={32}
                showTagline={true}
                subTaglineText={getT('logoSubTagline')}
                theme="dark"
                variant="hero"
              />
            </View>
          </View>
        </ImageBackground>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Main Glass Form Card ── */}
        <View style={styles.formCard}>
          {/* Title & Subtitle */}
          <View style={styles.headerTextBlock}>
            <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('mainTitle')}
            </Text>
            <Text style={[styles.subTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('subTitle')}
            </Text>
          </View>

          {/* Phone Input Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('phoneLabel')}
            </Text>
            <View style={[styles.phoneInputRow, { flexDirection: 'row' }]}>
              <Phone size={18} color="#A78BFA" />
              <View style={[styles.countryCodeBadge, { flexDirection: 'row' }]}>
                <Text style={styles.flagEmoji}>🇲🇦</Text>
                <Text style={styles.countryCodeText}>+212</Text>
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.textInput, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="06 12 34 56 78"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={14}
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.continueBtnText}>{getT('continueBtn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer Link (Back to Register) ── */}
        <View style={styles.footerBlock}>
          <Text style={styles.footerLinkBase}>{getT('newToApp')}</Text>
          <TouchableOpacity
            style={styles.footerLinkTouch}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.footerLinkHighlight}>{getT('createAccountLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Language Switcher Modal ── */}
      <Modal
        visible={showLangModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.langModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <View style={styles.langModalCard}>
            <Text style={styles.langModalTitle}>{getT('langModalTitle')}</Text>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langOptionRow,
                  activeLang === item.code && styles.langOptionRowSelected,
                ]}
                onPress={() => handleLanguageChange(item.code)}
              >
                <Text style={styles.langOptionFlag}>{item.flag}</Text>
                <Text style={styles.langOptionLabel}>{item.label}</Text>
                {activeLang === item.code && <Check size={18} color="#A78BFA" />}
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
    backgroundColor: 'rgba(60, 60, 60, 0.55)',
  },
  topHeaderBannerContainer: {
    height: 245,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderColor: '#683EE640',
  },
  topHeaderBannerBg: {
    width: '100%',
    height: '100%',
  },
  topHeaderContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1B4B80',
    borderWidth: 1,
    borderColor: '#683EE660',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B80',
    borderWidth: 1,
    borderColor: '#683EE660',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langBtnText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)' as any,
    borderRadius: 24,
    padding: 22,
    gap: 18,
    shadowColor: '#683EE6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTextBlock: {
    gap: 6,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    gap: 10,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagEmoji: {
    fontSize: 16,
  },
  countryCodeText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  inputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  continueBtn: {
    backgroundColor: '#683EE6',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerBlock: {
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerLinkBase: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerLinkTouch: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  footerLinkHighlight: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Language Modal */
  langModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  langModalCard: {
    width: '100%',
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    gap: 10,
  },
  langModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  langOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  langOptionRowSelected: {
    backgroundColor: '#683EE620',
    borderWidth: 1,
    borderColor: '#683EE6',
  },
  langOptionFlag: {
    fontSize: 20,
  },
  langOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
