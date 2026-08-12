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

  const { passengerDetail } = order;

  // Mock driver current GPS position (Approaching pickup A)
  const driverLat = (order.pickupLat || 31.6342) - 0.005;
  const driverLng = (order.pickupLng || -8.0089) - 0.005;

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#22252D' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  // Load saved navigation app preference
  useEffect(() => {
    (async () => {
      try {
        const savedNav = await AsyncStorage.getItem('@driver_nav_app');
        if (savedNav === 'google_maps' || savedNav === 'waze' || savedNav === 'apple_maps') {
          setPreferredNavApp(savedNav as NavAppType);
        }
      } catch (_) {}
    })();
  }, []);

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
    const destLat = order.pickupLat || 31.6342;
    const destLng = order.pickupLng || -8.0089;

    let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;

    if (targetApp === 'waze') {
      url = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;
    } else if (targetApp === 'apple_maps' && Platform.OS === 'ios') {
      url = `maps://maps.apple.com/?daddr=${destLat},${destLng}`;
    } else if (targetApp === 'google_maps' && Platform.OS === 'android') {
      url = `google.navigation:q=${destLat},${destLng}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web Google Maps URL
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
        await Linking.openURL(fallbackUrl);
      }
    } catch (_) {
      Alert.alert(
        isRTL ? 'تطبيق الملاحة' : 'Navigation',
        isRTL ? 'تعذر فتح تطبيق الخرائط. سيتم فتح خرائط جوجل على المتصفح.' : 'Impossible d’ouvrir l’application. Ouverture dans le navigateur.',
        [{ text: 'OK' }]
      );
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
              <CheckCircle2 size={16} color="#16A34A" />
              <Text style={[styles.headerTitle, { color: textPrimaryColor }]}>
                {isRTL
                  ? 'الرحلة مؤكدة ✓'
                  : rawLang.startsWith('es')
                  ? 'Viaje confirmado ✓'
                  : rawLang.startsWith('en')
                  ? 'Trip Confirmed ✓'
                  : 'Course confirmée ✓'}
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: textSecondaryColor }]}>
              {isRTL ? 'أنت الآن في الطريق إلى الراكب' : 'En route vers le passager'}
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
            height={SCREEN_H * 0.42}
          />

          {/* Floating Driver ETA Pill over map */}
          <View style={[styles.floatingEtaPill, { backgroundColor: primaryBrand }]}>
            <Car size={14} color="#FFFFFF" />
            <Text style={styles.floatingEtaText}>
              {isRTL ? 'وصولك له:' : 'Approche:'} {order.distanceToPickup || '1.5 km'} ({order.pickupEta || '4 min'})
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

          {/* ── 4. Open External Navigation Action Button ──────────────────── */}
          <TouchableOpacity
            style={[styles.openNavBtn, { backgroundColor: '#CCFF00' }]}
            onPress={() => handleOpenExternalNavigation()}
            activeOpacity={0.88}
          >
            <Navigation size={20} color="#111827" />
            <Text style={styles.openNavBtnText}>
              {isRTL
                ? 'فتح الخريطة (Google Maps / Waze)'
                : rawLang.startsWith('es')
                ? 'Abrir navegación'
                : rawLang.startsWith('en')
                ? 'Open Navigation'
                : 'Ouvrir la navigation'}
            </Text>
            <ExternalLink size={18} color="#111827" />
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
});
