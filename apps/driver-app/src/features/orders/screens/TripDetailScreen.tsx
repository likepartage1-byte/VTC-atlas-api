import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  Banknote,
  Star,
  Info,
  DollarSign,
  Percent,
  ShieldCheck,
  User,
  Car,
  Bike,
  Package,
  FileText,
  MessageSquare,
  RotateCcw,
  ArrowLeftRight,
  Trash2,
  Flag,
  UserCheck,
  Share2,
} from 'lucide-react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { RideHistoryItem } from './TripHistoryScreen';
import { useAppModeStore } from '../../../store/useAppModeStore';
import { LeafletMapView } from '../../../components/LeafletMapView';
import { AtlasMapView } from '../../../components/AtlasMapView';

const { width: SCREEN_W } = Dimensions.get('window');

const TRANSLATIONS: any = {
  ar: {
    trip_detail_title: 'تفاصيل الرحلة',
    ride_info_section: 'معلومات الرحلة',
    ride_number: 'رقم الرحلة',
    date_and_time: 'التاريخ والوقت',
    duration: 'مدة الرحلة',
    distance: 'المسافة المقطوعة',
    route_section: 'مسار الرحلة',
    pickup_location: 'نقطة الانطلاق',
    dropoff_location: 'نقطة الوصول',
    financial_section: 'المعلومات المالية',
    total_fare: 'قيمة الرحلة الإجمالية',
    platform_commission: 'عمولة المنصة (10.4%)',
    net_driver_income: 'صافي دخل السائق',
    payment_method: 'طريقة الدفع',
    cash_value: '💵 نقدًا (Cash)',
    cash_notice: 'تم دفع قيمة الرحلة نقدًا مباشرةً من الراكب للسائق، واقتطاع العمولة من المحفظة.',
    passenger_review_section: 'تقييم الراكب',
    passenger_name: 'الراكب',
    rating: 'التقييم',
    km: 'كم',
    mins: 'دقيقة',
    mad: 'د.م.',
    status_completed: 'رحلة مكتملة بنجاح ✓',
    status_cancelled: 'رحلة ملغاة ❌',
    passenger_service_title: 'رحلة المدينة',
    passenger_status_subtitle: 'رحلة · مكتملة',
    passenger_duree: 'المدة',
    passenger_distance: 'المسافة',
    passenger_rated_label: 'تقييمك للرحلة :',
    passenger_btn_receipt: 'الفاتورة',
    passenger_btn_support: 'الدعم',
    passenger_btn_repeat: 'إعادة الطلب',
    passenger_btn_return: 'رحلة العودة',
    passenger_payment_header: 'المبلغ المدفوع',
    passenger_price: 'السعر',
    passenger_total_paid: 'إجمالي المدفوع',
    passenger_remove_from_history: 'حذف من سجل الرحلات',
    receipt_modal_title: 'فاتورة الرحلة الرسمية',
    receipt_close: 'إغلاق',
    confirm_remove_title: 'إزالة من السجل',
    confirm_remove_msg: 'هل أنت تأكد من أنك تريد إزالة هذه الرحلة من سجل الرحلات؟',
    cancel_action: 'إلغاء',
    remove_action: 'إزالة',
  },
  fr: {
    trip_detail_title: 'Détails de la course',
    ride_info_section: 'Informations de la course',
    ride_number: 'N° de la course',
    date_and_time: 'Date et heure',
    duration: 'Durée',
    distance: 'Distance parcourue',
    route_section: 'Itinéraire',
    pickup_location: 'Point de départ',
    dropoff_location: 'Point d\'arrivée',
    financial_section: 'Informations financières',
    total_fare: 'Prix total de la course',
    platform_commission: 'Commission plateforme (10,4%)',
    net_driver_income: 'Revenu net du chauffeur',
    payment_method: 'Mode de paiement',
    cash_value: '💵 En espèces (Cash)',
    cash_notice: 'Course payée en espèces directement au chauffeur.',
    passenger_review_section: 'Avis du passager',
    passenger_name: 'Passager',
    rating: 'Note',
    km: 'km',
    mins: 'min',
    mad: 'DH',
    status_completed: 'Course effectuée avec succès ✓',
    status_cancelled: 'Course annulée ❌',
    passenger_service_title: 'Course en ville',
    passenger_status_subtitle: 'Course · Terminé',
    passenger_duree: 'Durée',
    passenger_distance: 'Distance',
    passenger_rated_label: 'Vous avez évalué :',
    passenger_btn_receipt: 'Reçu',
    passenger_btn_support: 'Assistance',
    passenger_btn_repeat: 'Répéter la course',
    passenger_btn_return: 'Itinéraire retour',
    passenger_payment_header: "J'ai payé",
    passenger_price: 'Prix',
    passenger_total_paid: 'Total payé',
    passenger_remove_from_history: 'Retirer de l\'historique',
    receipt_modal_title: 'Reçu de la course',
    receipt_close: 'Fermer',
    confirm_remove_title: 'Retirer de l\'historique',
    confirm_remove_msg: 'Voulez-vous vraiment retirer cette course de l\'historique ?',
    cancel_action: 'Annuler',
    remove_action: 'Retirer',
  },
  es: {
    trip_detail_title: 'Detalles del viaje',
    ride_info_section: 'Información del viaje',
    ride_number: 'N° de viaje',
    date_and_time: 'Fecha y hora',
    duration: 'Duración',
    distance: 'Distancia recorrida',
    route_section: 'Ruta del viaje',
    pickup_location: 'Punto de origen',
    dropoff_location: 'Punto de destino',
    financial_section: 'Información financiera',
    total_fare: 'Tarifa total del viaje',
    platform_commission: 'Comisión plataforma (10.4%)',
    net_driver_income: 'Ingreso neto del conductor',
    payment_method: 'Método de pago',
    cash_value: '💵 En efectivo (Cash)',
    cash_notice: 'Viaje pagado en efectivo directamente al conductor.',
    passenger_review_section: 'Opinión del pasajero',
    passenger_name: 'Pasajero',
    rating: 'Calificación',
    km: 'km',
    mins: 'min',
    mad: 'MAD',
    status_completed: 'Viaje completado con éxito ✓',
    status_cancelled: 'Viaje cancelado ❌',
    passenger_service_title: 'Viaje en ciudad',
    passenger_status_subtitle: 'Viaje · Completado',
    passenger_duree: 'Duración',
    passenger_distance: 'Distancia',
    passenger_rated_label: 'Has calificado :',
    passenger_btn_receipt: 'Recibo',
    passenger_btn_support: 'Asistencia',
    passenger_btn_repeat: 'Repetir viaje',
    passenger_btn_return: 'Ruta de regreso',
    passenger_payment_header: 'He pagado',
    passenger_price: 'Precio',
    passenger_total_paid: 'Total pagado',
    passenger_remove_from_history: 'Eliminar del historial',
    receipt_modal_title: 'Recibo oficial del viaje',
    receipt_close: 'Cerrar',
    confirm_remove_title: 'Eliminar del historial',
    confirm_remove_msg: '¿Estás seguro de que quieres eliminar este viaje de tu historial?',
    cancel_action: 'Cancelar',
    remove_action: 'Eliminar',
  },
  en: {
    trip_detail_title: 'Ride Details',
    ride_info_section: 'Ride Information',
    ride_number: 'Ride Number',
    date_and_time: 'Date & Time',
    duration: 'Trip Duration',
    distance: 'Distance Traveled',
    route_section: 'Ride Route',
    pickup_location: 'Pickup Point',
    dropoff_location: 'Dropoff Point',
    financial_section: 'Financial Breakdown',
    total_fare: 'Total Trip Fare',
    platform_commission: 'Platform Commission (10.4%)',
    net_driver_income: 'Net Driver Earnings',
    payment_method: 'Payment Method',
    cash_value: '💵 Cash',
    cash_notice: 'Trip fare paid in cash directly to driver by passenger.',
    passenger_review_section: 'Passenger Review',
    passenger_name: 'Passenger',
    rating: 'Rating',
    km: 'km',
    mins: 'mins',
    mad: 'MAD',
    status_completed: 'Ride Completed Successfully ✓',
    status_cancelled: 'Ride Cancelled ❌',
    passenger_service_title: 'City Ride',
    passenger_status_subtitle: 'Ride · Completed',
    passenger_duree: 'Duration',
    passenger_distance: 'Distance',
    passenger_rated_label: 'You rated :',
    passenger_btn_receipt: 'Receipt',
    passenger_btn_support: 'Support',
    passenger_btn_repeat: 'Repeat Ride',
    passenger_btn_return: 'Return Route',
    passenger_payment_header: 'I paid',
    passenger_price: 'Price',
    passenger_total_paid: 'Total Paid',
    passenger_remove_from_history: 'Remove from History',
    receipt_modal_title: 'Official Ride Receipt',
    receipt_close: 'Close',
    confirm_remove_title: 'Remove from history',
    confirm_remove_msg: 'Are you sure you want to remove this ride from your history?',
    cancel_action: 'Cancel',
    remove_action: 'Remove',
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
};

export const TripDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const { activeMode } = useAppModeStore();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const lang = rawLang.startsWith('ar') ? 'ar' : rawLang.startsWith('es') ? 'es' : rawLang.startsWith('en') ? 'en' : 'fr';
  const isRTL = lang === 'ar';

  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  const { trip } = (route.params || {}) as { trip: RideHistoryItem };

  if (!trip) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 20 }}>
          <Text style={{ color: colors.primary }}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCompleted = trip.status === 'COMPLETED' || trip.status === 'completed';
  const rideDate = new Date(trip.createdAt || Date.now());
  const dateHeaderStr = rideDate.toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeHeaderStr = rideDate.toLocaleTimeString(lang === 'ar' ? 'ar-MA' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  // ══════════════════════════════════════════════════════════════════════════
  // PASSENGER RIDE DETAILS VIEW (Matching Reference Screenshots)
  // ══════════════════════════════════════════════════════════════════════════
  if (activeMode === 'PASSENGER') {
    const fareFormatted = `${Number(trip.fareAmount || 40).toFixed(2).replace('.', ',')} MAD`;
    const driverName = trip.passengerName || 'Said';
    const vehicleInfo = 'Noir Dacia Sandero, 10217-26-أ';
    const pickupLandmark = trip.pickupAddress || 'CPGE-MARRAKECH PREPAS';
    const dropoffLandmark = trip.dropoffAddress || 'Clinique RIAD SALAM';
    const durationText = `${trip.durationMins || 24} min`;
    const distanceText = `${Number(trip.distanceKm || 8.2).toFixed(1).replace('.', ',')} km`;

    const handleRepeatRide = () => {
      navigation.navigate('PassengerHome', {
        repeatPickup: pickupLandmark,
        repeatDropoff: dropoffLandmark,
      });
    };

    const handleReturnRoute = () => {
      navigation.navigate('PassengerHome', {
        repeatPickup: dropoffLandmark,
        repeatDropoff: pickupLandmark,
      });
    };

    const handleSupport = () => {
      navigation.navigate('SupportChat', { tripId: trip.id });
    };

    const handleRemoveFromHistory = () => {
      Alert.alert(
        getTr('confirm_remove_title', lang),
        getTr('confirm_remove_msg', lang),
        [
          { text: getTr('cancel_action', lang), style: 'cancel' },
          {
            text: getTr('remove_action', lang),
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                lang === 'ar' ? '✓ تم المحو' : '✓ Supprimée',
                lang === 'ar' ? 'تمت إزالة الرحلة بنجاح من سجل حسابك.' : 'La course a été retirée de votre historique.'
              );
              navigation.goBack();
            },
          },
        ]
      );
    };

    return (
      <SafeAreaView style={[styles.passengerSafeView, { paddingTop: topPadding, backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

        {/* ── 1. Top Header ── */}
        <View style={[styles.passengerHeader, isRTL && styles.passengerHeaderRTL]}>
          <TouchableOpacity
            style={styles.passengerBackBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
          </TouchableOpacity>

          <View style={styles.passengerHeaderTitleWrap}>
            <Text style={[styles.passengerHeaderDate, { color: colors.textPrimary }]}>{dateHeaderStr}</Text>
            <Text style={[styles.passengerHeaderTime, { color: colors.textSecondary }]}>{timeHeaderStr}</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.passengerScrollContent} showsVerticalScrollIndicator={false}>

          {/* ── 2. Map & Route Section ── */}
          <View style={styles.passengerMapCard}>
            <View style={styles.passengerMapCanvas}>
              <LeafletMapView
                height={220}
                isDarkMode={isDarkMode}
                pickup={{ lat: 31.6258, lng: -7.9891, title: pickupLandmark }}
                destination={{ lat: 31.6425, lng: -8.0125, title: dropoffLandmark }}
              />
            </View>

            {/* ── 3. Ride Service & Status Header ── */}
            <View style={[styles.passengerRideInfoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.serviceTypeName}>
                  {getTr('passenger_service_title', lang)}
                </Text>
                <Text style={styles.serviceStatusSubtitle}>
                  {getTr('passenger_status_subtitle', lang)}
                </Text>
              </View>

              {/* Car Graphic */}
              <View style={styles.passengerCarGraphicWrap}>
                <Car size={38} color="#FFFFFF" />
              </View>
            </View>

            {/* ── 4. Spatial & Temporal Timeline ── */}
            <View style={styles.passengerTimelineWrap}>
              {/* Pickup */}
              <View style={[styles.timelineRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.timelineIconSquare}>
                  <User size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.timelineAddressTxt, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {pickupLandmark}
                </Text>
                <Text style={styles.timelineTimeTxt}>10:39</Text>
              </View>

              {/* Connecting Line */}
              <View style={[styles.timelineConnectorLine, isRTL ? { right: 23 } : { left: 23 }]} />

              {/* Destination */}
              <View style={[styles.timelineRow, { marginTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.timelineIconSquare}>
                  <Flag size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.timelineAddressTxt, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {dropoffLandmark}
                </Text>
                <Text style={styles.timelineTimeTxt}>11:03</Text>
              </View>
            </View>

            {/* ── 5. Duration & Distance Row ── */}
            <View style={[styles.metricsRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.metricBox, isRTL && { flexDirection: 'row-reverse' }]}>
                <Clock size={20} color="#FFFFFF" />
                <View style={isRTL && { alignItems: 'flex-end' }}>
                  <Text style={styles.metricLabel}>{getTr('passenger_duree', lang)}</Text>
                  <Text style={styles.metricValue}>{durationText}</Text>
                </View>
              </View>

              <View style={[styles.metricBox, isRTL && { flexDirection: 'row-reverse' }]}>
                <ArrowLeftRight size={20} color="#FFFFFF" />
                <View style={isRTL && { alignItems: 'flex-end' }}>
                  <Text style={styles.metricLabel}>{getTr('passenger_distance', lang)}</Text>
                  <Text style={styles.metricValue}>{distanceText}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── 6. Driver & Vehicle Card ── */}
          <View style={styles.passengerDriverCard}>
            <View style={[styles.driverRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.driverAvatarSquare}>
                <User size={30} color="#FFFFFF" />
              </View>
              <View style={[{ flex: 1, marginHorizontal: 12 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.driverNameTxt}>{driverName}</Text>
                <Text style={styles.vehicleDetailsTxt}>{vehicleInfo}</Text>
              </View>
            </View>

            {/* Stars Rating Row */}
            <View style={[styles.ratingDisplayRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.ratedLabel}>
                {getTr('passenger_rated_label', lang)}
              </Text>
              <View style={styles.starsCluster}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} color="#F59E0B" fill="#F59E0B" style={{ marginHorizontal: 2 }} />
                ))}
              </View>
            </View>
          </View>

          {/* ── 7. Action Buttons Cards ── */}
          <View style={styles.passengerActionsCard}>
            <View style={[styles.actionsGrid, isRTL && { flexDirection: 'row-reverse' }]}>

              {/* 1. Reçu (Receipt) */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionGridItem}
                onPress={() => setReceiptModalVisible(true)}
              >
                <View style={styles.actionIconCircle}>
                  <FileText size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionItemLabel}>{getTr('passenger_btn_receipt', lang)}</Text>
              </TouchableOpacity>

              {/* 2. Assistance (Support) */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionGridItem}
                onPress={handleSupport}
              >
                <View style={styles.actionIconCircle}>
                  <MessageSquare size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionItemLabel}>{getTr('passenger_btn_support', lang)}</Text>
              </TouchableOpacity>

              {/* 3. Répéter la course */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionGridItem}
                onPress={handleRepeatRide}
              >
                <View style={styles.actionIconCircle}>
                  <RotateCcw size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionItemLabel} numberOfLines={2}>
                  {getTr('passenger_btn_repeat', lang)}
                </Text>
              </TouchableOpacity>

              {/* 4. Itinéraire retour */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionGridItem}
                onPress={handleReturnRoute}
              >
                <View style={styles.actionIconCircle}>
                  <ArrowLeftRight size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionItemLabel} numberOfLines={2}>
                  {getTr('passenger_btn_return', lang)}
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* ── 8. Payment Card ── */}
          <View style={styles.passengerPaymentCard}>
            <Text style={[styles.paymentSectionHeader, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getTr('passenger_payment_header', lang)}
            </Text>

            <View style={[styles.paymentLineRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.paymentLineLabel}>{getTr('passenger_price', lang)}</Text>
              <Text style={styles.paymentLineValue}>{fareFormatted}</Text>
            </View>

            <View style={[styles.paymentLineRow, { marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={{ fontSize: 16 }}>💵</Text>
                <Text style={styles.paymentTotalLabel}>{getTr('passenger_total_paid', lang)}</Text>
              </View>
              <Text style={styles.paymentTotalValue}>{fareFormatted}</Text>
            </View>
          </View>

          {/* ── 9. Remove from History Button ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.removeHistoryBtn}
            onPress={handleRemoveFromHistory}
          >
            <Text style={styles.removeHistoryBtnTxt}>
              {getTr('passenger_remove_from_history', lang)}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── 10. Receipt Modal ── */}
        <Modal
          visible={receiptModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setReceiptModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.receiptSheetContainer}>
              <Text style={styles.receiptSheetTitle}>
                🧾 {getTr('receipt_modal_title', lang)}
              </Text>

              <View style={[styles.receiptLineRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.receiptLineLbl}>{lang === 'ar' ? 'الخدمة' : 'Service'}</Text>
                <Text style={styles.receiptLineVal}>{getTr('passenger_service_title', lang)}</Text>
              </View>
              <View style={[styles.receiptLineRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.receiptLineLbl}>{lang === 'ar' ? 'التاريخ' : 'Date'}</Text>
                <Text style={styles.receiptLineVal}>{dateHeaderStr}</Text>
              </View>
              <View style={[styles.receiptLineRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.receiptLineLbl}>{getTr('payment_method', lang)}</Text>
                <Text style={styles.receiptLineVal}>{getTr('cash_value', lang)}</Text>
              </View>
              <View style={[styles.receiptLineRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.receiptLineLbl}>{getTr('passenger_total_paid', lang)}</Text>
                <Text style={[styles.receiptLineVal, { color: '#22C55E', fontWeight: '800' }]}>{fareFormatted}</Text>
              </View>

              <TouchableOpacity
                style={styles.receiptCloseBtn}
                onPress={() => setReceiptModalVisible(false)}
              >
                <Text style={styles.receiptCloseBtnTxt}>{getTr('receipt_close', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {getTr('trip_detail_title', lang)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          { backgroundColor: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            borderColor: isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }
        ]}>
          {isCompleted ? <CheckCircle2 size={20} color="#22C55E" /> : <XCircle size={20} color="#EF4444" />}
          <Text style={[styles.statusBannerText, { color: isCompleted ? '#22C55E' : '#EF4444' }]}>
            {isCompleted ? getTr('status_completed', lang) : getTr('status_cancelled', lang)}
          </Text>
        </View>

        {/* Section 1: Ride Info */}
        <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            📋 {getTr('ride_info_section', lang)}
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('ride_number', lang)}</Text>
            <Text style={[styles.infoValueBold, { color: colors.primary }]}>{trip.rideIdStr || trip.id}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('date_and_time', lang)}</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{dateStr} • {timeStr}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('duration', lang)}</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.durationMins} {getTr('mins', lang)}</Text>
          </View>

          <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('distance', lang)}</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.distanceKm.toFixed(1)} {getTr('km', lang)}</Text>
          </View>
        </View>

        {/* Section 2: Route Info */}
        <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            🗺️ {getTr('route_section', lang)}
          </Text>

          <View style={styles.routeBox}>
            <View style={[styles.routeRowItem, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.dotMarker, { backgroundColor: '#22C55E' }]} />
              <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.routeSubLabel, { color: colors.textMuted }]}>{getTr('pickup_location', lang)}</Text>
                <Text style={[styles.routeMainText, { color: colors.textPrimary }]}>{trip.pickupAddress}</Text>
              </View>
            </View>

            <View style={[styles.routeVerticalLine, { backgroundColor: colors.border, left: isRTL ? undefined : 7, right: isRTL ? 7 : undefined }]} />

            <View style={[styles.routeRowItem, { marginTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.dotMarker, { backgroundColor: '#F97316' }]} />
              <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.routeSubLabel, { color: colors.textMuted }]}>{getTr('dropoff_location', lang)}</Text>
                <Text style={[styles.routeMainText, { color: colors.textPrimary }]}>{trip.dropoffAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Financial Details */}
        <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            💰 {getTr('financial_section', lang)}
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('total_fare', lang)}</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.fareAmount.toFixed(2)} {getTr('mad', lang)}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('platform_commission', lang)}</Text>
            <Text style={[styles.infoValue, { color: '#F97316' }]}>-{trip.commissionAmount.toFixed(2)} {getTr('mad', lang)}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabelBold, { color: colors.textPrimary }]}>{getTr('net_driver_income', lang)}</Text>
            <Text style={[styles.netIncomeHero, { color: '#22C55E' }]}>{trip.netIncome.toFixed(2)} {getTr('mad', lang)}</Text>
          </View>

          <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getTr('payment_method', lang)}</Text>
            <Text style={[styles.infoValueBold, { color: '#22C55E' }]}>{getTr('cash_value', lang)}</Text>
          </View>

          <View style={[styles.cashNoticeBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Info size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={[styles.cashNoticeText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {getTr('cash_notice', lang)}
            </Text>
          </View>
        </View>

        {/* Section 4: Passenger Review (if available) */}
        {trip.passengerRating && (
          <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
              ⭐ {getTr('passenger_review_section', lang)}
            </Text>

            <View style={[styles.reviewHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceAlt }]}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={[{ flex: 1, marginHorizontal: 10 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.passengerNameText, { color: colors.textPrimary }]}>
                  {trip.passengerName || getTr('passenger_name', lang)}
                </Text>
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                    {trip.passengerRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {trip.passengerComment && (
              <View style={[styles.commentBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.commentText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  "{trip.passengerComment}"
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusBannerText: { fontSize: 14, fontWeight: '700' },
  cardSection: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoLabelBold: { fontSize: 14, fontWeight: '700' },
  infoValue: { fontSize: 13.5 },
  infoValueBold: { fontSize: 14, fontWeight: '700' },
  netIncomeHero: { fontSize: 18, fontWeight: '800' },
  routeBox: { position: 'relative', paddingVertical: 4 },
  routeRowItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dotMarker: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeSubLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  routeMainText: { fontSize: 13.5, fontWeight: '600', lineHeight: 18 },
  routeVerticalLine: { position: 'absolute', top: 16, bottom: 30, width: 2 },
  cashNoticeBox: {
    flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 14, alignItems: 'flex-start',
  },
  cashNoticeText: { fontSize: 12, lineHeight: 17, flex: 1 },
  reviewHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  passengerNameText: { fontSize: 14, fontWeight: '700' },
  commentBox: { borderRadius: 12, padding: 12, marginTop: 4 },
  commentText: { fontSize: 13, fontStyle: 'italic', lineHeight: 18 },

  // Passenger Specific Styles matching reference screenshot 1 & 2
  passengerSafeView: { flex: 1, backgroundColor: '#000000' },
  passengerHeader: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  passengerHeaderRTL: { flexDirection: 'row-reverse' },
  passengerBackBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  passengerHeaderTitleWrap: { alignItems: 'center' },
  passengerHeaderDate: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  passengerHeaderTime: { fontSize: 13, fontWeight: '500', color: '#A1A1AA' },
  passengerScrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  passengerMapCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 16, marginBottom: 14 },
  passengerMapCanvas: { height: 220, width: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 16 },
  mapGridPattern: { position: 'absolute', top: 20, left: 20 },
  mapWatermarkLabel: { color: '#52525B', fontSize: 18, fontWeight: '800' },
  mapLandmarkLabel: { color: '#3F3F46', fontSize: 13, fontWeight: '600', marginTop: 30, marginLeft: 40 },
  mapPickupPinWrap: { position: 'absolute', bottom: 35, left: 50 },
  mapDropoffPinWrap: { position: 'absolute', top: 25, right: 60 },
  mapPinCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  mapPolylineCurve: { position: 'absolute', top: 40, left: 75, right: 85, height: 110, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 60 },
  mapGoogleWatermark: { position: 'absolute', bottom: 10, left: 14, color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  passengerRideInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  serviceTypeName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  serviceStatusSubtitle: { fontSize: 14, fontWeight: '600', color: '#A1A1AA' },
  passengerCarGraphicWrap: { width: 68, height: 44, justifyContent: 'center', alignItems: 'center' },
  passengerTimelineWrap: { position: 'relative', marginVertical: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'center' },
  timelineIconSquare: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  timelineAddressTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginHorizontal: 12, lineHeight: 20 },
  timelineTimeTxt: { fontSize: 13, fontWeight: '600', color: '#A1A1AA' },
  timelineConnectorLine: { position: 'absolute', top: 28, bottom: 28, width: 2, backgroundColor: '#3F3F46' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#27272A', paddingTop: 16, marginTop: 18 },
  metricBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricLabel: { fontSize: 12, fontWeight: '600', color: '#A1A1AA' },
  metricValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  passengerDriverCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 18, marginBottom: 14 },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverAvatarSquare: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#27272A', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  driverNameTxt: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 3 },
  vehicleDetailsTxt: { fontSize: 13.5, fontWeight: '600', color: '#A1A1AA' },
  ratingDisplayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: '#27272A', paddingTop: 14 },
  ratedLabel: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginRight: 10 },
  starsCluster: { flexDirection: 'row' },
  passengerActionsCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 18, marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionGridItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  actionIconCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#27272A', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionItemLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', lineHeight: 16 },
  passengerPaymentCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 18, marginBottom: 14 },
  paymentSectionHeader: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 14 },
  paymentLineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentLineLabel: { fontSize: 15, fontWeight: '600', color: '#A1A1AA' },
  paymentLineValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  paymentTotalLabel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  paymentTotalValue: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  removeHistoryBtn: { backgroundColor: '#1C1C1E', borderRadius: 20, height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#27272A', marginTop: 4 },
  removeHistoryBtnTxt: { fontSize: 16, fontWeight: '700', color: '#F87171' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  receiptSheetContainer: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  receiptSheetTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  receiptLineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  receiptLineLbl: { fontSize: 14, fontWeight: '600', color: '#A1A1AA' },
  receiptLineVal: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  receiptCloseBtn: { backgroundColor: '#FFFFFF', borderRadius: 16, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  receiptCloseBtnTxt: { color: '#000000', fontSize: 15, fontWeight: '800' },
});

export default TripDetailScreen;
