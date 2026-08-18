import * as React from 'react';
import {
  useRef, useCallback, useEffect, useState, useMemo
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar as RNStatusBar,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

import { socketService } from '../../services/socket.service';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { AtlasColors } from '../../theme/atlas';
import { useOrdersStore } from '../../store/useOrdersStore';

// Sub-components
import { DriverMarker }        from './components/DriverMarker';
import { StatusBar }           from './components/StatusBar';
import { AvailabilityButton }  from './components/AvailabilityButton';
import { FloatingButtons }     from './components/FloatingButtons';
import { RideBottomSheet, RideOffer } from './components/RideBottomSheet';
import { LocationInfo }        from './components/LocationInfo';
import { OffersListOverlay }   from './components/OffersListOverlay';

const DEFAULT_REGION = {
  latitude:       31.6295,
  longitude:      -7.9811,
  latitudeDelta:  0.015,
  longitudeDelta: 0.015,
};

// Seed initial high-quality offers to demo/simulate navigation
const INITIAL_MOCK_OFFERS: RideOffer[] = [
  {
    rideId: 'offer-101',
    pickupAddress: 'Gueliz (MacDonalds)',
    destAddress: 'Medina (Riad Al Maha)',
    distanceKm: 2.3,
    etaMinutes: 6,
    priceMAD: 45,
    customerRating: 4.8,
    customerName: 'Adrian',
    customerRides: 142,
    customerSince: '2024',
    paymentMethod: 'Cash payment',
    pickupCoords: { latitude: 31.6343, longitude: -8.0142 },
    destCoords: { latitude: 31.6214, longitude: -7.9945 },
  },
  {
    rideId: 'offer-102',
    pickupAddress: 'Marrakech Airport (RAK)',
    destAddress: 'Palmeraie (Hotel Riu Tikida)',
    distanceKm: 13.5,
    etaMinutes: 29,
    priceMAD: 120,
    customerRating: 4.9,
    customerName: 'Sara',
    customerRides: 388,
    customerSince: '2022',
    paymentMethod: 'Credit Card',
    pickupCoords: { latitude: 31.6069, longitude: -8.0358 },
    destCoords: { latitude: 31.6521, longitude: -7.9515 },
  },
  {
    rideId: 'offer-103',
    pickupAddress: 'Bab Agnaou (Kasbah)',
    destAddress: 'Menara Gardens',
    distanceKm: 4.1,
    etaMinutes: 12,
    priceMAD: 60,
    customerRating: 4.7,
    customerName: 'Youssef',
    customerRides: 89,
    customerSince: '2023',
    paymentMethod: 'Cash payment',
    pickupCoords: { latitude: 31.6148, longitude: -7.9912 },
    destCoords: { latitude: 31.6138, longitude: -8.0210 },
  }
];

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { t, i18n } = useTranslation('profile');
  const { isDarkMode, colors: themeColors } = useTheme();
  const isRTL = i18n.language === 'ar';

  // ── Presence state (controlled by driver, never by GPS) ─────────────────
  const [isAvailable, setIsAvailable] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Offers lists & selection (Phase 4 & 5)
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<RideOffer | null>(null);

  // Radar Animation States
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const pendingPresence = useRef<'AVAILABLE' | 'ONLINE' | null>(null);
  const isAvailableRef  = useRef(isAvailable);
  useEffect(() => { isAvailableRef.current = isAvailable; }, [isAvailable]);

  // ── GPS & Permission (always active, independent of presence) ───────────
  const { location, lastUpdate, gpsStatus, permissionStatus } = useLocationTracking(isAvailable);

  // Sync mock list loading when Online/Offline
  useEffect(() => {
    if (isAvailable) {
      setOffers(INITIAL_MOCK_OFFERS);
    } else {
      setOffers([]);
      setSelectedOffer(null);
    }
  }, [isAvailable]);

  // ── Follow driver on map ─────────────────────────────────────────────────
  useEffect(() => {
    if (!location || !mapRef.current || selectedOffer) return; // Don't snap-back if viewing an offer route
    mapRef.current.animateToRegion({
      latitude:        location.latitude,
      longitude:       location.longitude,
      latitudeDelta:   0.008,
      longitudeDelta:  0.008,
    }, 600);
  }, [location, selectedOffer]);

  // ── Socket lifecycle ─────────────────────────────────────────────────────
  useEffect(() => {
    socketService.connect((event, data) => {
      if (event === 'status') {
        setSocketStatus(data as any);
        if (data === 'connected') {
          if (pendingPresence.current) {
            socketService.setPresence(pendingPresence.current);
            pendingPresence.current = null;
          } else if (isAvailableRef.current) {
            socketService.setPresence('AVAILABLE');
          }
        }
      }
      if (event === 'ride_offer') {
        const incoming = data as any;
        // normalise to RideOffer shape for the dashboard overlay
        const newOffer: RideOffer = {
          rideId:        incoming.rideId ?? incoming.id,
          pickupAddress: incoming.pickupAddress  ?? incoming.pickup?.address ?? '',
          destAddress:   incoming.dropoffAddress ?? incoming.destination?.address ?? '',
          distanceKm:    incoming.distance       ?? 0,
          etaMinutes:    0,
          priceMAD:      incoming.fare           ?? incoming.offeredPrice ?? incoming.estimatedPrice ?? 0,
          customerRating: incoming.passengerRating ?? 4.8,
          customerName:   incoming.passengerName  ?? 'Client',
          customerRides:  incoming.passengerTripsCount ?? 0,
          customerSince:  '2025',
          paymentMethod:  'Cash payment',
          pickupCoords:  incoming.pickupLat ? { latitude: incoming.pickupLat, longitude: incoming.pickupLng } : undefined,
          destCoords:    incoming.dropoffLat ? { latitude: incoming.dropoffLat, longitude: incoming.dropoffLng } : undefined,
          serviceType:   incoming.serviceType,
          parcelInfo:    incoming.parcelInfo,
        };
        setOffers(prev => [newOffer, ...prev.filter(o => o.rideId !== newOffer.rideId)]);

        // Also push to global OrdersStore so OrdersListScreen stays in sync
        const { addOrder } = useOrdersStore.getState();
        addOrder({
          id:                  incoming.rideId ?? incoming.id,
          passengerName:       incoming.passengerName       ?? 'Client',
          passengerRating:     incoming.passengerRating     ?? 4.8,
          passengerAvatar:     incoming.passengerAvatar,
          isNewPassenger:      incoming.isNewPassenger      ?? false,
          passengerTripsCount: incoming.passengerTripsCount ?? 0,
          isVerified:          incoming.isVerified          ?? true,
          expiresAt:           incoming.expiresAt           ?? Date.now() + 25_000,
          distanceToPickup:    incoming.distanceToPickup    ?? '1.5 km',
          pickupEta:           incoming.pickupEta           ?? '4 min',
          tripDistance:        incoming.tripDistance        ?? '5 km',
          tripDuration:        incoming.tripDuration        ?? '12 min',
          offeredPrice:        incoming.offeredPrice        ?? incoming.fare ?? incoming.estimatedPrice ?? 0,
          pickupAddress:       incoming.pickupAddress       ?? incoming.pickup?.address ?? '',
          dropoffAddress:      incoming.dropoffAddress      ?? incoming.destination?.address ?? '',
          pickupLat:           incoming.pickupLat           ?? 0,
          pickupLng:           incoming.pickupLng           ?? 0,
          dropoffLat:          incoming.dropoffLat          ?? 0,
          dropoffLng:          incoming.dropoffLng          ?? 0,
          serviceType:         incoming.serviceType         ?? 'ECONOMY',
          parcelInfo:          incoming.parcelInfo          ?? undefined,
        });
      }
    });

    const heartbeat = setInterval(async () => {
      try {
        const { api } = require('../../api/axios.instance');
        await api.get('/auth/me');
      } catch (e: any) {
        const s = e.response?.status;
        if (s === 404 || s === 403) clearInterval(heartbeat);
      }
    }, 10_000);

    return () => { clearInterval(heartbeat); socketService.disconnect(); };
  }, []);

  // ── Presence toggle ──────────────────────────────────────────────────────
  const handleTogglePresence = useCallback(() => {
    const next = !isAvailableRef.current;
    setIsAvailable(next);
    const desired = next ? 'AVAILABLE' : 'ONLINE';
    if (socketService.isConnected()) {
      socketService.setPresence(desired);
    } else {
      pendingPresence.current = desired;
    }
  }, []);

  // ── Map controls ─────────────────────────────────────────────────────────
  const handleLocate = useCallback(() => {
    if (!location || !mapRef.current) return;
    setSelectedOffer(null); // Clear selected route overlay to center back on chauffeur
    mapRef.current.animateToRegion({
      latitude:       location.latitude,
      longitude:      location.longitude,
      latitudeDelta:  0.008,
      longitudeDelta: 0.008,
    }, 500);
  }, [location]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.getCamera().then((cam: any) => {
      mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 15) + 1 }, { duration: 300 });
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.getCamera().then((cam: any) => {
      mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 15) - 1 }, { duration: 300 });
    });
  }, []);

  // ── Offer interaction & Map fit (Phase 5) ────────────────────────────────
  const handleSelectOffer = useCallback((offer: RideOffer) => {
    setSelectedOffer(offer);

    // Zoom/Fit camera to encapsulate Driver, Pickup (A) and Destination (B) points
    if (mapRef.current && offer.pickupCoords && offer.destCoords) {
      const points = [offer.pickupCoords, offer.destCoords];
      if (location) {
        points.push({ latitude: location.latitude, longitude: location.longitude });
      }
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 90, right: 60, bottom: 380, left: 60 },
        animated: true,
      });
    }
  }, [location]);

  // ── Accept / Reject ride ─────────────────────────────────────────────────
  const handleAccept = useCallback(async (customPrice?: number) => {
    if (!selectedOffer) return;
    const finalPrice = customPrice ?? selectedOffer.priceMAD;
    
    // Call socket accept with correct details
    await socketService.acceptRide(selectedOffer.rideId);
    
    // Remove accepted offer from available list
    setOffers(prev => prev.filter(o => o.rideId !== selectedOffer.rideId));
    setSelectedOffer(null);
  }, [selectedOffer]);

  const handleReject = useCallback(() => {
    if (!selectedOffer) return;
    
    // Remove rejected offer from available list
    setOffers(prev => prev.filter(o => o.rideId !== selectedOffer.rideId));
    setSelectedOffer(null);
  }, [selectedOffer]);

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

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
      spinAnim.stopAnimation();
      textAnim.stopAnimation();
    };
  }, [pulse1, pulse2, pulse3, spinAnim, textAnim]);

  useEffect(() => {
    const showRadar = isAvailable && offers.length === 0;
    if (showRadar) {
      const cleanup = startAnimations();
      return cleanup;
    }
  }, [isAvailable, offers.length, startAnimations]);

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

  // ── Derived markers ────────────────────────────────────────────────────────
  const driverCoord = useMemo(() => location
    ? { latitude: location.latitude, longitude: location.longitude }
    : null, [location]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <RNStatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full-Screen Map ───────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType="none"
        initialRegion={DEFAULT_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
        showsScale={false}
        rotateEnabled={true}
        pitchEnabled={false}
        moveOnMarkerPress={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* Route Points (Pickup -> Destination) if an offer is selected */}
        {selectedOffer?.pickupCoords && (
          <Marker
            coordinate={selectedOffer.pickupCoords}
            title="Pickup (A)"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.routeMarkerCircle, { backgroundColor: AtlasColors.online }]}>
              <Text style={styles.routeMarkerLetter}>A</Text>
            </View>
          </Marker>
        )}

        {selectedOffer?.destCoords && (
          <Marker
            coordinate={selectedOffer.destCoords}
            title="Destination (B)"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.routeMarkerCircle, { backgroundColor: AtlasColors.offline }]}>
              <Text style={styles.routeMarkerLetter}>B</Text>
            </View>
          </Marker>
        )}

        {driverCoord && (
          <Marker
            coordinate={driverCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <DriverMarker isOnline={isAvailable} />
          </Marker>
        )}
      </MapView>

      {/* ── Radar Scanner overlay (pops up when Online and offers list is empty) ── */}
      {isAvailable && offers.length === 0 && (
        <View style={styles.radarContainer} pointerEvents="box-none">
          <ImageBackground
            source={
              isDarkMode
                ? require('../../assets/radar_dark.png')
                : require('../../assets/radar_light.png')
            }
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          >
            {/* Pulsing Concentric Circles */}
            <Animated.View
              style={[
                styles.pulsingRing,
                {
                  transform: [{ scale: pulse1Scale }],
                  opacity: pulse1Opacity,
                  borderColor: isDarkMode ? '#4ADE80' : '#16A34A',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulsingRing,
                {
                  transform: [{ scale: pulse2Scale }],
                  opacity: pulse2Opacity,
                  borderColor: isDarkMode ? '#4ADE80' : '#16A34A',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulsingRing,
                {
                  transform: [{ scale: pulse3Scale }],
                  opacity: pulse3Opacity,
                  borderColor: isDarkMode ? '#4ADE80' : '#16A34A',
                },
              ]}
            />

            {/* Rotating Sweep Sector */}
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
                    <Stop offset="0%" stopColor={isDarkMode ? '#4ADE80' : '#16A34A'} stopOpacity="0.45" />
                    <Stop offset="50%" stopColor={isDarkMode ? '#4ADE80' : '#16A34A'} stopOpacity="0.25" />
                    <Stop offset="100%" stopColor={isDarkMode ? '#4ADE80' : '#16A34A'} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Path
                  d="M100 100 L170 30 A 100 100 0 0 0 100 0 Z"
                  fill="url(#radarSweep)"
                />
              </Svg>
            </Animated.View>

            {/* HUD Status Texts */}
            <View style={styles.radarHUD}>
              <Animated.Text style={[styles.radarStatusText, { color: isDarkMode ? '#4ADE80' : '#16A34A', opacity: textOpacity }]}>
                {isRTL ? 'جاري البحث عن طلبات قريبة...' : 'Recherche de courses à proximité...'}
              </Animated.Text>
              <Text style={[styles.radarSubText, { color: themeColors.textSecondary }]}>
                {isRTL ? 'ابق قريباً من المناطق النشطة' : 'Restez à proximité des zones animées'}
              </Text>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ── Top overlay ──────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          {/* App title */}
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>Yalla VTC</Text>
          </View>

          {/* Status pills */}
          <StatusBar
            networkStatus={socketStatus}
            gpsStatus={gpsStatus}
            permissionStatus={permissionStatus}
            isAvailable={isAvailable}
          />
        </View>
      </SafeAreaView>

      {/* ── Floating action buttons (moved slightly up to avoid overlapping lists) */}
      <FloatingButtons
        onLocate={handleLocate}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* ── Bottom panel ─────────────────────────────────────────────── */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 8 }]}>
        {/* Real-time Location/Speed Overlay */}
        {location && (
          <LocationInfo
            latitude={location.latitude}
            longitude={location.longitude}
            lastUpdate={lastUpdate}
            gpsStatus={gpsStatus}
          />
        )}

        {/* GPS warnings */}
        {gpsStatus === 'OFF' && (
          <Text style={styles.gpsBanner}>⚠️  GPS disabled — enable Location Services</Text>
        )}

        {/* Nearby Ride Offers horizontal list (Phase 4) */}
        <OffersListOverlay
          offers={offers}
          selectedId={selectedOffer?.rideId ?? null}
          onSelect={handleSelectOffer}
          isOnline={isAvailable}
        />

        {/* Main availability button */}
        <AvailabilityButton
          isAvailable={isAvailable}
          onToggle={handleTogglePresence}
        />
      </View>

      {/* ── Expanded Ride Offer Bottom Sheet (Phase 6) ────────────────── */}
      {selectedOffer && (
        <RideBottomSheet
          offer={selectedOffer}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Top Overlay
  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: AtlasColors.overlay,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  brandBadge: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  brandText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Custom Map Markers
  routeMarkerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  routeMarkerLetter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  // Bottom Panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    backgroundColor: AtlasColors.overlay,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gpsBanner: {
    color: AtlasColors.warning,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  radarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
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
  radarHUD: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
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
});
