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
import { Menu, Settings, Bell, RefreshCw, AlertCircle, Compass } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AtlasColors } from '../../../theme/atlas';
import { OrderCard } from '../components/OrderCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ordersRepository, MockOrder } from '../ordersRepository';

type DriverPresenceStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

export const OrdersListScreen = () => {
  const [presence, setPresence] = useState<DriverPresenceStatus>('AVAILABLE');
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('orders');

  // ── Data Ingestion ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMsg(null);
    try {
      const data = await ordersRepository.getNearbyOrders();
      setOrders(data);
    } catch (e) {
      setErrorMsg('Failed to synchronize nearby requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  // Toggle status capsule cyclic: OFFLINE -> AVAILABLE -> BUSY -> OFFLINE
  const cyclePresenceStatus = useCallback(() => {
    setPresence((prev) => {
      if (prev === 'OFFLINE') return 'AVAILABLE';
      if (prev === 'AVAILABLE') return 'BUSY';
      return 'OFFLINE';
    });
  }, []);

  const handleOrderPress = useCallback((order: MockOrder) => {
    console.log('[OrdersFeed] Selected order:', order.id);
    // Future integration hook (Map detail transition)
  }, []);

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const presenceStyle = useMemo(() => {
    switch (presence) {
      case 'AVAILABLE':
        return { color: AtlasColors.online, label: 'AVAILABLE' };
      case 'BUSY':
        return { color: AtlasColors.offline, label: 'BUSY' };
      default:
        return { color: AtlasColors.neutral, label: 'OFFLINE' };
    }
  }, [presence]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Drawer hamburger */}
      <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
        <Menu size={22} color={AtlasColors.textPrimary} />
      </TouchableOpacity>

      {/* Interactive presence capsule */}
      <TouchableOpacity
        style={[styles.statusCapsule, { borderColor: presenceStyle.color + '45' }]}
        onPress={cyclePresenceStatus}
        activeOpacity={0.8}
      >
        <View style={[styles.statusDot, { backgroundColor: presenceStyle.color }]} />
        <Text style={[styles.statusText, { color: presenceStyle.color }]}>
          {presenceStyle.label}
        </Text>
      </TouchableOpacity>

      {/* Right controls */}
      <View style={styles.rightHeaderControls}>
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Bell size={20} color={AtlasColors.textPrimary} />
          {orders.length > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Settings size={20} color={AtlasColors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Compass size={48} color={AtlasColors.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No Orders Found</Text>
      <Text style={styles.emptySub}>We will notify you immediately as soon as a customer proposes a ride</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>Check Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertCircle size={44} color={AtlasColors.offline} />
      <Text style={styles.errorTitle}>Synchronization Error</Text>
      <Text style={styles.errorSub}>{errorMsg}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AtlasColors.primary} />
          <Text style={styles.loadingText}>Fetching nearby ride offers...</Text>
        </View>
      );
    }

    if (errorMsg) {
      return renderErrorState();
    }

    if (orders.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Peak Performance flatlist tuning
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[AtlasColors.primary]}
            tintColor={AtlasColors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <RNStatusBar barStyle="light-content" backgroundColor={AtlasColors.bg} />
      
      {/* Header element */}
      {renderHeader()}

      {/* Main orders feed block */}
      <View style={styles.feedWrapper}>
        <View style={styles.feedHeadingRow}>
          <Text style={styles.feedTitle}>Nearby Requests</Text>
          <TouchableOpacity style={styles.syncBtn} onPress={() => fetchOrders()} disabled={loading}>
            <RefreshCw size={13} color={AtlasColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {renderContent()}
      </View>

      {/* Bottom tabs menu navigation overlay */}
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: AtlasColors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: AtlasColors.surface,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AtlasColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  rightHeaderControls: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeDot: {
    position: 'absolute',
    top: 10, right: 10,
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: AtlasColors.offline,
    borderWidth: 1,
    borderColor: AtlasColors.surfaceAlt,
  },
  statusCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  feedWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  feedHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AtlasColors.textPrimary,
  },
  syncBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: AtlasColors.surfaceAlt,
  },
  listContainer: {
    paddingBottom: 110, // clear navigation footer
  },
  // States style
  loadingContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AtlasColors.textPrimary,
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AtlasColors.textPrimary,
    marginTop: 6,
  },
  errorSub: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
    textAlign: 'center',
  },
});
