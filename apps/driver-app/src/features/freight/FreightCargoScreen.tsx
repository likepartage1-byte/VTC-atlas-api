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
  RefreshControl,
  TextInput,
  Image,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
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
  Truck,
  Car,
  Info,
  ArrowRight,
  Plus,
  Minus,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawerHeader } from '../../components/DrawerHeader';
import { useAppModeStore } from '../../store/useAppModeStore';
import { api } from '../../api/axios.instance';

// ─── 3D ISOMETRIC PREMIUM VEHICLE ASSETS ──────────────────────────────────────
const tricycleImg = require('../../assets/images/vehicles/tricycle_cargo_3d.png');
const petitCamionImg = require('../../assets/images/vehicles/petit_camion_cargo_3d.png');
const fourgonImg = require('../../assets/images/vehicles/fourgon_cargo_3d.png');
const largeTruckImg = require('../../assets/images/vehicles/large_truck_cargo_3d.png');

// ─── 4-LANGUAGE TRANSLATIONS DICTIONARY (AR, FR, EN, ES) ─────────────────────
const FREIGHT_I18N: Record<string, Record<string, string>> = {
  ar: {
    pageTitle: 'الشحن والنقل',
    selectVehicleTitle: 'أي مركبة تناسب شحنتك؟',
    pickupLabel: 'مكان الشحن (نقطة الاستلام)',
    dropoffLabel: 'مكان التسليم (الوجهة)',
    timeLabel: 'وقت الاستلام',
    timeAsap: '10 إلى 20 دقيقة',
    time1h: 'خلال ساعة',
    timeSched: 'جدولة التسليم',
    cargoDescLabel: 'وصف الشحنة',
    cargoDescHint: 'أثاث، أجهزة كهربائية، طرود وصناديق...',
    vehicleSizeLabel: 'تأكيد حمولة ونوع المركبة',
    optionsLabel: 'خيارات إضافية',
    optCash: 'نقداً',
    optHelper1: 'مساعد 1',
    optHelper2: 'مساعدين 2',
    optElevator: 'مصعد متوفر',
    optPassenger: 'مع ركاب',
    photoLabel: 'صورة الشحنة',
    photoModalTitle: 'صورة الشحنة - اختر طريقة الإضافة',
    takePhoto: '📷 التقاط صورة بالكاميرا',
    chooseGallery: '🖼️ اختيار صورة من المعرض',
    deletePhoto: '🗑️ حذف الصورة الحالية',
    tariffLabel: 'السعر المقترح',
    confirmTariff: 'تأكيد السعر المقترح',
    minFareWarning: 'الحد الأدنى لـ',
    is: 'هو',
    createOrderBtn: 'إرسال طلب الشحن 📦',
    selectCity: 'اختر المدينة',
    searchCityHint: 'ابحث عن المدينة (مراكش، الرباط...)...',
    streetLabel: 'رقم المنزل/المبنى والشارع',
    streetHint: 'أدخل الشارع، الحي، أو رقم المبنى...',
    done: 'تم',
    save: 'حفظ',
    activeRideBanner: '⚡ طلب شحن قيد التنفيذ',
    activeRideSearching: 'جاري البحث عن سائق',
    successTitle: 'نجاح 🚀',
    successMsg: 'تم إرسال طلب الشحن بنجاح! جاري البحث عن سائقين قريبين.',
    errorTitle: 'خطأ ⚠️',
    errorMsg: 'تعذر إرسال الطلب، يرجى التأكد من البيانات والإعادة.',
  },
  fr: {
    pageTitle: 'Fret et Transport',
    selectVehicleTitle: 'Quel véhicule convient à votre cargaison ?',
    pickupLabel: 'Lieu de prise en charge',
    dropoffLabel: 'Destination',
    timeLabel: 'Heure de prise en charge',
    timeAsap: '10 à 20 min',
    time1h: "Jusqu'à 1 heure",
    timeSched: 'Planifier la livraison',
    cargoDescLabel: 'Description de la cargaison',
    cargoDescHint: 'Ex: Meubles de salon, 5 cartons, électroménager...',
    vehicleSizeLabel: 'Taille du véhicule et capacité',
    optionsLabel: 'Options supplémentaires',
    optCash: 'Espèces',
    optHelper1: 'Un déménageur',
    optHelper2: 'Deux déménageurs',
    optElevator: 'Ascenseur',
    optPassenger: 'Trajet avec passager',
    photoLabel: 'Photo de votre cargaison',
    photoModalTitle: 'Photo de cargaison - Choisissez une méthode',
    takePhoto: '📷 Prendre une photo',
    chooseGallery: '🖼️ Choisir depuis la galerie',
    deletePhoto: '🗑️ Supprimer la photo actuelle',
    tariffLabel: 'Proposez votre tarif',
    confirmTariff: 'Confirmer le tarif',
    minFareWarning: 'Le tarif minimum pour',
    is: 'est de',
    createOrderBtn: 'Créer une demande 📦',
    selectCity: 'Sélectionnez votre ville',
    searchCityHint: 'Rechercher une ville (Marrakech, Casablanca...)...',
    streetLabel: 'Numéro de domicile et rue',
    streetHint: 'Entrez la rue, numéro, quartier...',
    done: 'Terminé',
    save: 'Enregistrer',
    activeRideBanner: '⚡ Demande en cours',
    activeRideSearching: 'Recherche de chauffeur',
    successTitle: 'Succès 🚀',
    successMsg: 'Demande créée avec succès ! Recherche de chauffeurs à proximité.',
    errorTitle: 'Erreur ⚠️',
    errorMsg: 'Impossible d\'envoyer la demande, veuillez réessayer.',
  },
  en: {
    pageTitle: 'Freight & Cargo',
    selectVehicleTitle: 'Which vehicle fits your cargo?',
    pickupLabel: 'Pickup Location',
    dropoffLabel: 'Destination',
    timeLabel: 'Pickup Time',
    timeAsap: '10 to 20 min',
    time1h: 'Within 1 hour',
    timeSched: 'Schedule Delivery',
    cargoDescLabel: 'Cargo Description',
    cargoDescHint: 'E.g., Living room furniture, 5 boxes, appliances...',
    vehicleSizeLabel: 'Vehicle Type & Capacity',
    optionsLabel: 'Extra Options',
    optCash: 'Cash',
    optHelper1: '1 Helper',
    optHelper2: '2 Helpers',
    optElevator: 'Elevator Available',
    optPassenger: 'Ride with Passengers',
    photoLabel: 'Cargo Photo',
    photoModalTitle: 'Cargo Photo - Choose Method',
    takePhoto: '📷 Take a photo with camera',
    chooseGallery: '🖼️ Choose from phone gallery',
    deletePhoto: '🗑️ Delete current photo',
    tariffLabel: 'Propose Your Fare',
    confirmTariff: 'Confirm Proposed Fare',
    minFareWarning: 'Minimum fare for',
    is: 'is',
    createOrderBtn: 'Submit Freight Order 📦',
    selectCity: 'Select City',
    searchCityHint: 'Search city (Marrakech, Rabat...)...',
    streetLabel: 'Street Address & House Number',
    streetHint: 'Enter street, building number, district...',
    done: 'Done',
    save: 'Save',
    activeRideBanner: '⚡ Active Freight Order',
    activeRideSearching: 'Searching for driver',
    successTitle: 'Success 🚀',
    successMsg: 'Freight order submitted successfully! Searching for nearby drivers.',
    errorTitle: 'Error ⚠️',
    errorMsg: 'Could not send request. Please check your data and retry.',
  },
  es: {
    pageTitle: 'Carga y Transporte',
    selectVehicleTitle: '¿Qué vehículo se adapta a su carga?',
    pickupLabel: 'Lugar de recogida',
    dropoffLabel: 'Destino',
    timeLabel: 'Hora de recogida',
    timeAsap: '10 a 20 min',
    time1h: 'En 1 hora',
    timeSched: 'Programar entrega',
    cargoDescLabel: 'Descripción de la carga',
    cargoDescHint: 'Ej: Muebles de salón, 5 cajas, electrodomésticos...',
    vehicleSizeLabel: 'Tipo de vehículo y capacidad',
    optionsLabel: 'Opciones adicionales',
    optCash: 'Efectivo',
    optHelper1: '1 Ayudante',
    optHelper2: '2 Ayudantes',
    optElevator: 'Ascensor disponible',
    optPassenger: 'Viaje con pasajeros',
    photoLabel: 'Foto de su carga',
    photoModalTitle: 'Foto de Carga - Seleccionar Método',
    takePhoto: '📷 Tomar una foto con cámara',
    chooseGallery: '🖼️ Elegir de la galería',
    deletePhoto: '🗑️ Eliminar foto actual',
    tariffLabel: 'Proponga su tarifa',
    confirmTariff: 'Confirmar tarifa propuesta',
    minFareWarning: 'La tarifa mínima para',
    is: 'es de',
    createOrderBtn: 'Enviar solicitud de carga 📦',
    selectCity: 'Seleccione su ciudad',
    searchCityHint: 'Buscar ciudad (Marrakech, Rabat...)...',
    streetLabel: 'Calle y número de casa',
    streetHint: 'Ingrese calle, número de edificio, barrio...',
    done: 'Hecho',
    save: 'Guardar',
    activeRideBanner: '⚡ Solicitud en curso',
    activeRideSearching: 'Buscando conductor',
    successTitle: 'Éxito 🚀',
    successMsg: '¡Solicitud enviada con éxito! Buscando conductores cercanos.',
    errorTitle: 'Error ⚠️',
    errorMsg: 'No se pudo enviar la solicitud, inténtelo de جديد.',
  },
};

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
  nameEs: string;
}

export const MOROCCAN_CITIES: MoroccanCity[] = [
  { id: 'marrakech',  nameAr: 'مراكش',        nameFr: 'Marrakech',  nameEn: 'Marrakech', nameEs: 'Marrakech' },
  { id: 'casablanca', nameAr: 'الدار البيضاء',  nameFr: 'Casablanca', nameEn: 'Casablanca', nameEs: 'Casablanca' },
  { id: 'rabat',      nameAr: 'الرباط',        nameFr: 'Rabat',      nameEn: 'Rabat', nameEs: 'Rabat' },
  { id: 'tangier',    nameAr: 'طنجة',         nameFr: 'Tanger',     nameEn: 'Tangier', nameEs: 'Tánger' },
  { id: 'agadir',     nameAr: 'أكادير',        nameFr: 'Agadir',     nameEn: 'Agadir', nameEs: 'Agadir' },
  { id: 'fes',        nameAr: 'فاس',          nameFr: 'Fès',        nameEn: 'Fez', nameEs: 'Fez' },
  { id: 'meknes',     nameAr: 'مكناس',        nameFr: 'Mequinez',   nameEn: 'Meknes', nameEs: 'Mequinez' },
  { id: 'oujda',      nameAr: 'وجدة',         nameFr: 'Oujda',      nameEn: 'Oujda', nameEs: 'Oujda' },
  { id: 'tetouan',    nameAr: 'تطوان',        nameFr: 'Tétouan',    nameEn: 'Tetouan', nameEs: 'Tetuán' },
  { id: 'kenitra',    nameAr: 'القنيطرة',      nameFr: 'Kénitra',    nameEn: 'Kenitra', nameEs: 'Kenitra' },
  { id: 'eljadida',   nameAr: 'الجديدة',      nameFr: 'El Jadida',  nameEn: 'El Jadida', nameEs: 'El Jadida' },
  { id: 'nador',      nameAr: 'الناظور',       nameFr: 'Nador',      nameEn: 'Nador', nameEs: 'Nador' },
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
];

export const FreightCargoScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors = { surface: '#FFF', textPrimary: '#1A1A2E', textMuted: '#6B7280', border: '#E5E7EB', primary: '#4F46E5', surfaceAlt: '#F9FAFB' }, isDarkMode = false } = useTheme() || {};
  const { activeMode } = useAppModeStore();

  // Language & RTL Setup (4 Languages: AR, FR, EN, ES)
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'ar').slice(0, 2).toLowerCase();
  const currentLang = ['ar', 'fr', 'en', 'es'].includes(rawLang) ? rawLang : 'ar';
  const isRTL = currentLang === 'ar';
  const t = FREIGHT_I18N[currentLang] || FREIGHT_I18N.ar;

  // Driver State
  const [isReceivingActive, setIsReceivingActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'my_trips'>('feed');
  const [freightOffers, setFreightOffers] = useState<FreightOrder[]>(MOCK_FREIGHT_OFFERS);
  const [acceptedOrders, setAcceptedOrders] = useState<FreightOrder[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<FreightOrder | null>(null);
  const [driverVehicleType, setDriverVehicleType] = useState<FreightVehicleType>('small_truck');
  const [driverWalletBalance, setDriverWalletBalance] = useState<number>(120);
  const [pendingAcceptOffer, setPendingAcceptOffer] = useState<FreightOrder | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState<boolean>(false);
  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState<boolean>(false);

  // Passenger State
  const [passengerTab, setPassengerTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [passengerRides, setPassengerRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [isLoadingPassenger, setIsLoadingPassenger] = useState<boolean>(true);
  const [passengerDetailsItem, setPassengerDetailsItem] = useState<any | null>(null);

  // FRET FORM STATE
  const [selectedVehicleId, setSelectedVehicleId] = useState<'tricycle' | 'petit_camion' | 'camion' | 'large_truck'>('tricycle');
  const [showVehiclePickerModal, setShowVehiclePickerModal] = useState<boolean>(false);

  // Pickup Location State (Step 1: City, Step 2: Street)
  const [pickupCity, setPickupCity] = useState<string>('Marrakech');
  const [pickupStreet, setPickupStreet] = useState<string>('Rue des Ecoles');
  const [pickupLat, setPickupLat] = useState<number>(31.6340);
  const [pickupLng, setPickupLng] = useState<number>(-8.0100);

  // Destination Location State (Step 1: City, Step 2: Street)
  const [dropoffCity, setDropoffCity] = useState<string>('Casablanca');
  const [dropoffStreet, setDropoffStreet] = useState<string>('Boulevard d\'Anfa');
  const [dropoffLat, setDropoffLat] = useState<number>(33.5731);
  const [dropoffLng, setDropoffLng] = useState<number>(-7.5898);

  // Location Sheet Modal State
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [addressTarget, setAddressTarget] = useState<'pickup' | 'dropoff'>('pickup');
  const [tempCity, setTempCity] = useState<string>('');
  const [tempStreet, setTempStreet] = useState<string>('');

  // City Search Modal State
  const [showCitySearchModal, setShowCitySearchModal] = useState<boolean>(false);
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');

  // Pickup Time & Description & Options
  const [pickupTimeOption, setPickupTimeOption] = useState<'ASAP' | 'IN_1_HOUR' | 'SCHEDULED'>('ASAP');
  const [cargoDescription, setCargoDescription] = useState<string>('');
  const [showDescModal, setShowDescModal] = useState<boolean>(false);

  const [paymentOption, setPaymentOption] = useState<'cash' | 'wallet'>('cash');
  const [helpersOption, setHelpersOption] = useState<0 | 1 | 2>(1);
  const [hasElevator, setHasElevator] = useState<boolean>(true);
  const [hasPassenger, setHasPassenger] = useState<boolean>(false);

  // PHOTO PICKER STATE & MODAL
  const [cargoPhotoUri, setCargoPhotoUri] = useState<string | null>(null);
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState<boolean>(false);

  const [offeredTariffStr, setOfferedTariffStr] = useState<string>('60');
  const [showPriceModal, setShowPriceModal] = useState<boolean>(false);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  const isDriverEligible = useMemo(() => driverVehicleType !== 'private_car', [driverVehicleType]);

  // 4 TRUCK/FREIGHT VEHICLES WITH 4-LANGUAGE SUPPORT & ENLARGED 3D ILLUSTRATIONS
  const TRUCK_VEHICLES = [
    {
      id: 'tricycle',
      title: {
        ar: 'دراجة ثلاثية العجلات (Triporteur)',
        fr: 'Tricycle (Triporteur)',
        en: 'Tricycle (Triporteur)',
        es: 'Triciclo (Triporteur)',
      },
      desc: {
        ar: 'حتى 300 كجم - نقل البضائع والطرود الصغيرة والمتوسطة الأوفر والأنسب',
        fr: 'Jusqu\'à 300 kg - Transport de marchandises et petits colis',
        en: 'Up to 300 kg - Transport of goods and small/medium packages',
        es: 'Hasta 300 kg - Transporte de mercancías y paquetes pequeños',
      },
      dimensions: '1.2 × 0.9 × 0.9 m',
      image: tricycleImg,
      minFareDH: 60,
    },
    {
      id: 'petit_camion',
      title: {
        ar: 'شاحنة صغيرة (Pickup)',
        fr: 'Petit camion (Pickup)',
        en: 'Small Truck (Pickup)',
        es: 'Camión Pequeño (Pickup)',
      },
      desc: {
        ar: 'حتى 700 كجم - نقل الأجهزة والمنقولات المنزلية والأمتعة',
        fr: 'Jusqu\'à 700 kg - Transport d\'électroménager, meubles et bagages',
        en: 'Up to 700 kg - Transport of appliances, home items and luggage',
        es: 'Hasta 700 kg - Transporte de electrodomésticos, enseres y equipaje',
      },
      dimensions: '1.7 × 1.0 × 1.5 m',
      image: petitCamionImg,
      minFareDH: 100,
    },
    {
      id: 'camion',
      title: {
        ar: 'سيارة نفعية (فورغون)',
        fr: 'Fourgon / Utilitaire',
        en: 'Cargo Van (Fourgon)',
        es: 'Furgón / Útil',
      },
      desc: {
        ar: 'حتى 1.5 طن - نقل الأثاث ومواد البناء',
        fr: 'Jusqu\'à 1.5 t - Transport de meubles et matériaux de construction',
        en: 'Up to 1.5 tons - Transport of furniture and building materials',
        es: 'Hasta 1.5 t - Transporte de muebles y materiales de construcción',
      },
      dimensions: '3.0 × 2.0 × 2.0 m',
      image: fourgonImg,
      minFareDH: 150,
    },
    {
      id: 'large_truck',
      title: {
        ar: 'شاحنة كبيرة (Camion L)',
        fr: 'Camion Grand (L)',
        en: 'Large Heavy Truck (L)',
        es: 'Camión Grande (L)',
      },
      desc: {
        ar: 'حتى 5 أطنان - نقل الأثاث الكبير والبضائع الضخمة',
        fr: 'Jusqu\'à 5 t - Transport de grands meubles et marchandises lourdes',
        en: 'Up to 5 tons - Transport of large furniture and bulk cargo',
        es: 'Hasta 5 t - Transporte de muebles grandes y carga pesada',
      },
      dimensions: '5.8 × 2.45 × 2.2 m',
      image: largeTruckImg,
      minFareDH: 250,
    },
  ];

  const selectedVehicleObj = useMemo(() => {
    return TRUCK_VEHICLES.find(v => v.id === selectedVehicleId) || TRUCK_VEHICLES[0];
  }, [selectedVehicleId]);

  const getLocalizedVehicleTitle = (v: typeof TRUCK_VEHICLES[0]) => {
    return v.title[currentLang as keyof typeof v.title] || v.title.ar;
  };

  const getLocalizedVehicleDesc = (v: typeof TRUCK_VEHICLES[0]) => {
    return v.desc[currentLang as keyof typeof v.desc] || v.desc.ar;
  };

  // Auto-adjust default tariff when vehicle changes
  const handleSelectVehicle = (vehicleId: 'tricycle' | 'petit_camion' | 'camion' | 'large_truck') => {
    setSelectedVehicleId(vehicleId);
    const vehicle = TRUCK_VEHICLES.find(v => v.id === vehicleId);
    if (vehicle) {
      setOfferedTariffStr(String(vehicle.minFareDH));
    }
  };

  // CAMERA PERMISSION REQUESTER FOR ANDROID & IOS
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: isRTL ? 'صلاحية الكاميرا 📷' : 'Camera Permission 📷',
            message: isRTL
              ? 'يحتاج تطبيق Yalla VTC إلى الوصول لكاميرا الهاتف لالتقاط صورة الشحنة والبضائع.'
              : 'Yalla VTC requires camera permission to capture photos of your cargo.',
            buttonNeutral: isRTL ? 'ذكرني لاحقاً' : 'Ask Me Later',
            buttonNegative: isRTL ? 'إلغاء' : 'Cancel',
            buttonPositive: isRTL ? 'موافق' : 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  // CAMERA & GALLERY PICKER HANDLERS
  const handleTakePhoto = async () => {
    setShowPhotoPickerModal(false);

    // 1. Explicit Permission Check for Android & iOS
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        t.errorTitle,
        isRTL
          ? 'تم رفض صلاحية استخدام الكاميرا. يرجى تفعيل الصلاحية من إعدادات الهاتف لالتقاط صورة الشحنة.'
          : 'Camera permission denied. Please allow camera access in device settings.'
      );
      return;
    }

    // 2. Direct Camera Launch
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        cameraType: 'back',
      });

      if (result.didCancel) {
        console.log('User cancelled camera capture');
        return;
      }

      if (result.errorCode) {
        console.warn('launchCamera error:', result.errorCode, result.errorMessage);
        Alert.alert(
          t.errorTitle,
          isRTL
            ? `تعذر فتح الكاميرا: ${result.errorMessage || result.errorCode}`
            : `Could not open camera: ${result.errorMessage || result.errorCode}`
        );
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setCargoPhotoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error('Camera launch error:', err);
      Alert.alert(
        t.errorTitle,
        isRTL ? 'حدث خطأ أثناء تشغيل الكاميرا.' : 'An error occurred while launching the camera.'
      );
    }
  };

  const handleChooseFromGallery = async () => {
    setShowPhotoPickerModal(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled gallery pick');
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          t.errorTitle,
          isRTL
            ? `تعذر فتح معرض الصور: ${result.errorMessage || result.errorCode}`
            : `Could not open gallery: ${result.errorMessage || result.errorCode}`
        );
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setCargoPhotoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert(t.errorTitle, isRTL ? 'تعذر اختيار الصورة من المعرض' : 'Unable to pick image from gallery');
    }
  };

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

  // Fetch Passenger Rides if in PASSENGER Mode
  const fetchPassengerData = useCallback(async () => {
    if (activeMode !== 'PASSENGER') return;
    setIsLoadingPassenger(true);
    try {
      const activeRes = await api.get('/passenger/rides/active').catch(() => ({ data: null }));
      setActiveRide(activeRes.data || null);
    } catch (_) {
    } finally {
      setIsLoadingPassenger(false);
    }
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === 'PASSENGER') {
      fetchPassengerData();
    }
  }, [activeMode, fetchPassengerData]);

  const handleToggleReceiving = async (val: boolean) => {
    setIsReceivingActive(val);
    Vibration.vibrate(30);
    try {
      await AsyncStorage.setItem('@yalla_freight_receiving_active', String(val));
    } catch (err) {
      console.log('Error saving freight receiving toggle:', err);
    }
  };

  const handleAcceptPress = (order: FreightOrder) => {
    if (driverWalletBalance < order.commissionDH) {
      setPendingAcceptOffer(order);
      setShowInsufficientBalanceModal(true);
      return;
    }
    setPendingAcceptOffer(order);
    setShowConfirmAcceptModal(true);
  };

  const confirmAcceptOrder = () => {
    if (!pendingAcceptOffer) return;
    setDriverWalletBalance(prev => prev - pendingAcceptOffer.commissionDH);
    setFreightOffers(prev => prev.filter(o => o.id !== pendingAcceptOffer.id));
    setAcceptedOrders(prev => [{ ...pendingAcceptOffer, isAccepted: true }, ...prev]);
    setShowConfirmAcceptModal(false);
    setSelectedOffer(pendingAcceptOffer);
    setPendingAcceptOffer(null);
    Vibration.vibrate([0, 100, 50, 100]);
  };

  // Open Address Modal Sheet Helper
  const openAddressSheet = (target: 'pickup' | 'dropoff') => {
    setAddressTarget(target);
    setTempCity(target === 'pickup' ? pickupCity : dropoffCity);
    setTempStreet(target === 'pickup' ? pickupStreet : dropoffStreet);
    setShowAddressModal(true);
  };

  // Save Address Sheet Helper
  const saveAddressSheet = () => {
    if (!tempCity) {
      Alert.alert(t.errorTitle, t.selectCity);
      return;
    }
    if (addressTarget === 'pickup') {
      setPickupCity(tempCity);
      setPickupStreet(tempStreet || (isRTL ? 'الشارع الرئيسي' : 'Rue principale'));
    } else {
      setDropoffCity(tempCity);
      setDropoffStreet(tempStreet || (isRTL ? 'الشارع الرئيسي' : 'Rue principale'));
    }
    setShowAddressModal(false);
  };

  // Filtered Cities for Search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return MOROCCAN_CITIES;
    const q = citySearchQuery.toLowerCase();
    return MOROCCAN_CITIES.filter(c =>
      c.nameAr.toLowerCase().includes(q) ||
      c.nameFr.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.nameEs.toLowerCase().includes(q)
    );
  }, [citySearchQuery]);

  // Submit Order Handler (Créer une demande)
  const handleCreateOrder = async () => {
    let tariff = parseInt(offeredTariffStr.trim(), 10) || 0;
    const minFare = selectedVehicleObj.minFareDH;
    const vTitle = getLocalizedVehicleTitle(selectedVehicleObj);

    if (tariff <= 0) {
      Alert.alert(t.errorTitle, t.tariffLabel);
      return;
    }
    if (tariff < minFare) {
      tariff = minFare;
      setOfferedTariffStr(String(minFare));
      Alert.alert(t.errorTitle, `${t.minFareWarning} ${vTitle} ${t.is} ${minFare} MAD.`);
    }

    const fullPickup = `${pickupCity}, ${pickupStreet}`;
    const fullDropoff = `${dropoffCity}, ${dropoffStreet}`;

    setIsSubmittingOrder(true);
    try {
      await api.post('/passenger/rides', {
        pickupLat,
        pickupLng,
        pickupAddress: fullPickup,
        dropoffLat,
        dropoffLng,
        dropoffAddress: fullDropoff,
        serviceType: 'FREIGHT',
        offeredPrice: tariff,
        tripType: 'CARGO',
        rideMode: 'FREIGHT',
        seatsBooked: hasPassenger ? 1 : 0,
        departureDateTime: new Date().toISOString(),
        passengerNotes: `[${vTitle}] ${cargoDescription} (${t.optionsLabel}: ${helpersOption}, Elevator: ${hasElevator ? 'Yes' : 'No'})`,
      });

      Alert.alert(t.successTitle, t.successMsg);
      fetchPassengerData();
    } catch (err) {
      Alert.alert(t.errorTitle, t.errorMsg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // PASSENGER MODE UI VIEW (Fret / الشحن والنقل للزبون)
  // ═════════════════════════════════════════════════════════════════════════════
  if (activeMode === 'PASSENGER') {
    return (
      <View style={[styles.safe, { backgroundColor: colors.surfaceAlt }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <DrawerHeader title={t.pageTitle} />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoadingPassenger} onRefresh={fetchPassengerData} colors={['#4F46E5']} />
          }
        >
          {/* ═════════════════════════════════════════════════════════════════
              FORM SECTION B: 4 FREIGHT VEHICLES CAROUSEL WITH ENLARGED 3D IMAGES
             ═════════════════════════════════════════════════════════════════ */}
          <View style={{ backgroundColor: colors.surface, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
              {TRUCK_VEHICLES.map((v) => {
                const isSel = selectedVehicleId === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={{
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: 18,
                      backgroundColor: isSel ? '#4F46E5' : colors.surfaceAlt,
                      borderWidth: isSel ? 2 : 1,
                      borderColor: isSel ? '#4F46E5' : colors.border,
                      minWidth: 145,
                    }}
                    onPress={() => {
                      handleSelectVehicle(v.id as any);
                      setShowVehiclePickerModal(true);
                    }}
                  >
                    <Image
                      source={v.image}
                      style={{ width: 92, height: 64, resizeMode: 'contain' }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isSel ? '#FFF' : colors.textPrimary, marginTop: 6, textAlign: 'center' }}>
                      {getLocalizedVehicleTitle(v)}
                    </Text>
                    <View style={{ backgroundColor: isSel ? 'rgba(255,255,255,0.22)' : '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: isSel ? '#FFF' : '#4F46E5' }}>📦 {v.dimensions}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ padding: 16, gap: 16 }}>
            {/* Active Ride Banner if present */}
            {activeRide && (
              <View style={{ padding: 16, backgroundColor: '#EEF2FF', borderRadius: 16, borderWidth: 1.5, borderColor: '#4F46E5' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#4F46E5' }}>{t.activeRideBanner}</Text>
                  <View style={{ backgroundColor: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{t.activeRideSearching}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#374151', marginTop: 8 }}>
                  {activeRide.pickupAddress} ➔ {activeRide.dropoffAddress}
                </Text>
              </View>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION C & D: 2-STEP LOCATION FIELDS (CITY + STREET)
               ═════════════════════════════════════════════════════════════════ */}
            {/* Pickup Location Box */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 6 }}
              activeOpacity={0.8}
              onPress={() => openAddressSheet('pickup')}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted }}>{t.pickupLabel}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }} numberOfLines={1}>
                  {pickupCity}, {pickupStreet}
                </Text>
                {isRTL ? <ChevronRight size={18} color={colors.textMuted} /> : <ChevronLeft size={18} color={colors.textMuted} />}
              </View>
            </TouchableOpacity>

            {/* Destination Location Box */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 6 }}
              activeOpacity={0.8}
              onPress={() => openAddressSheet('dropoff')}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted }}>{t.dropoffLabel}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }} numberOfLines={1}>
                  {dropoffCity}, {dropoffStreet}
                </Text>
                {isRTL ? <ChevronRight size={18} color={colors.textMuted} /> : <ChevronLeft size={18} color={colors.textMuted} />}
              </View>
            </TouchableOpacity>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION E: PICKUP TIME CHIPS
               ═════════════════════════════════════════════════════════════════ */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>{t.timeLabel}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'ASAP', label: t.timeAsap },
                  { id: 'IN_1_HOUR', label: t.time1h },
                  { id: 'SCHEDULED', label: t.timeSched },
                ].map((item) => {
                  const isSel = pickupTimeOption === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: isSel ? colors.surface : colors.surfaceAlt,
                        borderWidth: isSel ? 2 : 1,
                        borderColor: isSel ? '#4F46E5' : colors.border,
                        alignItems: 'center',
                      }}
                      onPress={() => setPickupTimeOption(item.id as any)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: isSel ? '#4F46E5' : colors.textMuted }}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION F: CARGO DESCRIPTION FIELD
               ═════════════════════════════════════════════════════════════════ */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 6 }}
              activeOpacity={0.8}
              onPress={() => setShowDescModal(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>{t.cargoDescLabel}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: cargoDescription ? colors.textPrimary : colors.textMuted, flex: 1, textAlign: isRTL ? 'right' : 'left' }} numberOfLines={1}>
                  {cargoDescription || t.cargoDescHint}
                </Text>
                {isRTL ? <ChevronRight size={18} color={colors.textMuted} /> : <ChevronLeft size={18} color={colors.textMuted} />}
              </View>
            </TouchableOpacity>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION G: VEHICLE CAPACITY SUMMARY BOX (ENLARGED IMAGE)
               ═════════════════════════════════════════════════════════════════ */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}
              activeOpacity={0.8}
              onPress={() => setShowVehiclePickerModal(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>{t.vehicleSizeLabel}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                  <Image source={selectedVehicleObj.image} style={{ width: 78, height: 54, resizeMode: 'contain' }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }}>{getLocalizedVehicleTitle(selectedVehicleObj)}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>{getLocalizedVehicleDesc(selectedVehicleObj)}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#4F46E5' }}>📦 {selectedVehicleObj.dimensions}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION H: OPTIONS CHIPS
               ═════════════════════════════════════════════════════════════════ */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }}>{t.optionsLabel}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: paymentOption === 'cash' ? '#EEF2FF' : colors.surface,
                    borderWidth: 1,
                    borderColor: paymentOption === 'cash' ? '#4F46E5' : colors.border,
                  }}
                  onPress={() => setPaymentOption(paymentOption === 'cash' ? 'wallet' : 'cash')}
                >
                  <Text style={{ fontSize: 13 }}>💵</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: paymentOption === 'cash' ? '#4F46E5' : colors.textPrimary }}>{t.optCash}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: helpersOption === 1 ? '#EEF2FF' : colors.surface,
                    borderWidth: 1,
                    borderColor: helpersOption === 1 ? '#4F46E5' : colors.border,
                  }}
                  onPress={() => setHelpersOption(helpersOption === 1 ? 0 : 1)}
                >
                  <Text style={{ fontSize: 13 }}>👷</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: helpersOption === 1 ? '#4F46E5' : colors.textPrimary }}>{t.optHelper1}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: helpersOption === 2 ? '#EEF2FF' : colors.surface,
                    borderWidth: 1,
                    borderColor: helpersOption === 2 ? '#4F46E5' : colors.border,
                  }}
                  onPress={() => setHelpersOption(helpersOption === 2 ? 0 : 2)}
                >
                  <Text style={{ fontSize: 13 }}>👷👷</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: helpersOption === 2 ? '#4F46E5' : colors.textPrimary }}>{t.optHelper2}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: hasElevator ? '#EEF2FF' : colors.surface,
                    borderWidth: 1,
                    borderColor: hasElevator ? '#4F46E5' : colors.border,
                  }}
                  onPress={() => setHasElevator(!hasElevator)}
                >
                  <Text style={{ fontSize: 13 }}>🛗</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: hasElevator ? '#4F46E5' : colors.textPrimary }}>{t.optElevator}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: hasPassenger ? '#EEF2FF' : colors.surface,
                    borderWidth: 1,
                    borderColor: hasPassenger ? '#4F46E5' : colors.border,
                  }}
                  onPress={() => setHasPassenger(!hasPassenger)}
                >
                  <Text style={{ fontSize: 13 }}>👥</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: hasPassenger ? '#4F46E5' : colors.textPrimary }}>{t.optPassenger}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION I: CARGO PHOTO PICKER (INTERACTIVE WITH CUSTOM BOTTOM SHEET)
               ═════════════════════════════════════════════════════════════════ */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }}>{t.photoLabel}</Text>
              {cargoPhotoUri ? (
                <TouchableOpacity
                  style={{ width: 110, height: 110, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4F46E5', position: 'relative' }}
                  onPress={() => setShowPhotoPickerModal(true)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: cargoPhotoUri }} style={{ width: '100%', height: '100%' }} />
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', padding: 6, borderRadius: 14 }}
                    onPress={() => setCargoPhotoUri(null)}
                  >
                    <Trash2 size={16} color="#FFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ width: 94, height: 94, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#4F46E5', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setShowPhotoPickerModal(true)}
                  activeOpacity={0.8}
                >
                  <Camera size={26} color="#4F46E5" />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#4F46E5', marginTop: 4 }}>+ {t.photoLabel}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ═════════════════════════════════════════════════════════════════
                FORM SECTION J: PROPOSED TARIFF FIELD (Yalla Brand Styling)
               ═════════════════════════════════════════════════════════════════ */}
            <TouchableOpacity
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#4F46E5', gap: 6 }}
              activeOpacity={0.8}
              onPress={() => setShowPriceModal(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>{t.tariffLabel}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#4F46E5' }}>
                  {offeredTariffStr} MAD / DH
                </Text>
                {isRTL ? <ChevronRight size={18} color="#4F46E5" /> : <ChevronLeft size={18} color="#4F46E5" />}
              </View>
            </TouchableOpacity>

            {/* ═════════════════════════════════════════════════════════════════
                SECTION K: FIXED BOTTOM ACTION BUTTON (Créer une demande)
               ═════════════════════════════════════════════════════════════════ */}
            <TouchableOpacity
              style={{ backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.35, shadowRadius: 10, elevation: 4, marginTop: 10 }}
              disabled={isSubmittingOrder}
              onPress={handleCreateOrder}
            >
              {isSubmittingOrder ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>{t.createOrderBtn}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ═════════════════════════════════════════════════════════════════
            MODAL 0: CARGO PHOTO PICKER BOTTOM SHEET (CAMERA vs GALLERY)
           ═════════════════════════════════════════════════════════════════ */}
        <Modal visible={showPhotoPickerModal} transparent animationType="slide" onRequestClose={() => setShowPhotoPickerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', padding: 22 }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                  {t.photoModalTitle}
                </Text>
                <TouchableOpacity onPress={() => setShowPhotoPickerModal(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12 }}>
                {/* 1. Take Photo via Camera */}
                <TouchableOpacity
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: '#EEF2FF',
                    borderWidth: 1.5,
                    borderColor: '#4F46E5',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                  onPress={handleTakePhoto}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' }}>
                    <Camera size={22} color="#FFF" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#4F46E5', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    {t.takePhoto}
                  </Text>
                </TouchableOpacity>

                {/* 2. Choose from Phone Gallery */}
                <TouchableOpacity
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                  onPress={handleChooseFromGallery}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#312E81', justifyContent: 'center', alignItems: 'center' }}>
                    <ImageIcon size={22} color="#FFF" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    {t.chooseGallery}
                  </Text>
                </TouchableOpacity>

                {/* 3. Delete Photo if exists */}
                {!!cargoPhotoUri && (
                  <TouchableOpacity
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: '#FEE2E2',
                      borderWidth: 1,
                      borderColor: '#EF4444',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 4,
                    }}
                    onPress={() => {
                      setCargoPhotoUri(null);
                      setShowPhotoPickerModal(false);
                    }}
                  >
                    <Trash2 size={20} color="#EF4444" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#EF4444' }}>{t.deletePhoto}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* ═════════════════════════════════════════════════════════════════
            MODAL 1: 4 TRUCK/FREIGHT VEHICLES SPECS SELECTION SHEET
           ═════════════════════════════════════════════════════════════════ */}
        <Modal visible={showVehiclePickerModal} transparent animationType="slide" onRequestClose={() => setShowVehiclePickerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', padding: 20 }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                  {t.selectVehicleTitle}
                </Text>
                <TouchableOpacity onPress={() => setShowVehiclePickerModal(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12 }}>
                {TRUCK_VEHICLES.map((v) => {
                  const isSel = selectedVehicleId === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        backgroundColor: isSel ? '#EEF2FF' : colors.surfaceAlt,
                        borderWidth: isSel ? 2 : 1,
                        borderColor: isSel ? '#4F46E5' : colors.border,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        alignItems: 'center',
                        gap: 14,
                      }}
                      onPress={() => {
                        handleSelectVehicle(v.id as any);
                        setShowVehiclePickerModal(false);
                      }}
                    >
                      <Image source={v.image} style={{ width: 88, height: 60, resizeMode: 'contain' }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }}>{getLocalizedVehicleTitle(v)}</Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>{getLocalizedVehicleDesc(v)}</Text>
                        <View style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start', backgroundColor: '#4F46E5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFF' }}>📦 {v.dimensions} (Min: {v.minFareDH} DH)</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>

        {/* ═════════════════════════════════════════════════════════════════
            MODAL 2: 2-STEP ADDRESS & CITY SELECTION SHEET
           ═════════════════════════════════════════════════════════════════ */}
        <Modal visible={showAddressModal} transparent animationType="slide" onRequestClose={() => setShowAddressModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', padding: 20 }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                  {addressTarget === 'pickup' ? t.pickupLabel : t.dropoffLabel}
                </Text>
                <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 14 }}>
                {/* Step 1: Sélectionner la ville */}
                <TouchableOpacity
                  style={{ backgroundColor: colors.surfaceAlt, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 4 }}
                  onPress={() => setShowCitySearchModal(true)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>{t.selectCity}</Text>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: tempCity ? colors.textPrimary : colors.textMuted }}>
                      {tempCity || t.selectCity}
                    </Text>
                    {isRTL ? <ChevronRight size={18} color={colors.textMuted} /> : <ChevronLeft size={18} color={colors.textMuted} />}
                  </View>
                </TouchableOpacity>

                {/* Step 2: Numéro de domicile et rue (Appears after City is selected) */}
                {!!tempCity && (
                  <View style={{ backgroundColor: colors.surfaceAlt, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>{t.streetLabel}</Text>
                    <TextInput
                      style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, padding: 0, textAlign: isRTL ? 'right' : 'left' }}
                      placeholder={t.streetHint}
                      placeholderTextColor={colors.textMuted}
                      value={tempStreet}
                      onChangeText={setTempStreet}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={{ backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10 }}
                  onPress={saveAddressSheet}
                >
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>{t.done}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ═════════════════════════════════════════════════════════════════
            MODAL 3: CITY SEARCH MODAL (Autocomplete)
           ═════════════════════════════════════════════════════════════════ */}
        <Modal visible={showCitySearchModal} transparent animationType="fade" onRequestClose={() => setShowCitySearchModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', height: '70%', padding: 20 }]}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>{t.selectCity}</Text>
                <TouchableOpacity onPress={() => setShowCitySearchModal(false)}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}
                placeholder={t.searchCityHint}
                placeholderTextColor={colors.textMuted}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
              />

              <ScrollView contentContainerStyle={{ gap: 8 }}>
                {filteredCities.map((c) => {
                  const cName = currentLang === 'ar' ? c.nameAr : currentLang === 'fr' ? c.nameFr : currentLang === 'es' ? c.nameEs : c.nameEn;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      onPress={() => {
                        setTempCity(c.nameFr);
                        setShowCitySearchModal(false);
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{cName} ({c.nameAr})</Text>
                      {isRTL ? <ChevronRight size={16} color={colors.textMuted} /> : <ChevronLeft size={16} color={colors.textMuted} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Cargo Description Modal */}
        <Modal visible={showDescModal} transparent animationType="slide" onRequestClose={() => setShowDescModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', padding: 20 }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }}>
                {t.cargoDescLabel}
              </Text>
              <TextInput
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 14, color: colors.textPrimary, minHeight: 100, textAlignVertical: 'top', textAlign: isRTL ? 'right' : 'left' }}
                multiline
                placeholder={t.cargoDescHint}
                placeholderTextColor={colors.textMuted}
                value={cargoDescription}
                onChangeText={setCargoDescription}
              />
              <TouchableOpacity
                style={{ backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 }}
                onPress={() => setShowDescModal(false)}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Tariff Input Modal */}
        <Modal visible={showPriceModal} transparent animationType="slide" onRequestClose={() => setShowPriceModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border, width: '100%', padding: 20 }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 4, textAlign: 'center' }}>
                {t.tariffLabel} (MAD)
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 12, textAlign: 'center' }}>
                {t.minFareWarning} {getLocalizedVehicleTitle(selectedVehicleObj)} {t.is} {selectedVehicleObj.minFareDH} MAD
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', marginVertical: 16 }}>
                <TouchableOpacity
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => {
                    const curr = parseInt(offeredTariffStr, 10) || selectedVehicleObj.minFareDH;
                    const next = Math.max(selectedVehicleObj.minFareDH, curr - 10);
                    setOfferedTariffStr(String(next));
                  }}
                >
                  <Minus size={20} color="#4F46E5" />
                </TouchableOpacity>

                <TextInput
                  style={{ fontSize: 28, fontWeight: '900', color: '#4F46E5', width: 120, textAlign: 'center' }}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={offeredTariffStr}
                  onChangeText={setOfferedTariffStr}
                />

                <TouchableOpacity
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => {
                    const curr = parseInt(offeredTariffStr, 10) || selectedVehicleObj.minFareDH;
                    setOfferedTariffStr(String(curr + 10));
                  }}
                >
                  <Plus size={20} color="#4F46E5" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 }}
                onPress={() => setShowPriceModal(false)}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>{t.confirmTariff}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // DRIVER MODE UI VIEW
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <View style={[styles.safe, { backgroundColor: colors.surfaceAlt }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <DrawerHeader title={`📦 ${t.pageTitle}`} />

      <View style={[styles.toggleBanner, { backgroundColor: isReceivingActive ? '#EEF2FF' : colors.surface, borderColor: isReceivingActive ? '#4F46E5' : colors.border }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: isReceivingActive ? '#4F46E5' : colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {isReceivingActive ? (isRTL ? 'استقبال طلبات الشحن والنقل' : 'Réception des demandes de fret') : (isRTL ? 'خدمة الشحن متوقفة حالياً' : 'Service de fret en pause')}
          </Text>
          <Text style={[styles.toggleSub, { color: isReceivingActive ? '#4F46E5' : colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            Solde: <Text style={{ fontWeight: '800', color: '#4F46E5' }}>DH {driverWalletBalance.toFixed(0)}</Text>
          </Text>
        </View>
        <Switch
          value={isReceivingActive}
          onValueChange={handleToggleReceiving}
          trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
          thumbColor={isReceivingActive ? '#FFFFFF' : '#F3F4F6'}
        />
      </View>

      {!isDriverEligible ? (
        <View style={styles.subGuardContainer}>
          <View style={[styles.subGuardCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.subGuardIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <AlertTriangle size={36} color="#D97706" />
            </View>
            <Text style={[styles.subGuardTitle, { color: colors.textPrimary }]}>تنبيه تأهيل المركبة</Text>
            <Text style={[styles.subGuardDesc, { color: colors.textMuted, textAlign: 'center', marginBottom: 20 }]}>
              خدمة الشحن والنقل مخصصة للشاحنات والسيارات النفعية المعتمدة.
            </Text>
            <TouchableOpacity style={[styles.subActivateBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('SelectVehicleType')}>
              <Text style={styles.subActivateBtnTxt}>تغيير نوع المركبة إلى شاحنة/سيارة نفعية</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.tabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'feed' && { borderBottomWidth: 3, borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab('feed')}
            >
              <Text style={[styles.tabTxt, { color: activeTab === 'feed' ? colors.primary : colors.textMuted }]}>
                الطلبات المتاحة ({freightOffers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'my_trips' && { borderBottomWidth: 3, borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab('my_trips')}
            >
              <Text style={[styles.tabTxt, { color: activeTab === 'my_trips' ? colors.primary : colors.textMuted }]}>
                رحلات الشحن المقبولة ({acceptedOrders.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'feed' ? (
              freightOffers.map((order) => (
                <View key={order.id} style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.priceBigTxt, { color: colors.primary }]}>{order.grossFareDH} DH</Text>
                    <View style={[styles.badgePill, { backgroundColor: '#EEF2FF' }]}>
                      <Text style={[styles.badgePillTxt, { color: '#4F46E5' }]}>{order.cargoType}</Text>
                    </View>
                  </View>

                  <View style={[styles.specsRow, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.specTxt, { color: colors.textMuted }]}>⏱️ {order.durationMinutes} min</Text>
                    <Text style={[styles.specTxt, { color: colors.textMuted }]}>📦 {order.packagesCount} p</Text>
                    <Text style={[styles.specTxt, { color: colors.textMuted }]}>📐 {order.cargoVolumeM3} m³</Text>
                    <Text style={[styles.specTxt, { color: colors.textMuted }]}>⚖️ {order.cargoWeightKg} kg</Text>
                  </View>

                  <View style={styles.routeBox}>
                    <Text style={[styles.cityTxt, { color: colors.textPrimary }]}>🟢 A: {order.fromAddress}</Text>
                    <Text style={[styles.cityTxt, { color: colors.textPrimary, marginTop: 4 }]}>🔴 B: {order.toAddress}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity style={[styles.acceptBtn, { flex: 2, backgroundColor: colors.primary }]} onPress={() => handleAcceptPress(order)}>
                      <Text style={styles.acceptBtnTxt}>قبول طلب الشحن 📦</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              acceptedOrders.map((order) => (
                <View key={order.id} style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: '#4F46E5' }]}>
                  <Text style={[styles.priceBigTxt, { color: '#4F46E5' }]}>{order.grossFareDH} DH</Text>
                  <Text style={[styles.riderNameTxt, { color: colors.textPrimary }]}>👤 {order.customerFirstName}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Confirmation Modals */}
      <Modal visible={showInsufficientBalanceModal} transparent animationType="fade" onRequestClose={() => setShowInsufficientBalanceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary }]}>رصيد المحفظة غير كافٍ ⚠️</Text>
            <TouchableOpacity style={[styles.subActivateBtn, { backgroundColor: '#4F46E5', width: '100%', marginTop: 12 }]} onPress={() => { setShowInsufficientBalanceModal(false); navigation.navigate('Wallet'); }}>
              <Text style={styles.subActivateBtnTxt}>شحن المحفظة الآن 💳</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmAcceptModal} transparent animationType="fade" onRequestClose={() => setShowConfirmAcceptModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary }]}>تأكيد قبول طلب الشحن 📦</Text>
            <TouchableOpacity style={[styles.subActivateBtn, { backgroundColor: colors.primary, width: '100%', marginTop: 12 }]} onPress={confirmAcceptOrder}>
              <Text style={styles.subActivateBtnTxt}>تأكيد الخصم والقبول الآن 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard3D: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  modalTitleTxt: { fontSize: 18, fontWeight: '800' },
  modalDescTxt: { fontSize: 13, lineHeight: 18 },
  subGuardContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  subGuardCard3D: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  subGuardIconWrap: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  subGuardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  subGuardDesc: { fontSize: 14, lineHeight: 20 },
  subActivateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 14, borderRadius: 12 },
  subActivateBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  toggleBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1 },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '700' },
  toggleSub: { fontSize: 12, marginTop: 2 },
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
  cityTxt: { fontSize: 14, fontWeight: '600' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  acceptBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  riderNameTxt: { fontSize: 14, fontWeight: '600' },
  card3D: { padding: 16, borderRadius: 16, borderWidth: 1 },
});
