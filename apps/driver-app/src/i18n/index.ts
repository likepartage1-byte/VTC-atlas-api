import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation files supporting full driver app localization from Day 1
const resources = {
  ar: {
    translation: {
      welcome: 'مرحباً بك في أطلس',
      login: 'تسجيل الدخول',
      phone_number: 'رقم الهاتف',
      go_online: 'بدء العمل',
      go_offline: 'توقف',
      earning_today: 'أرباح اليوم',
      active_rides: 'الرحلات النشطة',
      wallet: 'المحفظة',
      city: 'المدينة',
      notifications: 'الإشعارات',
      security: 'الأمان',
      settings: 'الإعدادات',
      help: 'المساعدة',
      support: 'الدعم الفني',
      passenger_mode: 'وضع الركاب',
      nearby_requests: 'الطلبات القريبة',
      available: 'نشط',
      offline: 'غير متصل',
      busy: 'مشغول',
      vehicle: 'المركبة',
      no_orders: 'لا توجد طلبات قريبة',
      check_again: 'تحقق مجدداً',
      orders: 'الطلبات',
      demand: 'الطلب',
      performance: 'الأداء',
      profile: 'الملف الشخصي',
    },
  },
  fr: {
    translation: {
      welcome: 'Bienvenue sur Atlas',
      login: 'Connexion',
      phone_number: 'Numéro de téléphone',
      go_online: 'Se connecter',
      go_offline: 'Se déconnecter',
      earning_today: "Gains d'aujourd'hui",
      active_rides: 'Courses actives',
      wallet: 'Portefeuille',
      city: 'Ville',
      notifications: 'Notifications',
      security: 'Sécurité',
      settings: 'Paramètres',
      help: 'Aide',
      support: 'Support technique',
      passenger_mode: 'Mode Passager',
      nearby_requests: 'Commandes à proximité',
      available: 'Disponible',
      offline: 'Hors ligne',
      busy: 'Occupé',
      vehicle: 'Véhicule',
      no_orders: 'Aucune commande trouvée',
      check_again: 'Vérifier à nouveau',
      orders: 'Commandes',
      demand: 'Demande',
      performance: 'Performance',
      profile: 'Profil',
    },
  },
  en: {
    translation: {
      welcome: 'Welcome to Atlas',
      login: 'Login',
      phone_number: 'Phone Number',
      go_online: 'Go Online',
      go_offline: 'Go Offline',
      earning_today: "Today's Earnings",
      active_rides: 'Active Rides',
      wallet: 'Wallet',
      city: 'City',
      notifications: 'Notifications',
      security: 'Security',
      settings: 'Settings',
      help: 'Help',
      support: 'Support',
      passenger_mode: 'Passenger Mode',
      nearby_requests: 'Nearby Requests',
      available: 'Available',
      offline: 'Offline',
      busy: 'Busy',
      vehicle: 'Vehicle',
      no_orders: 'No Orders Found',
      check_again: 'Check Again',
      orders: 'Orders',
      demand: 'Demand',
      performance: 'Performance',
      profile: 'Profile',
    },
  },
};

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem('user_language');
  const language = savedLanguage || 'ar'; // Default to Arabic

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  // Handle RTL for Arabic
  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

export default i18n;
