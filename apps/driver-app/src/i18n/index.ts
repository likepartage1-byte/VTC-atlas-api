import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation files (Simplified for setup)
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
    // Note: App restart might be handled in the UI layer for full layout refresh
  }
};

export default i18n;
