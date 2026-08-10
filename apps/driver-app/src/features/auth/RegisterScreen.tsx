import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDocumentStorageCache } from '../profile/DocumentsScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronDown,
  Check,
  Search,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Car,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { authService } from '../../services/auth.service';

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
  amber:       '#F59E0B',
  sky:         '#0EA5E9',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

// Popular Moroccan Cities List with 4 Languages
const MOROCCAN_CITIES = [
  { id: '1', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', es: 'Casablanca' },
  { id: '2', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', es: 'Rabat' },
  { id: '3', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', es: 'Marrakech' },
  { id: '4', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', es: 'Tánger' },
  { id: '5', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', es: 'Agadir' },
  { id: '6', ar: 'فاس', fr: 'Fès', en: 'Fes', es: 'Fez' },
  { id: '7', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', es: 'Mequinez' },
  { id: '8', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', es: 'Ujda' },
  { id: '9', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', es: 'Kenitra' },
  { id: '10', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', es: 'Tetuán' },
  { id: '11', ar: 'الناظور', fr: 'Nador', en: 'Nador', es: 'Nador' },
  { id: '12', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', es: 'El Aaiún' },
];

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

// Clean Pure Multilingual Dictionary (Zero Language Mixing)
const TRANSLATIONS: Record<string, Record<'ar' | 'fr' | 'en' | 'es', string>> = {
  logoTagline: {
    ar: 'منصة السائقين والركاب',
    fr: 'PLATEFORME CHAUFFEURS & PASSAGERS',
    en: 'DRIVER & PASSENGER PLATFORM',
    es: 'PLATAFORMA DE CONDUCTORES Y PASAJEROS',
  },
  logoSubTagline: {
    ar: 'رحلتك تبدأ هنا',
    fr: 'Votre voyage commence ici',
    en: 'Your journey starts here',
    es: 'Tu viaje comienza aquí',
  },
  screenTitle: {
    ar: 'إنشاء حساب جديد',
    fr: 'Créer un nouveau compte',
    en: 'Create New Account',
    es: 'Crear nueva cuenta',
  },
  screenSubtitle: {
    ar: 'اختر نوع الحساب للبدء في رحلتك مع Yalla VTC',
    fr: 'Sélectionnez votre type de compte pour commencer avec Yalla VTC',
    en: 'Select your account type to get started with Yalla VTC',
    es: 'Seleccione su tipo de cuenta para comenzar con Yalla VTC',
  },
  driverTitle: {
    ar: 'التسجيل كسائق',
    fr: 'S\'inscrire comme chauffeur',
    en: 'Register as Driver',
    es: 'Registrarse como conductor',
  },
  driverTag: {
    ar: 'سائق',
    fr: 'Chauffeur',
    en: 'Driver',
    es: 'Conductor',
  },
  driverDesc: {
    ar: 'سجّل سيارتك أو دراجتك النارية وابدأ استقبال الرحلات وتحقيق أرباح يومية ممتازة.',
    fr: 'Inscrivez votre voiture ou moto et commencez à recevoir des courses et générer d\'excellents revenus.',
    en: 'Register your car or motorcycle and start accepting rides to earn great daily income.',
    es: 'Registre su coche o motocicleta y comience a recibir viajes para obtener excelentes ingresos diarios.',
  },
  driverBtn: {
    ar: 'متابعة التسجيل كسائق ➔',
    fr: 'Continuer l\'inscription chauffeur ➔',
    en: 'Continue Driver Signup ➔',
    es: 'Continuar registro de conductor ➔',
  },
  passengerTitle: {
    ar: 'التسجيل كراكب',
    fr: 'S\'inscrire comme passager',
    en: 'Register as Passenger',
    es: 'Registrarse como pasajero',
  },
  passengerTag: {
    ar: 'راكب',
    fr: 'Passager',
    en: 'Passenger',
    es: 'Pasajero',
  },
  passengerDesc: {
    ar: 'احجز رحلاتك وخدمات توصيل الطرود والمستندات فوراً وبأفضل الأسعار.',
    fr: 'Réservez vos trajets et la livraison de colis ou documents instantanément aux meilleurs tarifs.',
    en: 'Book your rides and parcel or document delivery instantly at the best rates.',
    es: 'Reserve sus viajes y la entrega de paquetes o documentos al instante a las mejores tarifas.',
  },
  passengerBtn: {
    ar: 'متابعة التسجيل كراكب ➔',
    fr: 'Continuer l\'inscription passager ➔',
    en: 'Continue Passenger Signup ➔',
    es: 'Continuar registro de pasajero ➔',
  },
  alreadyHaveAccount: {
    ar: 'هل لديك حساب بالفعل؟',
    fr: 'Vous avez déjà un compte ?',
    en: 'Already have an account?',
    es: '¿Ya tiene una cuenta?',
  },
  signInLink: {
    ar: 'سجّل الدخول برقم الهاتف 🔑',
    fr: 'Se connecter par téléphone 🔑',
    en: 'Sign In with Phone 🔑',
    es: 'Iniciar sesión con teléfono 🔑',
  },
  sheetHeaderDriver: {
    ar: '🚗 نموذج تسجيل سائق',
    fr: '🚗 Inscription Chauffeur',
    en: '🚗 Driver Registration',
    es: '🚗 Registro de Conductor',
  },
  sheetHeaderPassenger: {
    ar: '👤 نموذج تسجيل راكب',
    fr: '👤 Inscription Passager',
    en: '👤 Passenger Registration',
    es: '👤 Registro de Pasajero',
  },
  sheetTitle: {
    ar: 'إدخال معلومات الحساب',
    fr: 'Informations du compte',
    en: 'Account Information',
    es: 'Información de la cuenta',
  },
  fullNamePlaceholder: {
    ar: 'الاسم الكامل',
    fr: 'Nom complet',
    en: 'Full Name',
    es: 'Nombre completo',
  },
  emailPlaceholder: {
    ar: 'البريد الإلكتروني (اختياري)',
    fr: 'Adresse e-mail (Optionnel)',
    en: 'Email Address (Optional)',
    es: 'Correo electrónico (Opcional)',
  },
  cityPlaceholder: {
    ar: 'اختر المدينة',
    fr: 'Sélectionnez votre ville',
    en: 'Select your city',
    es: 'Seleccione su ciudad',
  },
  agreePrefix: {
    ar: 'أوافق على ',
    fr: 'J\'accepte les ',
    en: 'I agree to the ',
    es: 'Acepto los ',
  },
  termsService: {
    ar: 'شروط الخدمة',
    fr: 'Conditions d\'utilisation',
    en: 'Terms of Service',
    es: 'Términos del servicio',
  },
  andWord: {
    ar: ' و ',
    fr: ' et la ',
    en: ' and ',
    es: ' y la ',
  },
  privacyPolicy: {
    ar: 'سياسة الخصوصية',
    fr: 'Politique de confidentialité',
    en: 'Privacy Policy',
    es: 'Política de privacidad',
  },
  submitLoading: {
    ar: 'جاري إرسال الرمز...',
    fr: 'Envoi du code en cours...',
    en: 'Sending code...',
    es: 'Enviando código...',
  },
  submitBtn: {
    ar: 'إرسال رمز التحقق ومتابعة التسجيل ➔',
    fr: 'Envoyer le code de vérification ➔',
    en: 'Send Verification Code ➔',
    es: 'Enviar código de verificación ➔',
  },
  alertTitleReq: {
    ar: 'تنبيه',
    fr: 'Champ requis',
    en: 'Required',
    es: 'Requerido',
  },
  alertNameMsg: {
    ar: 'يرجى إدخال الاسم الكامل.',
    fr: 'Veuillez saisir votre nom complet.',
    en: 'Please enter your full name.',
    es: 'Por favor ingrese su nombre completo.',
  },
  alertPhoneMsg: {
    ar: 'يرجى إدخال رقم هاتف صحيح.',
    fr: 'Veuillez saisir un numéro de téléphone valide.',
    en: 'Please enter a valid phone number.',
    es: 'Por favor ingrese un número de teléfono válido.',
  },
  alertCityMsg: {
    ar: 'يرجى اختيار مدينتك.',
    fr: 'Veuillez sélectionner votre ville.',
    en: 'Please select your city.',
    es: 'Por favor seleccione su ciudad.',
  },
  alertTermsTitle: {
    ar: 'تنبيه',
    fr: 'Conditions requises',
    en: 'Terms Required',
    es: 'Términos requeridos',
  },
  alertTermsMsg: {
    ar: 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية.',
    fr: 'Veuillez accepter les conditions d\'utilisation et la politique de confidentialité.',
    en: 'Please accept the Terms of Service and Privacy Policy.',
    es: 'Por favor acepte los términos del servicio y la política de privacidad.',
  },
  cityModalTitle: {
    ar: 'اختر مدينتك',
    fr: 'Sélectionnez votre ville',
    en: 'Select Your City',
    es: 'Seleccione su ciudad',
  },
  citySearchPlaceholder: {
    ar: 'ابحث عن مدينة...',
    fr: 'Rechercher une ville...',
    en: 'Search city...',
    es: 'Buscar ciudad...',
  },
  langModalTitle: {
    ar: '🌐 اختر اللغة',
    fr: '🌐 Choisir la langue',
    en: '🌐 Select Language',
    es: '🌐 Seleccionar idioma',
  },
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'ar').toLowerCase().substring(0, 2);
  const activeLang: 'ar' | 'fr' | 'en' | 'es' =
    rawLang === 'fr' || rawLang === 'en' || rawLang === 'es' ? rawLang : 'ar';
  const isRTL = activeLang === 'ar';

  const getT = (key: string): string => {
    return TRANSLATIONS[key]?.[activeLang] || TRANSLATIONS[key]?.['ar'] || '';
  };

  useEffect(() => {
    clearDocumentStorageCache();
  }, []);
  const [selectedRole, setSelectedRole] = useState<'DRIVER' | 'PASSENGER'>('DRIVER');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  // Input States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // City Picker Modal State
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Filtered Cities for Modal
  const filteredCities = MOROCCAN_CITIES.filter((city) => {
    const name =
      activeLang === 'fr' ? city.fr : activeLang === 'en' ? city.en : activeLang === 'es' ? city.es : city.ar;
    return name.toLowerCase().includes(citySearchQuery.toLowerCase());
  });

  const getCityName = (city: any) => {
    if (!city) return '';
    return activeLang === 'fr' ? city.fr : activeLang === 'en' ? city.en : activeLang === 'es' ? city.es : city.ar;
  };

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);
    setShowLangModal(false);
  };

  // Validation Check
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert(getT('alertTitleReq'), getT('alertNameMsg'));
      return false;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      Alert.alert(getT('alertTitleReq'), getT('alertPhoneMsg'));
      return false;
    }
    if (!selectedCity) {
      Alert.alert(getT('alertTitleReq'), getT('alertCityMsg'));
      return false;
    }
    if (!agreeTerms) {
      Alert.alert(getT('alertTermsTitle'), getT('alertTermsMsg'));
      return false;
    }
    return true;
  };

  // Form Submit Handler
  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    const cleanNumber = phoneNumber.trim().replace(/^0+/, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+212${cleanNumber}`;
    const cityName = selectedCity ? getCityName(selectedCity) : '';

    const { useAppModeStore } = await import('../../store/useAppModeStore');
    await useAppModeStore.getState().setRegisteredUser({
      fullName: fullName.trim(),
      email: email.trim(),
      city: cityName,
      phone: formattedPhone,
    });
    await AsyncStorage.setItem('registered_role', selectedRole);

    setIsLoading(true);
    try {
      await authService.requestOtp(formattedPhone);
    } catch (_) {
      // Continue to OTP screen smoothly
    } finally {
      setIsLoading(false);
      setShowFormModal(false);
      navigation.navigate('OTPVerify', {
        phoneNumber: formattedPhone,
        isRegistration: true,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        city: cityName || undefined,
        role: selectedRole,
      });
    }
  };

  const openFormForRole = (role: 'DRIVER' | 'PASSENGER') => {
    setSelectedRole(role);
    setShowFormModal(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar: lang + logo */}
        <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>Y</Text>
            </View>
            <Text style={styles.logoWordmark}>Yalla VTC</Text>
          </View>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.75}
          >
            <Globe size={14} color={C.primary} />
            <Text style={styles.langBtnText}>
              {LANGUAGES.find(l => l.code === activeLang)?.flag} {activeLang.toUpperCase()}
            </Text>
            <ChevronDown size={12} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Screen header */}
        <View style={styles.headerBlock}>
          <Text style={[styles.screenTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {getT('screenTitle')}
          </Text>
          <Text style={[styles.screenSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {getT('screenSubtitle')}
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {/* Driver Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => openFormForRole('DRIVER')}
            activeOpacity={0.88}
          >
            <View style={[styles.roleHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.roleIconBadge, { backgroundColor: C.primary }]}>
                <Car size={24} color={C.white} />
              </View>
              <View style={[styles.tagBadge, isRTL && { flexDirection: 'row-reverse' }]}>
                <Sparkles size={11} color={C.amber} />
                <Text style={styles.tagBadgeText}>{getT('driverTag')}</Text>
              </View>
            </View>
            <Text style={[styles.roleCardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('driverTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('driverDesc')}
            </Text>
            <View style={styles.roleCardBtn}>
              <Text style={styles.roleCardBtnText}>{getT('driverBtn')}</Text>
            </View>
          </TouchableOpacity>

          {/* Passenger Card */}
          <TouchableOpacity
            style={[styles.roleCard, styles.roleCardPassenger]}
            onPress={() => openFormForRole('PASSENGER')}
            activeOpacity={0.88}
          >
            <View style={[styles.roleHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.roleIconBadge, { backgroundColor: C.sky }]}>
                <UserCheck size={24} color={C.white} />
              </View>
              <View style={[styles.tagBadgePassenger, isRTL && { flexDirection: 'row-reverse' }]}>
                <ShieldCheck size={11} color={C.sky} />
                <Text style={styles.tagBadgePassengerText}>{getT('passengerTag')}</Text>
              </View>
            </View>
            <Text style={[styles.roleCardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('passengerTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('passengerDesc')}
            </Text>
            <View style={[styles.roleCardBtn, styles.roleCardBtnPassenger]}>
              <Text style={[styles.roleCardBtnText, { color: C.sky }]}>{getT('passengerBtn')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerArea}>
          <Text style={styles.footerText}>{getT('alreadyHaveAccount')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PhoneAuth' as never)}
            style={styles.loginLinkBtn}
          >
            <Text style={styles.loginLinkText}>{getT('signInLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Registration Form Sheet ── */}
      <Modal visible={showFormModal} animationType="slide" transparent onRequestClose={() => setShowFormModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdropDismiss} activeOpacity={1} onPress={() => setShowFormModal(false)} />

          <View style={styles.modalSheetContainer}>
            {/* Drag indicator */}
            <View style={styles.dragHandle} />

            {/* Sheet Header */}
            <View style={[styles.sheetHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.sheetHeaderInfo}>
                <View style={[
                  styles.roleBadgeHeader,
                  { backgroundColor: selectedRole === 'DRIVER' ? C.primaryLight : '#E0F2FE' },
                ]}>
                  <Text style={[
                    styles.roleBadgeHeaderText,
                    { color: selectedRole === 'DRIVER' ? C.primary : C.sky },
                  ]}>
                    {selectedRole === 'DRIVER' ? getT('sheetHeaderDriver') : getT('sheetHeaderPassenger')}
                  </Text>
                </View>
                <Text style={styles.sheetTitle}>{getT('sheetTitle')}</Text>
              </View>
              <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setShowFormModal(false)}>
                <X size={18} color={C.textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Full Name */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                  <User size={18} color={C.primary} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={getT('fullNamePlaceholder')}
                    placeholderTextColor={C.textSub}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Mail size={18} color={C.primary} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={getT('emailPlaceholder')}
                    placeholderTextColor={C.textSub}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Phone size={18} color={C.primary} />
                  <View style={[styles.countryPrefix, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.flagEmoji}>🇲🇦</Text>
                    <Text style={styles.countryCode}>+212</Text>
                  </View>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={[styles.input, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder="6XX XX XX XX"
                    placeholderTextColor={C.textSub}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* City */}
              <View style={styles.fieldWrapper}>
                <TouchableOpacity
                  style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}
                  onPress={() => setShowCityModal(true)}
                  activeOpacity={0.8}
                >
                  <MapPin size={18} color={C.primary} />
                  <Text style={[
                    styles.citySelectText,
                    !selectedCity && { color: C.textSub },
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}>
                    {selectedCity ? getCityName(selectedCity) : getT('cityPlaceholder')}
                  </Text>
                  <ChevronDown size={16} color={C.textSub} />
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <TouchableOpacity
                style={[styles.termsContainer, isRTL && { flexDirection: 'row-reverse' }]}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Check size={12} color={C.white} />}
                </View>
                <Text style={[styles.termsText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {getT('agreePrefix')}
                  <Text style={styles.termsHighlight} onPress={() => navigation.navigate('TermsOfService')}>
                    {getT('termsService')}
                  </Text>
                  {getT('andWord')}
                  <Text style={styles.termsHighlight} onPress={() => navigation.navigate('PrivacyPolicy')}>
                    {getT('privacyPolicy')}
                  </Text>
                  .
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleFormSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? getT('submitLoading') : getT('submitBtn')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 14, alignItems: 'center', paddingVertical: 8 }}
                onPress={() => { setShowFormModal(false); navigation.navigate('HelpCenter'); }}
              >
                <Text style={{ fontSize: 13, color: C.primary, fontWeight: '600' }}>
                  {isRTL ? 'هل تحتاج إلى مساعدة؟ تواصل مع فريق الدعم' : 'Need help? Contact support'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── City Modal ── */}
      <Modal visible={showCityModal} animationType="slide" transparent onRequestClose={() => setShowCityModal(false)}>
        <View style={styles.cityModalContainer}>
          <View style={styles.cityModalContent}>
            <View style={[styles.cityModalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.cityModalTitle}>{getT('cityModalTitle')}</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <X size={22} color={C.textSub} />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchBox, isRTL && { flexDirection: 'row-reverse' }]}>
              <Search size={16} color={C.textSub} />
              <TextInput
                style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={getT('citySearchPlaceholder')}
                placeholderTextColor={C.textSub}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
              />
            </View>
            <FlatList
              data={filteredCities}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedCity?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.cityItem, isSelected && styles.cityItemSelected, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => { setSelectedCity(item); setShowCityModal(false); setCitySearchQuery(''); }}
                  >
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {getCityName(item)}
                    </Text>
                    {isSelected && <Check size={16} color={C.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Language Modal ── */}
      <Modal visible={showLangModal} animationType="fade" transparent onRequestClose={() => setShowLangModal(false)}>
        <TouchableOpacity style={styles.langModalBackdrop} activeOpacity={1} onPress={() => setShowLangModal(false)}>
          <View style={styles.langModalCard}>
            <Text style={styles.langModalTitle}>{getT('langModalTitle')}</Text>
            {LANGUAGES.map(item => (
              <TouchableOpacity
                key={item.code}
                style={[styles.langOption, activeLang === item.code && styles.langOptionActive]}
                onPress={() => handleLanguageChange(item.code)}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[styles.langLabel, activeLang === item.code && styles.langLabelActive]}>
                  {item.label}
                </Text>
                {activeLang === item.code && <Check size={15} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

      {/* ── Top Header Banner with marrakech_bg.jpg ── */}
      <View style={styles.topHeaderBannerContainer}>
        <ImageBackground
          source={require('../../assets/marrakech_bg.jpg')}
          style={styles.topHeaderBannerBg}
          resizeMode="cover"
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="headerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#05070A" stopOpacity="0.45" />
                <Stop offset="65%" stopColor="#05070A" stopOpacity="0.75" />
                <Stop offset="100%" stopColor="#05070A" stopOpacity="1.0" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#headerGradient)" />
          </Svg>

          <View style={styles.topHeaderContent}>
            {/* Top Bar: Language Button */}
            <View style={[styles.topBar, isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' }]}>
              <TouchableOpacity
                style={styles.langPickerBtn}
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
        {/* Header Description */}
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>{getT('screenTitle')}</Text>
          <Text style={styles.screenSubtitle}>{getT('screenSubtitle')}</Text>
        </View>

        {/* Action Cards Container (Driver vs Passenger) */}
        <View style={styles.rolesContainer}>
          {/* Card 1: Register as Driver */}
          <TouchableOpacity
            style={styles.roleCardDriver}
            onPress={() => openFormForRole('DRIVER')}
            activeOpacity={0.9}
          >
            <View style={[styles.roleHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.driverBadgeIcon}>
                <Car size={26} color="#FFFFFF" />
              </View>
              <View style={[styles.tagBadge, isRTL && { flexDirection: 'row-reverse' }]}>
                <Sparkles size={12} color="#F59E0B" />
                <Text style={styles.tagBadgeText}>{getT('driverTag')}</Text>
              </View>
            </View>

            <Text style={[styles.roleCardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('driverTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('driverDesc')}
            </Text>

            <View style={styles.actionButtonDriver}>
              <Text style={styles.actionButtonTextDriver}>{getT('driverBtn')}</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Register as Passenger */}
          <TouchableOpacity
            style={styles.roleCardPassenger}
            onPress={() => openFormForRole('PASSENGER')}
            activeOpacity={0.9}
          >
            <View style={[styles.roleHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.passengerBadgeIcon}>
                <UserCheck size={26} color="#38BDF8" />
              </View>
              <View style={[styles.tagBadgeBlue, isRTL && { flexDirection: 'row-reverse' }]}>
                <ShieldCheck size={12} color="#38BDF8" />
                <Text style={styles.tagBadgeTextBlue}>{getT('passengerTag')}</Text>
              </View>
            </View>

            <Text style={[styles.roleCardTitlePassenger, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('passengerTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getT('passengerDesc')}
            </Text>

            <View style={styles.actionButtonPassenger}>
              <Text style={styles.actionButtonTextPassenger}>{getT('passengerBtn')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Area: Switch to Phone Sign In */}
        <View style={styles.footerArea}>
          <Text style={styles.footerText}>{getT('alreadyHaveAccount')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PhoneAuth' as never)}
            style={styles.loginLinkBtn}
          >
            <Text style={styles.loginLinkText}>{getT('signInLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Pop-Up Registration Form Sheet Modal ── */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowFormModal(false)}
          />

          <View style={styles.modalSheetContainer}>
            {/* Sheet Header */}
            <View style={[styles.sheetHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.sheetHeaderInfo}>
                <View
                  style={[
                    styles.roleBadgeHeader,
                    selectedRole === 'DRIVER' ? { backgroundColor: '#683EE620' } : { backgroundColor: '#38BDF820' },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeHeaderText,
                      selectedRole === 'DRIVER' ? { color: '#A78BFA' } : { color: '#38BDF8' },
                    ]}
                  >
                    {selectedRole === 'DRIVER' ? getT('sheetHeaderDriver') : getT('sheetHeaderPassenger')}
                  </Text>
                </View>
                <Text style={styles.sheetTitle}>{getT('sheetTitle')}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeSheetBtn}
                onPress={() => setShowFormModal(false)}
              >
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Field 1: Full Name */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                  <User size={20} color="#A78BFA" />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={getT('fullNamePlaceholder')}
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Field 2: Email Address */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Mail size={20} color="#A78BFA" />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={getT('emailPlaceholder')}
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field 3: Phone Number */}
              <View style={styles.fieldWrapper}>
                <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Phone size={20} color="#A78BFA" />
                  <View style={[styles.countryPrefix, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.flagEmoji}>🇲🇦</Text>
                    <Text style={styles.countryCode}>+212</Text>
                  </View>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={[styles.input, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder="06 12 34 56 78"
                    placeholderTextColor="#64748B"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Field 4: City Dropdown Trigger */}
              <View style={styles.fieldWrapper}>
                <TouchableOpacity
                  style={[styles.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}
                  onPress={() => setShowCityModal(true)}
                  activeOpacity={0.8}
                >
                  <MapPin size={20} color="#A78BFA" />
                  <Text
                    style={[
                      styles.citySelectText,
                      !selectedCity && { color: '#64748B' },
                      { textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {selectedCity ? getCityName(selectedCity) : getT('cityPlaceholder')}
                  </Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Field 5: Terms Checkbox */}
              <TouchableOpacity
                style={[styles.termsContainer, isRTL && { flexDirection: 'row-reverse' }]}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.termsText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {getT('agreePrefix')}
                  <Text style={styles.termsHighlight} onPress={() => navigation.navigate('TermsOfService')}>
                    {getT('termsService')}
                  </Text>
                  {getT('andWord')}
                  <Text style={styles.termsHighlight} onPress={() => navigation.navigate('PrivacyPolicy')}>
                    {getT('privacyPolicy')}
                  </Text>
                  .
                </Text>
              </TouchableOpacity>

              {/* Form Submit Primary Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleFormSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? getT('submitLoading') : getT('submitBtn')}
                </Text>
              </TouchableOpacity>

              {/* Support / Help Center Link */}
              <TouchableOpacity
                style={{ marginTop: 16, alignItems: 'center', paddingVertical: 8 }}
                onPress={() => {
                  setShowFormModal(false);
                  navigation.navigate('HelpCenter');
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, color: '#A78BFA', fontWeight: '600' }}>
                  {isRTL ? 'هل تحتاج إلى مساعدة؟ تواصل مع فريق الدعم 💬' : 'Need help? Contact support team 💬'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── City Selector Modal ── */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.cityModalContainer}>
          <View style={styles.cityModalContent}>
            <View style={[styles.cityModalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.cityModalTitle}>{getT('cityModalTitle')}</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, isRTL && { flexDirection: 'row-reverse' }]}>
              <Search size={18} color="#64748B" />
              <TextInput
                style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={getT('citySearchPlaceholder')}
                placeholderTextColor="#64748B"
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
              />
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedCity?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemSelected,
                      isRTL && { flexDirection: 'row-reverse' },
                    ]}
                    onPress={() => {
                      setSelectedCity(item);
                      setShowCityModal(false);
                      setCitySearchQuery('');
                    }}
                  >
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {getCityName(item)}
                    </Text>
                    {isSelected && <Check size={18} color="#683EE6" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

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
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
  },
  logoWordmark: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
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
  headerBlock: {
    marginTop: 20,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 14,
    color: C.textSub,
    lineHeight: 20,
  },
  rolesContainer: {
    gap: 14,
    marginTop: 20,
  },
  roleCard: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 20,
    padding: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  roleCardPassenger: {
    shadowColor: C.sky,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagBadgeText: {
    color: C.amber,
    fontSize: 12,
    fontWeight: '700',
  },
  tagBadgePassenger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagBadgePassengerText: {
    color: C.sky,
    fontSize: 12,
    fontWeight: '700',
  },
  roleCardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  roleCardDesc: {
    fontSize: 13,
    color: C.textSub,
    lineHeight: 19,
    marginBottom: 16,
  },
  roleCardBtn: {
    backgroundColor: C.primary,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
  },
  roleCardBtnPassenger: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  roleCardBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
  footerArea: {
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  footerText: {
    color: C.textSub,
    fontSize: 14,
  },
  loginLinkBtn: {
    backgroundColor: C.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D8D0FA',
  },
  loginLinkText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  /* Form Modal Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: { flex: 1 },
  modalSheetContainer: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: C.border,
    padding: 22,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetHeaderInfo: { flex: 1, gap: 4 },
  roleBadgeHeader: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleBadgeHeaderText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  closeSheetBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrapper: { marginBottom: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },
  countryPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagEmoji: { fontSize: 16 },
  countryCode: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.border,
  },
  citySelectText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: C.textSub,
    lineHeight: 18,
  },
  termsHighlight: {
    color: C.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  /* City Modal */
  cityModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cityModalContent: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  cityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cityModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  cityItemSelected: {
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  cityName: {
    fontSize: 15,
    color: C.text,
    fontWeight: '500',
  },
  cityNameSelected: {
    color: C.primary,
    fontWeight: '700',
  },

  /* Language Modal */
  langModalBackdrop: {
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
    paddingVertical: 13,
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
