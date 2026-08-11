import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PermissionsAndroid,
  Linking,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Menu, Wifi, WifiOff, Compass, RefreshCw } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { OrderCard } from '../components/OrderCard';
import { SideDrawer } from '../components/SideDrawer';
import { TripDetailsBottomSheet } from '../components/TripDetailsBottomSheet';
import { useOrdersStore, RideOrder } from '../../../store/useOrdersStore';
import { useTheme } from '../../../theme/ThemeContext';
import { socketService } from '../../../services/socket.service';
import { useVehicleMode } from '../../../hooks/useVehicleMode';
import {
  checkNativeGpsEnabled,
  openNativeGpsSettings,
  syncKeepScreenOnNativeSetting,
  setGlobalDriverWorkStatus,
} from '../../../services/keepAwake.service';

type MockOrder = RideOrder & { passengerDetail?: any; isFairPrice?: boolean };
type DriverStatus = 'OFFLINE' | 'AVAILABLE';

// Helper to parse distance number for proximity sorting (Rule #9)
const parseDistanceKm = (distStr?: string): number => {
  if (!distStr) return 999;
  const clean = distStr.replace(/[^0-9.,]/g, '').replace(',', '.');
  const val = parseFloat(clean);
  if (isNaN(val)) return 999;
  if (distStr.toLowerCase().includes('m') && !distStr.toLowerCase().includes('km')) {
    return val / 1000;
  }
  return val;
};

export const OrdersListScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const { orders: storeOrders, removeOrder } = useOrdersStore();

  const [motoStatus, setMotoStatus]               = useState<DriverStatus>('OFFLINE');
  const [motoStatusLoading, setMotoStatusLoading] = useState<boolean>(false);

  const [carStatus, setCarStatus]                 = useState<DriverStatus>('OFFLINE');
  const [carStatusLoading, setCarStatusLoading]   = useState<boolean>(false);

  const [loading, setLoading]       = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  const { isMotorcycleMode, refresh: refreshVehicleMode } = useVehicleMode();

  useEffect(() => {
    refreshVehicleMode();
  }, [refreshVehicleMode]);

  // Load persistent mode statuses independently
  useEffect(() => {
    (async () => {
      try {
        const savedMoto = await AsyncStorage.getItem('@moto_driver_status');
        if (savedMoto === 'AVAILABLE' || savedMoto === 'OFFLINE') setMotoStatus(savedMoto as DriverStatus);
        const savedCar = await AsyncStorage.getItem('@car_driver_status');
        if (savedCar === 'AVAILABLE' || savedCar === 'OFFLINE') setCarStatus(savedCar as DriverStatus);
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

  // Filter orders by vehicle type
  const MOTO_SERVICE_TYPES = ['MOTORCYCLE', 'MOTORCYCLE_DELIVERY', 'MOTO'];
  const filteredOrders = useMemo(() => {
    return (storeOrders as MockOrder[]).filter(o => {
      const st = (o.serviceType ?? '').toUpperCase();
      if (isMotorcycleMode) {
        return !st || MOTO_SERVICE_TYPES.includes(st);
      } else {
        return !MOTO_SERVICE_TYPES.includes(st);
      }
    });
  }, [storeOrders, isMotorcycleMode]);

  // MANDATORY RULE #9: Sort orders by proximity (nearest to driver first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => parseDistanceKm(a.distanceToPickup) - parseDistanceKm(b.distanceToPickup)
    );
  }, [filteredOrders]);

  // Auto-cleanup expired orders every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      storeOrders.forEach(o => {
        if (o.expiresAt && o.expiresAt < now) {
          removeOrder(o.id);
        }
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, [storeOrders, removeOrder]);

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
        socketService.setPresence('AVAILABLE');
      } else {
        setMotoStatus('OFFLINE');
        await AsyncStorage.setItem('@moto_driver_status', 'OFFLINE').catch(() => {});
        socketService.setPresence('OFFLINE');
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
        socketService.setPresence('AVAILABLE');
      } else {
        setCarStatus('OFFLINE');
        await AsyncStorage.setItem('@car_driver_status', 'OFFLINE').catch(() => {});
        socketService.setPresence('OFFLINE');
      }
    } catch (e) {
      console.error('[CAR STATUS ERROR]', e);
    } finally {
      setCarStatusLoading(false);
    }
  }, [carStatus, carStatusLoading, isRTL]);

  // MANDATORY RULE #6: Tapping an order card when OFFLINE triggers Online switch
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
              setSelectedOrder(order);
            },
          },
        ]
      );
      return;
    }
    setSelectedOrder(order);
  }, [activeStatus, isMotorcycleMode, toggleMotoStatus, toggleCarStatus, isRTL]);

  const handleAcceptOrder = useCallback(async (orderId: string, finalPrice: number) => {
    try {
      await socketService.acceptRide(orderId);
      removeOrder(orderId);
      setSelectedOrder(null);
    } catch (err: any) {
      Alert.alert(
        isRTL ? 'تم قبول الطلب بوسطة سائق آخر' : 'Course déjà acceptée',
        err?.response?.data?.message || (isRTL ? 'تم قبول هذا الطلب من طرف سائق آخر.' : 'Cette course a déjà été acceptée par un autre chauffeur.'),
        [{ text: 'OK' }]
      );
      removeOrder(orderId);
      setSelectedOrder(null);
    }
  }, [removeOrder, isRTL]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  // Theme Design Tokens
  const pageBg = isDarkMode ? '#111318' : '#FFFFFF';
  const surfaceBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
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

        {/* Refresh / Sync Button */}
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: isDarkMode ? '#20232B' : '#F8F7FC' }]}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={textSecondaryColor} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Orders List Section (RULE #6: Always visible even when offline) ── */}
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            driverStatus={activeStatus}
            onPress={handleCardPress}
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
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: isDarkMode ? '#20232B' : '#F3F0FF' }]}>
              <Compass size={40} color={primaryBrand} />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimaryColor }]}>
              {isRTL ? 'لا تتوفر طلبات قريبة حالياً' : 'Aucune commande disponible'}
            </Text>
            <Text style={[styles.emptySub, { color: textSecondaryColor }]}>
              {activeStatus === 'OFFLINE'
                ? (isRTL ? 'أنت غير متصل الآن. قم بالتحويل إلى "متصل" لتلقي إشعارات الطلبات الفورية.' : 'Vous êtes hors ligne. Passez en ligne pour recevoir des demandes directes.')
                : (isRTL ? 'جاري البحث عن طلبات رحلات جديدة بالقرب منك...' : 'Recherche de nouvelles courses à proximité...')}
            </Text>
          </View>
        }
      />

      {/* ── 3. Side Drawer & Trip Details Sheet ───────────────────────────────── */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {selectedOrder && (
        <TripDetailsBottomSheet
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAccept={handleAcceptOrder}
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
  listPadding: {
    padding: 14,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
