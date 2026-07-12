import React, {
  useRef, useCallback, useEffect, useState, useMemo
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { socketService } from '../../services/socket.service';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { AtlasColors } from '../../theme/atlas';

// Sub-components (UI only — no logic changes)
import { DriverMarker }       from './components/DriverMarker';
import { StatusBar }          from './components/StatusBar';
import { AvailabilityButton } from './components/AvailabilityButton';
import { FloatingButtons }    from './components/FloatingButtons';
import { RideBottomSheet, RideOffer }    from './components/RideBottomSheet';
import { LocationInfo }       from './components/LocationInfo';

// Dark-mode map style
const MAP_STYLE = [
  { elementType: 'geometry',                     stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill',             stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke',           stylers: [{ color: '#0f172a' }] },
  { featureType: 'road',         elementType: 'geometry',      stylers: [{ color: '#1e293b' }] },
  { featureType: 'road',         elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road.highway', elementType: 'geometry',      stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water',        elementType: 'geometry',      stylers: [{ color: '#0c1628' }] },
  { featureType: 'water',        elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'poi',          elementType: 'labels',        stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',      elementType: 'labels',        stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6366f1' }] },
];

const DEFAULT_REGION = {
  latitude:       31.6295,
  longitude:      -7.9811,
  latitudeDelta:  0.015,
  longitudeDelta: 0.015,
};

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // ── Presence state (controlled by driver, never by GPS) ─────────────────
  const [isAvailable, setIsAvailable] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastOffer,   setLastOffer]    = useState<RideOffer | null>(null);

  const pendingPresence = useRef<'AVAILABLE' | 'ONLINE' | null>(null);
  const isAvailableRef  = useRef(isAvailable);
  useEffect(() => { isAvailableRef.current = isAvailable; }, [isAvailable]);

  // ── GPS & Permission (always active, independent of presence) ───────────
  const { location, lastUpdate, gpsStatus, permissionStatus }
    = useLocationTracking(isAvailable);

  // ── Follow driver on map ─────────────────────────────────────────────────
  useEffect(() => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude:        location.latitude,
      longitude:       location.longitude,
      latitudeDelta:   0.008,
      longitudeDelta:  0.008,
    }, 600);
  }, [location]);

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
      if (event === 'ride_offer') setLastOffer(data as RideOffer);
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

  // ── Accept / Reject ride ─────────────────────────────────────────────────
  const handleAccept = useCallback(async () => {
    if (!lastOffer) return;
    await socketService.acceptRide(lastOffer.rideId);
    setLastOffer(null);
  }, [lastOffer]);

  const handleReject = useCallback(() => setLastOffer(null), []);

  // ── Derived values ────────────────────────────────────────────────────────
  const markerCoord = useMemo(() => location
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
        {markerCoord && (
          <Marker
            coordinate={markerCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <DriverMarker isOnline={isAvailable} />
          </Marker>
        )}
      </MapView>

      {/* ── Top overlay ──────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          {/* App title */}
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>ATLAS</Text>
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

      {/* ── Floating action buttons ───────────────────────────────────── */}
      <FloatingButtons
        onLocate={handleLocate}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* ── Bottom panel ─────────────────────────────────────────────── */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 12 }]}>
        {/* GPS info strip */}
        {location && (
          <LocationInfo
            latitude={location.latitude}
            longitude={location.longitude}
            lastUpdate={lastUpdate}
            gpsStatus={gpsStatus}
          />
        )}

        {/* GPS warning if needed */}
        {gpsStatus === 'OFF' && (
          <Text style={styles.gpsBanner}>⚠️  GPS disabled — enable Location Services</Text>
        )}
        {permissionStatus === 'DENIED' && (
          <Text style={styles.gpsBanner}>⚠️  Location permission denied</Text>
        )}

        {/* Main action button */}
        <AvailabilityButton
          isAvailable={isAvailable}
          onToggle={handleTogglePresence}
        />
      </View>

      {/* ── Ride offer bottom sheet (slides up from bottom) ──────────── */}
      {lastOffer && (
        <RideBottomSheet
          offer={lastOffer}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Top
  topOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: AtlasColors.overlay,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  brandBadge: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  brandText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Bottom
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: AtlasColors.overlay,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gpsBanner: {
    color: AtlasColors.warning,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
