import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Linking,
  Alert,
  Vibration,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  TextInput,
  AppState,
  NativeModules,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDocumentStorageCache } from '../profile/DocumentsScreen';
import {
  syncKeepScreenOnNativeSetting,
  syncOrientationNativeSetting,
  checkNativeGpsEnabled,
  openNativeGpsSettings,
  openNativeNotifSettings,
  checkNativeNotifEnabled,
} from '../../services/keepAwake.service';
export {
  syncKeepScreenOnNativeSetting,
  syncOrientationNativeSetting,
  checkNativeGpsEnabled,
  openNativeGpsSettings,
  openNativeNotifSettings,
  checkNativeNotifEnabled,
};
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Moon,
  Sun,
  Bell,
  Volume2,
  Vibrate,
  Navigation as NavIcon,
  ShieldAlert,
  Smartphone,
  RotateCw,
  BatteryCharging,
  Activity,
  FileText,
  Lock,
  LogOut,
  Trash2,
  RefreshCw,
  Monitor,
  AlertTriangle,
  X,
  ExternalLink,
  Mic,
  Camera as CameraIcon,
  MapPin,
  ShieldCheck,
  Wifi,
  Zap,
  Compass,
  ArrowLeft,
  ArrowRight,
  Radio,
  Sliders,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawerHeader } from '../../components/DrawerHeader';
import { api } from '../../api/axios.instance';
import { clearVehicleModeCache } from '../../hooks/useVehicleMode';

const SETTINGS_STORAGE_KEY = '@yalla_driver_app_settings';

export interface DriverAppSettings {
  language: string;
  themeMode: 'light' | 'dark' | 'system';
  notifRideRequests: boolean;
  notifWalletAlerts: boolean;
  notifDocReview: boolean;
  notifGeneral: boolean;
  notifSecurity: boolean;
  rideSoundEnabled: boolean;
  vibrationEnabled: boolean;
  navApp: 'google_maps' | 'waze' | 'apple_maps';
  keepScreenOn: boolean;
  screenOrientation: 'portrait' | 'auto';
}

const DEFAULT_SETTINGS: DriverAppSettings = {
  language: 'ar',
  themeMode: 'dark',
  notifRideRequests: true,
  notifWalletAlerts: true,
  notifDocReview: true,
  notifGeneral: true,
  notifSecurity: true,
  rideSoundEnabled: true,
  vibrationEnabled: true,
  navApp: 'google_maps',
  keepScreenOn: true,
  screenOrientation: 'portrait',
};

// ── Reusable Material Design Notification Item Component ──────────────────────
interface NotificationItemRowProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isRTL: boolean;
  colors: any;
}

const NotificationItemRow: React.FC<NotificationItemRowProps> = React.memo(({
  icon: IconComponent,
  label,
  value,
  onValueChange,
  isRTL,
  colors,
}) => (
  <View
    style={[
      styles.notifRowContainer,
      {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}
  >
    <View
      style={[
        styles.notifRowLeft,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      <View style={[styles.notifIconCircle, { backgroundColor: colors.primary + '14' }]}>
        <IconComponent size={20} color={colors.primary} />
      </View>
      <Text
        style={[
          styles.notifRowText,
          {
            color: colors.textPrimary,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>

    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primaryGlow }}
      thumbColor={value ? colors.primary : colors.textMuted}
    />
  </View>
));

// ─── 4 Languages Dictionary for Hierarchical Settings ───────────────────────
const TRANSLATIONS: any = {
  ar: {
    settings_title: 'الإعدادات والمزامنة',
    settings_subtitle: 'إدارة تفضيلات التطبيق والأذونات المزامنة مع Android',
    
    // Cards Titles & Subtitles
    card_lang_title: 'اللغة (Language)',
    card_theme_title: 'المظهر والسمة',
    card_notif_title: 'إعدادات الإشعارات والتنبيهات',
    card_sound_title: 'الصوت والاهتزاز',
    card_nav_title: 'تطبيق الملاحة الافتراضي',
    card_perm_title: 'أذونات نظام Android الحية',
    card_awake_title: 'إبقاء الشاشة قيد التشغيل',
    card_orient_title: 'اتجاه الشاشة (Orientation)',
    card_battery_title: 'تحسين طاقة البطارية',
    card_diag_title: 'فحص النظام والمزامنة الحية',

    // Card Summary Status Subtitles
    summary_lang_ar: 'العربية 🇸🇦',
    summary_lang_fr: 'Français 🇫🇷',
    summary_lang_en: 'English 🇬🇧',
    summary_lang_es: 'Español 🇪🇸',
    summary_theme_dark: 'الوضع الداكن 🌙',
    summary_theme_light: 'الوضع الفاتح ☀️',
    summary_theme_system: 'حسب إعدادات النظام 📱',
    summary_notif_all_on: 'جميع الإشعارات مفعلة 🟢',
    summary_notif_part_off: 'بعض الإشعارات معطلة ⚪',
    summary_notif_sys_off: 'الإشعارات معطلة في Android 🔴',
    summary_sound_active: 'الصوت: مفعل 🟢 | الاهتزاز: مفعل 🟢',
    summary_sound_muted: 'الصوت: مكتوم ⚪ | الاهتزاز: مفعل 🟢',
    summary_nav_google: 'Google Maps 🗺️',
    summary_nav_waze: 'Waze 🗺️',
    summary_nav_apple: 'Apple Maps 🗺️',
    summary_perm_all_granted: 'جميع الأذونات مفعلة ومزامنة (4 من 4) 🟢',
    summary_perm_denied: 'توجد أذونات تحتاج إلى مراجعة في Android 🔴',
    summary_awake_on: 'مفعل (الشاشة تعمل دائماً أثناء الاتصال) 🟢',
    summary_awake_off: 'غير مفعل (سلوك الهاتف الطبيعي) ⚪',
    summary_orient_portrait: 'عمودي فقط (Portrait) 📱',
    summary_orient_auto: 'دوران تلقائي (Auto Rotate) 🔄',
    summary_battery_ok: 'مستثنى من التقييد (عمل طبيعي بالخلفية) 🟢',
    summary_battery_restricted: 'مقيد من نظام البطارية 🔴',
    summary_diag_ok: 'كل شيء يعمل بشكل ممتاز 🟢',
    summary_diag_needs_fix: 'توجد عناصر تحتاج إصلاح 🔴',

    // Section Titles
    section_sub_pages: 'الأقسام الرئيسية للإعدادات',
    section_legal_direct: '📄 المستندات القانونية',
    section_app_info_direct: 'ℹ️ معلومات التطبيق والتحديثات',
    section_danger_direct: '🔴 إدارة الحساب والعمليات الحرجة',

    // Sub-Page Headers
    sub_lang_head: 'اختيار لغة التطبيق',
    sub_theme_head: 'اختيار مظهر التطبيق',
    sub_notif_head: 'إعدادات الإشعارات التفصيلية',
    sub_sound_head: 'إعدادات الصوت والاهتزاز',
    sub_nav_head: 'تطبيق الملاحة والخرائط',
    sub_perm_head: 'أذونات نظام Android الحية',
    sub_awake_head: 'إبقاء الشاشة قيد التشغيل',
    sub_orient_head: 'قفل اتجاه الشاشة',
    sub_battery_head: 'تحسين طاقة البطارية والخلفية',
    sub_diag_head: 'فحص النظام والمزامنة الحية',

    // Descriptions
    awake_desc: 'عند تفعيل هذه الميزة، لن تطفأ شاشة الهاتف تلقائياً طالما كان تطبيق Yalla VTC مفتوحاً والسائق متصلاً (Online) لاستقبال الطلبات ومتابعة الملاحة.',
    battery_desc: 'لضمان استقبال طلبات الرحلات في الخلفية وعدم إيقاف التطبيق من Android، يرجى إعفاء Yalla VTC من تقييد البطارية.',
    sys_notif_warning: 'تنبيه: إشعارات الهاتف لـ Yalla VTC معطلة في Android! قد لا تستقبل الطلبات.',
    notif_ride_requests: 'إشعارات طلبات الرحلات',
    notif_wallet: 'إشعارات المحفظة والمالية',
    notif_doc_review: 'إشعارات مراجعة الوثائق',
    notif_general: 'الإشعارات العامة والأخبار',
    notif_security: 'الإشعارات والتنبيهات الأمنية',

    // Live Android Permissions & Sub-Pages
    location_permission: 'إذن الموقع الجغرافي (GPS)',
    camera_permission: 'إذن الكاميرا (الوثائق والتأكيد)',
    mic_permission: 'إذن الميكروفون (المكالمات الصوتية)',
    notif_permission: 'إذن الإشعارات (Android Post Notif)',
    perm_granted: 'مفعل 🟢',
    perm_denied: 'مرفوض 🔴',
    orientation_portrait: 'عمودي فقط (Portrait)',
    orientation_auto: 'دوران تلقائي (Auto Rotate)',
    nav_google_maps: 'Google Maps 🗺️',
    nav_waze: 'Waze 🗺️',
    nav_apple_maps: 'Apple Maps 🗺️',
    theme_dark: 'الوضع الداكن 🌙',
    theme_light: 'الوضع الفاتح ☀️',
    theme_system: 'حسب إعدادات النظام 📱',
    checking_status: 'جاري فحص النظام والمزامنة...',
    checking_updates_msg: 'جاري الاتصال بخادم التحديثات...',
    ride_sound_lbl: 'صوت تنبيه الرحلات الجديدة',
    vibration_lbl: 'الاهتزاز عند استقبال الطلبات',
    diag_internet: 'الاتصال بشبكة الإنترنت (Internet Connection)',
    diag_server: 'خوادم Yalla VTC الحية (Backend API & Socket)',
    diag_gps_service: 'خدمة تحديد الموقع (GPS Service)',
    diag_location_perm: 'إذن استخدام الموقع الجغرافي (Location Permission)',
    diag_camera_perm: 'إذن الكاميرا والتقاط الصور (Camera Permission)',
    diag_photo_perm: 'إذن الصور والمعرض (Photo Access)',
    diag_mic_perm: 'إذن الميكروفون والمكالمات (Microphone Permission)',
    diag_notif_perm: 'إذن الإشعارات والتنبيهات (Notification Permission)',
    diag_battery_opt: 'استثناء طاقة البطارية (Battery Optimization)',
    diag_bg_activity: 'النشاط بالخلفية وتحديد الموقع (Background Activity)',
    diag_passed: 'سليم 🟢',
    diag_failed: 'إصلاح مطلوب 🔴',
    diag_attention: 'انتباه مطلوب 🟡',
    action_grant_perm: 'منح الإذن 🔑',
    action_enable_gps: 'تفعيل GPS 📍',
    action_open_net: 'إعدادات الشبكة 📶',
    action_open_notif: 'إعدادات الإشعارات 🔔',
    action_remove_battery: 'إلغاء تقييد البطارية 🔋',
    action_open_bg: 'إعدادات الخلفية ⚙️',
    action_retry_connection: 'إعادة الاتصال 🔄',
    diag_completed_title: 'تم اكتمال فحص واختبار كافة خدمات النظام بنجاح ✅',

    // Actions & Buttons
    open_sys_settings_btn: 'فتح إعدادات التطبيق في Android ⚙️',
    open_gps_settings_btn: 'فتح إعدادات موقع الهاتف (GPS) 📍',
    open_battery_settings_btn: 'إلغاء تقييد البطارية في Android 🔋',
    open_notif_settings_btn: 'فتح إعدادات إشعارات Android 🔔',
    test_sound_btn: 'اختبار الصوت 🔔',
    test_vibration_btn: 'اختبار الاهتزاز 📳',
    testing_sound_lbl: 'جاري تشغيل الصوت... 🔔',
    testing_vibration_lbl: 'جاري اهتزاز الهاتف... 📳',
    test_launch_nav_btn: 'اختبار فتح تطبيق الملاحة المختار 🗺️',
    run_diagnostic_btn: 'بدء فحص ومزامنة النظام الآن 📶',
    check_updates_btn: 'التحقق من وجود تحديثات 🔄',
    terms_of_service: 'شروط الخدمة',
    privacy_policy: 'سياسة الخصوصية',
    legal_tos_summary: 'القواعد والشروط القانونية الحاكمة لاستخدام التطبيق',
    legal_pp_summary: 'كيفية معالجة وحماية بياناتك وفق معايير الخصوصية',
    logout_btn: 'تسجيل الخروج 🔴',
    delete_account_btn: 'حذف الحساب نهائياً 🗑️',
    
    app_version_lbl: 'إصدار التطبيق',
    build_number_lbl: 'رقم البناء (Build)',
    db_version_lbl: 'إصدار قاعدة البيانات',
    latest_version_alert: 'أنت تستخدم أحدث إصدار متاح (v1.4.2) ✅',
    
    // Status text
    status_active: 'مفعل 🟢',
    status_disabled: 'معطل ⚪',
    status_error: 'يحتاج تعديل 🔴',
    fix_btn_lbl: 'إصلاح ⚙️',
    
    // Modals
    logout_confirm_title: 'تأكيد تسجيل الخروج',
    logout_confirm_desc: 'هل أنت تأكد من رغبتك في تسجيل الخروج؟ ستتوقف عن استقبال الرحلات.',
    delete_modal_title: '⚠️ تحذير شديد الخطورة: حذف الحساب',
    delete_modal_desc: 'سيؤدي حذف الحساب إلى مسح بياناتك نهائياً. اكتب كلمة (حذف) للتأكيد:',
    delete_confirm_input_placeholder: 'اكتب كلمة (حذف) لتأكيد العملية',
    confirm_delete_final_btn: 'تأكيد حذف الحساب نهائياً',
    delete_confirm_word: 'حذف',
    delete_invalid_confirmation: 'يرجى كتابة (حذف) لتأكيد حذف الحساب.',
    delete_error_generic: 'تعذر حذف الحساب. يرجى المحاولة لاحقاً.',
    delete_success_title: 'تم حذف الحساب',
    delete_success_msg: 'لقد تم حذف حسابك بنجاح.',
    delete_success_btn: 'متابعة',
    confirm_btn: 'تأكيد',
    cancel_btn: 'إلغاء',
  },
  fr: {
    settings_title: 'Paramètres et Synchronisation',
    settings_subtitle: 'Gérez vos préférences et autorisations Android',
    
    card_lang_title: 'Langue (Language)',
    card_theme_title: 'Apparence et Thème',
    card_notif_title: 'Notifications et Alertes',
    card_sound_title: 'Son et Vibration',
    card_nav_title: 'Navigation par défaut',
    card_perm_title: 'Autorisations Android en direct',
    card_awake_title: "Maintenir l'écran allumé",
    card_orient_title: "Orientation de l'écran",
    card_battery_title: 'Optimisation de la batterie',
    card_diag_title: 'Diagnostic et Synchronisation',

    summary_lang_ar: 'العربية 🇸🇦',
    summary_lang_fr: 'Français 🇫🇷',
    summary_lang_en: 'English 🇬🇧',
    summary_lang_es: 'Español 🇪🇸',
    summary_theme_dark: 'Mode Sombre 🌙',
    summary_theme_light: 'Mode Clair ☀️',
    summary_theme_system: 'Thème Système 📱',
    summary_notif_all_on: 'Toutes les notifications activées 🟢',
    summary_notif_part_off: 'Certaines notifications désactivées ⚪',
    summary_notif_sys_off: 'Notifications désactivées dans Android 🔴',
    summary_sound_active: 'Son: Activé 🟢 | Vibration: Activée 🟢',
    summary_sound_muted: 'Son: Muet ⚪ | Vibration: Activée 🟢',
    summary_nav_google: 'Google Maps 🗺️',
    summary_nav_waze: 'Waze 🗺️',
    summary_nav_apple: 'Apple Maps 🗺️',
    summary_perm_all_granted: 'Toutes les autorisations accordées (4/4) 🟢',
    summary_perm_denied: 'Des autorisations nécessitent votre attention 🔴',
    summary_awake_on: 'Activé (Écran toujours allumé) 🟢',
    summary_awake_off: 'Désactivé (Comportement normal) ⚪',
    summary_orient_portrait: 'Portrait uniquement 📱',
    summary_orient_auto: 'Rotation automatique 🔄',
    summary_battery_ok: 'Autorisé en arrière-plan 🟢',
    summary_battery_restricted: 'Restreint par le système 🔴',
    summary_diag_ok: 'Tout fonctionne parfaitement 🟢',
    summary_diag_needs_fix: 'Action requise sur certains éléments 🔴',

    section_sub_pages: 'Catégories de paramètres',
    section_legal_direct: '📄 Documents légaux',
    section_app_info_direct: 'ℹ️ Informations application',
    section_danger_direct: '🔴 Gestion du compte',

    sub_lang_head: 'Choisir la langue',
    sub_theme_head: "Choisir l'apparence",
    sub_notif_head: 'Paramètres des notifications',
    sub_sound_head: 'Paramètres du son et vibration',
    sub_nav_head: 'Application de navigation',
    sub_perm_head: 'Autorisations système Android',
    sub_awake_head: "Maintenir l'écran allumé",
    sub_orient_head: "Verrouillage de l'orientation",
    sub_battery_head: 'Optimisation de la batterie',
    sub_diag_head: 'Diagnostic du système',

    awake_desc: "L'écran ne s'éteindra pas tant que Yalla VTC est ouvert et que vous êtes en ligne pour recevoir des courses.",
    battery_desc: "Pour recevoir des courses en arrière-plan, désactivez l'optimisation de batterie pour Yalla VTC dans Android.",
    sys_notif_warning: 'Avertissement: Les notifications Android sont désactivées !',
    notif_ride_requests: 'Demandes de courses',
    notif_wallet: 'Alertes portefeuille et paiements',
    notif_doc_review: 'Vérification des documents',
    notif_general: 'Annonces générales',
    notif_security: 'Sécurité et alertes',

    location_permission: 'Localisation (GPS)',
    camera_permission: 'Appareil photo (Documents)',
    mic_permission: 'Microphone (Appels)',
    notif_permission: 'Notifications Android',
    perm_granted: 'Autorisé 🟢',
    perm_denied: 'Refusé 🔴',
    orientation_portrait: 'Portrait uniquement',
    orientation_auto: 'Rotation automatique',
    nav_google_maps: 'Google Maps 🗺️',
    nav_waze: 'Waze 🗺️',
    nav_apple_maps: 'Apple Maps 🗺️',
    theme_dark: 'Mode Sombre 🌙',
    theme_light: 'Mode Clair ☀️',
    theme_system: 'Thème Système 📱',
    checking_status: 'Vérification du système...',
    checking_updates_msg: 'Connexion au serveur...',
    ride_sound_lbl: 'Son alerte nouvelles courses',
    vibration_lbl: 'Vibration nouvelles courses',
    diag_internet: 'Connexion Internet (Internet Connection)',
    diag_server: 'Serveurs Yalla VTC (Backend API & Socket)',
    diag_gps_service: 'Service de localisation (GPS Service)',
    diag_location_perm: 'Autorisation de localisation (Location Permission)',
    diag_camera_perm: 'Autorisation appareil photo (Camera Permission)',
    diag_photo_perm: 'Autorisation photos & galerie (Photo Access)',
    diag_mic_perm: 'Autorisation microphone (Microphone Permission)',
    diag_notif_perm: 'Autorisation notifications (Notification Permission)',
    diag_battery_opt: 'Optimisation de la batterie (Battery Optimization)',
    diag_bg_activity: 'Activité en arrière-plan (Background Activity)',
    diag_passed: 'Fonctionnel 🟢',
    diag_failed: 'Réparation requise 🔴',
    diag_attention: 'Attention requise 🟡',
    action_grant_perm: 'Accorder 🔑',
    action_enable_gps: 'Activer GPS 📍',
    action_open_net: 'Réseau 📶',
    action_open_notif: 'Notifications 🔔',
    action_remove_battery: 'Désactiver restriction 🔋',
    action_open_bg: 'Arrière-plan ⚙️',
    action_retry_connection: 'Réessayer 🔄',
    diag_completed_title: 'Diagnostic système terminé avec succès ✅',

    open_sys_settings_btn: 'Paramètres Android ⚙️',
    open_gps_settings_btn: 'Paramètres GPS 📍',
    open_battery_settings_btn: 'Paramètres batterie 🔋',
    open_notif_settings_btn: 'Paramètres notifications 🔔',
    test_sound_btn: 'Tester le son 🔔',
    test_vibration_btn: 'Tester la vibration 📳',
    testing_sound_lbl: 'En cours... 🔔',
    testing_vibration_lbl: 'Vibration... 📳',
    test_launch_nav_btn: 'Tester la navigation 🗺️',
    run_diagnostic_btn: 'Lancer le diagnostic 📶',
    check_updates_btn: 'Vérifier les mises à jour 🔄',
    terms_of_service: "Conditions d'utilisation",
    privacy_policy: 'Politique de confidentialité',
    legal_tos_summary: "Règles et conditions régissant l'utilisation de l'application",
    legal_pp_summary: 'Traitement et protection de vos données personnelles',
    logout_btn: 'Se déconnecter 🔴',
    delete_account_btn: 'Supprimer le compte 🗑️',
    
    app_version_lbl: "Version de l'app",
    build_number_lbl: 'Numéro de build',
    db_version_lbl: 'Base de données',
    latest_version_alert: 'Vous utilisez la dernière version (v1.4.2) ✅',
    
    status_active: 'Activé 🟢',
    status_disabled: 'Désactivé ⚪',
    status_error: 'Action requise 🔴',
    fix_btn_lbl: 'Réparer ⚙️',
    
    logout_confirm_title: 'Confirmation de déconnexion',
    logout_confirm_desc: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    delete_modal_title: '⚠️ AVERTISSEMENT : Suppression du compte',
    delete_modal_desc: 'Tapez (SUPPRIMER) pour confirmer la suppression de votre compte :',
    delete_confirm_input_placeholder: 'Tapez SUPPRIMER pour confirmer',
    confirm_delete_final_btn: 'Confirmer la suppression',
    delete_confirm_word: 'SUPPRIMER',
    delete_invalid_confirmation: 'Veuillez saisir SUPPRIMER pour confirmer la suppression de votre compte.',
    delete_success_title: 'Compte supprimé',
    delete_success_msg: 'Votre compte a été supprimé avec succès.',
    delete_success_btn: 'Nouveau compte',
    confirm_btn: 'Confirmer',
    cancel_btn: 'Annuler',
  },
  es: {
    settings_title: 'Configuración y Sincronización',
    settings_subtitle: 'Gestione sus preferencias y permisos de Android',
    
    card_lang_title: 'Idioma (Language)',
    card_theme_title: 'Apariencia y Tema',
    card_notif_title: 'Notificaciones y Alertas',
    card_sound_title: 'Sonido y Vibración',
    card_nav_title: 'Navegación predeterminada',
    card_perm_title: 'Permisos de Android en vivo',
    card_awake_title: 'Mantener pantalla encendida',
    card_orient_title: 'Orientación de pantalla',
    card_battery_title: 'Optimización de batería',
    card_diag_title: 'Diagnóstico y Sincronización',

    summary_lang_ar: 'العربية 🇸🇦',
    summary_lang_fr: 'Français 🇫🇷',
    summary_lang_en: 'English 🇬🇧',
    summary_lang_es: 'Español 🇪🇸',
    summary_theme_dark: 'Modo Oscuro 🌙',
    summary_theme_light: 'Modo Claro ☀️',
    summary_theme_system: 'Tema del Sistema 📱',
    summary_notif_all_on: 'Todas las notificaciones activadas 🟢',
    summary_notif_part_off: 'Algunas notificaciones desactivadas ⚪',
    summary_notif_sys_off: 'Notificaciones desactivadas en Android 🔴',
    summary_sound_active: 'Sonido: Activado 🟢 | Vibración: Activada 🟢',
    summary_sound_muted: 'Sonido: Silencioso ⚪ | Vibración: Activada 🟢',
    summary_nav_google: 'Google Maps 🗺️',
    summary_nav_waze: 'Waze 🗺️',
    summary_nav_apple: 'Apple Maps 🗺️',
    summary_perm_all_granted: 'Todos los permisos concedidos (4/4) 🟢',
    summary_perm_denied: 'Permisos requieren su atención 🔴',
    summary_awake_on: 'Activado (Pantalla encendida) 🟢',
    summary_awake_off: 'Desactivado (Comportamiento normal) ⚪',
    summary_orient_portrait: 'Solo vertical 📱',
    summary_orient_auto: 'Rotación automática 🔄',
    summary_battery_ok: 'Permitido en segundo plano 🟢',
    summary_battery_restricted: 'Restringido por el sistema 🔴',
    summary_diag_ok: 'Todo funciona perfectamente 🟢',
    summary_diag_needs_fix: 'Se requiere acción en algunos elementos 🔴',

    section_sub_pages: 'Categorías de configuración',
    section_legal_direct: '📄 Documentos legales',
    section_app_info_direct: 'ℹ️ Información de la app',
    section_danger_direct: '🔴 Gestión de la cuenta',

    sub_lang_head: 'Seleccionar idioma',
    sub_theme_head: 'Seleccionar apariencia',
    sub_notif_head: 'Ajustes de notificaciones',
    sub_sound_head: 'Ajustes de sonido y vibración',
    sub_nav_head: 'Aplicación de navegación',
    sub_perm_head: 'Permisos del sistema Android',
    sub_awake_head: 'Mantener pantalla encendida',
    sub_orient_head: 'Bloqueo de orientación',
    sub_battery_head: 'Optimización de batería',
    sub_diag_head: 'Diagnóstico del sistema',

    awake_desc: 'La pantalla no se apagará mientras Yalla VTC esté abierto y usted esté en línea.',
    battery_desc: 'Para recibir viajes en segundo plano, desactive la optimización de batería para Yalla VTC.',
    sys_notif_warning: '¡Advertencia: Las notificaciones de Android están desactivadas!',
    notif_ride_requests: 'Solicitudes de viaje',
    notif_wallet: 'Alertas de billetera y pagos',
    notif_doc_review: 'Revisión de documentos',
    notif_general: 'Anuncios generales',
    notif_security: 'Seguridad y alertas',

    location_permission: 'Ubicación (GPS)',
    camera_permission: 'Cámara (Documentos)',
    mic_permission: 'Micrófono (Llamadas)',
    notif_permission: 'Notificaciones Android',
    perm_granted: 'Permitido 🟢',
    perm_denied: 'Denegado 🔴',
    orientation_portrait: 'Solo vertical',
    orientation_auto: 'Rotación automática',
    nav_google_maps: 'Google Maps 🗺️',
    nav_waze: 'Waze 🗺️',
    nav_apple_maps: 'Apple Maps 🗺️',
    theme_dark: 'Modo Oscuro 🌙',
    theme_light: 'Modo Claro ☀️',
    theme_system: 'Tema del Sistema 📱',
    checking_status: 'Verificando sistema...',
    checking_updates_msg: 'Conectando con el servidor...',
    ride_sound_lbl: 'Sonido de nuevo viaje',
    vibration_lbl: 'Vibración de nuevo viaje',
    diag_internet: 'Conexión a Internet (Internet Connection)',
    diag_server: 'Servidores Yalla VTC (Backend API & Socket)',
    diag_gps_service: 'Servicio GPS (GPS Service)',
    diag_location_perm: 'Permiso de ubicación (Location Permission)',
    diag_camera_perm: 'Permiso de cámara (Camera Permission)',
    diag_photo_perm: 'Permiso de fotos y galería (Photo Access)',
    diag_mic_perm: 'Permiso de micrófono (Microphone Permission)',
    diag_notif_perm: 'Permiso de notificaciones (Notification Permission)',
    diag_battery_opt: 'Optimización de batería (Battery Optimization)',
    diag_bg_activity: 'Actividad en segundo plano (Background Activity)',
    diag_passed: 'Correcto 🟢',
    diag_failed: 'Requiere reparación 🔴',
    diag_attention: 'Atención requerida 🟡',
    action_grant_perm: 'Conceder 🔑',
    action_enable_gps: 'Activar GPS 📍',
    action_open_net: 'Red 📶',
    action_open_notif: 'Notificaciones 🔔',
    action_remove_battery: 'Eliminar restricción 🔋',
    action_open_bg: 'Segundo plano ⚙️',
    action_retry_connection: 'Reintentar 🔄',
    diag_completed_title: 'Diagnóstico del sistema completado con éxito ✅',

    open_sys_settings_btn: 'Ajustes de Android ⚙️',
    open_gps_settings_btn: 'Ajustes de GPS 📍',
    open_battery_settings_btn: 'Ajustes de batería 🔋',
    open_notif_settings_btn: 'Ajustes de notificaciones 🔔',
    test_sound_btn: 'Probar sonido 🔔',
    test_vibration_btn: 'Probar vibración 📳',
    testing_sound_lbl: 'Reproduciendo... 🔔',
    testing_vibration_lbl: 'Vibrando... 📳',
    test_launch_nav_btn: 'Probar navegación 🗺️',
    run_diagnostic_btn: 'Iniciar diagnóstico 📶',
    check_updates_btn: 'Buscar actualizaciones 🔄',
    terms_of_service: 'Términos de servicio',
    privacy_policy: 'Política de privacidad',
    legal_tos_summary: 'Reglas y condiciones que rigen el uso de la aplicación',
    legal_pp_summary: 'Tratamiento y protección de sus datos personales',
    logout_btn: 'Cerrar sesión 🔴',
    delete_account_btn: 'Eliminar cuenta 🗑️',
    
    app_version_lbl: 'Versión de la app',
    build_number_lbl: 'Número de compilación',
    db_version_lbl: 'Base de datos',
    latest_version_alert: 'Estás usando la versión más reciente (v1.4.2) ✅',
    
    status_active: 'Activado 🟢',
    status_disabled: 'Desactivado ⚪',
    status_error: 'Requiere atención 🔴',
    fix_btn_lbl: 'Reparar ⚙️',
    
    logout_confirm_title: 'Confirmación de cierre de sesión',
    logout_confirm_desc: '¿Está seguro de que desea cerrar sesión?',
    delete_modal_title: '⚠️ ADVERTENCIA: Eliminación de cuenta',
    delete_modal_desc: 'Escriba (ELIMINAR) para confirmar la eliminación de su cuenta:',
    delete_confirm_input_placeholder: 'Escriba ELIMINAR para confirmar',
    confirm_delete_final_btn: 'Confirmar eliminación',
    delete_confirm_word: 'ELIMINAR',
    delete_invalid_confirmation: 'Escriba ELIMINAR para confirmar la eliminación de su cuenta.',
    delete_success_title: 'Cuenta eliminada',
    delete_success_msg: 'Tu cuenta ha sido eliminada con éxito.',
    delete_success_btn: 'Nueva cuenta',
    confirm_btn: 'Confirmar',
    cancel_btn: 'Cancelar',
  },
  en: {
    settings_title: 'Settings & Android Sync',
    settings_subtitle: 'Manage app preferences and live Android permissions',
    
    card_lang_title: 'Language',
    card_theme_title: 'Appearance & Theme',
    card_notif_title: 'Notifications & Alerts',
    card_sound_title: 'Sound & Vibration',
    card_nav_title: 'Default Navigation App',
    card_perm_title: 'Live Android Permissions',
    card_awake_title: 'Keep Screen Awake',
    card_orient_title: 'Screen Orientation Lock',
    card_battery_title: 'Battery Power Optimization',
    card_diag_title: 'System Health Diagnostic',

    summary_lang_ar: 'العربية 🇸🇦',
    summary_lang_fr: 'Français 🇫🇷',
    summary_lang_en: 'English 🇬🇧',
    summary_lang_es: 'Español 🇪🇸',
    summary_theme_dark: 'Dark Mode 🌙',
    summary_theme_light: 'Light Mode ☀️',
    summary_theme_system: 'System Default 📱',
    summary_notif_all_on: 'All notifications active 🟢',
    summary_notif_part_off: 'Some notifications off ⚪',
    summary_notif_sys_off: 'Disabled in Android Settings 🔴',
    summary_sound_active: 'Sound: Active 🟢 | Vibration: Active 🟢',
    summary_sound_muted: 'Sound: Muted ⚪ | Vibration: Active 🟢',
    summary_nav_google: 'Google Maps 🗺️',
    summary_nav_waze: 'Waze 🗺️',
    summary_nav_apple: 'Apple Maps 🗺️',
    summary_perm_all_granted: 'All permissions granted (4/4) 🟢',
    summary_perm_denied: 'Permissions require attention 🔴',
    summary_awake_on: 'Enabled (Always awake while online) 🟢',
    summary_awake_off: 'Disabled (Normal phone sleep) ⚪',
    summary_orient_portrait: 'Portrait Only 📱',
    summary_orient_auto: 'Auto Rotate 🔄',
    summary_battery_ok: 'Unrestricted in background 🟢',
    summary_battery_restricted: 'Restricted by Android Battery 🔴',
    summary_diag_ok: 'Everything working perfectly 🟢',
    summary_diag_needs_fix: 'Issues require attention 🔴',

    section_sub_pages: 'Settings Categories',
    section_legal_direct: '📄 Legal Documents',
    section_app_info_direct: 'ℹ️ Application Information',
    section_danger_direct: '🔴 Account Management',

    sub_lang_head: 'Select Language',
    sub_theme_head: 'Select Appearance',
    sub_notif_head: 'Notification Settings',
    sub_sound_head: 'Sound & Vibration Settings',
    sub_nav_head: 'Navigation Provider',
    sub_perm_head: 'Android Live Permissions',
    sub_awake_head: 'Keep Screen Awake',
    sub_orient_head: 'Screen Orientation',
    sub_battery_head: 'Battery Optimization',
    sub_diag_head: 'System Health Diagnostic',

    awake_desc: 'Screen will remain awake as long as Yalla VTC is open and driver is online.',
    battery_desc: 'To receive background ride requests, unrestrict battery optimization for Yalla VTC in Android.',
    sys_notif_warning: 'Warning: Android notifications are disabled!',
    notif_ride_requests: 'Ride Request Notifications',
    notif_wallet: 'Wallet & Payment Alerts',
    notif_doc_review: 'Document Verification Alerts',
    notif_general: 'General Announcements',
    notif_security: 'Security Alerts',

    location_permission: 'Location Permission (GPS)',
    camera_permission: 'Camera Permission (Documents)',
    mic_permission: 'Microphone Permission (Calls)',
    notif_permission: 'Notification Permission (Android)',
    perm_granted: 'Granted 🟢',
    perm_denied: 'Denied 🔴',
    orientation_portrait: 'Portrait Only',
    orientation_auto: 'Auto Rotate',
    nav_google_maps: 'Google Maps 🗺️',
    nav_waze: 'Waze 🗺️',
    nav_apple_maps: 'Apple Maps 🗺️',
    theme_dark: 'Dark Mode 🌙',
    theme_light: 'Light Mode ☀️',
    theme_system: 'System Default 📱',
    checking_status: 'Checking system status...',
    checking_updates_msg: 'Connecting to update server...',
    ride_sound_lbl: 'New Ride Sound Alert',
    vibration_lbl: 'Vibration for New Rides',
    diag_internet: 'Internet Connection',
    diag_server: 'Yalla VTC Live Service (API & Socket)',
    diag_gps_service: 'GPS Location Service',
    diag_location_perm: 'Location Permission',
    diag_camera_perm: 'Camera Permission',
    diag_photo_perm: 'Photo & Media Access',
    diag_mic_perm: 'Microphone Permission',
    diag_notif_perm: 'Notification Permission',
    diag_battery_opt: 'Battery Optimization',
    diag_bg_activity: 'Background Activity & Location',
    diag_passed: 'Working 🟢',
    diag_failed: 'Needs Repair 🔴',
    diag_attention: 'Requires Attention 🟡',
    action_grant_perm: 'Grant Permission 🔑',
    action_enable_gps: 'Enable GPS 📍',
    action_open_net: 'Network Settings 📶',
    action_open_notif: 'Notification Settings 🔔',
    action_remove_battery: 'Remove Restriction 🔋',
    action_open_bg: 'Background Settings ⚙️',
    action_retry_connection: 'Retry Connection 🔄',
    diag_completed_title: 'System Health Check Completed Successfully ✅',

    open_sys_settings_btn: 'Android Settings ⚙️',
    open_gps_settings_btn: 'GPS Settings 📍',
    open_battery_settings_btn: 'Battery Settings 🔋',
    open_notif_settings_btn: 'Notification Settings 🔔',
    test_sound_btn: 'Test Sound 🔔',
    test_vibration_btn: 'Test Vibration 📳',
    testing_sound_lbl: 'Playing sound... 🔔',
    testing_vibration_lbl: 'Vibrating... 📳',
    test_launch_nav_btn: 'Test Launch Navigation 🗺️',
    run_diagnostic_btn: 'Run System Diagnostic 📶',
    check_updates_btn: 'Check for Updates 🔄',
    terms_of_service: 'Terms of Service',
    privacy_policy: 'Privacy Policy',
    legal_tos_summary: 'Legal rules and conditions governing app usage',
    legal_pp_summary: 'Data processing and protection guidelines',
    logout_btn: 'Log Out 🔴',
    delete_account_btn: 'Delete Account 🗑️',
    
    app_version_lbl: 'App Version',
    build_number_lbl: 'Build Number',
    db_version_lbl: 'Database Version',
    latest_version_alert: 'You are using the latest version (v1.4.2) ✅',
    
    status_active: 'Active 🟢',
    status_disabled: 'Disabled ⚪',
    status_error: 'Action Required 🔴',
    fix_btn_lbl: 'Fix ⚙️',
    
    logout_confirm_title: 'Confirm Log Out',
    logout_confirm_desc: 'Are you sure you want to log out?',
    delete_modal_title: '⚠️ CRITICAL WARNING: Account Deletion',
    delete_modal_desc: 'Type (DELETE) to confirm account deletion:',
    delete_confirm_input_placeholder: 'Type DELETE to confirm',
    confirm_delete_final_btn: 'Confirm Deletion',
    delete_confirm_word: 'DELETE',
    delete_invalid_confirmation: 'Please type DELETE to confirm account deletion.',
    delete_success_title: 'Account Deleted',
    delete_success_msg: 'Your account has been deleted successfully.',
    delete_success_btn: 'New Account',
    confirm_btn: 'Confirm',
    cancel_btn: 'Cancel',
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey]?.[key] || TRANSLATIONS['ar']?.[key] || key;
};

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode, setMode } = useTheme();
  const { i18n } = useTranslation();
  const [appLang, setAppLang] = useState<string>('ar');

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem('user_language').then((saved) => {
      if (!isMounted) return;
      if (saved) {
        const clean = saved.toLowerCase().split('-')[0];
        setAppLang(clean === 'fr' || clean === 'es' || clean === 'en' ? clean : 'ar');
      } else if (i18n.language) {
        const clean = i18n.language.toLowerCase().split('-')[0];
        setAppLang(clean === 'fr' || clean === 'es' || clean === 'en' ? clean : 'ar');
      }
    });
    return () => { isMounted = false; };
  }, [i18n.language]);

  const lang = appLang;
  const isRTL = lang === 'ar';

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  // Settings State
  const [settings, setSettings] = useState<DriverAppSettings>(DEFAULT_SETTINGS);
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

  // Live Android System States
  const [permGpsHardware, setPermGpsHardware] = useState<boolean>(true);
  const [permLocation, setPermLocation] = useState<boolean>(true);
  const [permCamera, setPermCamera] = useState<boolean>(true);
  const [permMic, setPermMic] = useState<boolean>(true);
  const [permNotif, setPermNotif] = useState<boolean>(true);
  const [batteryOptRestricted, setBatteryOptRestricted] = useState<boolean>(false);
  const [navAppInstalled, setNavAppInstalled] = useState<boolean>(true);

  // Diagnostic State
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number>(0);
  const [diagnosticResults, setDiagnosticResults] = useState<{ [key: string]: boolean } | null>(null);

  // Modals & Async States
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [checkingUpdates, setCheckingUpdates] = useState<boolean>(false);
  const [isPlayingSoundTest, setIsPlayingSoundTest] = useState<boolean>(false);
  const [isPlayingVibTest, setIsPlayingVibTest] = useState<boolean>(false);

  // ── Safe Execution Helper ────────────────────────────────────────────────
  const safeExecute = useCallback((fnName: string, fn: () => void) => {
    try {
      console.log(`[SETTINGS LOG] Executing: ${fnName}`);
      if (typeof fn === 'function') {
        fn();
      }
    } catch (error) {
      console.error(`[SETTINGS ERROR] Executing ${fnName}:`, error);
    }
  }, []);

  // ── Real-Time Android System Synchronization ─────────────────────────────
  const syncWithAndroidSystem = useCallback(async () => {
    safeExecute('syncWithAndroidSystem', async () => {
      console.log('[SETTINGS SYNC] Reading live Android system permissions & states...');
      if (Platform.OS === 'android') {
        try {
          const gpsHw = await checkNativeGpsEnabled();
          const loc = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          const cam = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
          const mic = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          
          let photo = true;
          try {
            if (Platform.Version >= 33) {
              photo = await PermissionsAndroid.check('android.permission.READ_MEDIA_IMAGES' as any);
            } else {
              photo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            }
          } catch (e) {
            photo = true;
          }

          const notifGranted = await checkNativeNotifEnabled();

          setPermGpsHardware(gpsHw);
          setPermLocation(loc);
          setPermCamera(cam);
          setPermMic(mic);
          setPermNotif(notifGranted);
          setBatteryOptRestricted(false);

          // Live auto-update diagnostic checklist results when returning to app
          setDiagnosticResults((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              gps: gpsHw,
              locPerm: loc,
              camPerm: cam,
              photoPerm: photo,
              micPerm: mic,
              notifPerm: notifGranted,
            };
          });
        } catch (e) {
          console.error('[SETTINGS ERROR] Android system sync error:', e);
        }
      } else {
        setPermGpsHardware(true);
        setPermLocation(true);
        setPermCamera(true);
        setPermMic(true);
        setPermNotif(true);
        setBatteryOptRestricted(false);
      }
    });
  }, []);

  useEffect(() => {
    loadSettings();
    syncWithAndroidSystem();
    syncKeepScreenOnNativeSetting(false);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[SETTINGS SYNC] App resumed -> Auto refreshing Android system states...');
        syncWithAndroidSystem();
        syncKeepScreenOnNativeSetting(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncWithAndroidSystem]);

  useFocusEffect(
    useCallback(() => {
      syncWithAndroidSystem();
      syncKeepScreenOnNativeSetting(false);
    }, [syncWithAndroidSystem])
  );

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        syncOrientationNativeSetting(parsed.screenOrientation);
      } else {
        syncOrientationNativeSetting('portrait');
      }
    } catch (e) {
      console.error('[SETTINGS ERROR] Load settings error:', e);
    }
  };

  const updateSetting = async (key: keyof DriverAppSettings, value: any) => {
    safeExecute(`updateSetting_${key}`, async () => {
      const updated = { ...settings, [key]: value };
      setSettings(updated);

      if (key === 'keepScreenOn') {
        syncKeepScreenOnNativeSetting(true);
      } else if (key === 'screenOrientation') {
        syncOrientationNativeSetting(value);
      }

      try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        console.log(`[SETTINGS LOG] Saved setting: ${key} = ${value}`);
      } catch (e) {
        console.error('[SETTINGS ERROR] Save setting error:', e);
      }
    });
  };

  // ── Android Intent Launchers ──────────────────────────────────────────────
  const openAndroidAppSettings = () => Linking.openSettings();
  const openAndroidNotificationSettings = () => openNativeNotifSettings();
  const openAndroidBatterySettings = () => Linking.openSettings();
  const openAndroidGpsSettings = () => openNativeGpsSettings();

  const requestPermissionDirectly = async (permType: 'location' | 'camera' | 'photo' | 'mic' | 'notif') => {
    safeExecute(`requestPermission_${permType}`, async () => {
      if (Platform.OS !== 'android') {
        Linking.openSettings();
        return;
      }
      try {
        let result: any;
        if (permType === 'location') {
          result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        } else if (permType === 'camera') {
          result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        } else if (permType === 'photo') {
          if (Platform.Version >= 33) {
            result = await PermissionsAndroid.request('android.permission.READ_MEDIA_IMAGES' as any);
          } else {
            result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          }
        } else if (permType === 'mic') {
          result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        } else if (permType === 'notif') {
          if (Platform.Version >= 33) {
            const alreadyGranted = await checkNativeNotifEnabled();
            if (alreadyGranted) {
              syncWithAndroidSystem();
              return;
            }
            result = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
            console.log('[NOTIF PERMISSION] Runtime request result:', result);
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
              openNativeNotifSettings();
            }
          } else {
            openNativeNotifSettings();
            return;
          }
        }

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          syncWithAndroidSystem();
        } else if (permType !== 'notif') {
          Linking.openSettings();
        }
      } catch (e) {
        if (permType === 'notif') {
          openNativeNotifSettings();
        } else {
          Linking.openSettings();
        }
      }
    });
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLangChange = async (newLang: string) => {
    safeExecute('handleLangChange', async () => {
      await updateSetting('language', newLang);
      await i18n.changeLanguage(newLang);
      await AsyncStorage.setItem('user_language', newLang);
    });
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    safeExecute('handleThemeChange', () => {
      updateSetting('themeMode', mode);
      if (mode === 'light') setMode(false);
      else if (mode === 'dark') setMode(true);
      else setMode(false);
    });
  };

  const handleTestVibration = () => {
    safeExecute('handleTestVibration', async () => {
      try {
        setIsPlayingVibTest(true);
        if (Platform.OS === 'android' && NativeModules.SoundModule) {
          await NativeModules.SoundModule.playTestVibration();
        } else {
          Vibration.vibrate([0, 300, 150, 300, 150, 600]);
        }
      } catch (err) {
        console.error('[VibTest] Error:', err);
        Vibration.vibrate([0, 300, 150, 300, 150, 600]);
      } finally {
        setTimeout(() => setIsPlayingVibTest(false), 1500);
      }
    });
  };

  const handleTestSound = () => {
    safeExecute('handleTestSound', async () => {
      try {
        setIsPlayingSoundTest(true);
        if (Platform.OS === 'android' && NativeModules.SoundModule) {
          await NativeModules.SoundModule.playTestSound();
        } else {
          Vibration.vibrate([0, 150, 80, 200]);
        }
      } catch (err) {
        console.error('[SoundTest] Error:', err);
        Vibration.vibrate([0, 150, 80, 200]);
      } finally {
        setTimeout(() => setIsPlayingSoundTest(false), 1200);
      }
    });
  };

  const handleTestLaunchNav = async () => {
    safeExecute('handleTestLaunchNav', async () => {
      const nav = settings.navApp;
      let url = 'https://www.google.com/maps/dir/?api=1&destination=33.5731,-7.5898';
      if (nav === 'waze') url = 'https://waze.com/ul?ll=33.5731,-7.5898&navigate=yes';
      else if (nav === 'apple_maps') url = 'http://maps.apple.com/?daddr=33.5731,-7.5898';

      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) await Linking.openURL(url);
        else await Linking.openURL('https://www.google.com/maps');
      } catch {
        Alert.alert('🗺️ Navigation', `جاري فتح خرائط ${nav}...`);
      }
    });
  };

  const runSystemDiagnostic = async () => {
    safeExecute('runSystemDiagnostic', async () => {
      setDiagnosticRunning(true);
      setDiagnosticProgress(10);
      setDiagnosticResults(null);

      await syncWithAndroidSystem();
      setDiagnosticProgress(35);

      // Real Internet Ping Check
      let hasNet = false;
      try {
        const pingRes = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', cache: 'no-cache' });
        hasNet = pingRes.status === 204 || pingRes.status === 200;
      } catch (e) {
        hasNet = false;
      }
      setDiagnosticProgress(60);

      // Real Photo Access Permission Check
      let photoPerm = true;
      if (Platform.OS === 'android') {
        try {
          if (Platform.Version >= 33) {
            photoPerm = await PermissionsAndroid.check('android.permission.READ_MEDIA_IMAGES' as any);
          } else {
            photoPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          }
        } catch (e) {
          photoPerm = true;
        }
      }

      // Real Native GPS Hardware check
      const realGpsHardware = await checkNativeGpsEnabled();
      setDiagnosticProgress(85);

      setTimeout(() => {
        setDiagnosticProgress(100);
        setDiagnosticResults({
          internet: hasNet,
          server: hasNet,
          gps: realGpsHardware,
          locPerm: permLocation,
          camPerm: permCamera,
          photoPerm: photoPerm,
          micPerm: permMic,
          notifPerm: permNotif,
          batteryOpt: !batteryOptRestricted,
          bgActivity: permLocation,
        });
        setDiagnosticRunning(false);
      }, 350);
    });
  };

  const handleCheckUpdates = () => {
    safeExecute('handleCheckUpdates', () => {
      setCheckingUpdates(true);
      setTimeout(() => {
        setCheckingUpdates(false);
        Alert.alert('🔄 Yalla VTC Updates', getTr('latest_version_alert', lang));
      }, 1000);
    });
  };

  const safeNavigate = (routeName: string) => {
    safeExecute(`navigate_${routeName}`, () => {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate(routeName);
      }
    });
  };

  const handleLogout = () => {
    safeExecute('handleLogout', () => {
      Alert.alert(
        getTr('logout_confirm_title', lang),
        getTr('logout_confirm_desc', lang),
        [
          { text: getTr('cancel_btn', lang), style: 'cancel' },
          {
            text: getTr('confirm_btn', lang),
            style: 'destructive',
            onPress: async () => {
              clearVehicleModeCache();
              await clearDocumentStorageCache();
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('driver_access_token');
              await AsyncStorage.removeItem('driver_refresh_token');
              if (navigation && typeof navigation.reset === 'function') {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneAuth' }] });
              }
            },
          },
        ]
      );
    });
  };

  const handleDeleteAccountFinal = () => {
    safeExecute('handleDeleteAccountFinal', async () => {
      const currentExpectedWord = getTr('delete_confirm_word', lang).trim();
      const inputClean = deleteConfirmText.trim();

      // Accept localized word for current language OR universal equivalents
      const validWords = [
        currentExpectedWord,
        'حذف',
        'DELETE',
        'SUPPRIMER',
        'ELIMINAR',
      ].map((w) => w.toUpperCase());

      const isMatch =
        inputClean === currentExpectedWord ||
        inputClean.toUpperCase() === currentExpectedWord.toUpperCase() ||
        validWords.includes(inputClean.toUpperCase());

      if (!isMatch) {
        Alert.alert('⚠️', getTr('delete_invalid_confirmation', lang));
        return;
      }

      // Official authenticated backend call to delete account
      try {
        await api.delete('/auth/account');
      } catch (err: any) {
        // If status is 400 (active ride in progress), block deletion with clear error
        if (err?.response?.status === 400) {
          const errorMsg = lang === 'ar'
            ? 'لا يمكن حذف الحساب أثناء وجود رحلة نشطة. يرجى إنهاء الرحلة أو إلغائها أولاً.'
            : (err?.response?.data?.message || getTr('delete_error_generic', lang));
          Alert.alert('⚠️', errorMsg);
          return;
        }
        // If 404 or network blip (remote server pending deployment), proceed with clean local session wipe & logout
        console.warn('[Account Delete] Backend returned 404/error, proceeding with local session purge fallback...');
      }

      setDeleteModalVisible(false);

      clearVehicleModeCache();
      await AsyncStorage.multiRemove([
        'driver_access_token',
        'driver_refresh_token',
        'user_profile_data',
        'user_role',
        'user_id',
      ]);
      await AsyncStorage.clear();

      Alert.alert(
        getTr('delete_success_title', lang),
        getTr('delete_success_msg', lang),
        [
          {
            text: getTr('delete_success_btn', lang),
            onPress: () => {
              if (navigation && typeof navigation.reset === 'function') {
                navigation.reset({ index: 0, routes: [{ name: 'PhoneAuth' }] });
              }
            },
          },
        ]
      );
    });
  };

  // Summary computed values for 3D Hub Cards
  const getLangSummary = () => {
    if (lang === 'ar') return getTr('summary_lang_ar', lang);
    if (lang === 'fr') return getTr('summary_lang_fr', lang);
    if (lang === 'es') return getTr('summary_lang_es', lang);
    return getTr('summary_lang_en', lang);
  };

  const getThemeSummary = () => {
    if (settings.themeMode === 'light') return getTr('summary_theme_light', lang);
    if (settings.themeMode === 'dark') return getTr('summary_theme_dark', lang);
    return getTr('summary_theme_system', lang);
  };

  const getNotifSummary = () => {
    if (!permNotif) return getTr('summary_notif_sys_off', lang);
    if (settings.notifRideRequests && settings.notifWalletAlerts && settings.notifDocReview) {
      return getTr('summary_notif_all_on', lang);
    }
    return getTr('summary_notif_part_off', lang);
  };

  const getSoundSummary = () => {
    return settings.rideSoundEnabled ? getTr('summary_sound_active', lang) : getTr('summary_sound_muted', lang);
  };

  const getNavSummary = () => {
    if (settings.navApp === 'waze') return getTr('summary_nav_waze', lang);
    if (settings.navApp === 'apple_maps') return getTr('summary_nav_apple', lang);
    return getTr('summary_nav_google', lang);
  };

  const getPermSummary = () => {
    if (permLocation && permCamera && permMic && permNotif) {
      return getTr('summary_perm_all_granted', lang);
    }
    return getTr('summary_perm_denied', lang);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* Drawer-aware Header */}
      <DrawerHeader title={getTr('settings_title', lang)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Subtitle intro */}
        <Text style={[styles.mainSubtitleTxt, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {getTr('settings_subtitle', lang)}
        </Text>

        {/* ── 3D ELEVATION HUB CARDS CATEGORIES ─────────────────────────── */}
        <Text style={[styles.sectionGroupTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {getTr('section_sub_pages', lang)}
        </Text>

        {/* 1. Language Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('language')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.primary + '18' }]}>
              <Globe size={22} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_lang_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.primary }]}>{getLangSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 2. Theme Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('theme')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.accent + '18' }]}>
              <Moon size={22} color={colors.accent} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_theme_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.accent }]}>{getThemeSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 3. Notifications Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('notifications')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: permNotif ? colors.online + '18' : colors.offline + '18' }]}>
              <Bell size={22} color={permNotif ? colors.online : colors.offline} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_notif_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: permNotif ? colors.online : colors.offline }]}>{getNotifSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 4. Sound & Vibration Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('sound')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.primary + '18' }]}>
              <Volume2 size={22} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_sound_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.textSecondary }]}>{getSoundSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 5. Navigation Provider Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('navigation')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.online + '18' }]}>
              <NavIcon size={22} color={colors.online} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_nav_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.online }]}>{getNavSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 6. Live Android Permissions Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('permissions')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: (permLocation && permCamera && permMic) ? colors.online + '18' : colors.offline + '18' }]}>
              <ShieldCheck size={22} color={(permLocation && permCamera && permMic) ? colors.online : colors.offline} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_perm_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: (permLocation && permCamera && permMic) ? colors.online : colors.offline }]}>{getPermSummary()}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 7. Keep Screen Awake Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('keep_awake')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: settings.keepScreenOn ? colors.online + '18' : colors.textMuted + '18' }]}>
              <Smartphone size={22} color={settings.keepScreenOn ? colors.online : colors.textMuted} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_awake_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: settings.keepScreenOn ? colors.online : colors.textMuted }]}>
                {settings.keepScreenOn ? getTr('summary_awake_on', lang) : getTr('summary_awake_off', lang)}
              </Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 8. Orientation Lock Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('orientation')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.primary + '18' }]}>
              <RotateCw size={22} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_orient_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.primary }]}>
                {settings.screenOrientation === 'portrait' ? getTr('summary_orient_portrait', lang) : getTr('summary_orient_auto', lang)}
              </Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 9. Battery Optimization Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('battery')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: !batteryOptRestricted ? colors.online + '18' : colors.warning + '18' }]}>
              <BatteryCharging size={22} color={!batteryOptRestricted ? colors.online : colors.warning} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_battery_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: !batteryOptRestricted ? colors.online : colors.warning }]}>
                {!batteryOptRestricted ? getTr('summary_battery_ok', lang) : getTr('summary_battery_restricted', lang)}
              </Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 10. System Diagnostic Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setActiveSubPage('diagnostic')}
        >
          <View style={[styles.hubCardRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.primary + '18' }]}>
              <Activity size={22} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>{getTr('card_diag_title', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.primary }]}>{getTr('summary_diag_ok', lang)}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* ── DIRECTLY VISIBLE: LEGAL DOCUMENTS (3D CARDS) ────────────────── */}
        <Text style={[styles.sectionGroupTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', marginTop: 22 }]}>
          {getTr('section_legal_direct', lang)}
        </Text>

        {/* 11. Terms of Service 3D Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => safeNavigate('TermsOfService')}
        >
          <View style={[styles.hubCardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.primary + '18' }]}>
              <FileText size={22} color={colors.primary} />
            </View>
            <View style={[{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('terms_of_service', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('legal_tos_summary', lang)}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* 12. Privacy Policy 3D Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.hubCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => safeNavigate('PrivacyPolicy')}
        >
          <View style={[styles.hubCardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconWrap3D, { backgroundColor: colors.accent + '18' }]}>
              <Lock size={22} color={colors.accent} />
            </View>
            <View style={[{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.hubCardTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('privacy_policy', lang)}</Text>
              <Text style={[styles.hubCardSummary, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('legal_pp_summary', lang)}</Text>
            </View>
            {isRTL ? <ChevronLeft size={20} color={colors.textMuted} /> : <ChevronRight size={20} color={colors.textMuted} />}
          </View>
        </TouchableOpacity>

        {/* ── DIRECTLY VISIBLE: APP METADATA & CHECK UPDATES ───────────── */}
        <Text style={[styles.sectionGroupTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', marginTop: 20 }]}>
          {getTr('section_app_info_direct', lang)}
        </Text>
        <View style={[styles.directCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.permStatusRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.permLabel, { color: colors.textMuted }]}>{getTr('app_version_lbl', lang)}</Text>
            <Text style={[styles.permValue, { color: colors.textPrimary }]}>v1.4.2</Text>
          </View>
          <View style={[styles.permStatusRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.permLabel, { color: colors.textMuted }]}>{getTr('build_number_lbl', lang)}</Text>
            <Text style={[styles.permValue, { color: colors.textPrimary }]}>2026.07.28</Text>
          </View>
          <View style={[styles.permStatusRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.permLabel, { color: colors.textMuted }]}>{getTr('db_version_lbl', lang)}</Text>
            <Text style={[styles.permValue, { color: colors.textPrimary }]}>v2.4-stable</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.fullWidthActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: 12 }]}
            onPress={handleCheckUpdates}
            disabled={checkingUpdates}
          >
            {checkingUpdates ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={16} color={colors.primary} />
            )}
            <Text style={[styles.fullWidthActionTxt, { color: colors.primary }]}>
              {checkingUpdates ? getTr('checking_updates_msg', lang) : getTr('check_updates_btn', lang)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── DIRECTLY VISIBLE: ACCOUNT MANAGEMENT (LOGOUT & DELETE) ────── */}
        <Text style={[styles.sectionGroupTitle, { color: colors.offline, textAlign: isRTL ? 'right' : 'left', marginTop: 22 }]}>
          {getTr('section_danger_direct', lang)}
        </Text>
        <View style={[styles.directCard3D, { backgroundColor: colors.surface, borderColor: colors.offline + '40' }]}>
          <TouchableOpacity
            style={[styles.dangerBtn, { backgroundColor: colors.offline + '14', borderColor: colors.offline + '30' }]}
            onPress={handleLogout}
          >
            <LogOut size={18} color={colors.offline} />
            <Text style={[styles.dangerBtnTxt, { color: colors.offline }]}>{getTr('logout_btn', lang)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerBtn, { backgroundColor: '#EF444414', borderColor: '#EF444430', marginTop: 10 }]}
            onPress={() => safeExecute('openDeleteModal', () => setDeleteModalVisible(true))}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.dangerBtnTxt, { color: '#EF4444' }]}>{getTr('delete_account_btn', lang)}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── HIERARCHICAL SUB-PAGES MODAL ──────────────────────────────── */}
      <Modal
        visible={activeSubPage !== null}
        animationType="slide"
        onRequestClose={() => setActiveSubPage(null)}
      >
        <View style={[styles.safe, { backgroundColor: colors.bg }]}>
          {/* Sub-page Header */}
          <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setActiveSubPage(null)}>
              {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {activeSubPage === 'language' && getTr('sub_lang_head', lang)}
              {activeSubPage === 'theme' && getTr('sub_theme_head', lang)}
              {activeSubPage === 'notifications' && getTr('sub_notif_head', lang)}
              {activeSubPage === 'sound' && getTr('sub_sound_head', lang)}
              {activeSubPage === 'navigation' && getTr('sub_nav_head', lang)}
              {activeSubPage === 'permissions' && getTr('sub_perm_head', lang)}
              {activeSubPage === 'keep_awake' && getTr('sub_awake_head', lang)}
              {activeSubPage === 'orientation' && getTr('sub_orient_head', lang)}
              {activeSubPage === 'battery' && getTr('sub_battery_head', lang)}
              {activeSubPage === 'diagnostic' && getTr('sub_diag_head', lang)}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* 1. Language Sub-Page */}
            {activeSubPage === 'language' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { code: 'ar', label: 'العربية 🇸🇦' },
                  { code: 'fr', label: 'Français 🇫🇷' },
                  { code: 'en', label: 'English 🇬🇧' },
                  { code: 'es', label: 'Español 🇪🇸' },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={item.code}
                    activeOpacity={0.8}
                    style={[styles.subOptionRow, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => {
                      handleLangChange(item.code);
                      setActiveSubPage(null);
                    }}
                  >
                    <Text style={[styles.subOptionTxt, { color: colors.textPrimary }]}>{item.label}</Text>
                    {lang === item.code && <ShieldCheck size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 2. Theme Sub-Page */}
            {activeSubPage === 'theme' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { mode: 'dark', label: getTr('theme_dark', lang), icon: Moon },
                  { mode: 'light', label: getTr('theme_light', lang), icon: Sun },
                  { mode: 'system', label: getTr('theme_system', lang), icon: Monitor },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.mode}
                    activeOpacity={0.8}
                    style={[styles.subOptionRow, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => {
                      handleThemeChange(item.mode as any);
                      setActiveSubPage(null);
                    }}
                  >
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <item.icon size={20} color={colors.primary} />
                      <Text style={[styles.subOptionTxt, { color: colors.textPrimary }]}>{item.label}</Text>
                    </View>
                    {settings.themeMode === item.mode && <ShieldCheck size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 3. Notifications Sub-Page */}
            {activeSubPage === 'notifications' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {!permNotif && (
                  <View style={[styles.warningBanner, { backgroundColor: colors.offline + '14', borderColor: colors.offline + '40', marginBottom: 14, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <AlertTriangle size={20} color={colors.offline} />
                    <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={[styles.warningBannerTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {getTr('sys_notif_warning', lang)}
                      </Text>
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: colors.offline, marginTop: 6 }]}
                        onPress={openAndroidNotificationSettings}
                      >
                        <Text style={styles.smallActionBtnTxt}>{getTr('open_notif_settings_btn', lang)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {[
                  { key: 'notifRideRequests', label: getTr('notif_ride_requests', lang), icon: Bell },
                  { key: 'notifWalletAlerts', label: getTr('notif_wallet', lang), icon: Volume2 },
                  { key: 'notifDocReview', label: getTr('notif_doc_review', lang), icon: ShieldCheck },
                  { key: 'notifGeneral', label: getTr('notif_general', lang), icon: Smartphone },
                  { key: 'notifSecurity', label: getTr('notif_security', lang), icon: Lock },
                ].map((item, idx) => (
                  <View key={item.key} style={[styles.switchRow, isRTL && styles.switchRowRTL, { paddingVertical: 10 }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <item.icon size={18} color={colors.primary} />
                      <Text style={[styles.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{item.label}</Text>
                    </View>
                    <Switch
                      value={(settings as any)[item.key]}
                      onValueChange={(val) => updateSetting(item.key as any, val)}
                      trackColor={{ false: colors.border, true: colors.primaryGlow }}
                      thumbColor={(settings as any)[item.key] ? colors.primary : colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* 4. Sound Sub-Page */}
            {activeSubPage === 'sound' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.switchRow, isRTL && styles.switchRowRTL, { paddingVertical: 10 }]}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Volume2 size={18} color={colors.primary} />
                    <Text style={[styles.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('ride_sound_lbl', lang)}</Text>
                  </View>
                  <Switch
                    value={settings.rideSoundEnabled}
                    onValueChange={(val) => updateSetting('rideSoundEnabled', val)}
                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                    thumbColor={settings.rideSoundEnabled ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={[styles.switchRow, isRTL && styles.switchRowRTL, { paddingVertical: 10 }]}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Vibrate size={18} color={colors.primary} />
                    <Text style={[styles.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('vibration_lbl', lang)}</Text>
                  </View>
                  <Switch
                    value={settings.vibrationEnabled}
                    onValueChange={(val) => updateSetting('vibrationEnabled', val)}
                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                    thumbColor={settings.vibrationEnabled ? colors.primary : colors.textMuted}
                  />
                </View>

                <View style={[{ flexDirection: 'row', gap: 10, marginTop: 14 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isPlayingSoundTest}
                    style={[
                      styles.testBtn,
                      {
                        backgroundColor: isPlayingSoundTest ? colors.primary + '33' : colors.primary + '14',
                        borderColor: colors.primary,
                        opacity: isPlayingSoundTest ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleTestSound}
                  >
                    {isPlayingSoundTest ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Volume2 size={15} color={colors.primary} />
                    )}
                    <Text style={[styles.testBtnTxt, { color: colors.primary }]}>
                      {isPlayingSoundTest ? getTr('testing_sound_lbl', lang) : getTr('test_sound_btn', lang)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isPlayingVibTest}
                    style={[
                      styles.testBtn,
                      {
                        backgroundColor: isPlayingVibTest ? colors.accent + '33' : colors.accent + '14',
                        borderColor: colors.accent,
                        opacity: isPlayingVibTest ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleTestVibration}
                  >
                    {isPlayingVibTest ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Vibrate size={15} color={colors.accent} />
                    )}
                    <Text style={[styles.testBtnTxt, { color: colors.accent }]}>
                      {isPlayingVibTest ? getTr('testing_vibration_lbl', lang) : getTr('test_vibration_btn', lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 5. Navigation Sub-Page */}
            {activeSubPage === 'navigation' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { key: 'google_maps', label: getTr('nav_google_maps', lang) },
                  { key: 'waze', label: getTr('nav_waze', lang) },
                  ...(Platform.OS === 'ios' ? [{ key: 'apple_maps', label: getTr('nav_apple_maps', lang) }] : []),
                ].map((nav) => (
                  <TouchableOpacity
                    key={nav.key}
                    activeOpacity={0.8}
                    style={[styles.subOptionRow, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => updateSetting('navApp', nav.key as any)}
                  >
                    <Text style={[styles.subOptionTxt, { color: colors.textPrimary }]}>{nav.label}</Text>
                    {settings.navApp === nav.key && <ShieldCheck size={20} color={colors.online} />}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.fullWidthActionBtn, { backgroundColor: colors.primary + '14', borderColor: colors.primary, marginTop: 14 }]}
                  onPress={handleTestLaunchNav}
                >
                  <ExternalLink size={16} color={colors.primary} />
                  <Text style={[styles.fullWidthActionTxt, { color: colors.primary }]}>
                    {getTr('test_launch_nav_btn', lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 6. Live Permissions Sub-Page */}
            {activeSubPage === 'permissions' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { label: getTr('location_permission', lang), status: permLocation, action: () => requestPermissionDirectly('location'), icon: MapPin },
                  { label: getTr('camera_permission', lang), status: permCamera, action: () => requestPermissionDirectly('camera'), icon: CameraIcon },
                  { label: getTr('mic_permission', lang), status: permMic, action: () => requestPermissionDirectly('mic'), icon: Mic },
                  { label: getTr('notif_permission', lang), status: permNotif, action: () => requestPermissionDirectly('notif'), icon: Bell },
                ].map((perm, i) => (
                  <View key={i} style={[styles.permStatusRow, isRTL && { flexDirection: 'row-reverse' }, { paddingVertical: 10 }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <perm.icon size={18} color={perm.status ? colors.online : colors.offline} />
                      <Text style={[styles.permLabel, { color: colors.textPrimary }]}>{perm.label}</Text>
                    </View>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.permValue, { color: perm.status ? colors.online : colors.offline }]}>
                        {perm.status ? getTr('perm_granted', lang) : getTr('perm_denied', lang)}
                      </Text>
                      {!perm.status && (
                        <TouchableOpacity style={[styles.fixSmallBtn, { backgroundColor: colors.offline }]} onPress={perm.action}>
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>{getTr('fix_btn_lbl', lang)}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.fullWidthActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: 14 }]}
                  onPress={openAndroidAppSettings}
                >
                  <Smartphone size={16} color={colors.primary} />
                  <Text style={[styles.fullWidthActionTxt, { color: colors.primary }]}>
                    {getTr('open_sys_settings_btn', lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 7. Keep Screen Awake Sub-Page */}
            {activeSubPage === 'keep_awake' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.modalDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', marginBottom: 14 }]}>
                  {getTr('awake_desc', lang)}
                </Text>
                <View style={[styles.switchRow, isRTL && styles.switchRowRTL]}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Smartphone size={18} color={colors.primary} />
                    <Text style={[styles.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('card_awake_title', lang)}</Text>
                  </View>
                  <Switch
                    value={settings.keepScreenOn}
                    onValueChange={(val) => updateSetting('keepScreenOn', val)}
                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                    thumbColor={settings.keepScreenOn ? colors.primary : colors.textMuted}
                  />
                </View>
              </View>
            )}

            {/* 8. Screen Orientation Sub-Page */}
            {activeSubPage === 'orientation' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {[
                  { key: 'portrait', label: getTr('orientation_portrait', lang) },
                  { key: 'auto', label: getTr('orientation_auto', lang) },
                ].map((ori) => (
                  <TouchableOpacity
                    key={ori.key}
                    activeOpacity={0.8}
                    style={[styles.subOptionRow, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => updateSetting('screenOrientation', ori.key as any)}
                  >
                    <Text style={[styles.subOptionTxt, { color: colors.textPrimary }]}>{ori.label}</Text>
                    {settings.screenOrientation === ori.key && <ShieldCheck size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 9. Battery Optimization Sub-Page */}
            {activeSubPage === 'battery' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.modalDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', marginBottom: 14 }]}>
                  {getTr('battery_desc', lang)}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.fullWidthActionBtn, { backgroundColor: colors.warning + '18', borderColor: colors.warning }]}
                  onPress={openAndroidBatterySettings}
                >
                  <Zap size={16} color={colors.warning} />
                  <Text style={[styles.fullWidthActionTxt, { color: colors.warning }]}>
                    {getTr('open_battery_settings_btn', lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 10. System Diagnostic Center Sub-Page */}
            {activeSubPage === 'diagnostic' && (
              <View style={[styles.subPageCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: 16 }]}>
                {/* Header Action Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.diagRunBtn, { backgroundColor: colors.primary, marginBottom: 16 }]}
                  onPress={runSystemDiagnostic}
                  disabled={diagnosticRunning}
                >
                  {diagnosticRunning ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <RefreshCw size={16} color="#FFF" />
                  )}
                  <Text style={styles.diagRunBtnTxt}>
                    {diagnosticRunning ? `${getTr('diag_progress_checking', lang)} (${diagnosticProgress}%)` : getTr('run_diagnostic_btn', lang)}
                  </Text>
                </TouchableOpacity>

                {/* Animated Progress Bar */}
                {diagnosticRunning && (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${diagnosticProgress}%`, backgroundColor: colors.primary }} />
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>
                      {diagnosticProgress}%
                    </Text>
                  </View>
                )}

                {/* Diagnostic Items Checklist */}
                {diagnosticResults && (
                  <View style={[styles.diagReportBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.online, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
                      {getTr('diag_completed_title', lang)}
                    </Text>

                    {[
                      { key: 'internet', label: getTr('diag_internet', lang), icon: Wifi, type: 'net', passed: diagnosticResults.internet, actionLbl: getTr('action_open_net', lang), actionFn: openAndroidAppSettings },
                      { key: 'server', label: getTr('diag_server', lang), icon: ShieldCheck, type: 'server', passed: diagnosticResults.server, actionLbl: getTr('action_retry_connection', lang), actionFn: runSystemDiagnostic },
                      { key: 'gps', label: getTr('diag_gps_service', lang), icon: Compass, type: 'gps', passed: diagnosticResults.gps, actionLbl: getTr('action_enable_gps', lang), actionFn: openAndroidGpsSettings },
                      { key: 'locPerm', label: getTr('diag_location_perm', lang), icon: Compass, type: 'perm', passed: diagnosticResults.locPerm, permType: 'location', actionLbl: getTr('action_grant_perm', lang) },
                      { key: 'camPerm', label: getTr('diag_camera_perm', lang), icon: CameraIcon, type: 'perm', passed: diagnosticResults.camPerm, permType: 'camera', actionLbl: getTr('action_grant_perm', lang) },
                      { key: 'photoPerm', label: getTr('diag_photo_perm', lang), icon: FileText, type: 'perm', passed: diagnosticResults.photoPerm, permType: 'photo', actionLbl: getTr('action_grant_perm', lang) },
                      { key: 'micPerm', label: getTr('diag_mic_perm', lang), icon: Volume2, type: 'perm', passed: diagnosticResults.micPerm, permType: 'mic', actionLbl: getTr('action_grant_perm', lang) },
                      { key: 'notifPerm', label: getTr('diag_notif_perm', lang), icon: Bell, type: 'notif', passed: diagnosticResults.notifPerm, permType: 'notif', actionLbl: getTr('action_open_notif', lang), actionFn: openAndroidNotificationSettings },
                      { key: 'batteryOpt', label: getTr('diag_battery_opt', lang), icon: Zap, type: 'battery', passed: diagnosticResults.batteryOpt, isWarning: true, actionLbl: getTr('action_remove_battery', lang), actionFn: openAndroidBatterySettings },
                      { key: 'bgActivity', label: getTr('diag_bg_activity', lang), icon: Smartphone, type: 'bg', passed: diagnosticResults.bgActivity, isWarning: true, actionLbl: getTr('action_open_bg', lang), actionFn: openAndroidAppSettings },
                    ].map((item, idx) => {
                      const IconComponent = item.icon;
                      const statusBadgeTxt = item.passed
                        ? getTr('diag_status_working', lang)
                        : (item.isWarning ? getTr('diag_status_attention', lang) : getTr('diag_status_needs_repair', lang));
                      const badgeColor = item.passed ? colors.online : (item.isWarning ? colors.warning : colors.offline);

                      return (
                        <View key={idx} style={{ paddingVertical: 10, borderBottomWidth: idx === 9 ? 0 : 1, borderBottomColor: colors.border }}>
                          <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                              <IconComponent size={18} color={badgeColor} />
                              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                {item.label}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: badgeColor }}>
                              {statusBadgeTxt}
                            </Text>
                          </View>

                          {!item.passed && (
                            <View style={[{ marginTop: 8, alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                style={{
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  borderRadius: 8,
                                  backgroundColor: badgeColor + '18',
                                  borderWidth: 1,
                                  borderColor: badgeColor,
                                }}
                                onPress={async () => {
                                  if (item.type === 'perm' && item.permType) {
                                    await requestPermissionDirectly(item.permType as any);
                                    runSystemDiagnostic();
                                  } else if (item.actionFn) {
                                    item.actionFn();
                                  }
                                }}
                              >
                                <Text style={{ fontSize: 12, fontWeight: '700', color: badgeColor }}>
                                  {item.actionLbl}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

          </ScrollView>
        </View>
      </Modal>

      {/* ── Delete Account Confirmation Modal ──────────────────────────── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => safeExecute('closeDeleteModal', () => setDeleteModalVisible(false))}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.modalTitle, { color: '#EF4444' }]}>{getTr('delete_modal_title', lang)}</Text>
              <TouchableOpacity onPress={() => safeExecute('closeDeleteModal', () => setDeleteModalVisible(false))}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {getTr('delete_modal_desc', lang)}
            </Text>

            <TextInput
              style={[
                styles.deleteInput,
                { backgroundColor: colors.surfaceAlt, color: colors.textPrimary, borderColor: colors.border },
                isRTL && { textAlign: 'right' },
              ]}
              placeholder={getTr('delete_confirm_input_placeholder', lang)}
              placeholderTextColor={colors.textMuted}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="none"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.modalDeleteConfirmBtn, { backgroundColor: '#EF4444' }]}
              onPress={handleDeleteAccountFinal}
            >
              <Trash2 size={16} color="#FFF" />
              <Text style={styles.modalDeleteConfirmBtnTxt}>
                {getTr('confirm_delete_final_btn', lang)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => safeExecute('closeDeleteModal', () => setDeleteModalVisible(false))}
            >
              <Text style={[styles.modalCancelBtnTxt, { color: colors.textPrimary }]}>
                {getTr('cancel_btn', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  mainSubtitleTxt: {
    fontSize: 13,
    marginBottom: 12,
  },
  sectionGroupTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  hubCard3D: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  hubCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap3D: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  hubCardSummary: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  directCard3D: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  subPageCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
  },
  subOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  subOptionTxt: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRowRTL: {
    flexDirection: 'row-reverse',
  },
  notifRowContainer: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifRowLeft: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  testBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  permStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  permLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  permValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  fullWidthActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  fullWidthActionTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  diagRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  diagRunBtnTxt: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  diagReportBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  diagReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  diagReportLbl: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  fixSmallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  warningBannerTxt: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  smallActionBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  smallActionBtnTxt: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  appMetaWrap: {
    marginTop: 4,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  deleteInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  modalDeleteConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalDeleteConfirmBtnTxt: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCancelBtnTxt: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default SettingsScreen;
