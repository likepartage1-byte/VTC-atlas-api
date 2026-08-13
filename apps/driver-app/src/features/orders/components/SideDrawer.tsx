import React, { memo, useState, useEffect } from 'react';
import { useVehicleMode } from '../../../hooks/useVehicleMode';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  I18nManager,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Home,
  Car,
  Bike,
  Package,
  Globe,
  FileText,
  Settings,
  HelpCircle,
  Star,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  User,
  Moon,
  Navigation,
  CreditCard,
  MessageSquare,
  Bell,
  Clock,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { api } from '../../../api/axios.instance';
import { useAppModeStore } from '../../../store/useAppModeStore';
import { navigationRef } from '../../../navigation/navigationRef';

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_W * 0.85;

interface SideDrawerProps {
  isOpen:  boolean;
  onClose: () => void;
}

// ─── Multilingual Dictionary for SideDrawer ───────────────────────────────────
const DRAWER_TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    main: 'الرئيسية',
    services: 'الخدمات',
    management: 'الإدارة',
    support: 'الدعم والمعلومات',
    home: 'الرئيسية',
    city_trips: 'طلبات المدينة',
    trip_history: 'سجل الطلبات والرحلات',
    intercity_trips: 'الرحلات بين المدن',
    freight_cargo: 'الشحن والنقل',
    motorcycle_rides: 'طلبات الدراجة النارية',
    motorcycle_delivery: 'توصيل بالدراجة / الطرود',
    notifications: 'الإشعارات والتنبيهات',
    security: 'الأمان والسلامة',
    wallet: 'المحفظة والأرباح',
    documents: 'الوثائق الرسمية',
    my_vehicle: 'مركبتي',
    settings: 'الإعدادات والمزامنة',
    help: 'مركز المساعدة والأسئلة',
    support_chat: 'الدعم الفني والدردشة',
    rate_app: 'قيّم التطبيق',
    terms_and_privacy: 'الشروط وسياسة الخصوصية',
    language: 'اللغة',
    dark_mode: 'الوضع الداكن',
    light_mode: 'الوضع الفاتح',
    my_profile: 'ملفي الشخصي',
    lang_select_title: 'اختر اللغة',
    current_mode: 'الوضع الحالي',
    role_passenger: 'راكب',
    role_driver: 'سائق',
    switch_to_driver: '🚗 التبديل إلى وضع السائق (Mode Conducteur)',
    switch_to_passenger: '👤 التبديل إلى وضع الراكب (Mode Passager)',
    driver_registration_title: 'التسجيل كـ سائق Yalla VTC',
    driver_registration_msg: 'الانضمام كـ سائق يتطلب إدخال نوع المركبة والوثائق الرسمية. هل ترغب في التقديم والبدء الآن؟',
  },
  fr: {
    main: 'PRINCIPAL',
    services: 'SERVICES',
    management: 'GESTION',
    support: 'SUPPORT & INFOS',
    home: 'Accueil',
    city_trips: 'Courses Ville',
    trip_history: 'Historique des commandes',
    intercity_trips: 'Trajets Intervilles',
    freight_cargo: 'Fret & Transport',
    motorcycle_rides: 'Courses Moto',
    motorcycle_delivery: 'Livraison Moto / Colis',
    notifications: 'Notifications',
    security: 'Sécurité & Protection',
    wallet: 'Portefeuille & Gains',
    documents: 'Documents Officiels',
    my_vehicle: 'Mon Véhicule',
    settings: 'Paramètres & Synchro',
    help: "Centre d'aide",
    support_chat: 'Support Technique',
    rate_app: "Évaluer l'application",
    terms_and_privacy: 'CGU & Confidentialité',
    language: 'Langue',
    dark_mode: 'Mode Sombre',
    light_mode: 'Mode Clair',
    my_profile: 'Mon Profil',
    lang_select_title: 'Sélectionner la langue',
    current_mode: 'MODE ACTUEL',
    role_passenger: 'Passager',
    role_driver: 'Conducteur',
    switch_to_driver: '🚗 Passer en Mode Conducteur',
    switch_to_passenger: '👤 Passer en Mode Passager',
    driver_registration_title: 'Devenir Chauffeur Yalla VTC',
    driver_registration_msg: 'Pour devenir chauffeur, veuillez enregistrer votre véhicule et vos documents officiels. Voulez-vous commencer ?',
  },
  en: {
    main: 'MAIN',
    services: 'SERVICES',
    management: 'MANAGEMENT',
    support: 'SUPPORT & INFO',
    home: 'Home',
    city_trips: 'City Rides',
    trip_history: 'Order History',
    intercity_trips: 'Intercity Trips',
    freight_cargo: 'Freight & Cargo',
    motorcycle_rides: 'Motorcycle Rides',
    motorcycle_delivery: 'Motorcycle Delivery',
    notifications: 'Notifications',
    security: 'Safety & Security',
    wallet: 'Wallet & Income',
    documents: 'Official Documents',
    my_vehicle: 'My Vehicle',
    settings: 'Settings & Sync',
    help: 'Help Center',
    support_chat: 'Support Chat',
    rate_app: 'Rate App',
    terms_and_privacy: 'Terms & Privacy',
    language: 'Language',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    my_profile: 'My Profile',
    lang_select_title: 'Select Language',
    current_mode: 'CURRENT MODE',
    role_passenger: 'Passenger',
    role_driver: 'Driver',
    switch_to_driver: '🚗 Switch to Driver Mode',
    switch_to_passenger: '👤 Switch to Passenger Mode',
    driver_registration_title: 'Become a Yalla VTC Driver',
    driver_registration_msg: 'To become a driver, please register your vehicle and official documents. Would you like to start now?',
  },
  es: {
    main: 'PRINCIPAL',
    services: 'SERVICIOS',
    management: 'GESTIÓN',
    support: 'SOPORTE',
    home: 'Inicio',
    city_trips: 'Viajes de Ciudad',
    trip_history: 'Historial de Pedidos',
    intercity_trips: 'Viajes Interurbanos',
    freight_cargo: 'Carga y Transporte',
    motorcycle_rides: 'Viajes en Moto',
    motorcycle_delivery: 'Entrega en Moto',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    wallet: 'Billetera y Ganancias',
    documents: 'Documentos Oficiales',
    my_vehicle: 'Mi Vehículo',
    settings: 'Ajustes y Sincro',
    help: 'Centro de Ayuda',
    support_chat: 'Soporte y Chat',
    rate_app: 'Calificar App',
    terms_and_privacy: 'Términos y Privacidad',
    language: 'Idioma',
    dark_mode: 'Modo Oscuro',
    light_mode: 'Modo Claro',
    my_profile: 'Mi Perfil',
    lang_select_title: 'Seleccionar Idioma',
    current_mode: 'MODO ACTUAL',
    role_passenger: 'Pasajero',
    role_driver: 'Conductor',
    switch_to_driver: '🚗 Cambiar a Modo Conductor',
    switch_to_passenger: '👤 Cambiar a Modo Pasajero',
    driver_registration_title: 'Convertirse en Conductor',
    driver_registration_msg: 'Para convertirse en conductor, registre su vehículo y documentos oficiales. ¿Desea comenzar?',
  },
};

const getDrawerTr = (key: string, l: string) =>
  DRAWER_TRANSLATIONS[l]?.[key] ?? DRAWER_TRANSLATIONS['ar']?.[key] ?? key;

export const SideDrawer = memo(({ isOpen, onClose }: SideDrawerProps) => {
  const navigation   = useNavigation<any>();
  const { i18n } = useTranslation();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const { activeMode, isDriverEligible, setActiveMode } = useAppModeStore();

  const [langSheetVisible, setLangSheetVisible] = useState(false);
  const isRTL = i18n.language === 'ar';
  const lang  = (i18n.language || 'ar').slice(0, 2);

  const translateX = useSharedValue(-DRAWER_WIDTH);

  const [driverName, setDriverName] = useState('');
  const [rating, setRating] = useState('4.96');

  // ── Vehicle Mode: determines which menu items to show ──────────────────────
  const { isMotorcycleMode } = useVehicleMode();

  useEffect(() => {
    if (isOpen) {
      api.get('/driver/profile')
        .then(res => {
          if (res.data?.driver) {
            setDriverName(res.data.driver.name || res.data.driver.user?.fullName || '');
            if (res.data.driver.rating !== undefined && res.data.driver.rating !== null) {
              setRating(Number(res.data.driver.rating).toFixed(2));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSwitchRole = async (targetRole: 'DRIVER' | 'PASSENGER') => {
    if (targetRole === 'DRIVER' && !isDriverEligible) {
      onClose();
      const { getDriverVerificationState } = await import('../../../services/driverVerificationGuard.service');
      const state = await getDriverVerificationState();

      if (state.vehicleVerificationPercentage < 100) {
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('SelectVehicleType');
          } else {
            navigation.navigate('SelectVehicleType');
          }
        }, 150);
      } else if (state.documentVerificationPercentage < 100) {
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Documents');
          } else {
            navigation.navigate('Documents');
          }
        }, 150);
      } else {
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Dashboard');
          } else {
            navigation.navigate('Dashboard');
          }
        }, 150);
      }
      return;
    }

    await setActiveMode(targetRole);
    await AsyncStorage.setItem('@user_active_role', targetRole);
    onClose();
  };

  useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 22, stiffness: 120 })
      : withTiming(-DRAWER_WIDTH, { duration: 240 });
  }, [isOpen]);

  const drawerStyle     = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const backdropOpacity = useAnimatedStyle(() => ({ opacity: withTiming(isOpen ? 1 : 0, { duration: 220 }) }));

  const handleNotificationsPress = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        '🔔 الإشعارات والتنبيهات',
        '• مرحباً بك في تطبيق Yalla VTC! تم تفعيل حسابك بنجاح.\n\n• تم تفعيل خاصية التتبع والمراقبة الفورية للأمان والسلامة أثناء الرحلات.\n\n• استمتع بتجربة تنقل سلسة وآمنة في جميع مدن المغرب.',
        [{ text: 'حسناً 👍', style: 'default' }]
      );
    }, 250);
  };

  const handleRateAppPress = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        '⭐ تقييم تطبيق Yalla VTC',
        'يسعدنا جداً معرفة رأيك وتقييمك للتطبيق لتقديم أفضل خدمة VTC وتنقل في المغرب!',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: '★★★★★ ممتاز 5/5',
            onPress: () => {
              Alert.alert(
                '🎉 شكراً جزيلاً!',
                'نشكرك على تقييمك الممتاز ودعمك لتطبيق Yalla VTC 🚀'
              );
            },
          },
        ]
      );
    }, 250);
  };

  const handleSecurityPress = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        '🛡️ الأمان والسلامة',
        'جميع الرحلات في Yalla VTC مؤمنة ومراقبة بنظام التتبع الجغرافي الحي، مع إمكانية مشاركة تفاصيل الرحلة مع عائلتك وزر الطوارئ المباشر.',
        [{ text: 'فهمت 👍', style: 'default' }]
      );
    }, 250);
  };

  const handleLangSelect = async (langCode: string) => {
    setLangSheetVisible(false);
    onClose();
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);
    const nextIsRTL = langCode === 'ar';
    if (I18nManager.isRTL !== nextIsRTL) {
      I18nManager.allowRTL(nextIsRTL);
      I18nManager.forceRTL(nextIsRTL);
    }
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'es': return 'Español';
      default:   return 'Français';
    }
  };

  const goTo = (screen: string) => {
    try { onClose(); navigation.navigate(screen); }
    catch (e) { console.error('[DRAWER] nav error:', e); }
  };

  // Arrow direction follows language: ChevronRight for LTR, ChevronLeft for RTL
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // ── Section header component ─────────────────────────────────────────────
  const SectionHeader = ({ labelKey }: { labelKey: string }) => (
    <View style={[styles.sectionHeader]}>
      <Text style={[styles.sectionHeaderText, { color: colors.textMuted }]}>
        {getDrawerTr(labelKey, lang)}
      </Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );

  // ── Single menu row component ────────────────────────────────────────────
  const MenuItem = ({ IconComp, labelKey, onPress }: { IconComp: any; labelKey: string; onPress: () => void }) => {
    const labelText = getDrawerTr(labelKey, lang);
    return (
      <TouchableOpacity
        style={[
          styles.menuRow,
          {
            borderBottomColor: colors.surfaceAlt,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.menuIconWrap}>
          <IconComp size={20} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.menuLabel,
            {
              color: colors.textPrimary,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          numberOfLines={1}
        >
          {labelText}
        </Text>
        <Chevron size={16} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>

        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropOpacity]} />
        </TouchableWithoutFeedback>

        {/* Drawer Panel */}
        <Animated.View
          style={[
            styles.drawer,
            drawerStyle,
            { backgroundColor: colors.surface },
            I18nManager.isRTL
              ? { right: 0, left: undefined, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderTopRightRadius: 0, borderBottomRightRadius: 0 }
              : { left: 0, right: undefined, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

            {/* ── Profile Header ─────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.profileHeader, isRTL && styles.profileHeaderRTL, { borderBottomColor: colors.surfaceAlt }]}
              activeOpacity={0.7}
              onPress={() => { onClose(); navigation.navigate('Profile'); }}
            >
              <View style={[styles.profileHeaderLeft, isRTL && styles.profileHeaderLeftRTL]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
                  <User size={26} color={colors.primary} />
                </View>
                <View style={[styles.profileInfo, isRTL && styles.profileInfoRTL]}>
                  <Text style={[styles.driverName, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {driverName || getDrawerTr('my_profile', lang)}
                  </Text>
                  {activeMode === 'DRIVER' && (
                    <Text style={[styles.rating, { textAlign: isRTL ? 'right' : 'left' }]}>⭐ {rating}</Text>
                  )}
                </View>
              </View>
              <Chevron size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* ── Role Switcher (Segmented Control) ────────────────────── */}
            <View style={styles.roleSection}>
              <Text style={[styles.roleSectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {getDrawerTr('current_mode', lang)}
              </Text>
              <View style={[styles.roleContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.roleSegment,
                    activeMode === 'PASSENGER' && styles.roleSegmentActive,
                  ]}
                  onPress={() => handleSwitchRole('PASSENGER')}
                >
                  <Text style={[
                    styles.roleSegmentText,
                    { color: activeMode === 'PASSENGER' ? '#000000' : colors.textMuted }
                  ]}>
                    {getDrawerTr('role_passenger', lang)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.roleSegment,
                    activeMode === 'DRIVER' && styles.roleSegmentActive,
                  ]}
                  onPress={() => handleSwitchRole('DRIVER')}
                >
                  <Text style={[
                    styles.roleSegmentText,
                    { color: activeMode === 'DRIVER' ? '#000000' : colors.textMuted }
                  ]}>
                    {getDrawerTr('role_driver', lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ══════════════════════════════════
                1. SERVICES (Filtered for Passenger & Driver)
            ══════════════════════════════════ */}
            <SectionHeader labelKey="services" />
            <View style={styles.menuList}>
              {activeMode === 'PASSENGER' ? (
                <>
                  <MenuItem IconComp={Car}        labelKey="city_trips"          onPress={() => goTo('PassengerHome')} />
                  <MenuItem IconComp={Clock}      labelKey="trip_history"        onPress={() => goTo('TripHistory')} />
                  <MenuItem IconComp={Bike}       labelKey="motorcycle_delivery" onPress={() => goTo('PassengerHome')} />
                  <MenuItem IconComp={Navigation} labelKey="intercity_trips"     onPress={() => goTo('IntercityTrips')} />
                  <MenuItem IconComp={Package}    labelKey="freight_cargo"       onPress={() => goTo('FreightCargo')} />
                </>
              ) : isMotorcycleMode ? (
                <MenuItem IconComp={Bike} labelKey="city_trips" onPress={() => goTo('Dashboard')} />
              ) : (
                <>
                  <MenuItem IconComp={Car}        labelKey="city_trips"       onPress={() => goTo('Dashboard')} />
                  <MenuItem IconComp={Navigation} labelKey="intercity_trips"  onPress={() => goTo('IntercityTrips')} />
                  <MenuItem IconComp={Package}    labelKey="freight_cargo"    onPress={() => goTo('FreightCargo')} />
                </>
              )}
            </View>

            {/* ══════════════════════════════════
                2. MANAGEMENT (DRIVER ONLY)
            ══════════════════════════════════ */}
            {activeMode === 'DRIVER' && (
              <>
                <SectionHeader labelKey="management" />
                <View style={styles.menuList}>
                  <MenuItem IconComp={CreditCard}                     labelKey="wallet"     onPress={() => goTo('Wallet')} />
                  <MenuItem IconComp={FileText}                       labelKey="documents"  onPress={() => goTo('Documents')} />
                  <MenuItem IconComp={isMotorcycleMode ? Bike : Car} labelKey="my_vehicle" onPress={() => goTo(isMotorcycleMode ? 'MotorcycleInfo' : 'VehicleInfo')} />
                  <MenuItem IconComp={Settings}                       labelKey="settings"   onPress={() => goTo('Settings')} />
                </View>
              </>
            )}

            {/* ══════════════════════════════════
                3. SUPPORT & INFORMATION
            ══════════════════════════════════ */}
            <SectionHeader labelKey="support" />
            <View style={styles.menuList}>
              <MenuItem IconComp={Bell}         labelKey="notifications"     onPress={handleNotificationsPress} />
              <MenuItem IconComp={ShieldCheck}  labelKey="security"          onPress={handleSecurityPress} />
              {activeMode === 'PASSENGER' && (
                <MenuItem IconComp={Settings}   labelKey="settings"          onPress={() => goTo('Settings')} />
              )}
              <MenuItem IconComp={HelpCircle}    labelKey="help"              onPress={() => goTo('HelpCenter')} />
              <MenuItem IconComp={MessageSquare} labelKey="support_chat"     onPress={() => goTo('SupportChat')} />
              <MenuItem IconComp={Star}          labelKey="rate_app"         onPress={handleRateAppPress} />
              <MenuItem IconComp={FileText}      labelKey="terms_and_privacy" onPress={() => goTo('TermsOfService')} />
            </View>

            {/* ── Preferences: Language & Dark Mode ───────────── */}
            <View style={[styles.prefsSection, { borderTopColor: colors.surfaceAlt, borderBottomColor: colors.surfaceAlt }]}>

              {/* Language row */}
              <TouchableOpacity
                style={[styles.prefRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                activeOpacity={0.7}
                onPress={() => setLangSheetVisible(true)}
              >
                <View style={styles.menuIconWrap}>
                  <Globe size={20} color={colors.primary} />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  numberOfLines={1}
                >
                  {getDrawerTr('language', lang)}
                </Text>
                <Text style={[styles.prefValue, { color: colors.primary }]}>
                  {getLanguageName(i18n.language)}
                </Text>
              </TouchableOpacity>

              {/* Dark Mode row */}
              <TouchableOpacity
                style={[styles.prefRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                activeOpacity={0.7}
                onPress={toggleTheme}
              >
                <View style={styles.menuIconWrap}>
                  <Moon size={20} color={colors.primary} />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  numberOfLines={1}
                >
                  {isDarkMode ? getDrawerTr('dark_mode', lang) : getDrawerTr('light_mode', lang)}
                </Text>
                <View style={[styles.toggleCapsule, { backgroundColor: isDarkMode ? colors.primary + '22' : colors.surfaceAlt }]}>
                  <Text style={[styles.toggleText, { color: isDarkMode ? colors.primary : colors.textMuted }]}>
                    {isDarkMode ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>

            </View>

            {/* Prominent inDrive-style Action Button for Driver Mode Switch */}
            <TouchableOpacity
              style={[
                styles.prominentRoleBtn,
                { backgroundColor: activeMode === 'PASSENGER' ? '#CCFF00' : colors.primary }
              ]}
              activeOpacity={0.85}
              onPress={() => handleSwitchRole(activeMode === 'PASSENGER' ? 'DRIVER' : 'PASSENGER')}
            >
              <Text style={[
                styles.prominentRoleBtnText,
                { color: activeMode === 'PASSENGER' ? '#000000' : '#FFFFFF' }
              ]}>
                {getDrawerTr(activeMode === 'PASSENGER' ? 'switch_to_driver' : 'switch_to_passenger', lang)}
              </Text>
            </TouchableOpacity>

            {/* ── Footer ──────────────────────────────────────── */}
            <View style={styles.footer}>
              <Text style={[styles.version, { color: colors.textMuted }]}>Yalla VTC • v1.0.0</Text>
            </View>

          </ScrollView>
        </Animated.View>

        {/* ── Language Bottom Sheet ────────────────────────────── */}
        <Modal visible={langSheetVisible} transparent animationType="slide" onRequestClose={() => setLangSheetVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setLangSheetVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                  <View style={[styles.modalHandle, { backgroundColor: colors.surfaceAlt }]} />
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {getDrawerTr('lang_select_title', lang)}
                  </Text>
                  {(['ar', 'fr', 'en', 'es'] as const).map((code) => (
                    <TouchableOpacity
                      key={code}
                      style={[styles.langOption, { borderBottomColor: colors.surfaceAlt }]}
                      activeOpacity={0.7}
                      onPress={() => handleLangSelect(code)}
                    >
                      <Text style={[styles.langOptionText, { color: code === i18n.language ? colors.primary : colors.textPrimary }]}>
                        {getLanguageName(code)}
                      </Text>
                      {code === i18n.language && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.60)', zIndex: 9999 },

  drawer: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: DRAWER_WIDTH, zIndex: 10000,
    shadowColor: '#000', shadowOffset: { width: 6, height: 0 }, shadowOpacity: 0.30, shadowRadius: 20, elevation: 25,
  },

  scrollContent: { flexGrow: 1, paddingTop: 52, paddingBottom: 30 },

  /* Profile */
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, marginBottom: 4 },
  profileHeaderRTL:     { flexDirection: 'row-reverse' },
  profileHeaderLeft:    { flexDirection: 'row', alignItems: 'center' },
  profileHeaderLeftRTL: { flexDirection: 'row-reverse' },
  avatar:       { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  profileInfo:    { marginLeft: 12 },
  profileInfoRTL: { marginLeft: 0, marginRight: 12 },
  driverName: { fontSize: 15, fontWeight: '800' },
  rating:     { fontSize: 12, color: '#F59E0B', fontWeight: '700', marginTop: 2 },

  /* Role Switcher */
  roleSection: { paddingHorizontal: 20, marginTop: 12, marginBottom: 8 },
  roleSectionTitle: { fontSize: 11, fontWeight: '800', marginBottom: 6, letterSpacing: 0.8 },
  roleContainer: { flexDirection: 'row', borderRadius: 16, padding: 3, borderWidth: 1 },
  roleSegment: { flex: 1, paddingVertical: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  roleSegmentActive: { backgroundColor: '#E5B80B', shadowColor: '#E5B80B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  roleSegmentText: { fontSize: 13, fontWeight: '800' },

  /* Section Header */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 2, gap: 8 },
  sectionHeaderText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  sectionLine:       { flex: 1, height: 1 },

  /* Menu — always LTR: ICON → NAME → ARROW */
  menuList:     { paddingHorizontal: 20 },
  menuRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  menuIconWrap: { width: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuLabel:    { flex: 1, fontSize: 14, fontWeight: '600', marginHorizontal: 10 },

  /* Preferences */
  prefsSection: { marginTop: 18, paddingHorizontal: 20, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 4 },
  prefRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  prefValue:  { fontSize: 13, fontWeight: '700' },
  toggleCapsule: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  toggleText:    { fontSize: 11, fontWeight: '800' },

  /* Prominent Role Switcher Button (inDrive style) */
  prominentRoleBtn: {
    height: 52,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  prominentRoleBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Footer */
  footer:  { paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },
  version: { fontSize: 10 },

  /* Lang Sheet */
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:     { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, paddingHorizontal: 24, paddingTop: 12 },
  modalHandle:    { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:     { fontSize: 16, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  langOption:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  langOptionText: { fontSize: 15, fontWeight: '700' },
  activeDot:      { width: 8, height: 8, borderRadius: 4 },
});
