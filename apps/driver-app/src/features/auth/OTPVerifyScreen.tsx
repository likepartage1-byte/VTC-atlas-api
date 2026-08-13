import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  I18nManager,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { ArrowLeft, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react-native';
import { LaserLogo } from '../../components/LaserLogo';
import { authService } from '../../services/auth.service';
import { api } from '../../api/axios.instance';
import { useAppModeStore } from '../../store/useAppModeStore';

const C = {
  bg:          '#F8FAFC',
  primary:     '#683EE6',
  primaryLight:'#F3F0FF',
  primaryMid:  '#EDE9FF',
  text:        '#0F172A',
  textSub:     '#64748B',
  border:      '#E2E8F0',
  inputBg:     '#FAFAFA',
  success:     '#10B981',
  error:       '#EF4444',
  white:       '#FFFFFF',
};

type OTPVerifyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerify'>;
type OTPVerifyScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerify'>;
interface Props {
  navigation: OTPVerifyScreenNavigationProp;
  route: OTPVerifyScreenRouteProp;
}

const TRANSLATIONS: Record<string, Record<'ar' | 'fr' | 'en' | 'es', string>> = {
  logoSubTagline: {
    ar: 'رحلتك تبدأ هنا',
    fr: 'Votre voyage commence ici',
    en: 'Your journey starts here',
    es: 'Tu viaje comienza aquí',
  },
  screenTitle: {
    ar: 'التحقق من رقم الهاتف',
    fr: 'Vérification du numéro',
    en: 'Phone Verification',
    es: 'Verificación de teléfono',
  },
  screenSubtitle: {
    ar: 'أرسلنا رمز التحقق المكوّن من 6 أرقام إلى',
    fr: 'Nous avons envoyé le code à 6 chiffres au',
    en: 'We sent the 6-digit code to',
    es: 'Enviamos el código de 6 dígitos al',
  },
  codeLabel: {
    ar: 'رمز التحقق',
    fr: 'Code de vérification',
    en: 'Verification Code',
    es: 'Código de verificación',
  },
  codePlaceholder: {
    ar: '000000',
    fr: '000000',
    en: '000000',
    es: '000000',
  },
  testCodeHint: {
    ar: '💡 رمز الدخول التجريبي المباشر: 000000',
    fr: '💡 Code d\'accès direct : 000000',
    en: '💡 Direct login code: 000000',
    es: '💡 Código de acceso directo: 000000',
  },
  confirmBtn: {
    ar: 'تأكيد والدخول',
    fr: 'Confirmer et se connecter',
    en: 'Confirm & Sign In',
    es: 'Confirmar e iniciar sesión',
  },
  loadingBtn: {
    ar: 'جارٍ التحقق...',
    fr: 'Vérification...',
    en: 'Verifying...',
    es: 'Verificando...',
  },
  resendIn: {
    ar: 'إعادة الإرسال بعد',
    fr: 'Renvoyer dans',
    en: 'Resend in',
    es: 'Reenviar en',
  },
  resendOTP: {
    ar: 'إعادة إرسال الرمز',
    fr: 'Renvoyer le code',
    en: 'Resend Code',
    es: 'Reenviar código',
  },
  successTitle: {
    ar: 'تم بنجاح',
    fr: 'Succès',
    en: 'Success',
    es: 'Éxito',
  },
  resentMsg: {
    ar: 'تم إعادة إرسال رمز التحقق بنجاح',
    fr: 'Le code a été renvoyé avec succès',
    en: 'Verification code resent successfully',
    es: 'Código reenviado con éxito',
  },
  errorTitle: {
    ar: 'خطأ في التحقق',
    fr: 'Échec de la vérification',
    en: 'Verification Failed',
    es: 'Verificación fallida',
  },
  invalidCode: {
    ar: 'رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى المحاولة مجدداً.',
    fr: 'Code invalide ou expiré. Veuillez réessayer.',
    en: 'Invalid or expired code. Please try again.',
    es: 'Código inválido o expirado. Inténtelo de nuevo.',
  },
  resendError: {
    ar: 'فشل إعادة إرسال الرمز. حاول مجدداً.',
    fr: 'Échec du renvoi. Réessayez.',
    en: 'Failed to resend. Try again.',
    es: 'Error al reenviar. Inténtelo de nuevo.',
  },
  seconds: {
    ar: 'ث',
    fr: 's',
    en: 's',
    es: 's',
  },
};

export const OTPVerifyScreen = ({ route, navigation }: Props) => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { phoneNumber } = route.params;

  const rawLang = (i18n.language || 'ar').toLowerCase().substring(0, 2);
  const activeLang: 'ar' | 'fr' | 'en' | 'es' =
    rawLang === 'fr' || rawLang === 'en' || rawLang === 'es' ? rawLang : 'ar';
  const isRTL = activeLang === 'ar';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isFocused, setIsFocused] = useState(false);

  const getT = (key: string): string =>
    TRANSLATIONS[key]?.[activeLang] || TRANSLATIONS[key]?.['ar'] || '';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResendOTP = async () => {
    if (timer > 0) return;
    try {
      await authService.requestOtp(phoneNumber);
      setTimer(60);
      Alert.alert(getT('successTitle'), getT('resentMsg'));
    } catch {
      Alert.alert(getT('errorTitle'), getT('resendError'));
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;
    setIsLoading(true);
    try {
      const regName  = route.params?.fullName || (await AsyncStorage.getItem('registered_full_name')) || undefined;
      const regEmail = route.params?.email    || (await AsyncStorage.getItem('registered_email'))     || undefined;
      const regCity  = route.params?.city     || (await AsyncStorage.getItem('registered_city'))      || undefined;
      const targetRole = (route.params?.role  || (await AsyncStorage.getItem('registered_role'))      || 'PASSENGER') as 'DRIVER' | 'PASSENGER';

      const response = await authService.verifyOtp(phoneNumber, code, 'unique-device-id', regName, regEmail, regCity, targetRole);
      const resData = response.data as any;
      const { accessToken, refreshToken, role: returnedRole } = resData;

      await AsyncStorage.setItem('driver_access_token', accessToken);
      await AsyncStorage.setItem('driver_refresh_token', refreshToken);

      await useAppModeStore.getState().setRegisteredUser({
        fullName: regName || resData?.user?.fullName || resData?.driver?.name,
        email: regEmail,
        city: regCity,
        phone: phoneNumber,
      });

      const effectiveRole = (returnedRole || route.params?.role || targetRole || 'PASSENGER').toUpperCase();
      await AsyncStorage.setItem('@user_active_role', effectiveRole);
      await AsyncStorage.removeItem('registered_role');

      const returnedName = resData?.user?.fullName || resData?.driver?.name || resData?.user?.name;
      const effectiveName = (regName && regName.trim()) || returnedName || '';

      if (effectiveName && effectiveName.trim().toLowerCase() !== 'new user') {
        const clean = effectiveName.trim();
        await AsyncStorage.setItem('registered_full_name', clean);
        await AsyncStorage.setItem('user_full_name', clean);
        await AsyncStorage.setItem('@user_full_name', clean);
        if (regEmail) await AsyncStorage.setItem('registered_email', regEmail);
        if (regCity) await AsyncStorage.setItem('user_city', regCity);
        const parts = clean.split(' ');
        const fn = parts[0] || 'User';
        const ln = parts.slice(1).join(' ') || fn;
        await api.patch('/driver/profile', {
          firstName: fn, lastName: ln, fullName: clean, name: clean,
          ...(regEmail ? { email: regEmail } : {}),
          ...(regCity  ? { city: regCity }   : {}),
        }).catch(() => {});
      }

      dispatch(setAuthenticated(accessToken));

      if (effectiveRole === 'PASSENGER') {
        await useAppModeStore.getState().setActiveMode('PASSENGER');
        useAppModeStore.getState().setDriverEligible(false);
        navigation.replace('PassengerHome');
      } else {
        await useAppModeStore.getState().setActiveMode('DRIVER');
        if (route.params?.isRegistration) {
          navigation.replace('SelectVehicleType');
        } else {
          navigation.replace('Dashboard');
        }
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || '';
      Alert.alert(getT('errorTitle'), serverMsg || getT('invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const canConfirm = code.length >= 6 && !isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header Banner with marrakech_bg.jpg & LaserLogo ── */}
      <View style={styles.topHeaderBannerContainer}>
        <ImageBackground
          source={require('../../assets/marrakech_bg.jpg')}
          style={styles.topHeaderBannerBg}
          resizeMode="cover"
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="headerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.45" />
                <Stop offset="65%" stopColor="#0F172A" stopOpacity="0.75" />
                <Stop offset="100%" stopColor="#F8FAFC" stopOpacity="1.0" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#headerGradient)" />
          </Svg>

          <View style={styles.topHeaderContent}>
            {/* Top Bar: Back Button */}
            <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                {isRTL
                  ? <ArrowRight size={20} color="#FFFFFF" />
                  : <ArrowLeft  size={20} color="#FFFFFF" />
                }
              </TouchableOpacity>
            </View>

            {/* Vector LaserLogo Header */}
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
        {/* OTP Card */}
        <View style={styles.card}>
          <View style={styles.heroArea}>
            <View style={styles.shieldBadge}>
              <ShieldCheck size={28} color={C.primary} />
            </View>
            <Text style={styles.heroTitle}>{getT('screenTitle')}</Text>
            <Text style={styles.heroSubtitle}>{getT('screenSubtitle')}</Text>
            <Text style={styles.phoneChip}>{phoneNumber}</Text>
          </View>

          <Text style={[styles.inputLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
            {getT('codeLabel')}
          </Text>

          <TextInput
            style={[
              styles.otpInput,
              { textAlign: 'center' },
              isFocused && styles.otpInputFocused,
              code.length === 6 && styles.otpInputFilled,
            ]}
            value={code}
            onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder={getT('codePlaceholder')}
            placeholderTextColor={C.border}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <View style={styles.testCodeBadge}>
            <Text style={styles.testCodeText}>{getT('testCodeHint')}</Text>
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                {getT('resendIn')} {timer}{getT('seconds')}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOTP}
                activeOpacity={0.75}
              >
                <RefreshCw size={14} color={C.primary} />
                <Text style={styles.resendBtnText}>{getT('resendOTP')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, !canConfirm && styles.primaryBtnDisabled]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!canConfirm}
          >
            {isLoading
              ? <ActivityIndicator color={C.white} size="small" />
              : <Text style={styles.primaryBtnText}>{getT('confirmBtn')}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeaderBannerContainer: {
    height: 235,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    gap: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroArea: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 8,
  },
  shieldBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D0FA',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },
  phoneChip: {
    backgroundColor: C.primaryLight,
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8D0FA',
    overflow: 'hidden',
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  otpInput: {
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    height: 68,
    fontSize: 26,
    color: C.text,
    fontWeight: '900',
    letterSpacing: 12,
  },
  otpInputFocused: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  otpInputFilled: {
    borderColor: C.success,
    backgroundColor: '#F0FDF4',
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  timerText: {
    color: C.textSub,
    fontSize: 13,
    fontWeight: '500',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D0FA',
  },
  resendBtnText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  testCodeBadge: {
    backgroundColor: '#F3F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D0FA',
  },
  testCodeText: {
    color: '#683EE6',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
