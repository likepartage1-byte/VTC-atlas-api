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
      incomingTimerRef.current = setTimeout(() => {
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
              isRTL ? '📍 خدمة تحديد الموقع معطلة' : '📍 Localisation désactivée',
              isRTL ? 'يرجى تفعيل خدمة GPS لاستقبال الطلبات.' : 'Veuillez activer le GPS pour recevoir des courses.',
              [
                { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
                { text: isRTL ? 'تفعيل GPS' : 'Activer GPS', onPress: () => openNativeGpsSettings() },
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
  }, [motoStatus, motoStatusLoading, isRTL]);

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
              isRTL ? '📍 خدمة تحديد الموقع معطلة' : '📍 Localisation désactivée',
              isRTL ? 'يرجى تفعيل خدمة GPS لاستقبال الطلبات.' : 'Veuillez activer le GPS pour recevoir des courses.',
              [
                { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
                { text: isRTL ? 'تفعيل GPS' : 'Activer GPS', onPress: () => openNativeGpsSettings() },
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
  }, [carStatus, carStatusLoading, isRTL]);

  // MANDATORY RULE #5 & #14: Manual Card Press vs Incoming Private Alert
  const handleCardPress = useCallback(async (order: MockOrder) => {
    if (activeStatus === 'OFFLINE') {
      Alert.alert(
        isRTL ? 'تنشيط الوضع متصل' : 'Passer en ligne',
        isRTL
          ? 'أنت غير متصل الآن. هل ترغب في التحويل إلى "متصل" لعرض وتفاعل الطلبات؟'
          : 'Vous êtes hors ligne. Voulez-vous passer en ligne pour accepter cette course ?',
        [
          { text: isRTL ? 'إلغاء' : 'Annuler', style: 'cancel' },
          {
            text: isRTL ? 'تفعيل (En ligne)' : 'Passer en ligne',
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
  }, [activeStatus, isMotorcycleMode, toggleMotoStatus, toggleCarStatus, isRTL]);

  // Phase 3 Flow: Driver Accept -> Waiting 15s Passenger Confirmation -> Confirmed Trip Screen
  const handleAcceptOrder = useCallback((orderId: string, finalPrice: number) => {
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

  // Phase 3 Event: Passenger Confirmed during 15s countdown -> Go to Confirmed Trip Screen!
  const handlePassengerConfirmed = useCallback((order: MockOrder, price: number) => {
    setWaitingConfirmationData(null);
    setConfirmedTripData({ order, finalPrice: price });
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

        {/* Centered Driver Status Pill */}
        <TouchableOpacity
          disabled={isMotorcycleMode ? motoStatusLoading : carStatusLoading}
          style={[
            styles.statusPill,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              backgroundColor: activeStatus === 'AVAILABLE' ? (isDarkMode ? '#14291F' : '#ECFDF5') : (isDarkMode ? '#20232B' : '#F8F7FC'),
              borderColor: activeStatus === 'AVAILABLE' ? '#16A34A' : '#E5E7EB',
            },
          ]}
          onPress={isMotorcycleMode ? toggleMotoStatus : toggleCarStatus}
          activeOpacity={0.85}
        >
          {(isMotorcycleMode ? motoStatusLoading : carStatusLoading) ? (
            <ActivityIndicator size="small" color={activeStatus === 'AVAILABLE' ? '#16A34A' : textSecondaryColor} />
          ) : (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: activeStatus === 'AVAILABLE' ? '#16A34A' : '#6B7280' },
              ]}
            />
          )}
          <Text
            style={[
              styles.statusText,
              { color: activeStatus === 'AVAILABLE' ? '#16A34A' : textSecondaryColor },
            ]}
          >
            {activeStatus === 'AVAILABLE'
              ? (isRTL ? '● متصل (En ligne)' : '● EN LIGNE')
              : (isRTL ? '○ غير متصل (Hors ligne)' : '○ HORS LIGNE')}
          </Text>
        </TouchableOpacity>

        {/* Tier Test Badge Switcher (BASIC / GOLD / PREMIER) */}
        <TouchableOpacity
          style={[styles.tierTestBadge, { backgroundColor: isDarkMode ? '#272042' : '#F3F0FF', borderColor: primaryBrand }]}
          onPress={cycleDriverTier}
          activeOpacity={0.8}
        >
          <Sparkles size={12} color={primaryBrand} />
          <Text style={[styles.tierTestText, { color: primaryBrand }]}>{driverTier}</Text>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tierTestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tierTestText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listPadding: {
    padding: 14,
    paddingBottom: 24,
  },
});
