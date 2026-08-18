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
  TextInput,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Navigation as NavIcon,
  Briefcase,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ArrowRightLeft,
  ShieldCheck,
  X,
  Plus,
  RefreshCw,
  Award,
  Check,
  Zap,
  Phone,
  MessageSquare,
  Baby,
  Dog,
  CreditCard,
  Wallet,
  Star,
  Info,
  Layers,
  Lock,
  ArrowDown,
  Navigation2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawerHeader } from '../../components/DrawerHeader';

const INTERCITY_PREFS_KEY = '@yalla_driver_intercity_prefs';
const INTERCITY_SUB_KEY   = '@yalla_driver_intercity_sub';

export interface MoroccanCity {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  region: string;
}

export const MOROCCAN_CITIES: MoroccanCity[] = [
  { id: 'casablanca', nameAr: 'الدار البيضاء', nameFr: 'Casablanca', nameEn: 'Casablanca', region: 'Casablanca-Settat' },
  { id: 'marrakech', nameAr: 'مراكش', nameFr: 'Marrakech', nameEn: 'Marrakech', region: 'Marrakech-Safi' },
  { id: 'rabat', nameAr: 'الرباط', nameFr: 'Rabat', nameEn: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { id: 'tangier', nameAr: 'طنجة', nameFr: 'Tanger', nameEn: 'Tangier', region: 'Tanger-Tétouan-Al Hoceïma' },
  { id: 'agadir', nameAr: 'أكادير', nameFr: 'Agadir', nameEn: 'Agadir', region: 'Souss-Massa' },
  { id: 'fes', nameAr: 'فاس', nameFr: 'Fès', nameEn: 'Fes', region: 'Fès-Meknès' },
  { id: 'meknes', nameAr: 'مكناس', nameFr: 'Meknès', nameEn: 'Meknes', region: 'Fès-Meknès' },
  { id: 'oujda', nameAr: 'وجدة', nameFr: 'Oujda', nameEn: 'Oujda', region: 'L\'Oriental' },
  { id: 'tetouan', nameAr: 'تطوان', nameFr: 'Tétouan', nameEn: 'Tetouan', region: 'Tanger-Tétouan-Al Hoceïma' },
  { id: 'al_hoceima', nameAr: 'الحسيمة', nameFr: 'Al Hoceïma', nameEn: 'Al Hoceima', region: 'Tanger-Tétouan-Al Hoceïma' },
  { id: 'nador', nameAr: 'الناظور', nameFr: 'Nador', nameEn: 'Nador', region: 'L\'Oriental' },
  { id: 'safi', nameAr: 'آسفي', nameFr: 'Safi', nameEn: 'Safi', region: 'Marrakech-Safi' },
  { id: 'el_jadida', nameAr: 'الجديدة', nameFr: 'El Jadida', nameEn: 'El Jadida', region: 'Casablanca-Settat' },
  { id: 'beni_mellal', nameAr: 'بني ملال', nameFr: 'Béni Mellal', nameEn: 'Beni Mellal', region: 'Béni Mellal-Khénifra' },
  { id: 'errachidia', nameAr: 'الرشيدية', nameFr: 'Errachidia', nameEn: 'Errachidia', region: 'Drâa-Tafilalet' },
  { id: 'ouarzazate', nameAr: 'ورزازات', nameFr: 'Ouarzazate', nameEn: 'Ouarzazate', region: 'Drâa-Tafilalet' },
  { id: 'laayoune', nameAr: 'العيون', nameFr: 'Laâyoune', nameEn: 'Laayoune', region: 'Laâyoune-Sakia El Hamra' },
  { id: 'dakhla', nameAr: 'الداخلة', nameFr: 'Dakhla', nameEn: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab' },
  { id: 'kenitra', nameAr: 'القنيطرة', nameFr: 'Kénitra', nameEn: 'Kenitra', region: 'Rabat-Salé-Kénitra' },
  { id: 'settat', nameAr: 'سطات', nameFr: 'Settat', nameEn: 'Settat', region: 'Casablanca-Settat' },
  { id: 'khouribga', nameAr: 'خريبكة', nameFr: 'Khouribga', nameEn: 'Khouribga', region: 'Béni Mellal-Khénifra' },
  { id: 'taza', nameAr: 'تازة', nameFr: 'Taza', nameEn: 'Taza', region: 'Fès-Meknès' },
  { id: 'essaouira', nameAr: 'الصويرة', nameFr: 'Essaouira', nameEn: 'Essaouira', region: 'Marrakech-Safi' },
  { id: 'taroudant', nameAr: 'تارودانت', nameFr: 'Taroudant', nameEn: 'Taroudant', region: 'Souss-Massa' },
  { id: 'guelmim', nameAr: 'كلميم', nameFr: 'Guelmim', nameEn: 'Guelmim', region: 'Guelmim-Oued Noun' },
  { id: 'chefchaouen', nameAr: 'شفشاون', nameFr: 'Chefchaouen', nameEn: 'Chefchaouen', region: 'Tanger-Tétouan-Al Hoceïma' },
];

export interface IntercityFeedOffer {
  id: string;
  fromCity: MoroccanCity;
  toCity: MoroccanCity;
  pickupLandmark: string;
  dropoffLandmark: string;
  dateStr: string;
  timeStr: string;
  distanceKm: number;
  durationEst: string;
  highwayRoute: string;
  grossFareDH: number;
  commissionDH: number;
  netDriverEarningsDH: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  passengersCount: number;
  luggageCount: number;
  hasChildSeat: boolean;
  hasPet: boolean;
  riderFirstName: string;
  riderRating: number;
  riderTripsCount: number;
  riderMemberSinceYear: number;
  riderPhone: string;
  riderNotes?: string;
  publishedAgoMinutes: number;
  isAccepted: boolean;
}

const FEED_SAMPLE_DATA: IntercityFeedOffer[] = [
  {
    id: 'IC-2026-881',
    fromCity: MOROCCAN_CITIES[1], // Marrakech
    toCity: MOROCCAN_CITIES[4],   // Agadir
    pickupLandmark: 'أمام محطة القطار شارع محمد السادس',
    dropoffLandmark: 'حي الداخلة، قرب شارع الحسن الثاني',
    dateStr: 'الأربعاء | 29 يوليو 2026',
    timeStr: '08:15 صباحاً',
    distanceKm: 245,
    durationEst: '3 ساعات و15 دقيقة',
    highwayRoute: 'طريق A7 السيار المباشر',
    grossFareDH: 350,
    commissionDH: 36.4,
    netDriverEarningsDH: 313.6,
    paymentMethod: 'cash',
    passengersCount: 2,
    luggageCount: 2,
    hasChildSeat: true,
    hasPet: false,
    riderFirstName: 'Mohamed',
    riderRating: 4.9,
    riderTripsCount: 145,
    riderMemberSinceYear: 2025,
    riderPhone: '0661234567',
    riderNotes: 'لدي حقائب سفر كبيرة، أرجو الانتظار 5 دقائق عند الوصول للمحطة.',
    publishedAgoMinutes: 3,
    isAccepted: false,
  },
  {
    id: 'IC-2026-882',
    fromCity: MOROCCAN_CITIES[1], // Marrakech
    toCity: MOROCCAN_CITIES[0],   // Casablanca
    pickupLandmark: 'فندق المأمونية، شارع باب جديد',
    dropoffLandmark: 'حي المعاريف، قرب سيتي سنتر',
    dateStr: 'الأربعاء | 29 يوليو 2026',
    timeStr: '11:00 صباحاً',
    distanceKm: 242,
    durationEst: '2س 30د',
    highwayRoute: 'طريق A3 السيار',
    grossFareDH: 450,
    commissionDH: 46.8,
    netDriverEarningsDH: 403.2,
    paymentMethod: 'card',
    passengersCount: 1,
    luggageCount: 1,
    hasChildSeat: false,
    hasPet: true,
    riderFirstName: 'Sarah',
    riderRating: 4.95,
    riderTripsCount: 88,
    riderMemberSinceYear: 2024,
    riderPhone: '0669876543',
    riderNotes: 'أسافر برفقة قطة صغيرة في صندوق التنقل الخاص بها.',
    publishedAgoMinutes: 7,
    isAccepted: false,
  },
  {
    id: 'IC-2026-883',
    fromCity: MOROCCAN_CITIES[2], // Rabat
    toCity: MOROCCAN_CITIES[3],   // Tangier
    pickupLandmark: 'محطة أقدال، شارع فرنسا',
    dropoffLandmark: 'مارينا طنجة البوغاز',
    dateStr: 'الخميس | 30 يوليو 2026',
    timeStr: '14:30 ظهراً',
    distanceKm: 250,
    durationEst: '2س 45د',
    highwayRoute: 'طريق A1 السيار الساحلي',
    grossFareDH: 520,
    commissionDH: 54.08,
    netDriverEarningsDH: 465.92,
    paymentMethod: 'wallet',
    passengersCount: 3,
    luggageCount: 3,
    hasChildSeat: false,
    hasPet: false,
    riderFirstName: 'Youssef',
    riderRating: 4.88,
    riderTripsCount: 210,
    riderMemberSinceYear: 2023,
    riderPhone: '0670001122',
    riderNotes: 'الرجاء تشغيل التكييف بشكل جيد خلال الرحلة.',
    publishedAgoMinutes: 12,
    isAccepted: false,
  },
];

// ─── 4-Languages Dictionary for Intercity Ride Requests Feed ────────────────
const TRANSLATIONS: any = {
  ar: {
    screen_title: '🚗 الرحلات بين المدن',
    screen_subtitle: 'طلبات السفر المباشرة بين المدن المغربية بحساب الأرباح اللحظي',

    sub_required_title: 'تفعيل اشتراك خدمة الرحلات بين المدن',
    sub_required_desc: 'للبدء في استقبال جميع طلبات الرحلات بين المدن في المغرب، يرجى تفعيل الاشتراك الخاص بهذه الخدمة.',
    sub_duration_lbl: 'مدة الاشتراك',
    sub_duration_val: '36 ساعة (عمل متواصل)',
    sub_price_lbl: 'رسوم التفعيل',
    sub_price_val: '29 د.م (تخصم من المحفظة)',
    sub_activate_btn: 'تفعيل الاشتراك الآن 🚀',
    sub_success_msg: 'تم تفعيل اشتراك الرحلات بين المدن بنجاح لمدة 36 ساعة! 🥳',
    sub_insufficient_wallet: 'عفواً، رصيد محفظتك غير كافٍ (تحتاج 29 د.م لتفعيل الاشتراك).',

    tab_feed: 'طلبات الرحلات ⚡',
    tab_my_trips: 'رحلاتي المحجوزة 📋',

    filter_btn: 'تصفية وفرز',
    sort_nearest: 'الأقرب لموقعك 📍',
    sort_price: 'أعلى سعر 💰',
    sort_time: 'أبكر انطلاق ⏰',
    sort_recent: 'أحدث الطلبات 🆕',

    from_label: '🟢 A – من (Departure)',
    to_label: '🔴 B – إلى (Destination)',
    select_from_placeholder: 'اختر مدينة الانطلاق',
    select_to_placeholder: 'اختر مدينة الوصول',

    payment_cash: '💵 نقداً',
    payment_card: '💳 بطاقة',
    payment_wallet: '💼 محفظة Yalla',

    status_new: '🟢 جديد',
    mins_ago: 'منذ {{mins}} دقيقة',

    accept_offer_btn: 'قبول الطلب 🟢',
    view_details_btn: 'عرض التفاصيل 👁️',

    child_seat_badge: '👶 طفل',
    pet_badge: '🐶 حيوان أليف',
    passengers: 'ركاب',
    luggage: 'حقائب',
    trips_unit: 'رحلة',

    details_modal_title: 'تفاصيل رحلة بين المدن',
    route_map_sim: 'خريطة المسار المباشر (A ➜ B)',
    financial_breakdown: 'تفاصيل السعر والعمولة',
    gross_fare: 'إجمالي سعر الرحلة',
    commission_fee: 'عمولة التطبيق (10.4%)',
    net_earnings: 'صافي أرباح السائق',

    rider_info_title: 'بيانات الراكب',
    member_since: 'عضو منذ',
    communication_lang: 'لغة التواصل: العربية',
    rider_notes_lbl: 'ملاحظات الراكب الخاصّة:',

    unlocked_contact_title: 'بيانات التواصل المباشرة (تم القبول 🟢)',
    call_btn: 'اتصال هاتفي 📞',
    chat_btn: 'دردشة مباشرة 💬',
    navigate_btn: 'بدء الملاحة 🗺️',

    trip_taken_by_other: 'تم قبول هذه الرحلة بواسطة سائق آخر ⚠️',

    empty_feed_title: 'لا توجد حالياً أي طلبات رحلات بين المدن مطابقة لاختياراتك.',
    refresh_search_btn: 'تحديث البحث 🔄',

    // ── PRE-ACCEPTANCE WALLET VERIFICATION & CONFIRMATION ────────────────────
    insufficient_wallet_title: 'رصيد المحفظة غير كافٍ',
    insufficient_wallet_desc: 'رصيدك الحالي لا يسمح بقبول هذا الطلب. يرجى تعبئة محفظتك أولاً حتى تتمكن من استقبال هذه الرحلة.',
    current_balance_lbl: 'رصيدك الحالي',
    min_required_lbl: 'الحد الأدنى المطلوب',
    amount_needed_lbl: 'المبلغ المطلوب إضافته',
    topup_wallet_btn: 'تعبئة الرصيد 💳',
    cancel_btn: 'إلغاء',

    confirm_accept_title: 'تأكيد قبول الرحلة',
    commission_notice: 'عند انتهاء الرحلة بنجاح سيتم خصم عمولة الخدمة تلقائياً من محفظتك.',
    expected_commission_lbl: 'العمولة المتوقعة',
    est_balance_after: 'الرصيد المتوقع بعد الخصم',
    confirm_final_accept_btn: 'تأكيد قبول الطلب 🟢',
    offer_no_longer_available: 'عذراً، هذا الطلب لم يعد متاحاً لأنه تم قبوله من قبل سائق آخر.',
    no_deduction_upon_accept_note: 'ملاحظة: لا يتم خصم أي مبلغ عند قبول الطلب. الخصم الفعلي يتم فقط بعد اكتمال الرحلة بنجاح.',
  },
  fr: {
    screen_title: '🚗 Trajets Intervilles (City to City)',
    screen_subtitle: 'Demandes de voyages en direct entre les villes marocaines avec calcul de gain instantané',

    sub_required_title: 'Activation de l\'abonnement Intervilles',
    sub_required_desc: 'Pour commencer à recevoir les demandes de trajet entre les villes au Maroc, veuillez activer l\'abonnement dédié.',
    sub_duration_lbl: 'Durée d\'activation',
    sub_duration_val: '36 heures (En continu)',
    sub_price_lbl: 'Frais d\'activation',
    sub_price_val: '29 DH (Déduits du portefeuille)',
    sub_activate_btn: 'Activer l\'abonnement 🚀',
    sub_success_msg: 'Abonnement Intervilles activé avec succès pour 36 heures ! 🥳',
    sub_insufficient_wallet: 'Solde insuffisant (Nécessite 29 DH pour l\'activation).',

    tab_feed: 'Offres Disponibles ⚡',
    tab_my_trips: 'Mes Trajets Reservés 📋',

    filter_btn: 'Filtrer & Trier',
    sort_nearest: 'Les plus proches 📍',
    sort_price: 'Prix le plus élevé 💰',
    sort_time: 'Départ le plus proche ⏰',
    sort_recent: 'Plus récents 🆕',

    from_label: '🟢 A – De (Départ)',
    to_label: '🔴 B – À (Destination)',
    select_from_placeholder: 'Choisir la ville de départ',
    select_to_placeholder: 'Choisir la ville d\'arrivée',

    payment_cash: '💵 Espèces',
    payment_card: '💳 Carte',
    payment_wallet: '💼 Portefeuille Yalla',

    status_new: '🟢 Nouveau',
    mins_ago: 'Il y a {{mins}} min',

    accept_offer_btn: 'Accepter l\'offre 🟢',
    view_details_btn: 'Voir Détails 👁️',

    child_seat_badge: '👶 Enfant',
    pet_badge: '🐶 Animal',
    passengers: 'passagers',
    luggage: 'bagages',
    trips_unit: 'trajets',

    details_modal_title: 'Détails du Trajet Intervilles',
    route_map_sim: 'Carte de l\'Itinéraire (A ➜ B)',
    financial_breakdown: 'Décomposition du Tarif & Commission',
    gross_fare: 'Tarif Total Brut',
    commission_fee: 'Commission Yalla VTC (10.4%)',
    net_earnings: 'Gain Net Chauffeur',

    rider_info_title: 'Infos du Passager',
    member_since: 'Membre depuis',
    communication_lang: 'Langue: Arabe/Français',
    rider_notes_lbl: 'Notes du Passager:',

    unlocked_contact_title: 'Coordonnées du Passager (Accepté 🟢)',
    call_btn: 'Appeler 📞',
    chat_btn: 'Chat 💬',
    navigate_btn: 'Navigation 🗺️',

    trip_taken_by_other: 'Ce trajet a été accepté par un autre chauffeur ⚠️',

    empty_feed_title: 'Aucune offre intervilles disponible correspondant à vos critères.',
    refresh_search_btn: 'Actualiser la recherche 🔄',

    insufficient_wallet_title: 'Solde du portefeuille insuffisant',
    insufficient_wallet_desc: 'Votre solde actuel ne permet pas d\'accepter cette course. Veuillez recharger votre portefeuille pour recevoir ce trajet.',
    current_balance_lbl: 'Votre solde actuel',
    min_required_lbl: 'Minimum requis',
    amount_needed_lbl: 'Montant à recharger',
    topup_wallet_btn: 'Recharger le solde 💳',
    cancel_btn: 'Annuler',

    confirm_accept_title: 'Confirmation de la course',
    commission_notice: 'À la fin du trajet réussi, la commission sera automatiquement déduite de votre portefeuille.',
    expected_commission_lbl: 'Commission estimée',
    est_balance_after: 'Solde estimé après déduction',
    confirm_final_accept_btn: 'Confirmer l\'acceptation 🟢',
    offer_no_longer_available: 'Désolé, ce trajet n\'est plus disponible car il a été accepté par un autre chauffeur.',
    no_deduction_upon_accept_note: 'Note : Aucun montant n\'est déduit lors de l\'acceptation. La déduction réelle a lieu uniquement à la fin du trajet.',
  },
  es: {
    screen_title: '🚗 Viajes Interurbanos (City to City)',
    screen_subtitle: 'Solicitudes de viajes directas entre ciudades con cálculo de ganancias en tiempo real',

    sub_required_title: 'Activación de suscripción Interurbana',
    sub_required_desc: 'Para recibir solicitudes entre ciudades en Marruecos, active la suscripción dedicada.',
    sub_duration_lbl: 'Duración',
    sub_duration_val: '36 horas (Continuo)',
    sub_price_lbl: 'Tarifa de activación',
    sub_price_val: '29 DH (Deducido de cartera)',
    sub_activate_btn: 'Activar Suscripción 🚀',
    sub_success_msg: '¡Suscripción activada con éxito por 36 horas! 🥳',
    sub_insufficient_wallet: 'Saldo insuficiente en su cartera (Requiere 29 DH).',

    tab_feed: 'Ofertas Disponibles ⚡',
    tab_my_trips: 'Mis Viajes Reservados 📋',

    filter_btn: 'Filtrar & Ordenar',
    sort_nearest: 'Más cercanos 📍',
    sort_price: 'Precio más alto 💰',
    sort_time: 'Salida más cercana ⏰',
    sort_recent: 'Más recientes 🆕',

    from_label: '🟢 A – Desde (Origen)',
    to_label: '🔴 B – Hasta (Destino)',
    select_from_placeholder: 'Seleccionar origen',
    select_to_placeholder: 'Seleccionar destino',

    payment_cash: '💵 Efectivo',
    payment_card: '💳 Tarjeta',
    payment_wallet: '💼 Cartera Yalla',

    status_new: '🟢 Nuevo',
    mins_ago: 'Hace {{mins}} min',

    accept_offer_btn: 'Aceptar Oferta 🟢',
    view_details_btn: 'Ver Detalles 👁️',

    child_seat_badge: '👶 Niño',
    pet_badge: '🐶 Mascota',
    passengers: 'pasajeros',
    luggage: 'equipaje',
    trips_unit: 'viajes',

    details_modal_title: 'Detalles del Viaje Interurbano',
    route_map_sim: 'Mapa de la Ruta (A ➜ B)',
    financial_breakdown: 'Desglose de Tarifa y Comisión',
    gross_fare: 'Tarifa Total Bruta',
    commission_fee: 'Comisión Yalla VTC (10.4%)',
    net_earnings: 'Ganancia Neta Chófer',

    rider_info_title: 'Info del Pasajero',
    member_since: 'Miembro desde',
    communication_lang: 'Idioma: Árabe/Francés',
    rider_notes_lbl: 'Notas del Pasajero:',

    unlocked_contact_title: 'Contacto del Pasajero (Aceptado 🟢)',
    call_btn: 'Llamar 📞',
    chat_btn: 'Chat 💬',
    navigate_btn: 'Navegar 🗺️',

    trip_taken_by_other: 'Este viaje fue aceptado por otro chófer ⚠️',

    empty_feed_title: 'No hay ofertas interurbanas disponibles que coincidan con sus criterios.',
    refresh_search_btn: 'Actualizar búsqueda 🔄',

    insufficient_wallet_title: 'Saldo de billetera insuficiente',
    insufficient_wallet_desc: 'Su saldo actual no permite aceptar este viaje. Recargue su billetera para recibir este trayecto.',
    current_balance_lbl: 'Su saldo actual',
    min_required_lbl: 'Mínimo requerido',
    amount_needed_lbl: 'Monto a recargar',
    topup_wallet_btn: 'Recargar Saldo 💳',
    cancel_btn: 'Cancelar',

    confirm_accept_title: 'Confirmación de viaje',
    commission_notice: 'Al finalizar el viaje con éxito, la comisión se deducirá automáticamente de su billetera.',
    expected_commission_lbl: 'Comisión estimada',
    est_balance_after: 'Saldo estimado tras deducción',
    confirm_final_accept_btn: 'Confirmar Aceptación 🟢',
    offer_no_longer_available: 'Lo sentimos, esta oferta ya no está disponible porque fue aceptada por otro chófer.',
    no_deduction_upon_accept_note: 'Nota: No se deduce ningún monto al aceptar. La deducción real ocurre solo al completar el viaje.',
  },
  en: {
    screen_title: '🚗 Intercity Trips (City to City)',
    screen_subtitle: 'Direct intercity ride requests across Moroccan cities with real-time earnings calculation',

    sub_required_title: 'Intercity Service Subscription Activation',
    sub_required_desc: 'To start receiving intercity ride requests across Morocco, please activate the dedicated service subscription.',
    sub_duration_lbl: 'Subscription Duration',
    sub_duration_val: '36 Hours (Non-stop)',
    sub_price_lbl: 'Activation Fee',
    sub_price_val: '29 DH (Deducted from wallet)',
    sub_activate_btn: 'Activate Subscription Now 🚀',
    sub_success_msg: 'Intercity subscription successfully activated for 36 hours! 🥳',
    sub_insufficient_wallet: 'Insufficient wallet balance (Requires 29 DH).',

    tab_feed: 'Live Ride Requests ⚡',
    tab_my_trips: 'My Reserved Trips 📋',

    filter_btn: 'Filter & Sort',
    sort_nearest: 'Nearest to location 📍',
    sort_price: 'Highest price 💰',
    sort_time: 'Earliest departure ⏰',
    sort_recent: 'Most recent 🆕',

    from_label: '🟢 A – From (Departure)',
    to_label: '🔴 B – To (Destination)',
    select_from_placeholder: 'Select origin city',
    select_to_placeholder: 'Select destination city',

    payment_cash: '💵 Cash',
    payment_card: '💳 Card',
    payment_wallet: '💼 Yalla Wallet',

    status_new: '🟢 New',
    mins_ago: '{{mins}}m ago',

    accept_offer_btn: 'Accept Request 🟢',
    view_details_btn: 'View Details 👁️',

    child_seat_badge: '👶 Child',
    pet_badge: '🐶 Pet',
    passengers: 'passengers',
    luggage: 'bags',
    trips_unit: 'trips',

    details_modal_title: 'Intercity Trip Details',
    route_map_sim: 'Live Route Visualizer (A ➜ B)',
    financial_breakdown: 'Fare & Commission Breakdown',
    gross_fare: 'Gross Trip Fare',
    commission_fee: 'Platform Commission (10.4%)',
    net_earnings: 'Net Driver Profit',

    rider_info_title: 'Rider Profile',
    member_since: 'Member since',
    communication_lang: 'Language: Arabic/French',
    rider_notes_lbl: 'Rider Special Notes:',

    unlocked_contact_title: 'Direct Rider Contact (Accepted 🟢)',
    call_btn: 'Phone Call 📞',
    chat_btn: 'Direct Chat 💬',
    navigate_btn: 'Start Navigation 🗺️',

    trip_taken_by_other: 'This ride offer was accepted by another driver ⚠️',

    empty_feed_title: 'No intercity ride offers currently match your selected filters.',
    refresh_search_btn: 'Refresh Feed 🔄',

    insufficient_wallet_title: 'Insufficient Wallet Balance',
    insufficient_wallet_desc: 'Your current balance does not allow accepting this ride. Please top up your wallet to accept this trip.',
    current_balance_lbl: 'Your Current Balance',
    min_required_lbl: 'Minimum Required',
    amount_needed_lbl: 'Amount Needed to Top Up',
    topup_wallet_btn: 'Top Up Wallet 💳',
    cancel_btn: 'Cancel',

    confirm_accept_title: 'Confirm Trip Acceptance',
    commission_notice: 'Upon successful trip completion, the service commission will be automatically deducted from your wallet.',
    expected_commission_lbl: 'Expected Commission',
    est_balance_after: 'Est. Balance After Completion',
    confirm_final_accept_btn: 'Confirm Trip Acceptance 🟢',
    offer_no_longer_available: 'Sorry, this ride request is no longer available as it was accepted by another driver.',
    no_deduction_upon_accept_note: 'Note: No funds are deducted upon accepting. Actual deduction occurs only after trip completion.',
  },
};

const getTr = (key: string, lang: string, params?: Record<string, string | number>) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  let str = TRANSLATIONS[langKey]?.[key] || TRANSLATIONS['ar']?.[key] || key;
  if (params) {
    Object.keys(params).forEach(k => {
      str = str.replace(`{{${k}}}`, String(params[k]));
    });
  }
  return str;
};

export const IntercityTripsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  // Driver Wallet Balance State (Default: 120 DH, easily toggleable for testing)
  const [driverWalletBalance, setDriverWalletBalance] = useState<number>(120.00);

  // Core Subscription Guard State
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [subExpiresAt, setSubExpiresAt] = useState<number | null>(Date.now() + 36 * 3600 * 1000);
  const [subActivating, setSubActivating] = useState<boolean>(false);

  // Tab State: 'feed' | 'my_trips'
  const [activeTab, setActiveTab] = useState<'feed' | 'my_trips'>('feed');

  // Feed State
  const [feedOffers, setFeedOffers] = useState<IntercityFeedOffer[]>(FEED_SAMPLE_DATA);
  const [reservedTrips, setReservedTrips] = useState<IntercityFeedOffer[]>([]);

  // Selected Offer Details Modal State
  const [selectedOffer, setSelectedOffer] = useState<IntercityFeedOffer | null>(null);

  // Pre-Acceptance Modal Verification States
  const [pendingAcceptOffer, setPendingAcceptOffer] = useState<IntercityFeedOffer | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState<boolean>(false);
  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState<boolean>(false);

  // City Search Modal State
  const [cityFilter, setCityFilter] = useState<MoroccanCity | null>(null);

  // Sorting Mode: 'nearest' | 'price' | 'time' | 'recent'
  const [sortBy, setSortBy] = useState<'nearest' | 'price' | 'time' | 'recent'>('recent');

  // Safe Execution Wrapper
  const safeExecute = useCallback((fnName: string, fn: () => void) => {
    try {
      console.log(`[INTERCITY LOG] Executing: ${fnName}`);
      if (typeof fn === 'function') {
        fn();
      }
    } catch (error) {
      console.error(`[INTERCITY ERROR] Executing ${fnName}:`, error);
    }
  }, []);

  // Load Saved Subscription & Feed Preferences
  useEffect(() => {
    loadSubAndPrefs();
  }, []);

  const loadSubAndPrefs = async () => {
    try {
      const subVal = await AsyncStorage.getItem(INTERCITY_SUB_KEY);
      if (subVal) {
        const parsed = JSON.parse(subVal);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setIsSubscribed(true);
          setSubExpiresAt(parsed.expiresAt);
        }
      }
    } catch (e) {
      console.error('[INTERCITY ERROR] Load sub error:', e);
    }
  };

  const handleActivateSubscription = async () => {
    safeExecute('handleActivateSubscription', async () => {
      setSubActivating(true);
      setTimeout(async () => {
        const expiresAt = Date.now() + 36 * 3600 * 1000;
        await AsyncStorage.setItem(INTERCITY_SUB_KEY, JSON.stringify({ isSubscribed: true, expiresAt }));
        setIsSubscribed(true);
        setSubExpiresAt(expiresAt);
        setSubActivating(false);
        Vibration.vibrate([0, 100, 50, 100]);
        Alert.alert('✅ Yalla VTC Intercity', getTr('sub_success_msg', lang));
      }, 1000);
    });
  };

  // ── PRE-ACCEPTANCE BALANCE CHECK TRIGGER ─────────────────────────────────
  const handleAcceptPress = (offer: IntercityFeedOffer) => {
    safeExecute('handleAcceptPress', () => {
      // Required minimum balance = commission amount or 40 DH threshold
      const requiredMin = Math.max(offer.commissionDH, 40.0);

      if (driverWalletBalance < requiredMin) {
        setPendingAcceptOffer(offer);
        setShowInsufficientBalanceModal(true);
      } else {
        setPendingAcceptOffer(offer);
        setShowConfirmAcceptModal(true);
      }
    });
  };

  // ── CONFIRMATION MODAL FINAL ACCEPTANCE EXECUTION ─────────────────────────
  const handleConfirmFinalAccept = () => {
    safeExecute('handleConfirmFinalAccept', () => {
      if (!pendingAcceptOffer) return;

      // Double-check offer availability to avoid race conditions
      const isAvailable = feedOffers.some(o => o.id === pendingAcceptOffer.id);
      if (!isAvailable) {
        setShowConfirmAcceptModal(false);
        setPendingAcceptOffer(null);
        Alert.alert('⚠️ Yalla VTC', getTr('offer_no_longer_available', lang));
        return;
      }

      Vibration.vibrate([0, 150, 80, 150]);
      const updatedOffer: IntercityFeedOffer = { ...pendingAcceptOffer, isAccepted: true };

      // Move offer from feed list to reserved trips
      setFeedOffers(prev => prev.filter(o => o.id !== pendingAcceptOffer.id));
      setReservedTrips(prev => [updatedOffer, ...prev]);

      setShowConfirmAcceptModal(false);

      if (selectedOffer && selectedOffer.id === pendingAcceptOffer.id) {
        setSelectedOffer(updatedOffer);
      }
      setPendingAcceptOffer(null);

      Alert.alert('🟢 Yalla VTC Intercity', 'تم قبول الرحلة بنجاح! تم حجز الطلب وفتح تفاصيل التواصل والملاحة.');
    });
  };

  const handleNavigateToWallet = () => {
    safeExecute('handleNavigateToWallet', () => {
      setShowInsufficientBalanceModal(false);
      setPendingAcceptOffer(null);
      navigation.navigate('Wallet');
    });
  };

  const getCityName = (city: MoroccanCity) => {
    if (lang === 'fr') return city.nameFr;
    if (lang === 'es' || lang === 'en') return city.nameEn;
    return city.nameAr;
  };

  const getPaymentBadge = (method: 'cash' | 'card' | 'wallet') => {
    switch (method) {
      case 'cash':
        return { label: getTr('payment_cash', lang), bg: '#10B98118', text: '#10B981' };
      case 'card':
        return { label: getTr('payment_card', lang), bg: '#3B82F618', text: '#3B82F6' };
      case 'wallet':
        return { label: getTr('payment_wallet', lang), bg: '#8B5CF618', text: '#8B5CF6' };
    }
  };

  const sortedOffers = useMemo(() => {
    let list = [...feedOffers];
    if (cityFilter) {
      list = list.filter(o => o.fromCity.id === cityFilter.id || o.toCity.id === cityFilter.id);
    }
    if (sortBy === 'price') {
      list.sort((a, b) => b.grossFareDH - a.grossFareDH);
    } else if (sortBy === 'recent') {
      list.sort((a, b) => a.publishedAgoMinutes - b.publishedAgoMinutes);
    }
    return list;
  }, [feedOffers, cityFilter, sortBy]);

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* Drawer-aware Header */}
      <DrawerHeader
        title={getTr('screen_title', lang)}
        rightElement={
          <TouchableOpacity
            style={[styles.subBadgeBtn, { backgroundColor: colors.primary + '18' }]}
            onPress={() => {
              const nextBal = driverWalletBalance === 120.00 ? 18.50 : 120.00;
              setDriverWalletBalance(nextBal);
              Alert.alert('💳 Wallet Balance Simulator', `تم تعديل رصيد المحفظة التجريبي إلى: ${nextBal.toFixed(2)} DH`);
            }}
          >
            <Wallet size={14} color={colors.primary} />
            <Text style={[styles.subBadgeTxt, { color: colors.primary }]}>
              {driverWalletBalance.toFixed(2)} DH
            </Text>
          </TouchableOpacity>
        }
      />

      {/* SUBSCRIPTION GUARD COVER SCREEN */}
      {!isSubscribed ? (
        <View style={styles.subGuardContainer}>
          <View style={[styles.subGuardCard3D, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={[styles.subGuardIconWrap, { backgroundColor: colors.primary + '18' }]}>
              <Zap size={36} color={colors.primary} />
            </View>
            <Text style={[styles.subGuardTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('sub_required_title', lang)}
            </Text>
            <Text style={[styles.subGuardDesc, { color: colors.textMuted, textAlign: 'center' }]}>
              {getTr('sub_required_desc', lang)}
            </Text>

            <View style={[styles.subMetricsBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Clock size={18} color={colors.primary} />
                <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('sub_duration_lbl', lang)}</Text>
                <Text style={[styles.subMetricVal, { color: colors.textPrimary }]}>{getTr('sub_duration_val', lang)}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Wallet size={18} color={colors.online} />
                <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('sub_price_lbl', lang)}</Text>
                <Text style={[styles.subMetricValBold, { color: colors.online }]}>{getTr('sub_price_val', lang)}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.subActivateBtn, { backgroundColor: colors.primary }]}
              onPress={handleActivateSubscription}
              disabled={subActivating}
            >
              {subActivating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Sparkles size={20} color="#FFF" />
              )}
              <Text style={styles.subActivateBtnTxt}>{getTr('sub_activate_btn', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>

          {/* Tab Navigation Segment */}
          <View style={[styles.tabSegmentBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.tabSegBtn, activeTab === 'feed' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab('feed')}
            >
              <Text style={[styles.tabSegTxt, { color: activeTab === 'feed' ? colors.primary : colors.textMuted }]}>
                {getTr('tab_feed', lang)} ({sortedOffers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabSegBtn, activeTab === 'my_trips' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab('my_trips')}
            >
              <Text style={[styles.tabSegTxt, { color: activeTab === 'my_trips' ? colors.primary : colors.textMuted }]}>
                {getTr('tab_my_trips', lang)} ({reservedTrips.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAIN OFFERS FEED TAB */}
          {activeTab === 'feed' && (
            <FlatList
              data={sortedOffers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.mainSubtitleTxt, { color: colors.textMuted }]}>
                    {getTr('screen_subtitle', lang)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.filterChipBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => setSortBy(sortBy === 'price' ? 'recent' : 'price')}
                  >
                    <SlidersHorizontal size={14} color={colors.primary} />
                    <Text style={[styles.filterChipTxt, { color: colors.primary }]}>
                      {sortBy === 'price' ? getTr('sort_price', lang) : getTr('sort_recent', lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Zap size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyTxt, { color: colors.textMuted, textAlign: 'center' }]}>
                    {getTr('empty_feed_title', lang)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.fullWidthActionBtn, { backgroundColor: colors.primary + '18', marginTop: 10 }]}
                    onPress={() => setFeedOffers(FEED_SAMPLE_DATA)}
                  >
                    <RefreshCw size={16} color={colors.primary} />
                    <Text style={[styles.fullWidthActionTxt, { color: colors.primary }]}>
                      {getTr('refresh_search_btn', lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              renderItem={({ item }) => {
                const payBadge = getPaymentBadge(item.paymentMethod);
                return (
                  <View style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                    {/* CARD HEADER: PRICE + TYPE + PAYMENT + STATUS */}
                    <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.priceBigTxt, { color: colors.primary }]}>{item.grossFareDH}</Text>
                        <Text style={[styles.priceCurrencyTxt, { color: colors.primary }]}>د.م</Text>
                      </View>

                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.badgePill, { backgroundColor: colors.primary + '14' }]}>
                          <Text style={[styles.badgePillTxt, { color: colors.primary }]}>🚗 بين المدن</Text>
                        </View>

                        <View style={[styles.badgePill, { backgroundColor: payBadge.bg }]}>
                          <Text style={[styles.badgePillTxt, { color: payBadge.text }]}>{payBadge.label}</Text>
                        </View>

                        <View style={[styles.badgePill, { backgroundColor: colors.surfaceAlt }]}>
                          <Text style={[styles.badgePillTxt, { color: colors.textMuted }]}>
                            {getTr('mins_ago', lang, { mins: item.publishedAgoMinutes })}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* DATE & DEPARTURE TIME */}
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <CalendarIcon size={16} color={colors.primary} />
                      <Text style={[styles.dateTimeTxt, { color: colors.textPrimary }]}>{item.dateStr}</Text>
                      <Clock size={16} color={colors.accent} />
                      <Text style={[styles.dateTimeTxt, { color: colors.textPrimary }]}>{item.timeStr}</Text>
                    </View>

                    {/* ROUTE TIMELINE VISUALIZER (🟢 A -> Landmark -> 🔴 B -> Landmark) */}
                    <View style={[styles.timelineBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.dotCircle, { backgroundColor: colors.online }]}>
                          <Text style={styles.dotCircleTxt}>A</Text>
                        </View>
                        <Text style={[styles.cityTitleTxt, { color: colors.online }]}>
                          🟢 {getCityName(item.fromCity)}
                        </Text>
                      </View>

                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: isRTL ? 0 : 28, paddingRight: isRTL ? 28 : 0 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <MapPin size={14} color={colors.textMuted} />
                        <Text style={[styles.landmarkTxt, { color: colors.textSecondary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                          {item.pickupLandmark}
                        </Text>
                      </View>

                      <View style={[{ paddingLeft: isRTL ? 0 : 8, paddingRight: isRTL ? 8 : 0 }, isRTL && { alignItems: 'flex-end' }]}>
                        <ArrowDown size={14} color={colors.textMuted} />
                      </View>

                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.dotCircle, { backgroundColor: colors.offline }]}>
                          <Text style={styles.dotCircleTxt}>B</Text>
                        </View>
                        <Text style={[styles.cityTitleTxt, { color: colors.offline }]}>
                          🔴 {getCityName(item.toCity)}
                        </Text>
                      </View>

                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: isRTL ? 0 : 28, paddingRight: isRTL ? 28 : 0 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <MapPin size={14} color={colors.textMuted} />
                        <Text style={[styles.landmarkTxt, { color: colors.textSecondary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                          {item.dropoffLandmark}
                        </Text>
                      </View>
                    </View>

                    {/* ROAD METRICS & PASSENGER BADGES */}
                    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.metricTagTxt, { color: colors.textMuted }]}>📏 {item.distanceKm} كم</Text>
                        <Text style={[styles.metricTagTxt, { color: colors.textMuted }]}>🕒 {item.durationEst}</Text>
                      </View>

                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.metricTagTxt, { color: colors.textPrimary }]}>👤 {item.passengersCount}</Text>
                        <Text style={[styles.metricTagTxt, { color: colors.textPrimary }]}>🧳 {item.luggageCount}</Text>
                        {item.hasChildSeat && (
                          <View style={[styles.badgePill, { backgroundColor: '#F59E0B14' }]}>
                            <Text style={[styles.badgePillTxt, { color: '#F59E0B' }]}>👶</Text>
                          </View>
                        )}
                        {item.hasPet && (
                          <View style={[styles.badgePill, { backgroundColor: '#EC489914' }]}>
                            <Text style={[styles.badgePillTxt, { color: '#EC4899' }]}>🐶</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* RIDER PRIVACY FOOTER */}
                    <View style={[styles.riderFooterRow, { borderTopColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.riderAvatarCircle, { backgroundColor: colors.primary }]}>
                          <Text style={styles.riderAvatarTxt}>{item.riderFirstName.charAt(0)}</Text>
                        </View>
                        <View style={[{ gap: 2 }, isRTL && { alignItems: 'flex-end' }]}>
                          <Text style={[styles.riderNameTxt, { color: colors.textPrimary }]}>{item.riderFirstName}</Text>
                          <Text style={[styles.riderMetaTxt, { color: colors.textMuted }]}>
                            ⭐ {item.riderRating} • {item.riderTripsCount} {getTr('trips_unit', lang)} • {getTr('member_since', lang)} {item.riderMemberSinceYear}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* ACTION BUTTONS */}
                    <View style={[{ flexDirection: 'row', gap: 10, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleAcceptPress(item)}
                      >
                        <CheckCircle size={18} color="#FFF" />
                        <Text style={styles.acceptBtnTxt}>{getTr('accept_offer_btn', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.viewDetailsBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                        onPress={() => setSelectedOffer(item)}
                      >
                        <Text style={[styles.viewDetailsBtnTxt, { color: colors.textPrimary }]}>{getTr('view_details_btn', lang)}</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                );
              }}
            />
          )}

          {/* MY RESERVED TRIPS TAB */}
          {activeTab === 'my_trips' && (
            <FlatList
              data={reservedTrips}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <CalendarIcon size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyTxt, { color: colors.textMuted, textAlign: 'center' }]}>
                    لا توجد رحلات بين المدن محجوزة حالياً.
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View style={[styles.feedCard3D, { backgroundColor: colors.surface, borderColor: colors.online }]}>
                  <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.priceBigTxt, { color: colors.online }]}>{item.grossFareDH} DH</Text>
                    <View style={[styles.badgePill, { backgroundColor: colors.online + '18' }]}>
                      <Text style={[styles.badgePillTxt, { color: colors.online }]}>🟢 محجوزة (تم القبول)</Text>
                    </View>
                  </View>

                  <Text style={[styles.cityTitleTxt, { color: colors.textPrimary, marginVertical: 8, textAlign: isRTL ? 'right' : 'left' }]}>
                    🟢 {getCityName(item.fromCity)} ➜ 🔴 {getCityName(item.toCity)}
                  </Text>

                  {/* UNLOCKED RIDER CONTACT DATA */}
                  <View style={[styles.unlockedBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.unlockedTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {getTr('unlocked_contact_title', lang)}
                    </Text>
                    <Text style={[styles.riderNameTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginTop: 4 }]}>
                      👤 {item.riderFirstName} ({item.riderPhone})
                    </Text>

                    {item.riderNotes && (
                      <Text style={[styles.riderNotesTxt, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', marginTop: 6 }]}>
                        💬 {item.riderNotes}
                      </Text>
                    )}

                    <View style={[{ flexDirection: 'row', gap: 10, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.online }]}
                        onPress={() => Linking.openURL(`tel:${item.riderPhone}`)}
                      >
                        <Phone size={16} color="#FFF" />
                        <Text style={styles.contactBtnTxt}>{getTr('call_btn', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                        onPress={() => Alert.alert('💬 Chat', `فتح الدردشة المباشرة مع الراكب ${item.riderFirstName}...`)}
                      >
                        <MessageSquare size={16} color="#FFF" />
                        <Text style={styles.contactBtnTxt}>{getTr('chat_btn', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.accent }]}
                        onPress={() => Alert.alert('🗺️ Navigation', 'جاري بدء الملاحة لنقطة الانطلاق...')}
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

      {/* ── MODAL SCENARIO 1: INSUFFICIENT WALLET BALANCE MODAL ───────────── */}
      <Modal
        visible={showInsufficientBalanceModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowInsufficientBalanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#EF444418' }]}>
              <AlertTriangle size={36} color="#EF4444" />
            </View>

            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('insufficient_wallet_title', lang)}
            </Text>

            <Text style={[styles.modalDescTxt, { color: colors.textMuted, textAlign: 'center' }]}>
              {getTr('insufficient_wallet_desc', lang)}
            </Text>

            {/* BALANCE METRICS BREAKDOWN BOX */}
            {pendingAcceptOffer && (
              <View style={[styles.subMetricsBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginVertical: 14 }]}>
                <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('current_balance_lbl', lang)}</Text>
                  <Text style={[styles.subMetricValBold, { color: '#EF4444' }]}>{driverWalletBalance.toFixed(2)} د.م</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('min_required_lbl', lang)}</Text>
                  <Text style={[styles.subMetricValBold, { color: colors.textPrimary }]}>
                    {Math.max(pendingAcceptOffer.commissionDH, 40.0).toFixed(2)} د.م
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.subMetricLbl, { color: colors.textPrimary }]}>{getTr('amount_needed_lbl', lang)}</Text>
                  <Text style={[styles.subMetricValBold, { color: colors.primary }]}>
                    {Math.max(0, Math.max(pendingAcceptOffer.commissionDH, 40.0) - driverWalletBalance).toFixed(2)} د.م
                  </Text>
                </View>
              </View>
            )}

            {/* BUTTONS */}
            <View style={{ gap: 10, width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.subActivateBtn, { backgroundColor: colors.primary }]}
                onPress={handleNavigateToWallet}
              >
                <CreditCard size={18} color="#FFF" />
                <Text style={styles.subActivateBtnTxt}>{getTr('topup_wallet_btn', lang)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.fullWidthActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => setShowInsufficientBalanceModal(false)}
              >
                <Text style={[styles.fullWidthActionTxt, { color: colors.textMuted }]}>{getTr('cancel_btn', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL SCENARIO 2: SUFFICIENT BALANCE PRE-ACCEPTANCE CONFIRMATION MODAL ── */}
      <Modal
        visible={showConfirmAcceptModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowConfirmAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: colors.primary + '18' }]}>
              <Text style={{ fontSize: 32 }}>🚗</Text>
            </View>

            <Text style={[styles.modalTitleTxt, { color: colors.textPrimary, textAlign: 'center' }]}>
              {getTr('confirm_accept_title', lang)}
            </Text>

            {pendingAcceptOffer && (
              <ScrollView style={{ width: '100%', maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {/* TRIP SUMMARY INFO */}
                <View style={[styles.timelineBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginVertical: 10 }]}>
                  <Text style={[styles.cityTitleTxt, { color: colors.online, textAlign: isRTL ? 'right' : 'left' }]}>
                    🟢 {getCityName(pendingAcceptOffer.fromCity)}
                  </Text>
                  <Text style={[styles.cityTitleTxt, { color: colors.offline, textAlign: isRTL ? 'right' : 'left', marginTop: 4 }]}>
                    🔴 {getCityName(pendingAcceptOffer.toCity)}
                  </Text>
                  <Text style={[styles.dateTimeTxt, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', marginTop: 6 }]}>
                    📅 {pendingAcceptOffer.dateStr} | ⏰ {pendingAcceptOffer.timeStr}
                  </Text>
                  <Text style={[styles.priceBigTxt, { color: colors.primary, marginTop: 4, textAlign: isRTL ? 'right' : 'left', fontSize: 20 }]}>
                    💰 {pendingAcceptOffer.grossFareDH} DH ({getPaymentBadge(pendingAcceptOffer.paymentMethod).label})
                  </Text>
                </View>

                {/* CLEAR COMMISSION DISCLOSURE NOTICE */}
                <View style={[styles.noticeBox, { backgroundColor: '#F59E0B14', borderColor: '#F59E0B40' }]}>
                  <AlertCircle size={18} color="#F59E0B" />
                  <Text style={[styles.noticeTxt, { color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                    {getTr('commission_notice', lang)}
                  </Text>
                </View>

                {/* FINANCIAL DISCLOSURE METRICS */}
                <View style={[styles.subMetricsBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginVertical: 10 }]}>
                  <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('expected_commission_lbl', lang)}</Text>
                    <Text style={[styles.subMetricValBold, { color: colors.offline }]}>-{pendingAcceptOffer.commissionDH} د.م</Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.subMetricLbl, { color: colors.textMuted }]}>{getTr('current_balance_lbl', lang)}</Text>
                    <Text style={[styles.subMetricValBold, { color: colors.textPrimary }]}>{driverWalletBalance.toFixed(2)} د.م</Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={[styles.subMetricRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.subMetricLbl, { color: colors.textPrimary }]}>{getTr('est_balance_after', lang)}</Text>
                    <Text style={[styles.subMetricValBold, { color: colors.online }]}>
                      {(driverWalletBalance - pendingAcceptOffer.commissionDH).toFixed(2)} د.م
                    </Text>
                  </View>
                </View>

                {/* NO DEDUCTION UPON ACCEPT NOTE */}
                <Text style={[styles.footnoteTxt, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', marginBottom: 12 }]}>
                  {getTr('no_deduction_upon_accept_note', lang)}
                </Text>
              </ScrollView>
            )}

            {/* CONFIRMATION ACTION BUTTONS */}
            <View style={{ gap: 10, width: '100%', marginTop: 6 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.subActivateBtn, { backgroundColor: colors.online }]}
                onPress={handleConfirmFinalAccept}
              >
                <CheckCircle size={18} color="#FFF" />
                <Text style={styles.subActivateBtnTxt}>{getTr('confirm_final_accept_btn', lang)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.fullWidthActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => setShowConfirmAcceptModal(false)}
              >
                <Text style={[styles.fullWidthActionTxt, { color: colors.textMuted }]}>{getTr('cancel_btn', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEDICATED TRIP DETAILS MODAL */}
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
                  {getCityName(selectedOffer.fromCity)} ➜ {getCityName(selectedOffer.toCity)}
                </Text>
              </View>

              {/* ROUTE VISUALIZER */}
              <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionGroupTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginBottom: 10 }]}>
                  {getTr('route_map_sim', lang)}
                </Text>
                <View style={[styles.mapVisualBox, { backgroundColor: colors.surfaceAlt }]}>
                  <NavIcon size={32} color={colors.primary} />
                  <Text style={[styles.mapVisualTxt, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
                    🛣️ {selectedOffer.highwayRoute} ({selectedOffer.distanceKm} كم • {selectedOffer.durationEst})
                  </Text>
                </View>
              </View>

              {/* RIDER PROFILE */}
              <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionGroupTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginBottom: 10 }]}>
                  {getTr('rider_info_title', lang)}
                </Text>

                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.riderAvatarCircle, { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 24 }]}>
                    <Text style={[styles.riderAvatarTxt, { fontSize: 20 }]}>{selectedOffer.riderFirstName.charAt(0)}</Text>
                  </View>
                  <View style={[{ gap: 4 }, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.riderNameTxt, { color: colors.textPrimary, fontSize: 16 }]}>{selectedOffer.riderFirstName}</Text>
                    <Text style={[styles.riderMetaTxt, { color: colors.textMuted }]}>
                      ⭐ {selectedOffer.riderRating} • {selectedOffer.riderTripsCount} {getTr('trips_unit', lang)} • {getTr('member_since', lang)} {selectedOffer.riderMemberSinceYear}
                    </Text>
                    <Text style={[styles.riderMetaTxt, { color: colors.primary }]}>{getTr('communication_lang', lang)}</Text>
                  </View>
                </View>

                {selectedOffer.riderNotes && (
                  <View style={[styles.notesBox, { backgroundColor: colors.surfaceAlt, marginTop: 12 }]}>
                    <Text style={[styles.notesLbl, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>{getTr('rider_notes_lbl', lang)}</Text>
                    <Text style={[styles.notesTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', marginTop: 4 }]}>
                      {selectedOffer.riderNotes}
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

              {/* ACCEPT BUTTON INSIDE MODAL */}
              {!selectedOffer.isAccepted && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.acceptBtn, { backgroundColor: colors.primary, paddingVertical: 16 }]}
                  onPress={() => handleAcceptPress(selectedOffer)}
                >
                  <CheckCircle size={20} color="#FFF" />
                  <Text style={[styles.acceptBtnTxt, { fontSize: 16 }]}>{getTr('accept_offer_btn', lang)}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
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
  subBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  subBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  subGuardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subGuardCard3D: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: '100%',
  },
  subGuardIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subGuardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  subGuardDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  subMetricsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  subMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subMetricLbl: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  subMetricVal: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  subMetricValBold: {
    fontSize: 15,
    fontWeight: '800',
  },
  subActivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
  },
  subActivateBtnTxt: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  tabSegmentBar: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
  },
  tabSegBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSegTxt: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 50,
  },
  mainSubtitleTxt: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipTxt: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  feedCard3D: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBigTxt: {
    fontSize: 24,
    fontWeight: '900',
  },
  priceCurrencyTxt: {
    fontSize: 13,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePillTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateTimeTxt: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  timelineBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginVertical: 4,
  },
  dotCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCircleTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cityTitleTxt: {
    fontSize: 15,
    fontWeight: '800',
  },
  landmarkTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricTagTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  riderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  riderAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderAvatarTxt: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  riderNameTxt: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  riderMetaTxt: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  acceptBtnTxt: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  viewDetailsBtn: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  viewDetailsBtnTxt: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  emptyTxt: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  fullWidthActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fullWidthActionTxt: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  unlockedBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  unlockedTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  riderNotesTxt: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactBtnTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionGroupTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  card3D: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  priceBanner: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    alignItems: 'center',
  },
  bannerPriceTxt: {
    fontSize: 32,
    fontWeight: '900',
  },
  bannerSubTxt: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  mapVisualBox: {
    height: 120,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapVisualTxt: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  notesBox: {
    borderRadius: 12,
    padding: 12,
  },
  notesLbl: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  notesTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  finLbl: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  finVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  finLblBold: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  finValBold: {
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard3D: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitleTxt: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDescTxt: {
    fontSize: 13,
    lineHeight: 20,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  noticeTxt: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  footnoteTxt: {
    fontSize: 11.5,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default IntercityTripsScreen;
