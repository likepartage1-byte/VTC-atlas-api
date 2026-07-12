import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar as RNStatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Menu, Settings, Bell, Compass, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AtlasColors } from '../../../theme/atlas';
import { OrderCard } from '../components/OrderCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { SideDrawer } from '../components/SideDrawer';
import { TripDetailsBottomSheet } from '../components/TripDetailsBottomSheet';
import { ordersRepository, MockOrder } from '../ordersRepository';

type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

export const OrdersListScreen = () => {
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
      setErrorMsg('Impossible de récupérer les commandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      case 'AVAILABLE': return { label: 'EN LIGNE',  color: AtlasColors.online };
      case 'BUSY':      return { label: 'OCCUPÉ',    color: '#F59E0B' };
      default:          return { label: 'Hors ligne', color: '#6B7280' };
    }
  }, [status]);

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
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => setDrawerOpen(true)} activeOpacity={0.7}>
        <Menu size={22} color={AtlasColors.textPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statusCapsule, { backgroundColor: status === 'OFFLINE' ? '#1F2937' : statusConfig.color + '22', borderColor: statusConfig.color + '55' }]}
        onPress={cycleStatus}
        activeOpacity={0.85}
      >
        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
        <Settings size={20} color={AtlasColors.textPrimary} />
        {orders.length > 0 && <View style={styles.notifBadge} />}
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={AtlasColors.primary} />
      <Text style={styles.centeredText}>Recherche de commandes...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centered}>
      <Compass size={50} color={AtlasColors.textMuted} strokeWidth={1.2} />
      <Text style={styles.emptyTitle}>Aucune commande</Text>
      <Text style={styles.emptySubtitle}>Vous serez notifié dès qu'un client propose une course.</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.centered}>
      <AlertCircle size={44} color={AtlasColors.offline} />
      <Text style={styles.emptyTitle}>Erreur de synchronisation</Text>
      <Text style={styles.emptySubtitle}>{errorMsg}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>Réessayer</Text>
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
            tintColor={AtlasColors.primary}
            colors={[AtlasColors.primary]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <RNStatusBar barStyle="light-content" backgroundColor={AtlasColors.bg} />

      {renderHeader()}

      <View style={styles.feed}>
        {renderContent()}
      </View>

      {/* Bottom Navigation (Phase 3) */}
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Side Drawer (Phase 5 — placeholder) */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Trip Details Bottom Sheet (Phase 4) */}
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
    backgroundColor: '#0D1117', // Very dark, matching inDrive screenshot background
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor:  '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: '#161D2B',
    alignItems:      'center',
    justifyContent:  'center',
  },
  notifBadge: {
    position:        'absolute',
    top:             10,
    right:           10,
    width:            7,
    height:           7,
    borderRadius:     4,
    backgroundColor: AtlasColors.offline,
  },
  statusCapsule: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               7,
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:      24,
    borderWidth:        1,
  },
  statusDot: {
    width:        7,
    height:       7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize:   12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Feed ──────────────────────────────────────────────────
  feed: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90, // clear bottom nav
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
    color:    AtlasColors.textSecondary,
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      AtlasColors.textPrimary,
  },
  emptySubtitle: {
    fontSize:   12,
    color:      AtlasColors.textSecondary,
    textAlign:  'center',
    lineHeight:  18,
  },
  retryBtn: {
    backgroundColor: AtlasColors.primary,
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
