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
  Dimensions,
  ImageBackground,
  I18nManager,
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
import { authService } from '../../services/auth.service';
import { api } from '../../api/axios.instance';
import { useAppModeStore } from '../../store/useAppModeStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type OTPVerifyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerify'>;
type OTPVerifyScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerify'>;

interface Props {
  navigation: OTPVerifyScreenNavigationProp;
  route: OTPVerifyScreenRouteProp;
}

// ── Pure Multilingual Dictionary ─────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<'ar' | 'fr' | 'en' | 'es', string>> = {
  screenTitle: {
    ar: 'التحقق من الهوية',
    fr: 'Vérification OTP',
    en: 'OTP Verification',
    es: 'Verificación OTP',
  },
  screenSubtitle: {
    ar: 'تم إرسال رمز التحقق المكوّن من 6 أرقام إلى رقمك',
    fr: 'Le code de vérification à 6 chiffres a été envoyé à',
    en: 'The 6-digit verification code was sent to',
    es: 'El código de verificación de 6 dígitos fue enviado a',
  },
  codeLabel: {
    ar: 'أدخل رمز التحقق',
    fr: 'Entrez le code de vérification',
    en: 'Enter Verification Code',
    es: 'Ingrese el código de verificación',
  },
  confirmBtn: {
    ar: 'تأكيد والدخول ➔',
    fr: 'Confirmer et se connecter ➔',
    en: 'Confirm & Sign In ➔',
    es: 'Confirmar e iniciar sesión ➔',
  },
  loadingBtn: {
    ar: 'جارٍ التحقق...',
    fr: 'Vérification en cours...',
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
    ar: '🔄 إعادة إرسال الرمز',
    fr: '🔄 Renvoyer le code',
    en: '🔄 Resend Code',
    es: '🔄 Reenviar código',
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
    es: 'Código de verificación reenviado con éxito',
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
    es: 'Código inválido o expirado. Intente de nuevo.',
  },
  resendError: {
    ar: 'فشل إعادة إرسال الرمز. حاول مجدداً.',
    fr: 'Échec du renvoi du code. Réessayez.',
    en: 'Failed to resend code. Try again.',
    es: 'Error al reenviar el código. Inténtelo de nuevo.',
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

  const getT = (key: string): string =>
    TRANSLATIONS[key]?.[activeLang] || TRANSLATIONS[key]?.['ar'] || '';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResendOTP = async () => {
    if (timer > 0) return;
    try {
      await authService.requestOtp(phoneNumber);
      setTimer(60);
      Alert.alert(getT('successTitle'), getT('resentMsg'));
    } catch (error: any) {
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
      const targetRole = (route.params?.role || (await AsyncStorage.getItem('registered_role')) || 'PASSENGER') as 'DRIVER' | 'PASSENGER';

      const response = await authService.verifyOtp(
        phoneNumber,
        code,
        'unique-device-id',
        regName,
        regEmail,
        regCity,
        targetRole,
      );
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
          firstName: fn,
          lastName: ln,
          fullName: clean,
          name: clean,
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
        // Do NOT blindly set isDriverEligible to true if this is a brand new driver registration
        if (route.params?.isRegistration) {
          useAppModeStore.getState().setDriverEligible(false);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <View style={styles.topBannerContainer}>
        <ImageBackground
          source={require('../../assets/marrakech_bg.jpg')}
          style={styles.topBannerBg}
          resizeMode="cover"
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="otpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%"   stopColor="#2D2D2D" stopOpacity="0.3" />
                <Stop offset="65%"  stopColor="#3A3A3A" stopOpacity="0.55" />
                <Stop offset="100%" stopColor="#404040" stopOpacity="0.85"  />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#otpGrad)" />
          </Svg>

          <View style={styles.topBannerContent}>
            {/* Back Button */}
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

            {/* Shield Icon + Title */}
            <View style={styles.heroCenter}>
              <View style={styles.shieldBadge}>
                <ShieldCheck size={40} color="#A78BFA" />
              </View>
              <Text style={[styles.heroTitle, { textAlign: 'center' }]}>
                {getT('screenTitle')}
              </Text>
              <Text style={[styles.heroSubtitle, { textAlign: 'center' }]}>
                {getT('screenSubtitle')}
              </Text>
              <Text style={[styles.phoneChip]}>
                {phoneNumber}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <View style={styles.formCard}>
        {/* Label */}
        <Text style={[styles.codeLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
          {getT('codeLabel')}
        </Text>

        {/* OTP Input */}
        <TextInput
          style={styles.otpInput}
          placeholder="● ● ● ● ● ●"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          autoFocus
          textAlign="center"
        />

        {/* Timer / Resend */}
        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResendOTP}
          disabled={timer > 0}
          activeOpacity={0.7}
        >
          {timer > 0 ? (
            <Text style={styles.timerText}>
              {getT('resendIn')} {timer}{getT('seconds')}
            </Text>
          ) : (
            <View style={styles.resendActiveRow}>
              <RefreshCw size={15} color="#A78BFA" />
              <Text style={styles.resendActiveText}>{getT('resendOTP')}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (code.length < 6 || isLoading) && styles.confirmBtnDisabled,
          ]}
          onPress={handleVerify}
          disabled={code.length < 6 || isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {isLoading ? getT('loadingBtn') : getT('confirmBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(60, 60, 60, 0.55)',
  },

  /* Top banner */
  topBannerContainer: {
    height: 280,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  topBannerBg: {
    width: '100%',
    height: '100%',
  },
  topBannerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 16,
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
    alignSelf: 'flex-start',
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shieldBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#683EE620',
    borderWidth: 1,
    borderColor: '#683EE660',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  phoneChip: {
    backgroundColor: '#683EE620',
    borderWidth: 1,
    borderColor: '#683EE660',
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
    letterSpacing: 1,
    overflow: 'hidden',
  },

  /* Form card */
  formCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  otpInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    height: 72,
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 10,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  timerText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  resendActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendActiveText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#683EE6',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
