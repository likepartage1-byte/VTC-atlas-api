import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Menu, RefreshCw, Sparkles } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { OrderCard } from '../components/OrderCard';
import { OrderRadar } from '../components/OrderRadar';
import { SideDrawer } from '../components/SideDrawer';
import { PrivateRideAlertModal } from '../components/PrivateRideAlertModal';
import { ManualRideDetailsModal } from '../components/ManualRideDetailsModal';
import { ReportOrderModal } from '../components/ReportOrderModal';
import { PassengerProfileModal } from '../components/PassengerProfileModal';
import { WaitingPassengerConfirmationModal } from '../components/WaitingPassengerConfirmationModal';
import { ConfirmedTripModal } from '../components/ConfirmedTripModal';
import { VerificationRequiredModal } from '../components/VerificationRequiredModal';
import { canDriverAccessOrder, DriverVerificationState } from '../../../services/driverVerificationGuard.service';
import {
  mockOrdersRepository,
  MockOrder,
  MOCK_CONFIG,
  DriverTier,
} from '../repositories/mockOrdersRepository';
import { useOrdersStore } from '../../../store/useOrdersStore';
import { useTheme } from '../../../theme/ThemeContext';
import { soundService } from '../../../services/sound.service';
import { useVehicleMode } from '../../../hooks/useVehicleMode';
import {
  checkNativeGpsEnabled,
  openNativeGpsSettings,
  syncKeepScreenOnNativeSetting,
  setGlobalDriverWorkStatus,
} from '../../../services/keepAwake.service';

type DriverStatus = 'OFFLINE' | 'AVAILABLE';

export const OrdersListScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  // Driver Tier state for priority testing (BASIC, GOLD, PREMIER)
  const [driverTier, setDriverTier] = useState<DriverTier>('GOLD');

  // Driver status state
  const [motoStatus, setMotoStatus]               = useState<DriverStatus>('OFFLINE');
  const [motoStatusLoading, setMotoStatusLoading] = useState<boolean>(false);

  const [carStatus, setCarStatus]                 = useState<DriverStatus>('OFFLINE');
  const [carStatusLoading, setCarStatusLoading]   = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Separate states for Incoming Private Ride Alert vs Manual Card Preview (Rule #14)
  const [incomingPrivateAlertOrder, setIncomingPrivateAlertOrder] = useState<MockOrder | null>(null);
  const [manualPreviewOrder, setManualPreviewOrder] = useState<MockOrder | null>(null);

  // Phase 3 States: Waiting Confirmation & Confirmed Trip Modal
  const [waitingConfirmationData, setWaitingConfirmationData] = useState<{
    order: MockOrder;
    finalPrice: number;
  } | null>(null);

  const [confirmedTripData, setConfirmedTripData] = useState<{
    order: MockOrder;
    finalPrice: number;
  } | null>(null);

  // Hidden orders, Report Modal & Passenger Profile Modal states
  const [hiddenOrderIds, setHiddenOrderIds] = useState<string[]>([]);
  const [selectedReportOrder, setSelectedReportOrder] = useState<MockOrder | null>(null);
  const [selectedPassengerProfileOrder, setSelectedPassengerProfileOrder] = useState<MockOrder | null>(null);

  // Local Mock Orders State
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);

  // Filter out hidden orders locally
  const visibleMockOrders = useMemo(() => {
    return mockOrders.filter((o) => !hiddenOrderIds.includes(o.id));
  }, [mockOrders, hiddenOrderIds]);

  const { isMotorcycleMode, refresh: refreshVehicleMode } = useVehicleMode();
  const incomingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    refreshVehicleMode();
  }, [refreshVehicleMode]);

  // Load persistent driver status & tier
  useEffect(() => {
    (async () => {
      try {
        const savedMoto = await AsyncStorage.getItem('@moto_driver_status');
        if (savedMoto === 'AVAILABLE' || savedMoto === 'OFFLINE') setMotoStatus(savedMoto as DriverStatus);
        const savedCar = await AsyncStorage.getItem('@car_driver_status');
        if (savedCar === 'AVAILABLE' || savedCar === 'OFFLINE') setCarStatus(savedCar as DriverStatus);
        const savedTier = await AsyncStorage.getItem('@driver_tier_level');
        if (savedTier === 'BASIC' || savedTier === 'GOLD' || savedTier === 'PREMIER') {
          setDriverTier(savedTier as DriverTier);
        }
      } catch (_) {}
    })();
  }, []);

  const activeStatus = isMotorcycleMode ? motoStatus : carStatus;

  useFocusEffect(
    useCallback(() => {
      setGlobalDriverWorkStatus(activeStatus === 'AVAILABLE', isMotorcycleMode);
      syncKeepScreenOnNativeSetting(true);
    }, [activeStatus, isMotorcycleMode])
  );

  useEffect(() => {
    setGlobalDriverWorkStatus(activeStatus === 'AVAILABLE', isMotorcycleMode);
    syncKeepScreenOnNativeSetting(true);
  }, [activeStatus, isMotorcycleMode]);

  // Load sorted mock orders from mockOrdersRepository (Rule #3)
  const refreshLocalMockOrders = useCallback(() => {
    const sorted = mockOrdersRepository.getSortedOrders();
    setMockOrders(sorted);
  }, []);

  useEffect(() => {
    refreshLocalMockOrders();
  }, [refreshLocalMockOrders]);

  // ── Rule #7: Simulate Incoming Private Ride Alert when Driver goes ONLINE ──
  useEffect(() => {
    // Clear any pending timer when status changes
    if (incomingTimerRef.current) {
      clearTimeout(incomingTimerRef.current);
      incomingTimerRef.current = null;
    }

    if (activeStatus === 'AVAILABLE' && MOCK_CONFIG.USE_MOCK_ORDERS) {
      // Simulate natural search delay (1.8s) before triggering nearest eligible ride
      incomingTimerRef.current = setTimeout(async () => {
        const { allowed } = await canDriverAccessOrder();
        if (!allowed) return; // Unapproved drivers do not receive private ride popups

        const { order, priorityWindowSeconds } = mockOrdersRepository.getNearestEligiblePrivateOrder(driverTier);
        if (order) {
          soundService.playNewOrderSound(order.id);
          setIncomingPrivateAlertOrder(order);
        }
      }, 1800);
    } else {
      setIncomingPrivateAlertOrder(null);
    }

    return () => {
      if (incomingTimerRef.current) {
        clearTimeout(incomingTimerRef.current);
      }
    };
  }, [activeStatus, driverTier, refreshLocalMockOrders]);

  // ── Motorcycle Status Toggle ────────────────────────────────────────────────
  const toggleMotoStatus = useCallback(async () => {
    if (motoStatusLoading) return;
    try {
      setMotoStatusLoading(true);
      if (motoStatus === 'OFFLINE') {
        if (Platform.OS === 'android') {
          const isGpsEnabled = await checkNativeGpsEnabled();
          if (!isGpsEnabled) {
            Alert.alert(
              isRTL ? '📍 خدمة تحديد الموقع معطلة' : rawLang.startsWith('es') ? '📍 Ubicación desactivada' : rawLang.startsWith('en') ? '📍 Location Disabled' : '📍 Localisation désactivée',
              isRTL ? 'يرجى تفعيل خدمة GPS لاستقبال الطلبات.' : rawLang.startsWith('es') ? 'Por favor, activa el GPS para recibir viajes.' : rawLang.startsWith('en') ? 'Please enable GPS to receive ride requests.' : 'Veuillez activer le GPS pour recevoir des courses.',
              [
                { text: isRTL ? 'إلغاء' : rawLang.startsWith('es') ? 'Cancelar' : rawLang.startsWith('en') ? 'Cancel' : 'Annuler', style: 'cancel' },
                { text: isRTL ? 'تفعيل GPS' : rawLang.startsWith('es') ? 'Activar GPS' : rawLang.startsWith('en') ? 'Enable GPS' : 'Activer GPS', onPress: () => openNativeGpsSettings() },
              ]
            );
            return;
          }
        }
        setMotoStatus('AVAILABLE');
        await AsyncStorage.setItem('@moto_driver_status', 'AVAILABLE').catch(() => {});
      } else {
        setMotoStatus('OFFLINE');
        await AsyncStorage.setItem('@moto_driver_status', 'OFFLINE').catch(() => {});
      }
    } catch (e) {
      console.error('[MOTO STATUS ERROR]', e);
    } finally {
      setMotoStatusLoading(false);
    }
  }, [motoStatus, motoStatusLoading, isRTL, rawLang]);

  // ── Car Status Toggle ───────────────────────────────────────────────────────
  const toggleCarStatus = useCallback(async () => {
    if (carStatusLoading) return;
    try {
      setCarStatusLoading(true);
      if (carStatus === 'OFFLINE') {
        if (Platform.OS === 'android') {
          const isGpsEnabled = await checkNativeGpsEnabled();
          if (!isGpsEnabled) {
            Alert.alert(
              isRTL ? '📍 خدمة تحديد الموقع معطلة' : rawLang.startsWith('es') ? '📍 Ubicación desactivada' : rawLang.startsWith('en') ? '📍 Location Disabled' : '📍 Localisation désactivée',
              isRTL ? 'يرجى تفعيل خدمة GPS لاستقبال الطلبات.' : rawLang.startsWith('es') ? 'Por favor, activa el GPS para recibir viajes.' : rawLang.startsWith('en') ? 'Please enable GPS to receive ride requests.' : 'Veuillez activer le GPS pour recevoir des courses.',
              [
                { text: isRTL ? 'إلغاء' : rawLang.startsWith('es') ? 'Cancelar' : rawLang.startsWith('en') ? 'Cancel' : 'Annuler', style: 'cancel' },
                { text: isRTL ? 'تفعيل GPS' : rawLang.startsWith('es') ? 'Activar GPS' : rawLang.startsWith('en') ? 'Enable GPS' : 'Activer GPS', onPress: () => openNativeGpsSettings() },
              ]
            );
            return;
          }
        }
        setCarStatus('AVAILABLE');
        await AsyncStorage.setItem('@car_driver_status', 'AVAILABLE').catch(() => {});
      } else {
        setCarStatus('OFFLINE');
        await AsyncStorage.setItem('@car_driver_status', 'OFFLINE').catch(() => {});
      }
    } catch (e) {
      console.error('[CAR STATUS ERROR]', e);
    } finally {
      setCarStatusLoading(false);
    }
  }, [carStatus, carStatusLoading, isRTL, rawLang]);

  // Driver Verification Guard State
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verificationState, setVerificationState] = useState<DriverVerificationState>({
    vehicleVerificationPercentage: 0,
    documentVerificationPercentage: 0,
    verificationStatus: 'NOT_STARTED',
    isApproved: false,
    currentMissingStep: 'VEHICLE',
  });

  // MANDATORY RULE #16: Verification Guard check before opening any order
  const handleCardPress = useCallback(async (order: MockOrder) => {
    const { allowed, state } = await canDriverAccessOrder();
    if (!allowed) {
      setVerificationState(state);
      setShowVerificationModal(true);
      return;
    }

    if (activeStatus === 'OFFLINE') {
      Alert.alert(
        isRTL ? 'تنشيط الوضع متصل' : rawLang.startsWith('es') ? 'Conectarse' : rawLang.startsWith('en') ? 'Go Online' : 'Passer en ligne',
        isRTL
          ? 'أنت غير متصل الآن. هل ترغب في التحويل إلى "متصل" لعرض وتفاعل الطلبات؟'
          : rawLang.startsWith('es')
          ? 'Estás desconectado. ¿Quieres conectarte para ver y aceptar este viaje?'
          : rawLang.startsWith('en')
          ? 'You are offline. Would you like to go online to view and accept this ride?'
          : 'Vous êtes hors ligne. Voulez-vous passer en ligne pour accepter cette course ?',
        [
          { text: isRTL ? 'إلغاء' : rawLang.startsWith('es') ? 'Cancelar' : rawLang.startsWith('en') ? 'Cancel' : 'Annuler', style: 'cancel' },
          {
            text: isRTL ? 'تفعيل' : rawLang.startsWith('es') ? 'Conectarse' : rawLang.startsWith('en') ? 'Go Online' : 'Passer en ligne',
            onPress: async () => {
              if (isMotorcycleMode) {
                await toggleMotoStatus();
              } else {
                await toggleCarStatus();
              }
              setManualPreviewOrder(order);
            },
          },
        ]
      );
      return;
    }
    setManualPreviewOrder(order);
  }, [activeStatus, isMotorcycleMode, toggleMotoStatus, toggleCarStatus, isRTL, rawLang]);

  const handleContinueVerification = useCallback(async () => {
    if (verificationState.vehicleVerificationPercentage < 100) {
      setShowVerificationModal(false);
      navigation.navigate('VehicleInfo');
    } else if (verificationState.documentVerificationPercentage < 100) {
      setShowVerificationModal(false);
      navigation.navigate('Documents');
    } else {
      // Vehicle 100% and Docs 100% -> Trigger real submit review request to Backend Queue
      const { submitDriverReviewRequest } = await import('../../../services/driverVerificationGuard.service');
      await submitDriverReviewRequest();
      setVerificationState((prev) => ({ ...prev, verificationStatus: 'PENDING_REVIEW' }));

      Alert.alert(
        isRTL ? 'تم إرسال الملف للمراجعة ✓' : rawLang.startsWith('es') ? 'Solicitud enviada ✓' : rawLang.startsWith('en') ? 'Request Submitted ✓' : 'Demande envoyée ✓',
        isRTL
          ? 'تم استلام معلومات المركبة والوثائق بنجاح، وتسجيل طلب المراجعة في الخادم. سيتم مراجعتها من فريق YALLA VTC وإفادتكم.'
          : rawLang.startsWith('es')
          ? 'Tus datos y documentos se han recibido correctamente. El equipo de YALLA VTC los revisará pronto.'
          : rawLang.startsWith('en')
          ? 'Your vehicle information and documents were received successfully. The YALLA VTC team will review them.'
          : 'Votre dossier a été soumis avec succès pour examen par l’administrateur YALLA VTC.',
        [{ text: 'OK' }]
      );
    }
  }, [navigation, verificationState, isRTL, rawLang]);

  // Phase 3 Flow: Driver Accept -> Waiting 15s Passenger Confirmation -> Confirmed Trip Screen
  const handleAcceptOrder = useCallback(async (orderId: string, finalPrice: number) => {
    const { allowed, state } = await canDriverAccessOrder();
    if (!allowed) {
      setIncomingPrivateAlertOrder(null);
      setManualPreviewOrder(null);
      setVerificationState(state);
      setShowVerificationModal(true);
      return;
    }

    const targetOrder = mockOrders.find((o) => o.id === orderId) || incomingPrivateAlertOrder || manualPreviewOrder;
    if (!targetOrder) return;

    mockOrdersRepository.acceptOrder(orderId);
    refreshLocalMockOrders();

    setIncomingPrivateAlertOrder(null);
    setManualPreviewOrder(null);

    setWaitingConfirmationData({
      order: { ...targetOrder, offeredPrice: finalPrice },
      finalPrice,
    });
  }, [mockOrders, incomingPrivateAlertOrder, manualPreviewOrder, refreshLocalMockOrders]);

  // Active Ride Restoration Effect on App Launch / Resume (Phase 4.1)
  useEffect(() => {
    (async () => {
      try {
        const storedTripJson = await AsyncStorage.getItem('@active_driver_trip_v1');
        if (storedTripJson) {
          const parsed = JSON.parse(storedTripJson);
          if (parsed && parsed.order) {
            setConfirmedTripData({ order: parsed.order, finalPrice: parsed.finalPrice || parsed.order.priceOffer });
          }
        }
      } catch (_) {}
    })();
  }, []);

  // Phase 3 Event: Passenger Confirmed during 15s countdown -> Go to Confirmed Trip Screen!
  const handlePassengerConfirmed = useCallback((order: MockOrder, price: number) => {
    const activeTrip = { order, finalPrice: price, status: 'DRIVER_ACCEPTED' };
    AsyncStorage.setItem('@active_driver_trip_v1', JSON.stringify(activeTrip)).catch(() => {});
    setWaitingConfirmationData(null);
    setConfirmedTripData({ order, finalPrice: price });
  }, []);

  const handleCloseConfirmedTrip = useCallback(() => {
    AsyncStorage.removeItem('@active_driver_trip_v1').catch(() => {});
    setConfirmedTripData(null);
  }, []);

  // Phase 3 Event: 15s Timeout expired without confirmation -> Return to DRIVER → ONLINE → ORDERS
  const handleWaitingTimeoutOrCancel = useCallback(() => {
    setWaitingConfirmationData(null);
  }, []);

  // Rule #12: Ignore Order in local Mock State
  const handleIgnoreOrder = useCallback((orderId: string) => {
    mockOrdersRepository.ignoreOrder(orderId);
    refreshLocalMockOrders();
    setIncomingPrivateAlertOrder(null);
    setManualPreviewOrder(null);
  }, [refreshLocalMockOrders]);

  // Handle 🙈 Masquer (Hide Order locally)
  const handleHideOrder = useCallback((orderId: string) => {
    setHiddenOrderIds((prev) => [...prev, orderId]);
  }, []);

  // Handle ⚠️ Plainte (Report Order Modal)
  const handleReportOrder = useCallback((order: MockOrder) => {
    setSelectedReportOrder(order);
  }, []);

  // Handle Report Submission
  const handleSubmitReport = useCallback((orderId: string, reason: string, details: string) => {
    console.log('[REPORT SUBMITTED]', { orderId, reason, details });
    setSelectedReportOrder(null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHiddenOrderIds([]);
    mockOrdersRepository.resetMockData();
    refreshLocalMockOrders();
    soundService.clearHistory();
    await new Promise(r => setTimeout(r, 400));
    setRefreshing(false);
  }, [refreshLocalMockOrders]);

  // Cycle Driver Tier Level for testing (BASIC -> GOLD -> PREMIER)
  const cycleDriverTier = async () => {
    const nextTier: DriverTier = driverTier === 'BASIC' ? 'GOLD' : driverTier === 'GOLD' ? 'PREMIER' : 'BASIC';
    setDriverTier(nextTier);
    await AsyncStorage.setItem('@driver_tier_level', nextTier).catch(() => {});
  };

  // Active active modal target
  const activeModalOrder = incomingPrivateAlertOrder || manualPreviewOrder;

  // Theme Design Tokens
  const pageBg = isDarkMode ? '#0F1115' : '#FFFFFF';
  const surfaceBg = isDarkMode ? '#171A21' : '#FFFFFF';
  const borderColor = isDarkMode ? '#272A33' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  const topPadding = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: pageBg }]} edges={['right', 'left', 'bottom']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* ── 1. Clean YALLA VTC Header ────────────────────────────────────────── */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: surfaceBg,
            borderBottomColor: borderColor,
            paddingTop: topPadding + 6,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {/* Menu Button (☰) */}
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: isDarkMode ? '#20232B' : '#F3F0FF' }]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Menu size={22} color={primaryBrand} />
        </TouchableOpacity>

        {/* 3D Glassmorphic Online / Offline Switch Button */}
        <TouchableOpacity
          disabled={isMotorcycleMode ? motoStatusLoading : carStatusLoading}
          style={[
            styles.statusPill,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              backgroundColor: activeStatus === 'AVAILABLE' ? '#10B981' : (isDarkMode ? '#2D3038' : '#374151'),
              borderColor: activeStatus === 'AVAILABLE' ? '#059669' : '#1F2937',
              shadowColor: activeStatus === 'AVAILABLE' ? '#10B981' : '#000000',
            },
          ]}
          onPress={isMotorcycleMode ? toggleMotoStatus : toggleCarStatus}
          activeOpacity={0.85}
        >
          {(isMotorcycleMode ? motoStatusLoading : carStatusLoading) ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: activeStatus === 'AVAILABLE' ? '#FFFFFF' : '#9CA3AF' },
              ]}
            />
          )}
          <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
            {activeStatus === 'AVAILABLE'
              ? (isRTL ? 'متصل' : rawLang.startsWith('es') ? 'En línea' : rawLang.startsWith('en') ? 'Online' : 'En ligne')
              : (isRTL ? 'غير متصل' : rawLang.startsWith('es') ? 'Desconectado' : rawLang.startsWith('en') ? 'Offline' : 'Hors ligne')}
          </Text>
        </TouchableOpacity>

        {/* Empty Placeholder for Balanced Header Layout */}
        <View style={{ width: 46 }} />
      </View>

      {/* ── 2. Orders List Section with Real Order Radar Integration ─────────── */}
      <FlatList
        data={visibleMockOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            driverStatus={activeStatus}
            onPress={handleCardPress}
            onPressAvatar={(order) => setSelectedPassengerProfileOrder(order)}
            onSelectOnMap={handleCardPress}
            onHideOrder={handleHideOrder}
            onReportOrder={handleReportOrder}
          />
        )}
        contentContainerStyle={styles.listPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryBrand]}
            tintColor={primaryBrand}
          />
        }
        ListEmptyComponent={
          /* Real Order Radar Component: Active when NO orders are present */
          <OrderRadar status={activeStatus} />
        }
      />

      {/* ── 3. Side Drawer, Private Alert Sheet, Manual Details Modal, Report Modal & Passenger Profile Modal ── */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* A. Automatic Targeted Incoming Alert (With 10-Second Countdown Lifetime Bar) */}
      {incomingPrivateAlertOrder && (
        <PrivateRideAlertModal
          order={incomingPrivateAlertOrder}
          onClose={() => setIncomingPrivateAlertOrder(null)}
          onIgnore={() => handleIgnoreOrder(incomingPrivateAlertOrder.id)}
          onAccept={(orderId, finalPrice) => handleAcceptOrder(orderId, finalPrice)}
        />
      )}

      {/* B. Manual Ride Details Modal (Tapped manually from Orders List - NO TIMER, NO AUTO CLOSE) */}
      {manualPreviewOrder && (
        <ManualRideDetailsModal
          order={manualPreviewOrder}
          onClose={() => setManualPreviewOrder(null)}
          onAccept={(orderId, finalPrice) => handleAcceptOrder(orderId, finalPrice)}
        />
      )}

      {/* C. Report Order Modal (Demande de rapport) */}
      {selectedReportOrder && (
        <ReportOrderModal
          order={selectedReportOrder}
          visible={!!selectedReportOrder}
          onClose={() => setSelectedReportOrder(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* D. Passenger Profile Modal (Opened by tapping passenger avatar) */}
      {selectedPassengerProfileOrder && (
        <PassengerProfileModal
          order={selectedPassengerProfileOrder}
          visible={!!selectedPassengerProfileOrder}
          onClose={() => setSelectedPassengerProfileOrder(null)}
        />
      )}

      {/* E. Phase 3: Waiting Passenger Confirmation Modal (15s Countdown Timer) */}
      {waitingConfirmationData && (
        <WaitingPassengerConfirmationModal
          order={waitingConfirmationData.order}
          finalPrice={waitingConfirmationData.finalPrice}
          visible={!!waitingConfirmationData}
          onPassengerConfirmed={handlePassengerConfirmed}
          onTimeout={handleWaitingTimeoutOrCancel}
          onCancel={handleWaitingTimeoutOrCancel}
        />
      )}

      {/* F. Phase 3: Confirmed Trip Modal (Course confirmée - Interactive Map & External Navigation) */}
      {confirmedTripData && (
        <ConfirmedTripModal
          order={confirmedTripData.order}
          finalPrice={confirmedTripData.finalPrice}
          visible={!!confirmedTripData}
          onClose={() => setConfirmedTripData(null)}
        />
      )}

      {/* G. Rule #16 Driver Verification Guard Modal */}
      {showVerificationModal && (
        <VerificationRequiredModal
          visible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onContinue={handleContinueVerification}
          state={verificationState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 74,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 23,
    borderWidth: 1.5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tierTestBadge: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  tierTestText: {
    fontSize: 12,
    fontWeight: '800',
  },
  listPadding: {
    padding: 14,
    paddingBottom: 24,
  },
});
