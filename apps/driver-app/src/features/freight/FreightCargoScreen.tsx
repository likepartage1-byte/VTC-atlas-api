import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  Bell,
  Navigation as NavIcon,
  SlidersHorizontal,
  RefreshCw,
  Zap,
  Phone,
  MessageSquare,
  CreditCard,
  Wallet,
  Star,
  ArrowDown,
  Sparkles,
  AlertTriangle,
  Package,
  Layers,
  ShieldCheck,
  Settings,
  Users,
  Check,
  X,
  Building2,
  Box,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawerHeader } from '../../components/DrawerHeader';

// ─── TYPES & DATA MODELS ────────────────────────────────────────────────────────
export type FreightVehicleType = 'small_truck' | 'medium_truck' | 'large_truck' | 'utility_van' | 'private_car';
export type CargoType = 'furniture' | 'appliances' | 'construction' | 'commercial' | 'boxes' | 'fragile';
export type PaymentMethodType = 'cash' | 'wallet' | 'card';

export interface FreightOrder {
  id: string;
  customerFirstName: string;
  customerPhone: string;
  customerRating: number;
  customerTripsCount: number;
  vehicleType: FreightVehicleType;
  cargoType: CargoType;
  cargoWeightKg: number;
  cargoVolumeM3: number;
  packagesCount: number;
  fromCity: string;
  fromAddress: string;
  toCity: string;
  toAddress: string;
  distanceKm: number;
  durationMinutes: number;
  hasElevator: boolean;
  needsHelpers: boolean;
  helpersCount: number;
  floorNumber: number;
  specialInstructions?: string;
  scheduledPickupTime: string;
  grossFareDH: number;
  commissionDH: number;
  netDriverEarningsDH: number;
  paymentMethod: PaymentMethodType;
  publishedAtTime: string;
  isAccepted?: boolean;
}

export interface MoroccanCity {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}

export const MOROCCAN_CITIES: MoroccanCity[] = [
  { id: 'casablanca', nameAr: 'الدار البيضاء', nameFr: 'Casablanca', nameEn: 'Casablanca' },
  { id: 'rabat',      nameAr: 'الرباط',        nameFr: 'Rabat',      nameEn: 'Rabat' },
  { id: 'marrakech',  nameAr: 'مراكش',        nameFr: 'Marrakech',  nameEn: 'Marrakech' },
  { id: 'tangier',    nameAr: 'طنجة',         nameFr: 'Tanger',     nameEn: 'Tangier' },
  { id: 'agadir',     nameAr: 'أكادير',        nameFr: 'Agadir',     nameEn: 'Agadir' },
  { id: 'fes',        nameAr: 'فاس',          nameFr: 'Fès',        nameEn: 'Fez' },
  { id: 'meknes',     nameAr: 'مكناس',        nameFr: 'Mequinez',   nameEn: 'Meknes' },
  { id: 'oujda',      nameAr: 'وجدة',         nameFr: 'Oujda',      nameEn: 'Oujda' },
  { id: 'tetouan',    nameAr: 'تطوان',        nameFr: 'Tétouan',    nameEn: 'Tetouan' },
  { id: 'kenitra',    nameAr: 'القنيطرة',      nameFr: 'Kénitra',    nameEn: 'Kenitra' },
  { id: 'eljadida',   nameAr: 'الجديدة',      nameFr: 'El Jadida',  nameEn: 'El Jadida' },
  { id: 'nador',      nameAr: 'الناظور',       nameFr: 'Nador',      nameEn: 'Nador' },
];

const MOCK_FREIGHT_OFFERS: FreightOrder[] = [
  {
    id: 'fr-901',
    customerFirstName: 'عثمان',
    customerPhone: '+212 661 234 567',
    customerRating: 4.9,
    customerTripsCount: 18,
    vehicleType: 'small_truck',
    cargoType: 'furniture',
    cargoWeightKg: 450,
    cargoVolumeM3: 6.5,
    packagesCount: 8,
    fromCity: 'casablanca',
    fromAddress: 'حي المعاريف - شارع المسيرة',
    toCity: 'rabat',
    toAddress: 'حي أقدال - شارع أبطال',
    distanceKm: 87,
    durationMinutes: 65,
    hasElevator: true,
    needsHelpers: true,
    helpersCount: 2,
    floorNumber: 3,
    specialInstructions: 'تغليف خاص للأثاث الخشبي وحماية الأجهزة الإليكترونية.',
    scheduledPickupTime: 'اليوم • 14:30',
    grossFareDH: 750,
    commissionDH: 75,
    netDriverEarningsDH: 675,
    paymentMethod: 'cash',
    publishedAtTime: 'منذ 5 دقائق',
  },
  {
    id: 'fr-902',
    customerFirstName: 'سارة',
    customerPhone: '+212 662 987 654',
    customerRating: 4.8,
    customerTripsCount: 11,
    vehicleType: 'utility_van',
    cargoType: 'boxes',
    cargoWeightKg: 280,
    cargoVolumeM3: 3.2,
    packagesCount: 15,
    fromCity: 'casablanca',
    fromAddress: 'سيدي معروف - قرب التقنوبارك',
    toCity: 'marrakech',
    toAddress: 'جليز - شارع محمد الخامس',
    distanceKm: 240,
    durationMinutes: 140,
    hasElevator: false,
    needsHelpers: false,
    helpersCount: 0,
    floorNumber: 0,
    specialInstructions: 'صناديق كرتونية تحتوي على ملابس ومستلزمات مكتبية.',
    scheduledPickupTime: 'غداً • 09:00',
    grossFareDH: 1400,
    commissionDH: 140,
    netDriverEarningsDH: 1260,
    paymentMethod: 'wallet',
    publishedAtTime: 'منذ 18 دقيقة',
  },
  {
    id: 'fr-903',
    customerFirstName: 'كريم',
    customerPhone: '+212 663 456 789',
    customerRating: 5.0,
    customerTripsCount: 24,
    vehicleType: 'medium_truck',
    cargoType: 'commercial',
    cargoWeightKg: 1200,
    cargoVolumeM3: 14.0,
    packagesCount: 42,
    fromCity: 'tangier',
    fromAddress: 'المنطقة الصناعية - غزنلبي',
    toCity: 'kenitra',
    toAddress: 'الميناء النهرى التجاري',
    distanceKm: 215,
    durationMinutes: 130,
    hasElevator: true,
    needsHelpers: true,
    helpersCount: 3,
    floorNumber: 1,
    specialInstructions: 'بضائع تجارية سريعة التلف بحاجة لتفريغ سريع عند الوصول.',
    scheduledPickupTime: 'اليوم • 16:00',
    grossFareDH: 2200,
    commissionDH: 220,
    netDriverEarningsDH: 1980,
    paymentMethod: 'card',
    publishedAtTime: 'منذ 32 دقيقة',
  },
];

// ─── TRANSLATIONS DICTIONARY ──────────────────────────────────────────────────
const TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    screen_title: '📦 الشحن والنقل',
    active_receiving: 'استقبال طلبات الشحن والنقل',
    inactive_receiving: 'خدمة الشحن متوقفة حالياً',
    not_eligible_title: 'تنبيه تأهيل المركبة',
    not_eligible_desc: 'خدمة الشحن والنقل مخصصة للشاحنات والسيارات النفعية المعتمدة.',
    feed_tab: 'الطلبات المتاحة (اللايف)',
    my_trips_tab: 'رحلات الشحن المقبولة',
    no_offers: 'لا توجد طلبات شحن متوفرة حالياً في منطقتك.',
    accept_btn: 'قبول طلب الشحن 📦',
    details_btn: 'التفاصيل اللوجستية',
    details_modal_title: 'تفاصيل شحنة النقل',
    logistics_details_group: '📦 المواصفات اللوجستية للشحنة',
    has_elevator: 'مصعد متوفر',
    needs_helpers: 'مساعدين للتحميل',
    floor_number: 'الطابق',
    customer_instructions: 'تعليمات العميل الخاصة:',
    financial_breakdown: '💳 التفاصيل المالية والحسابية',
    gross_fare: 'إجمالي قيمة الشحن:',
    commission_fee: 'عمولة Yalla VTC (10%):',
    net_earnings: 'صافي ربح السائق المحصل:',
    insufficient_wallet_title: 'رصيد المحفظة غير كافٍ ⚠️',
    insufficient_wallet_desc: 'رصيدك الحالي لا يسمح بقبول هذا الطلب. يرجى تعبئة محفظتك أولاً لاستكمال العملية.',
    confirm_accept_title: 'تأكيد قبول طلب الشحن 📦',
    commission_notice: 'سيتم خصم عمولة الخدمة فوراً عند التأكيد، هل ترغب في المتابعة؟',
    confirm_accept_btn: 'تأكيد الخصم والقبول الآن 🚀',
    topup_wallet_btn: 'شحن المحفظة الآن 💳',
    cancel_btn: 'إلغاء',
    unlocked_customer_title: '👤 بيانات التواصل مع صاحب الشحنة',
    call_btn: 'اتصال',
    chat_btn: 'محادثة',
    navigate_btn: 'الملاحة',
    yes: 'نعم',
    no: 'لا',
    vehicle_small_truck: '🚚 شاحنة صغيرة',
    vehicle_medium_truck: '🚛 شاحنة متوسطة',
    vehicle_large_truck: '🚛 شاحنة كبيرة',
    vehicle_utility_van: '🚐 سيارة نفعية (Fourgon)',
    cargo_furniture: '🛋️ أثاث ومنزليات',
    cargo_appliances: '🔌 أجهزة كهربائية',
    cargo_construction: '🏗️ مواد بناء',
    cargo_commercial: '📦 بضائع تجارية',
    cargo_boxes: '📦 صناديق وأمتعة',
    cargo_fragile: '🍶 مواد قابلة للكسر',
  },
  fr: {
    screen_title: '📦 Fret & Transport',
    active_receiving: 'Réception des demandes active',
    inactive_receiving: 'Service actuellement désactivé',
    not_eligible_title: 'Éligibilité du Véhicule',
    not_eligible_desc: 'Ce service est réservé aux camions et véhicules utilitaires certifiés.',
    feed_tab: 'Demandes En Direct',
    my_trips_tab: 'Mes Frets Acceptés',
    no_offers: 'Aucune demande de fret disponible actuellement.',
    accept_btn: 'Accepter la commande 📦',
    details_btn: 'Détails Logistiques',
    details_modal_title: 'Détails de la cargaison',
    logistics_details_group: '📦 Spécifications Logistiques',
    has_elevator: 'Ascenseur disponible',
    needs_helpers: 'Aide au chargement',
    floor_number: 'Étage',
    customer_instructions: 'Instructions du client :',
    financial_breakdown: '💳 Détails Financiers',
    gross_fare: 'Prix total du fret :',
    commission_fee: 'Commission Yalla VTC (10%) :',
    net_earnings: 'Gains nets du chauffeur :',
    insufficient_wallet_title: 'Solde Portefeuille Insuffisant ⚠️',
    insufficient_wallet_desc: 'Votre solde ne permet pas d\'accepter cette course. Veuillez recharger votre portefeuille.',
    confirm_accept_title: 'Confirmer l\'acceptation 📦',
    commission_notice: 'La commission sera déduite immédiatement de votre solde.',
    confirm_accept_btn: 'Confirmer et Accepter 🚀',
    topup_wallet_btn: 'Recharger le Portefeuille 💳',
    cancel_btn: 'Annuler',
    unlocked_customer_title: '👤 Contact du Client',
    call_btn: 'Appeler',
    chat_btn: 'Chat',
    navigate_btn: 'Navigation',
    yes: 'Oui',
    no: 'Non',
    vehicle_small_truck: '🚚 Petit Camion',
    vehicle_medium_truck: '🚛 Camion Moyen',
    vehicle_large_truck: '🚛 Camion Grand',
    vehicle_utility_van: '🚐 Utilitaire / Fourgon',
    cargo_furniture: '🛋️ Meubles',
    cargo_appliances: '🔌 Électroménager',
    cargo_construction: '🏗️ Matériaux de construction',
    cargo_commercial: '📦 Marchandises commerciales',
    cargo_boxes: '📦 Cartons & Bagages',
    cargo_fragile: '🍶 Objets fragiles',
  },
  es: {
    screen_title: '📦 Carga y Transporte',
    active_receiving: 'Recepción de solicitudes activa',
    inactive_receiving: 'Servicio pausado',
    not_eligible_title: 'Elegibilidad del Vehículo',
    not_eligible_desc: 'Este servicio está reservado para camiones y furgonetas autorizadas.',
    feed_tab: 'Solicitudes En Vivo',
    my_trips_tab: 'Cargas Aceptadas',
    no_offers: 'No hay ofertas de carga disponibles actualmente.',
    accept_btn: 'Aceptar Pedido 📦',
    details_btn: 'Detalles Logísticos',
    details_modal_title: 'Detalles del Envío',
    logistics_details_group: '📦 Especificaciones de Carga',
    has_elevator: 'Ascensor disponible',
    needs_helpers: 'Ayudantes de carga',
    floor_number: 'Piso',
    customer_instructions: 'Instrucciones del cliente:',
    financial_breakdown: '💳 Desglose Financiero',
    gross_fare: 'Tarifa total:',
    commission_fee: 'Comisión Yalla VTC (10%):',
    net_earnings: 'Ganancia neta:',
    insufficient_wallet_title: 'Saldo Insuficiente ⚠️',
    insufficient_wallet_desc: 'Su saldo actual no permite aceptar este pedido. Recargue su billetera.',
    confirm_accept_title: 'Confirmar Aceptación 📦',
    commission_notice: 'La comisión se deducirá inmediatamente de su billetera.',
    confirm_accept_btn: 'Confirmar y Aceptar 🚀',
    topup_wallet_btn: 'Recargar Billetera 💳',
    cancel_btn: 'Cancelar',
    unlocked_customer_title: '👤 Datos de Contacto',
    call_btn: 'Llamar',
    chat_btn: 'Chat',
    navigate_btn: 'Navegación',
    yes: 'Sí',
    no: 'No',
    vehicle_small_truck: '🚚 Camión Pequeño',
    vehicle_medium_truck: '🚛 Camión Mediano',
    vehicle_large_truck: '🚛 Camión Grande',
    vehicle_utility_van: '🚐 Furgoneta Útil',
    cargo_furniture: '🛋️ Muebles',
    cargo_appliances: '🔌 Electrodomésticos',
    cargo_construction: '🏗️ Materiales de construcción',
    cargo_commercial: '📦 Mercancías comerciales',
    cargo_boxes: '📦 Cajas y Equipaje',
    cargo_fragile: '🍶 Artículos frágiles',
  },
  en: {
    screen_title: '📦 Freight & Cargo',
    active_receiving: 'Receiving Freight Requests Active',
    inactive_receiving: 'Freight Service Currently Paused',
    not_eligible_title: 'Vehicle Qualification Notice',
    not_eligible_desc: 'Freight & Cargo transport service is reserved for certified trucks and utility vans.',
    feed_tab: 'Live Requests',
    my_trips_tab: 'Accepted Freights',
    no_offers: 'No freight requests currently available in your area.',
    accept_btn: 'Accept Order 📦',
    details_btn: 'Logistics Details',
    details_modal_title: 'Cargo Shipment Details',
    logistics_details_group: '📦 Logistics Specifications',
    has_elevator: 'Elevator Available',
    needs_helpers: 'Loading Helpers Needed',
    floor_number: 'Floor Level',
    customer_instructions: 'Customer Instructions:',
    financial_breakdown: '💳 Financial Breakdown',
    gross_fare: 'Gross Freight Fare:',
    commission_fee: 'Yalla VTC Fee (10%):',
    net_earnings: 'Net Driver Earnings:',
    insufficient_wallet_title: 'Insufficient Wallet Balance ⚠️',
    insufficient_wallet_desc: 'Your current balance does not allow accepting this order. Please top up your wallet.',
    confirm_accept_title: 'Confirm Freight Acceptance 📦',
    commission_notice: 'Service commission fee will be deducted immediately upon confirmation.',
    confirm_accept_btn: 'Confirm & Accept Now 🚀',
    topup_wallet_btn: 'Top Up Wallet Now 💳',
    cancel_btn: 'Cancel',
    unlocked_customer_title: '👤 Customer Contact Details',
    call_btn: 'Call',
    chat_btn: 'Chat',
    navigate_btn: 'Navigate',
    yes: 'Yes',
    no: 'No',
    vehicle_small_truck: '🚚 Small Truck',
    vehicle_medium_truck: '🚛 Medium Truck',
    vehicle_large_truck: '🚛 Large Truck',
    vehicle_utility_van: '🚐 Utility Van',
    cargo_furniture: '🛋️ Furniture',
    cargo_appliances: '🔌 Home Appliances',
    cargo_construction: '🏗️ Building Materials',
    cargo_commercial: '📦 Commercial Freight',
    cargo_boxes: '📦 Boxes & Luggage',
    cargo_fragile: '🍶 Fragile Items',
  },
};

export const FreightCargoScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors = AtlasLightColors, isDarkMode = false } = useTheme() || {};

  // Language & RTL Setup
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'ar').slice(0, 2);
  const isRTL = lang === 'ar';

  // Helper for translations
  const getTr = (key: string, currentLang: string): string => {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['ar'];
    return dict[key] || TRANSLATIONS['ar'][key] || key;
  };

  // State Management
  const [isReceivingActive, setIsReceivingActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'my_trips'>('feed');
  const [freightOffers, setFreightOffers] = useState<FreightOrder[]>(MOCK_FREIGHT_OFFERS);
  const [acceptedOrders, setAcceptedOrders] = useState<FreightOrder[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<FreightOrder | null>(null);

  // Driver Vehicle Eligibility (Demo Default: Qualified as Small Truck)
  const [driverVehicleType, setDriverVehicleType] = useState<FreightVehicleType>('small_truck');
  const isDriverEligible = useMemo(() => {
    return driverVehicleType !== 'private_car';
  }, [driverVehicleType]);

  // Wallet Security Check State (Demo Wallet Balance: 120 DH)
  const [driverWalletBalance, setDriverWalletBalance] = useState<number>(120);
  const [pendingAcceptOffer, setPendingAcceptOffer] = useState<FreightOrder | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState<boolean>(false);
  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState<boolean>(false);

  // Load Saved Preferences
  useEffect(() => {
    (async () => {
      try {
        const savedReceiving = await AsyncStorage.getItem('@yalla_freight_receiving_active');
        if (savedReceiving !== null) {
          setIsReceivingActive(savedReceiving === 'true');
        }
      } catch (err) {
        console.log('Error loading freight state:', err);
      }
    })();
  }, []);

  const handleToggleReceiving = async (val: boolean) => {
    setIsReceivingActive(val);
    Vibration.vibrate(30);
    try {
      await AsyncStorage.setItem('@yalla_freight_receiving_active', String(val));
    } catch (err) {
      console.log('Error saving freight receiving toggle:', err);
    }
  };

  // Accept Order Workflow
  const handleAcceptPress = (order: FreightOrder) => {
    if (driverWalletBalance < order.commissionDH) {
      setPendingAcceptOffer(order);
      setShowInsufficientBalanceModal(true);
      return;
    }

    setPendingAcceptOffer(order);
    setShowConfirmAcceptModal(true);
  };

  const handleConfirmAccept = () => {
    if (!pendingAcceptOffer) return;
    Vibration.vibrate([0, 50, 100, 50]);

    // Deduct commission
    setDriverWalletBalance((prev) => prev - pendingAcceptOffer.commissionDH);

    // Update lists
    setFreightOffers((prev) => prev.filter((o) => o.id !== pendingAcceptOffer.id));
    setAcceptedOrders((prev) => [
      { ...pendingAcceptOffer, isAccepted: true },
      ...prev,
    ]);

    setShowConfirmAcceptModal(false);
    setSelectedOffer(null);
    setPendingAcceptOffer(null);
    setActiveTab('my_trips');

    Alert.alert(
      '🎉 تم قبول الشحنة بنسبة 100%',
      'تم خصم عمولة الخدمة بنجاح، وتفعيل بيانات صاحب الشحنة للتواصل والملاحة.',
    );
  };

  const getCityName = (cityId: string): string => {
    const found = MOROCCAN_CITIES.find((c) => c.id === cityId);
    if (!found) return cityId;
    if (lang === 'fr') return found.nameFr;
    if (lang === 'en') return found.nameEn;
    return found.nameAr;
  };

  const getVehicleLabel = (type: FreightVehicleType): string => {
    switch (type) {
      case 'small_truck':  return getTr('vehicle_small_truck', lang);
      case 'medium_truck': return getTr('vehicle_medium_truck', lang);
      case 'large_truck':  return getTr('vehicle_large_truck', lang);
      case 'utility_van':  return getTr('vehicle_utility_van', lang);
      default: return type;
    }
  };

  const getCargoLabel = (type: CargoType): string => {
    switch (type) {
      case 'furniture':    return getTr('cargo_furniture', lang);
      case 'appliances':   return getTr('cargo_appliances', lang);
      case 'construction': return getTr('cargo_construction', lang);
      case 'commercial':   return getTr('cargo_commercial', lang);
      case 'boxes':        return getTr('cargo_boxes', lang);
      case 'fragile':      return getTr('cargo_fragile', lang);
      default: return type;
    }
  };

  const topPadding = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 12);

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* Drawer-aware Header */}
      <DrawerHeader
        title={getTr('screen_title', lang)}
        rightElement={
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('FreightSettings')}
          >
            <Settings size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* RECEIVING TOGGLE BANNER */}
      <View style={[styles.toggleBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {isReceivingActive ? getTr('active_receiving', lang) : getTr('inactive_receiving', lang)}
          </Text>
          <Text style={[styles.toggleSub, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            رصيد المحفظة المتوفر: <Text style={{ color: colors.online, fontWeight: '700' }}>{driverWalletBalance} DH</Text>
          </Text>
        </View>
        <Switch
          value={isReceivingActive}
          onValueChange={handleToggleReceiving}
          trackColor={{ false: '#94A3B8', true: colors.online }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* DRIVER VEHICLE ELIGIBILITY CHECK */}
      {!isDriverEligible ? (
        <View style={styles.subGuardContainer}>
          <View style={[styles.subGuardCard3D, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
            <View style={[styles.subGuardIconWrap, { backgroundColor: '#EF444418' }]}>
              <Package size={36} color="#EF4444" />
            </View>
            <Text style={[styles.subGuardTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('not_eligible_title', lang)}
            </Text>
            <Text style={[styles.subGuardDesc, { color: colors.textMuted, textAlign: 'center' }]}>
              {getTr('not_eligible_desc', lang)}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.subActivateBtn, { backgroundColor: colors.primary, marginTop: 14 }]}
              onPress={() => setDriverVehicleType('small_truck')}
            >
              <Package size={18} color="#FFF" />
              <Text style={styles.subActivateBtnTxt}>تعديل المركبة لـ شاحنة صغيرة 🚚 (اختبار)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* NAVIGATION TABS */}
          <View style={[styles.tabsRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'feed' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab('feed')}
            >
              <Text style={[styles.tabTxt, { color: activeTab === 'feed' ? colors.primary : colors.textMuted }]}>
                {getTr('feed_tab', lang)} ({freightOffers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'my_trips' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab('my_trips')}
            >
              <Text style={[styles.tabTxt, { color: activeTab === 'my_trips' ? colors.primary : colors.textMuted }]}>
                {getTr('my_trips_tab', lang)} ({acceptedOrders.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT */}
          {activeTab === 'feed' ? (
            <FlatList
              data={freightOffers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Package size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyTxt, { color: colors.textMuted, textAlign: 'center' }]}>
                    {getTr('no_offers', lang)}
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* PRICE & BADGES HEADER */}
                  <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.priceBigTxt, { color: colors.primary }]}>{item.grossFareDH} DH</Text>
                    <View style={[{ flexDirection: 'row', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[styles.badgePill, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[styles.badgePillTxt, { color: colors.primary }]}>
                          {getVehicleLabel(item.vehicleType)}
                        </Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: colors.accent + '18' }]}>
                        <Text style={[styles.badgePillTxt, { color: colors.accent }]}>
                          {getCargoLabel(item.cargoType)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* CARGO SPECS ROW */}
                  <View style={[styles.specsRow, { backgroundColor: colors.surfaceAlt }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.specTxt, { color: colors.textSecondary }]}>⚖️ {item.cargoWeightKg} كجم</Text>
                    <Text style={[styles.specTxt, { color: colors.textSecondary }]}>📐 {item.cargoVolumeM3} م³</Text>
                    <Text style={[styles.specTxt, { color: colors.textSecondary }]}>📦 {item.packagesCount} قطع</Text>
                    <Text style={[styles.specTxt, { color: colors.textSecondary }]}>⏱️ {item.durationMinutes} دقيقة</Text>
                  </View>

                  {/* ROUTE TIMELINE (🟢 A -> 🔴 B) */}
                  <View style={styles.routeBox}>
                    <View style={[styles.cityRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.dotIcon, { color: colors.online }]}>🟢 A</Text>
                      <Text style={[styles.cityTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {getCityName(item.fromCity)} • <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.fromAddress}</Text>
                      </Text>
                    </View>

                    <View style={[styles.cityRow, { marginTop: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.dotIcon, { color: '#EF4444' }]}>🔴 B</Text>
                      <Text style={[styles.cityTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {getCityName(item.toCity)} • <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.toAddress}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={[{ flexDirection: 'row', gap: 10, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.acceptBtn, { backgroundColor: colors.primary, flex: 2 }]}
                      onPress={() => handleAcceptPress(item)}
                    >
                      <CheckCircle size={18} color="#FFF" />
                      <Text style={styles.acceptBtnTxt}>{getTr('accept_btn', lang)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.detailsBtn, { borderColor: colors.border, flex: 1 }]}
                      onPress={() => setSelectedOffer(item)}
                    >
                      <Text style={[styles.detailsBtnTxt, { color: colors.textPrimary }]}>{getTr('details_btn', lang)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <FlatList
              data={acceptedOrders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Package size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyTxt, { color: colors.textMuted, textAlign: 'center' }]}>
                    لا توجد طلبات شحن مقبولة حالياً.
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: colors.online }]}>
                  <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.priceBigTxt, { color: colors.online }]}>{item.grossFareDH} DH</Text>
                    <View style={[styles.badgePill, { backgroundColor: colors.online + '18' }]}>
                      <Text style={[styles.badgePillTxt, { color: colors.online }]}>🟢 تم قبول الشحن</Text>
                    </View>
                  </View>

                  <Text style={[styles.cityTitleTxt, { color: colors.textPrimary, marginVertical: 8, textAlign: isRTL ? 'right' : 'left' }]}>
                    🟢 {getCityName(item.fromCity)} ➜ 🔴 {getCityName(item.toCity)}
                  </Text>

                  {/* UNLOCKED CUSTOMER CONTACT */}
                  <View style={[styles.unlockedBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.unlockedTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {getTr('unlocked_customer_title', lang)}
                    </Text>
                    <Text style={[styles.riderNameTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginTop: 4 }]}>
                      👤 {item.customerFirstName} ({item.customerPhone})
                    </Text>

                    <View style={[{ flexDirection: 'row', gap: 10, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.online }]}
                        onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
                      >
                        <Phone size={16} color="#FFF" />
                        <Text style={styles.contactBtnTxt}>{getTr('call_btn', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                        onPress={() => Alert.alert('💬 Chat', `فتح الدردشة مع العميل ${item.customerFirstName}...`)}
                      >
                        <MessageSquare size={16} color="#FFF" />
                        <Text style={styles.contactBtnTxt}>{getTr('chat_btn', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.accent }]}
                        onPress={() => Alert.alert('🗺️ Navigation', 'جاري بدء الملاحة لنقطة تحميل البضاعة...')}
                      >
                        <NavIcon size={16} color="#FFF" />
                        <Text style={styles.contactBtnTxt}>{getTr('navigate_btn', lang)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

        </View>
      )}

      {/* DEDICATED FREIGHT ORDER DETAILS MODAL */}
      <Modal
        visible={selectedOffer !== null}
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        {selectedOffer && (
          <View style={[styles.safe, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedOffer(null)}>
                {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {getTr('details_modal_title', lang)}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }}>
              {/* PRICE BANNER */}
              <View style={[styles.priceBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary }]}>
                <Text style={[styles.bannerPriceTxt, { color: colors.primary }]}>{selectedOffer.grossFareDH} DH</Text>
                <Text style={[styles.bannerSubTxt, { color: colors.textSecondary }]}>
                  {getVehicleLabel(selectedOffer.vehicleType)} • {getCargoLabel(selectedOffer.cargoType)}
                </Text>
              </View>

              {/* LOGISTICS & CARGO REQUIREMENTS */}
              <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionGroupTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginBottom: 10 }]}>
                  {getTr('logistics_details_group', lang)}
                </Text>
                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLbl, { color: colors.textMuted }]}>{getTr('has_elevator', lang)}</Text>
                  <Text style={[styles.finVal, { color: colors.textPrimary }]}>
                    {selectedOffer.hasElevator ? '🛗 ' + getTr('yes', lang) : '❌ ' + getTr('no', lang)}
                  </Text>
                </View>

                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLbl, { color: colors.textMuted }]}>{getTr('needs_helpers', lang)}</Text>
                  <Text style={[styles.finVal, { color: colors.textPrimary }]}>
                    {selectedOffer.needsHelpers ? `👥 ${getTr('yes', lang)} (${selectedOffer.helpersCount} مساعدين)` : '❌ ' + getTr('no', lang)}
                  </Text>
                </View>

                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLbl, { color: colors.textMuted }]}>{getTr('floor_number', lang)}</Text>
                  <Text style={[styles.finVal, { color: colors.textPrimary }]}>
                    {selectedOffer.floorNumber > 0 ? `الطابق ${selectedOffer.floorNumber}` : 'الطابق الأرضي'}
                  </Text>
                </View>

                {selectedOffer.specialInstructions && (
                  <View style={[styles.notesBox, { backgroundColor: colors.surfaceAlt, marginTop: 10 }]}>
                    <Text style={[styles.notesLbl, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {getTr('customer_instructions', lang)}
                    </Text>
                    <Text style={[styles.notesTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginTop: 4 }]}>
                      {selectedOffer.specialInstructions}
                    </Text>
                  </View>
                )}
              </View>

              {/* FINANCIAL BREAKDOWN */}
              <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionGroupTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginBottom: 10 }]}>
                  {getTr('financial_breakdown', lang)}
                </Text>
                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLbl, { color: colors.textMuted }]}>{getTr('gross_fare', lang)}</Text>
                  <Text style={[styles.finVal, { color: colors.textPrimary }]}>{selectedOffer.grossFareDH} DH</Text>
                </View>
                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLbl, { color: colors.textMuted }]}>{getTr('commission_fee', lang)}</Text>
                  <Text style={[styles.finVal, { color: colors.offline }]}>-{selectedOffer.commissionDH} DH</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={[styles.finRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.finLblBold, { color: colors.textPrimary }]}>{getTr('net_earnings', lang)}</Text>
                  <Text style={[styles.finValBold, { color: colors.online }]}>+{selectedOffer.netDriverEarningsDH} DH</Text>
                </View>
              </View>

              {/* ACCEPT BUTTON */}
              {!selectedOffer.isAccepted && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.acceptBtn, { backgroundColor: colors.primary, paddingVertical: 16 }]}
                  onPress={() => handleAcceptPress(selectedOffer)}
                >
                  <CheckCircle size={20} color="#FFF" />
                  <Text style={[styles.acceptBtnTxt, { fontSize: 16 }]}>{getTr('accept_btn', lang)}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* INSUFFICIENT BALANCE MODAL */}
      <Modal visible={showInsufficientBalanceModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#EF444418' }]}>
              <AlertTriangle size={36} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('insufficient_wallet_title', lang)}
            </Text>
            <Text style={[styles.modalDescTxt, { color: colors.textMuted, textAlign: 'center', marginBottom: 14 }]}>
              {getTr('insufficient_wallet_desc', lang)}
            </Text>
            <TouchableOpacity
              style={[styles.subActivateBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowInsufficientBalanceModal(false);
                navigation.navigate('Wallet');
              }}
            >
              <CreditCard size={18} color="#FFF" />
              <Text style={styles.subActivateBtnTxt}>{getTr('topup_wallet_btn', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal visible={showConfirmAcceptModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: colors.primary + '18' }]}>
              <Package size={36} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('confirm_accept_title', lang)}
            </Text>
            <Text style={[styles.noticeTxt, { color: colors.textMuted, textAlign: 'center', marginVertical: 10 }]}>
              {getTr('commission_notice', lang)}
            </Text>
            <TouchableOpacity
              style={[styles.subActivateBtn, { backgroundColor: colors.online, marginTop: 10 }]}
              onPress={handleConfirmAccept}
            >
              <Text style={styles.subActivateBtnTxt}>{getTr('confirm_accept_btn', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10, paddingVertical: 8, alignItems: 'center' }}
              onPress={() => setShowConfirmAcceptModal(false)}
            >
              <Text style={{ color: colors.textMuted }}>{getTr('cancel_btn', lang)}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 8 },
  settingsBtn: { padding: 8 },
  toggleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '700' },
  toggleSub: { fontSize: 12, marginTop: 2 },
  subGuardContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  subGuardCard3D: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  subGuardIconWrap: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  subGuardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  subGuardDesc: { fontSize: 14, lineHeight: 20 },
  subActivateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 14, borderRadius: 12 },
  subActivateBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 12 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabTxt: { fontSize: 14, fontWeight: '700' },
  scrollContent: { padding: 16, gap: 14 },
  emptyBox: { padding: 30, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginTop: 40 },
  emptyTxt: { fontSize: 14, marginTop: 10 },
  feedCard3D: { padding: 16, borderRadius: 16, borderWidth: 1, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceBigTxt: { fontSize: 22, fontWeight: '900' },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePillTxt: { fontSize: 12, fontWeight: '700' },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 10, marginVertical: 10 },
  specTxt: { fontSize: 12, fontWeight: '600' },
  routeBox: { marginVertical: 6 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotIcon: { fontSize: 14, fontWeight: '800' },
  cityTxt: { fontSize: 14, fontWeight: '600' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  acceptBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  detailsBtn: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingVertical: 12 },
  detailsBtnTxt: { fontWeight: '700', fontSize: 13 },
  cityTitleTxt: { fontSize: 16, fontWeight: '800' },
  unlockedBox: { padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  unlockedTitle: { fontSize: 13, fontWeight: '700' },
  riderNameTxt: { fontSize: 14, fontWeight: '600' },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  contactBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  priceBanner: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  bannerPriceTxt: { fontSize: 28, fontWeight: '900' },
  bannerSubTxt: { fontSize: 14, marginTop: 4 },
  card3D: { padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionGroupTitle: { fontSize: 15, fontWeight: '800' },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  finLbl: { fontSize: 13 },
  finVal: { fontSize: 14, fontWeight: '600' },
  finLblBold: { fontSize: 15, fontWeight: '800' },
  finValBold: { fontSize: 16, fontWeight: '800' },
  divider: { height: 1, marginVertical: 8 },
  notesBox: { padding: 10, borderRadius: 10 },
  notesLbl: { fontSize: 12, fontWeight: '700' },
  notesTxt: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard3D: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  modalTitleTxt: { fontSize: 18, fontWeight: '800' },
  modalDescTxt: { fontSize: 13, lineHeight: 18 },
  noticeTxt: { fontSize: 13, lineHeight: 18 },
});
