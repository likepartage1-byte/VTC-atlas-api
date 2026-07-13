import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Menu, Compass, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { OrderCard } from '../components/OrderCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { SideDrawer } from '../components/SideDrawer';
import { TripDetailsBottomSheet } from '../components/TripDetailsBottomSheet';
import { ordersRepository, MockOrder } from '../ordersRepository';
import { useTheme } from '../../../theme/ThemeContext';

type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

export const OrdersListScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [status, setStatus]         = useState<DriverStatus>('OFFLINE');
  const [orders, setOrders]         = useState<MockOrder[]>([]);
  const [loading, setLoading]       = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<string>('orders');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMsg(null);
    try {
      const data = await ordersRepository.getNearbyOrders();
      setOrders(data);
    } catch {
      setErrorMsg(t('wallet:error_load', 'Impossible de récupérer les commandes.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  // ── Status capsule ─────────────────────────────────────────────────────────
  const cycleStatus = useCallback(() => {
    setStatus((s) => s === 'OFFLINE' ? 'AVAILABLE' : s === 'AVAILABLE' ? 'BUSY' : 'OFFLINE');
  }, []);

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'AVAILABLE': return { label: t('available'),  color: colors.online };
      case 'BUSY':      return { label: t('busy'),       color: colors.warning };
      default:          return { label: t('offline'),    color: colors.neutral };
    }
  }, [status, colors, t]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCardPress = useCallback((order: MockOrder) => {
    setSelectedOrder(order);
  }, []);

  const handleAccept = useCallback((orderId: string, finalPrice: number) => {
    console.log(`[Orders] Accepted order ${orderId} at ${finalPrice} MAD`);
    setSelectedOrder(null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceAlt }]}>
      <TouchableOpacity 
        style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]} 
        onPress={() => setDrawerOpen(true)} 
        activeOpacity={0.7}
      >
        <Menu size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('orders')}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.statusCapsule, 
          { 
            backgroundColor: status === 'OFFLINE' ? colors.surfaceAlt : statusConfig.color + '15', 
            borderColor: statusConfig.color + '30' 
          }
        ]}
        onPress={cycleStatus}
        activeOpacity={0.85}
      >
        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.centeredText, { color: colors.textSecondary }]}>
        {t('check_again', 'Recherche de commandes...')}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centered}>
      <Compass size={50} color={colors.textMuted} strokeWidth={1.2} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('no_orders')}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('check_again', 'Vous serez notifié dès qu\'un client propose une course.')}
      </Text>
      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>{t('check_again', 'Réessayer')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.centered}>
      <AlertCircle size={44} color={colors.offline} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Erreur de synchronisation</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{errorMsg}</Text>
      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>{t('check_again', 'Réessayer')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading)   return renderLoading();
    if (errorMsg)  return renderError();
    if (!orders.length) return renderEmpty();

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleCardPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {renderHeader()}

      <View style={styles.feed}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Trip Details Bottom Sheet */}
      <TripDetailsBottomSheet
        order={selectedOrder}
        onAccept={handleAccept}
        onClose={handleCloseSheet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: 1,
    height: 58,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    10,
    alignItems:      'center',
    justifyContent:  'center',
  },
  statusCapsule: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               7,
    paddingHorizontal: 14,
    paddingVertical:    7,
    borderRadius:      24,
    borderWidth:        1,
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize:   11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Feed ──────────────────────────────────────────────────
  feed: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90,
  },

  // ── States ────────────────────────────────────────────────
  centered: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap:             14,
  },
  centeredText: {
    fontSize: 13,
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize:   12,
    textAlign:  'center',
    lineHeight:  18,
  },
  retryBtn: {
    borderRadius:    10,
    paddingVertical:  8,
    paddingHorizontal: 22,
  },
  retryText: {
    color:      '#fff',
    fontSize:   12,
    fontWeight: '700',
  },
});
