import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Core translations (inline, stable keys) ──────────────────────────────────
import walletFr from './translations/fr/wallet.json';
import walletAr from './translations/ar/wallet.json';
import walletEn from './translations/en/wallet.json';
import walletEs from './translations/es/wallet.json';

const resources = {
  ar: {
    translation: {
      // Auth & core
      welcome: 'مرحباً بك في أطلس',
      login: 'تسجيل الدخول',
      phone_number: 'رقم الهاتف',
      go_online: 'بدء العمل',
      go_offline: 'توقف',
      earning_today: 'أرباح اليوم',
      active_rides: 'الرحلات النشطة',
      // Orders
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
      no_orders: 'لا توجد طلبات قريبة',
      check_again: 'تحقق مجدداً',
      orders: 'الطلبات',
      demand: 'الطلب',
      performance: 'الأداء',
      profile: 'الملف الشخصي',
    },
    wallet: walletAr,
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
      no_orders: 'Aucune commande trouvée',
      check_again: 'Vérifier à nouveau',
      orders: 'Commandes',
      demand: 'Demande',
      performance: 'Performance',
      profile: 'Profil',
    },
    wallet: walletFr,
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
      no_orders: 'No Orders Found',
      check_again: 'Check Again',
      orders: 'Orders',
      demand: 'Demand',
      performance: 'Performance',
      profile: 'Profile',
    },
    wallet: walletEn,
  },
  es: {
    translation: {
      welcome: 'Bienvenido a Atlas',
      login: 'Iniciar sesión',
      phone_number: 'Número de teléfono',
      go_online: 'Conectarse',
      go_offline: 'Desconectarse',
      earning_today: 'Ganancias de hoy',
      active_rides: 'Viajes activos',
      wallet: 'Billetera',
      city: 'Ciudad',
      notifications: 'Notificaciones',
      security: 'Seguridad',
      settings: 'Configuración',
      help: 'Ayuda',
      support: 'Soporte',
      passenger_mode: 'Modo Pasajero',
      nearby_requests: 'Solicitudes cercanas',
      available: 'Disponible',
      offline: 'Sin conexión',
      busy: 'Ocupado',
      no_orders: 'No se encontraron pedidos',
      check_again: 'Verificar de nuevo',
      orders: 'Pedidos',
      demand: 'Demanda',
      performance: 'Rendimiento',
      profile: 'Perfil',
    },
    wallet: walletEs,
  },
};

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem('user_language');
  const language = savedLanguage || 'ar';

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    ns: ['translation', 'wallet'],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
  });

  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

export default i18n;
