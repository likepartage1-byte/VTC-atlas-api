import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Star,
  Compass,
  Phone,
  MessageSquare,
  X,
  ExternalLink,
  ChevronRight,
  Car,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../repositories/mockOrdersRepository';
import { LeafletMapView } from '../../../components/LeafletMapView';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ConfirmedTripModalProps {
  order: MockOrder | null;
  finalPrice: number;
  visible: boolean;
  onClose: () => void;
}

type NavAppType = 'google_maps' | 'waze' | 'apple_maps';

export type RideLifecycleStatus = 'DRIVER_ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';

export const ConfirmedTripModal = memo(({
  order,
  finalPrice,
  visible,
  onClose,
}: ConfirmedTripModalProps) => {
  if (!order || !visible) return null;

  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [preferredNavApp, setPreferredNavApp] = useState<NavAppType>('google_maps');
  const [showNavPicker, setShowNavPicker] = useState<boolean>(false);
  const [isBackgroundedNotificationSent, setIsBackgroundedNotificationSent] = useState<boolean>(false);

  // Phase 4 Lifecycle States
  const [rideStatus, setRideStatus] = useState<RideLifecycleStatus>('DRIVER_ACCEPTED');
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [driverGivenRating, setDriverGivenRating] = useState<number>(5);

  const { passengerDetail } = order;

  // Mock driver current GPS position
  const driverLat = (order.pickupLat || 31.6342) - 0.005;
  const driverLng = (order.pickupLng || -8.0089) - 0.005;

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#22252D' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  // Load saved navigation app preference & initial status
  useEffect(() => {
    (async () => {
      try {
        const savedNav = await AsyncStorage.getItem('@driver_nav_app');
        if (savedNav === 'google_maps' || savedNav === 'waze' || savedNav === 'apple_maps') {
          setPreferredNavApp(savedNav as NavAppType);
        }
        const storedTripJson = await AsyncStorage.getItem('@active_driver_trip_v1');
        if (storedTripJson) {
          const parsed = JSON.parse(storedTripJson);
          if (parsed && parsed.status) {
            setRideStatus(parsed.status as RideLifecycleStatus);
          }
        }
      } catch (_) {}
    })();
  }, []);

  // Sync active trip status to AsyncStorage cache
  const updateStatusAndSave = async (newStatus: RideLifecycleStatus) => {
    setRideStatus(newStatus);
    try {
      const activeTrip = { order, finalPrice, status: newStatus };
      await AsyncStorage.setItem('@active_driver_trip_v1', JSON.stringify(activeTrip));
    } catch (_) {}
  };

  // Phase 4.2: Driver Arrived ("وصلت / Je suis arrivé")
  const handleDriverArrived = async () => {
    await updateStatusAndSave('ARRIVED');
    // Simulated Passenger Notification
    const arrivalMsg = isRTL
      ? 'وصل السائق إلى موقعك.'
      : rawLang.startsWith('es')
      ? 'Tu conductor ha llegado a tu ubicación.'
      : rawLang.startsWith('en')
      ? 'Your driver has arrived at your location.'
      : 'Votre chauffeur est arrivé à votre position.';

    Alert.alert(
      isRTL ? 'إشعار الراكب 🔔' : 'Notification passager 🔔',
      arrivalMsg,
      [{ text: 'OK' }]
    );
  };

  // Phase 4.3: Start Trip Trigger (Countdown 5s with Cancel option)
  const handleTriggerStartTrip = () => {
    if (isCountdownActive) return;
    setIsCountdownActive(true);
    setCountdownSeconds(5);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCountdownActive && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isCountdownActive && countdownSeconds === 0) {
      setIsCountdownActive(false);
      updateStatusAndSave('IN_PROGRESS');
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountdownActive, countdownSeconds]);

  const handleCancelCountdown = () => {
    setIsCountdownActive(false);
    setCountdownSeconds(5);
  };

  // Phase 4.5: Complete Ride ("إنهاء الرحلة / Terminer la course")
  const handleCompleteRide = async () => {
    await updateStatusAndSave('COMPLETED');
    setShowRatingModal(true);
  };

  const handleFinishRating = async () => {
    await AsyncStorage.removeItem('@active_driver_trip_v1').catch(() => {});
    setShowRatingModal(false);
    onClose();
  };

  // System Notification when driver locks phone or sends app to background (Rule #14)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (!isBackgroundedNotificationSent) {
          setIsBackgroundedNotificationSent(true);
          console.log('[SYSTEM NOTIFICATION] 🚗 YALLA VTC: Course active - Le chauffeur est en route vers le passager.');
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isBackgroundedNotificationSent]);

  // Open External Navigation App (Google Maps / Waze / Apple Maps)
  const handleOpenExternalNavigation = async (navAppChoice?: NavAppType) => {
    const targetApp = navAppChoice || preferredNavApp;

    // Phase 4 Dynamic Destination:
    // If trip is IN_PROGRESS -> Navigate to Dropoff B (Destination)
    // Otherwise -> Navigate to Pickup A (Passenger Location)
    const isHeadingToDestination = rideStatus === 'IN_PROGRESS';
    const targetLat = isHeadingToDestination ? (order.dropoffLat || 31.6410) : (order.pickupLat || 31.6342);
    const targetLng = isHeadingToDestination ? (order.dropoffLng || -8.0190) : (order.pickupLng || -8.0089);

    let primaryUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=driving`;

    if (targetApp === 'waze') {
      // Waze Universal Deep Link for exact coordinate navigation
      primaryUrl = `https://waze.com/ul?ll=${targetLat},${targetLng}&navigate=yes`;
    } else if (targetApp === 'apple_maps' && Platform.OS === 'ios') {
      primaryUrl = `maps://maps.apple.com/?daddr=${targetLat},${targetLng}&dirflg=d`;
    } else if (targetApp === 'google_maps' && Platform.OS === 'android') {
      primaryUrl = `google.navigation:q=${targetLat},${targetLng}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(primaryUrl);
      if (canOpen) {
        await Linking.openURL(primaryUrl);
      } else {
        const fallbackUrl = targetApp === 'waze'
          ? `waze://?ll=${targetLat},${targetLng}&navigate=yes`
          : `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=driving`;

        await Linking.openURL(fallbackUrl).catch(async () => {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=driving`;
          await Linking.openURL(webUrl);
        });
      }
    } catch (_) {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=driving`;
      await Linking.openURL(webUrl).catch(() => {});
    }
  };

  const savePreferredNavApp = async (app: NavAppType) => {
    setPreferredNavApp(app);
    setShowNavPicker(false);
    await AsyncStorage.setItem('@driver_nav_app', app).catch(() => {});
    handleOpenExternalNavigation(app);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: cardBg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* ── 1. Top Bar Header (Course confirmée) ────────────────────────── */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: cardBg,
              borderBottomColor: borderColor,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <TouchableOpacity style={[styles.closeHeaderBtn, { backgroundColor: surfaceAltBg }]} onPress={onClose}>
            <X size={20} color={textPrimaryColor} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <View style={styles.confirmedHeaderRow}>
              <CheckCircle2 size={16} color={rideStatus === 'IN_PROGRESS' ? '#3B82F6' : '#16A34A'} />
              <Text style={[styles.headerTitle, { color: textPrimaryColor }]}>
                {rideStatus === 'IN_PROGRESS'
                  ? (isRTL ? 'الرحلة جارية' : rawLang.startsWith('es') ? 'Viaje en curso' : rawLang.startsWith('en') ? 'Ride in progress' : 'Course en cours')
                  : rideStatus === 'ARRIVED'
                  ? (isRTL ? 'وصلت لموقع الزبون' : rawLang.startsWith('es') ? 'He llegado' : rawLang.startsWith('en') ? 'I’ve Arrived' : 'Je suis arrivé')
                  : (isRTL ? 'الرحلة مؤكدة ✓' : rawLang.startsWith('es') ? 'Viaje confirmado ✓' : rawLang.startsWith('en') ? 'Trip Confirmed ✓' : 'Course confirmée ✓')}
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: textSecondaryColor }]}>
              {rideStatus === 'IN_PROGRESS'
                ? (isRTL ? 'في الطريق إلى الوجهة النهائيّة (B)' : 'En route vers la destination (B)')
                : rideStatus === 'ARRIVED'
                ? (isRTL ? 'في انتظار صعود الزبون' : 'En attente du passager')
                : (isRTL ? 'أنت الآن في الطريق إلى الراكب' : 'En route vers le passager')}
            </Text>
          </View>

          {/* Nav Picker Launcher Cog */}
          <TouchableOpacity
            style={[styles.navPickerBtn, { backgroundColor: primaryLightBg }]}
            onPress={() => setShowNavPicker(true)}
          >
            <Compass size={18} color={primaryBrand} />
          </TouchableOpacity>
        </View>

        {/* ── 2. Interactive Map View (Driver 🚗 -> Pickup A -> Dropoff B) ─── */}
        <View style={styles.mapContainer}>
          <LeafletMapView
            pickupLocation={{
              latitude: order.pickupLat || 31.6342,
              longitude: order.pickupLng || -8.0089,
              address: order.pickupAddress,
            }}
            dropoffLocation={{
              latitude: order.dropoffLat || 31.6410,
              longitude: order.dropoffLng || -8.0190,
              address: order.dropoffAddress,
            }}
            driverLocation={{
              latitude: driverLat,
              longitude: driverLng,
            }}
            height={SCREEN_H * 0.40}
          />

          {/* Floating Driver ETA Pill over map */}
          <View style={[styles.floatingEtaPill, { backgroundColor: rideStatus === 'IN_PROGRESS' ? '#3B82F6' : primaryBrand }]}>
            <Car size={14} color="#FFFFFF" />
            <Text style={styles.floatingEtaText}>
              {rideStatus === 'IN_PROGRESS'
                ? (isRTL ? 'الوجهة (B):' : 'Destination B:') + ` ${order.distance || '8.8 km'} (${order.eta || '14 min'})`
                : (isRTL ? 'وصولك له:' : 'Approche:') + ` ${order.distanceToPickup || '1.5 km'} (${order.pickupEta || '4 min'})`}
            </Text>
          </View>
        </View>

        {/* ── 3. Bottom Passenger & Trip Details Sheet ─────────────────────── */}
        <View style={[styles.bottomSheet, { backgroundColor: cardBg, borderColor: borderColor }]}>
          {/* Passenger Info & Fare Header */}
          <View style={[styles.passengerCard, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}>
            <View style={[styles.passengerMainRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Image
                source={{
                  uri:
                    passengerDetail?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatar}
              />
              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.passengerName, { color: textPrimaryColor }]}>
                  {passengerDetail?.name || 'Passager'}
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.ratingText, { color: textSecondaryColor }]}>
                    {(passengerDetail?.rating || 4.9).toFixed(1)} ({passengerDetail?.tripsCount || 60} {isRTL ? 'رحلة' : 'courses'})
                  </Text>
                </View>
              </View>

              {/* Price Tag */}
              <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                <Text style={[styles.priceValue, { color: primaryBrand }]}>
                  {finalPrice} MAD
                </Text>
                <Text style={[styles.priceSub, { color: textSecondaryColor }]}>
                  {isRTL ? 'دفع نقدي' : 'Espèces'}
                </Text>
              </View>
            </View>

            {/* Address Points A & B */}
            <View style={styles.addressListContainer}>
              <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.pointBadge, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.pointLetter}>A</Text>
                </View>
                <Text style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                  {order.pickupAddress}
                </Text>
              </View>

              <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.pointBadge, { backgroundColor: primaryBrand }]}>
                  <Text style={styles.pointLetter}>B</Text>
                </View>
                <Text style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                  {order.dropoffAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 4. Phase 4 Dynamic Action Buttons ───────────────────────────── */}
          {/* A. Phase 4.2: Driver En Route -> Button "Je suis arrivé / وصلت" */}
          {rideStatus === 'DRIVER_ACCEPTED' && (
            <TouchableOpacity
              style={[styles.primaryLifecycleBtn, { backgroundColor: '#10B981' }]}
              onPress={handleDriverArrived}
              activeOpacity={0.88}
            >
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.primaryLifecycleBtnText}>
                {isRTL
                  ? 'وصلت (Je suis arrivé)'
                  : rawLang.startsWith('es')
                  ? 'He llegado'
                  : rawLang.startsWith('en')
                  ? 'I’ve Arrived'
                  : 'Je suis arrivé'}
              </Text>
            </TouchableOpacity>
          )}

          {/* B. Phase 4.3: Driver Arrived -> Button "Démarrer la course / بدء الرحلة" with 5m Countdown */}
          {rideStatus === 'ARRIVED' && !isCountdownActive && (
            <TouchableOpacity
              style={[styles.primaryLifecycleBtn, { backgroundColor: primaryBrand }]}
              onPress={handleTriggerStartTrip}
              activeOpacity={0.88}
            >
              <Car size={20} color="#FFFFFF" />
              <Text style={styles.primaryLifecycleBtnText}>
                {isRTL
                  ? 'بدء الرحلة (Démarrer la course)'
                  : rawLang.startsWith('es')
                  ? 'Iniciar viaje'
                  : rawLang.startsWith('en')
                  ? 'Start Ride'
                  : 'Démarrer la course'}
              </Text>
            </TouchableOpacity>
          )}

          {/* C. Countdown Active State (5s timer with Cancel button) */}
          {rideStatus === 'ARRIVED' && isCountdownActive && (
            <View style={styles.countdownContainer}>
              <View style={[styles.countdownBar, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.countdownText}>
                  {isRTL
                    ? `جاري تأكيد لبدء الرحلة... (${countdownSeconds}s)`
                    : `Démarrage dans... (${countdownSeconds}s)`}
                </Text>
              </View>
              <TouchableOpacity style={styles.cancelCountdownBtn} onPress={handleCancelCountdown}>
                <Text style={styles.cancelCountdownText}>
                  {isRTL ? 'إلغاء (Annuler)' : 'Annuler / Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* D. Phase 4.5: Trip In Progress -> Button "Terminer la course / إنهاء الرحلة" */}
          {rideStatus === 'IN_PROGRESS' && (
            <TouchableOpacity
              style={[styles.primaryLifecycleBtn, { backgroundColor: '#EF4444' }]}
              onPress={handleCompleteRide}
              activeOpacity={0.88}
            >
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.primaryLifecycleBtnText}>
                {isRTL
                  ? 'إنهاء الرحلة (Terminer la course)'
                  : rawLang.startsWith('es')
                  ? 'Finalizar viaje'
                  : rawLang.startsWith('en')
                  ? 'End Ride'
                  : 'Terminer la course'}
              </Text>
            </TouchableOpacity>
          )}

          {/* E. Open External Navigation Action Button */}
          <TouchableOpacity
            style={[styles.openNavBtn, { backgroundColor: '#CCFF00', marginTop: 10 }]}
            onPress={() => handleOpenExternalNavigation()}
            activeOpacity={0.88}
          >
            <Navigation size={18} color="#111827" />
            <Text style={styles.openNavBtnText}>
              {isRTL
                ? 'فتح الخريطة (Google Maps / Waze)'
                : rawLang.startsWith('es')
                ? 'Abrir navegación'
                : rawLang.startsWith('en')
                ? 'Open Navigation'
                : 'Ouvrir la navigation'}
            </Text>
            <ExternalLink size={16} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* ── 5. Navigation App Selection Picker Modal ────────────────────── */}
        {showNavPicker && (
          <Modal visible={showNavPicker} transparent animationType="fade" onRequestClose={() => setShowNavPicker(false)}>
            <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowNavPicker(false)}>
              <View style={[styles.pickerContainer, { backgroundColor: cardBg, borderColor: borderColor }]}>
                <Text style={[styles.pickerTitle, { color: textPrimaryColor }]}>
                  {isRTL ? 'اختر تطبيق الملاحة المفضل' : 'Choisir l’application de navigation'}
                </Text>

                <TouchableOpacity
                  style={[styles.pickerOption, { backgroundColor: preferredNavApp === 'google_maps' ? primaryLightBg : surfaceAltBg }]}
                  onPress={() => savePreferredNavApp('google_maps')}
                >
                  <Text style={[styles.pickerOptionText, { color: textPrimaryColor }]}>🗺️ Google Maps</Text>
                  {preferredNavApp === 'google_maps' && <CheckCircle2 size={18} color={primaryBrand} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pickerOption, { backgroundColor: preferredNavApp === 'waze' ? primaryLightBg : surfaceAltBg }]}
                  onPress={() => savePreferredNavApp('waze')}
                >
                  <Text style={[styles.pickerOptionText, { color: textPrimaryColor }]}>🚘 Waze</Text>
                  {preferredNavApp === 'waze' && <CheckCircle2 size={18} color={primaryBrand} />}
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.pickerOption, { backgroundColor: preferredNavApp === 'apple_maps' ? primaryLightBg : surfaceAltBg }]}
                    onPress={() => savePreferredNavApp('apple_maps')}
                  >
                    <Text style={[styles.pickerOptionText, { color: textPrimaryColor }]}>🍏 Apple Maps</Text>
                    {preferredNavApp === 'apple_maps' && <CheckCircle2 size={18} color={primaryBrand} />}
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Phase 4.6: Driver Passenger Rating Modal */}
        {showRatingModal && (
          <Modal visible={showRatingModal} transparent animationType="slide">
            <View style={styles.ratingOverlay}>
              <View style={[styles.ratingCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
                <View style={[styles.ratingHeaderBadge, { backgroundColor: primaryLightBg }]}>
                  <CheckCircle2 size={32} color={primaryBrand} />
                </View>

                <Text style={[styles.ratingTitle, { color: textPrimaryColor }]}>
                  {isRTL
                    ? 'تم إنهاء الرحلة بنجاح 🎉'
                    : rawLang.startsWith('es')
                    ? 'Viaje completado 🎉'
                    : rawLang.startsWith('en')
                    ? 'Ride Completed 🎉'
                    : 'Course terminée 🎉'}
                </Text>
                <Text style={[styles.ratingSubtitle, { color: textSecondaryColor }]}>
                  {isRTL
                    ? 'قيّم الراكب:'
                    : rawLang.startsWith('es')
                    ? 'Califica al pasajero:'
                    : rawLang.startsWith('en')
                    ? 'Rate the passenger:'
                    : 'Évaluez le passager :'} {passengerDetail?.name || 'Passager'}
                </Text>

                {/* 5-Star Rating Row */}
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setDriverGivenRating(star)}
                      activeOpacity={0.7}
                      style={{ padding: 4 }}
                    >
                      <Star
                        size={34}
                        color="#F59E0B"
                        fill={star <= driverGivenRating ? '#F59E0B' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryLifecycleBtn, { backgroundColor: primaryBrand, marginTop: 16 }]}
                  onPress={handleFinishRating}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryLifecycleBtnText}>
                    {isRTL
                      ? 'إرسال التقييم (Envoyer)'
                      : rawLang.startsWith('es')
                      ? 'Enviar valoración'
                      : rawLang.startsWith('en')
                      ? 'Submit Rating'
                      : 'Envoyer l’évaluation'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  closeHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  navPickerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingEtaPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  floatingEtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  passengerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  passengerMainRow: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#683EE6',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 19,
    fontWeight: '900',
  },
  priceSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressListContainer: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB33',
  },
  addressRow: {
    alignItems: 'center',
    gap: 8,
  },
  pointBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLetter: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  openNavBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  openNavBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerContainer: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  pickerOptionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryLifecycleBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  primaryLifecycleBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  countdownContainer: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  countdownBar: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelCountdownBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelCountdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  ratingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  ratingCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  ratingHeaderBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  ratingSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
});
