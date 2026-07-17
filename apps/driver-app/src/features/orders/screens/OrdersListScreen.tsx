import * as React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import { Menu, Compass, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { OrderCard } from '../components/OrderCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { SideDrawer } from '../components/SideDrawer';
import { TripDetailsBottomSheet } from '../components/TripDetailsBottomSheet';
import { useOrdersStore, RideOrder } from '../../../store/useOrdersStore';
import { useTheme } from '../../../theme/ThemeContext';
import { socketService } from '../../../services/socket.service';

// Legacy type alias — OrderCard still expects MockOrder shape
type MockOrder = RideOrder & { passengerDetail?: any; isFairPrice?: boolean };

type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

const SAFE_POSITIONS = [
  { top: '25%', left: '25%', right: undefined, bottom: undefined },
  { top: '22%', right: '28%', left: undefined, bottom: undefined },
  { top: '38%', left: '20%', right: undefined, bottom: undefined },
  { top: '42%', right: '18%', left: undefined, bottom: undefined },
  { bottom: '26%', left: '28%', top: undefined, right: undefined },
  { bottom: '22%', right: '30%', top: undefined, left: undefined },
  { bottom: '38%', left: '22%', top: undefined, right: undefined },
  { bottom: '40%', right: '24%', top: undefined, left: undefined },
  { top: '30%', right: '40%', left: undefined, bottom: undefined },
  { bottom: '30%', left: '42%', top: undefined, right: undefined },
];

export const OrdersListScreen = () => {
  const { t, i18n } = useTranslation('profile');
  const { colors, isDarkMode } = useTheme();
  const isRTL = i18n.language === 'ar';

  const { orders: storeOrders, removeOrder } = useOrdersStore();

  const [status, setStatus]         = useState<DriverStatus>('OFFLINE');
  const [loading, setLoading]       = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<string>('orders');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  // Dynamic positions for submarine targets
  const [target1Pos, setTarget1Pos] = useState<any>(SAFE_POSITIONS[0]);
  const [target2Pos, setTarget2Pos] = useState<any>(SAFE_POSITIONS[1]);
  const [target3Pos, setTarget3Pos] = useState<any>(SAFE_POSITIONS[5]);

  // Radar Animation States
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const target1Anim = useRef(new Animated.Value(0)).current;
  const target2Anim = useRef(new Animated.Value(0)).current;
  const target3Anim = useRef(new Animated.Value(0)).current;

  // Cast store orders to MockOrder shape for OrderCard compatibility
  const orders = storeOrders as MockOrder[];

  // ── Radar Loop & Pulsing Interpolations ──────────────────────────────────────────
  const startAnimations = useCallback(() => {
    const runPulse = (anim: Animated.Value) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => runPulse(anim));
    };

    runPulse(pulse1);
    const t2 = setTimeout(() => runPulse(pulse2), 900);
    const t3 = setTimeout(() => runPulse(pulse3), 1800);

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(textAnim, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const runTarget = (anim: Animated.Value, setPos: (pos: any) => void) => {
      let timeoutId: any;
      let active = true;

      const cycle = () => {
        if (!active) return;
        anim.setValue(0);
        
        // Randomize location
        const rIndex = Math.floor(Math.random() * SAFE_POSITIONS.length);
        setPos(SAFE_POSITIONS[rIndex]);

        // 35% chance to skip this cycle to dynamically show 0/1/2/3 dots!
        const skip = Math.random() < 0.35;
        if (skip) {
          timeoutId = setTimeout(() => {
            cycle();
          }, 2400);
          return;
        }

        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.delay(650),
          Animated.timing(anim, {
            toValue: 0,
            duration: 950,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start((result) => {
          if (result.finished) {
            cycle();
          }
        });
      };

      cycle();

      return () => {
        active = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    };

    const cleanupTarget1 = runTarget(target1Anim, setTarget1Pos);
    const cleanupTarget2 = runTarget(target2Anim, setTarget2Pos);
    const cleanupTarget3 = runTarget(target3Anim, setTarget3Pos);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      cleanupTarget1();
      cleanupTarget2();
      cleanupTarget3();
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
      spinAnim.stopAnimation();
      textAnim.stopAnimation();
      target1Anim.stopAnimation();
      target2Anim.stopAnimation();
      target3Anim.stopAnimation();
    };
  }, [pulse1, pulse2, pulse3, spinAnim, textAnim, target1Anim, target2Anim, target3Anim]);

  useEffect(() => {
    const showRadar = orders.length === 0 && !loading && !errorMsg;
    if (showRadar) {
      const cleanup = startAnimations();
      return cleanup;
    }
  }, [orders.length, loading, errorMsg, startAnimations]);

  const pulse1Scale = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.2],
  });
  const pulse1Opacity = pulse1.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 0.7, 0.4, 0],
  });

  const pulse2Scale = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.2],
  });
  const pulse2Opacity = pulse2.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 0.7, 0.4, 0],
  });

  const pulse3Scale = pulse3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.2],
  });
  const pulse3Opacity = pulse3.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 0.7, 0.4, 0],
  });

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const textOpacity = textAnim;

  // ── Auto-cleanup expired orders every 30s ─────────────────────────────────
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

  // ── Pull-to-refresh: noop since data is driven by live socket ─────────────
  const fetchOrders = useCallback(async (silent = false) => {
    // Orders arrive via WebSocket; nothing to fetch manually.
    // This handler is kept for the refresh control UI.
    if (!silent) setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setRefreshing(false);
  }, []);

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

  const handleCardPress = useCallback((order: MockOrder) => {
    setSelectedOrder(order);
  }, []);

  const handleAccept = useCallback(async (orderId: string, finalPrice: number) => {
    try {
      await socketService.acceptRide(orderId);
      removeOrder(orderId);   // Remove from live list on success
      setSelectedOrder(null);
    } catch (err: any) {
      Alert.alert(
        'Course non disponible',
        err?.response?.data?.message || 'Cette course a déjà été acceptée par un autre chauffeur.',
        [{ text: 'OK' }],
      );
      removeOrder(orderId);   // Clean up even on conflict
      setSelectedOrder(null);
    }
  }, [removeOrder]);


  const handleCloseSheet = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={[
      styles.header,
      { 
        backgroundColor: colors.surface, 
        borderBottomColor: colors.surfaceAlt,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
      }
    ]}>
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

  const renderEmpty = () => {
    const radarColor = isDarkMode ? '#C084FC' : '#7C3AED';

    return (
      <View style={[styles.pureRadarContainer, { backgroundColor: colors.bg }]}>
        <View style={styles.radarMainFrame}>
          
          {/* Night Map Background Texture */}
          <ImageBackground
            source={require('../../../assets/radar_dark.png')}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            imageStyle={{ opacity: isDarkMode ? 0.35 : 0.18, borderRadius: 170 }}
          >
            {/* Soft dark/light overlay depending on active theme */}
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: isDarkMode ? 'rgba(11, 15, 25, 0.45)' : 'rgba(248, 250, 252, 0.4)',
                  borderRadius: 170
                }
              ]}
            />
          </ImageBackground>

          {/* Abstract Vector Road Network Grid (Roadmap/grid background) */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 340 340">
              {/* Central horizontal road */}
              <Path
                d="M 10,170 Q 100,160 170,170 T 330,170"
                fill="none"
                stroke={radarColor}
                strokeWidth={1.5}
                strokeDasharray="4 6"
                opacity={0.06}
              />
              {/* Central vertical road */}
              <Path
                d="M 170,10 Q 160,100 170,170 T 170,330"
                fill="none"
                stroke={radarColor}
                strokeWidth={1.5}
                strokeDasharray="4 6"
                opacity={0.06}
              />
              {/* Curved street 1 */}
              <Path
                d="M 40,60 C 120,40 220,120 280,100"
                fill="none"
                stroke={radarColor}
                strokeWidth={2}
                opacity={0.05}
              />
              {/* Curved street 2 */}
              <Path
                d="M 60,280 C 140,240 220,320 300,240"
                fill="none"
                stroke={radarColor}
                strokeWidth={2}
                opacity={0.05}
              />
              {/* Diagonal ring road */}
              <Path
                d="M 80,100 C 120,180 200,220 260,280"
                fill="none"
                stroke={radarColor}
                strokeWidth={1.5}
                opacity={0.04}
              />
              {/* Tiny intersection dots */}
              <Path
                d="M40,60 h1 M280,100 h1 M60,280 h1 M300,240 h1 M170,170 h1 M80,100 h1 M260,280 h1"
                stroke={radarColor}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.12}
              />
            </Svg>
          </View>

          {/* Static Radar Grid Background (Concentric Circles) */}
          <View style={[styles.gridCircle, { width: 80, height: 80, borderRadius: 40, borderColor: radarColor, opacity: 0.12 }]} />
          <View style={[styles.gridCircle, { width: 160, height: 160, borderRadius: 80, borderColor: radarColor, opacity: 0.09 }]} />
          <View style={[styles.gridCircle, { width: 240, height: 240, borderRadius: 120, borderColor: radarColor, opacity: 0.07 }]} />
          <View style={[styles.gridCircle, { width: 320, height: 320, borderRadius: 160, borderColor: radarColor, opacity: 0.05 }]} />
          
          {/* Crosshairs lines to complete the professional look */}
          <View style={[styles.crosshairLine, { width: 340, height: 1, backgroundColor: radarColor, opacity: 0.04 }]} />
          <View style={[styles.crosshairLine, { width: 1, height: 340, backgroundColor: radarColor, opacity: 0.04 }]} />

          {/* Pulsing Concentric Waves */}
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                transform: [{ scale: pulse1Scale }],
                opacity: pulse1Opacity,
                borderColor: radarColor,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                transform: [{ scale: pulse2Scale }],
                opacity: pulse2Opacity,
                borderColor: radarColor,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulsingRing,
              {
                transform: [{ scale: pulse3Scale }],
                opacity: pulse3Opacity,
                borderColor: radarColor,
              },
            ]}
          />

          {/* Submarine Sonar target blips */}
          {/* Target Blip 1 */}
          <Animated.View
            style={[
              styles.submarineBlip,
              target1Pos,
              {
                opacity: target1Anim,
              },
            ]}
          >
            <View style={[styles.blipCore, { backgroundColor: radarColor }]} />
            <Animated.View
              style={[
                styles.blipRing,
                {
                  borderColor: radarColor,
                  transform: [{
                    scale: target1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 2.2],
                    })
                  }],
                  opacity: target1Anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.8, 0],
                  })
                }
              ]}
            />
          </Animated.View>

          {/* Target Blip 2 */}
          <Animated.View
            style={[
              styles.submarineBlip,
              target2Pos,
              {
                opacity: target2Anim,
              },
            ]}
          >
            <View style={[styles.blipCore, { backgroundColor: radarColor }]} />
            <Animated.View
              style={[
                styles.blipRing,
                {
                  borderColor: radarColor,
                  transform: [{
                    scale: target2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 2.2],
                    })
                  }],
                  opacity: target2Anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.8, 0],
                  })
                }
              ]}
            />
          </Animated.View>

          {/* Target Blip 3 */}
          <Animated.View
            style={[
              styles.submarineBlip,
              target3Pos,
              {
                opacity: target3Anim,
              },
            ]}
          >
            <View style={[styles.blipCore, { backgroundColor: radarColor }]} />
            <Animated.View
              style={[
                styles.blipRing,
                {
                  borderColor: radarColor,
                  transform: [{
                    scale: target3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 2.2],
                    })
                  }],
                  opacity: target3Anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.8, 0],
                  })
                }
              ]}
            />
          </Animated.View>

          {/* Rotating Radar Sweep Slice */}
          <Animated.View
            style={[
              styles.sweepWrapper,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg width={360} height={360} viewBox="0 0 200 200">
              <Defs>
                <RadialGradient id="radarSweep" cx="100" cy="100" r="100" fx="100" fy="100">
                  <Stop offset="0%" stopColor={radarColor} stopOpacity="0.45" />
                  <Stop offset="50%" stopColor={radarColor} stopOpacity="0.18" />
                  <Stop offset="100%" stopColor={radarColor} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Path
                d="M100 100 L170 30 A 100 100 0 0 0 100 0 Z"
                fill="url(#radarSweep)"
              />
            </Svg>
          </Animated.View>

          {/* Central Beacon Chauffeur Profile or Compass Pin */}
          <View style={[styles.centralBeacon, { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.12)' : 'rgba(22, 163, 74, 0.09)' }]}>
            <View style={[styles.centralDot, { backgroundColor: radarColor }]}>
              <Compass size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* HUD Info and coordinate logs */}
        <View style={styles.radarHUDContainer}>
          <Animated.Text style={[styles.radarStatusText, { color: radarColor, opacity: textOpacity }]}>
            {isRTL ? 'جاري المسح الراداري للطلبات...' : 'Recherche de courses (Radar)...'}
          </Animated.Text>
          <Text style={[styles.radarSubText, { color: colors.textSecondary }]}>
            {isRTL ? 'تلقائيًا، ستبث أولى الطلبات القريبة إليك' : 'Vous recevrez les demandes à proximité en temps réel'}
          </Text>

          {/* Corner tech specs for decoration */}
          <View style={styles.radarTechFooter}>
            <Text style={[styles.techSpecText, { color: colors.textMuted }]}>SYS: OK</Text>
            <Text style={[styles.techSpecText, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.techSpecText, { color: colors.textMuted }]}>RANGE: 10 KM</Text>
            <Text style={[styles.techSpecText, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.techSpecText, { color: colors.textMuted }]}>FPS: 60</Text>
          </View>
        </View>
      </View>
    );
  };

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
          <OrderCard order={item as any} onPress={handleCardPress} />
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
        order={selectedOrder as any}
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
  pureRadarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  radarMainFrame: {
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridCircle: {
    position: 'absolute',
    borderWidth: 1.2,
    borderStyle: 'dashed',
  },
  crosshairLine: {
    position: 'absolute',
  },
  centralBeacon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  centralDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    top: '50%',
    left: '50%',
    marginTop: -110,
    marginLeft: -110,
  },
  sweepWrapper: {
    position: 'absolute',
    width: 360,
    height: 360,
    top: '50%',
    left: '50%',
    marginTop: -180,
    marginLeft: -180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarHUDContainer: {
    marginTop: 35,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  radarStatusText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  radarSubText: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  radarTechFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    opacity: 0.7,
  },
  techSpecText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  submarineBlip: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blipCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 1.5,
    elevation: 2,
  },
  blipRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
});
