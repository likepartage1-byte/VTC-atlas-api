import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { socketService } from '../../services/socket.service';
import { useLocationTracking } from '../../hooks/useLocationTracking';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  network: {
    connected:    { color: '#22c55e', label: 'ONLINE' },
    disconnected: { color: '#ef4444', label: 'OFFLINE' },
  },
  gps: {
    ON:        { color: '#22c55e', label: 'GPS ON' },
    OFF:       { color: '#ef4444', label: 'GPS OFF' },
    SEARCHING: { color: '#f59e0b', label: 'SEARCHING' },
  },
  permission: {
    GRANTED: { color: '#22c55e', label: 'GRANTED' },
    DENIED:  { color: '#ef4444', label: 'DENIED' },
    UNKNOWN: { color: '#64748b', label: 'UNKNOWN' },
  },
  presence: {
    available: { color: '#22c55e', label: 'AVAILABLE' },
    offDuty:   { color: '#64748b', label: 'OFF DUTY' },
  },
};

const Indicator = ({ label, value, config }: {
  label: string;
  value: string;
  config: { color: string; label: string };
}) => (
  <View style={styles.indicatorRow}>
    <Text style={styles.indicatorLabel}>{label}</Text>
    <View style={[styles.indicatorBadge, { borderColor: config.color }]}>
      <View style={[styles.indicatorDot, { backgroundColor: config.color }]} />
      <Text style={[styles.indicatorValue, { color: config.color }]}>{config.label}</Text>
    </View>
  </View>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const DashboardScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastOffer, setLastOffer] = useState<any>(null);
  const [acceptResult, setAcceptResult] = useState<string | null>(null);

  // Queues presence update if socket is not yet ready
  const pendingPresence = useRef<'AVAILABLE' | 'ONLINE' | null>(null);
  const isAvailableRef  = useRef(isAvailable);
  useEffect(() => { isAvailableRef.current = isAvailable; }, [isAvailable]);

  // ── GPS & Permission (always active — independent of dispatch) ──────────
  const { location, lastUpdate, gpsStatus, permissionStatus } = useLocationTracking(isAvailable);

  // ── Socket lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    socketService.connect((event, data) => {
      if (event === 'status') {
        setSocketStatus(data as 'connected' | 'disconnected');
        if (data === 'connected') {
          if (pendingPresence.current) {
            socketService.setPresence(pendingPresence.current);
            pendingPresence.current = null;
          } else if (isAvailableRef.current) {
            // Auto-restore presence after reconnect
            socketService.setPresence('AVAILABLE');
          }
        }
      }
      if (event === 'ride_offer') setLastOffer(data);
    });

    // Heartbeat: silently keeps session alive every 10s
    const interval = setInterval(async () => {
      try {
        const { api } = require('../../api/axios.instance');
        await api.get('/auth/me');
      } catch (e: any) {
        const status = e.response?.status;
        if (status === 404 || status === 403) clearInterval(interval);
      }
    }, 10_000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  // ── Driver presence toggle ──────────────────────────────────────────────
  const togglePresence = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    const desired = next ? 'AVAILABLE' : 'ONLINE';
    if (socketService.isConnected()) {
      socketService.setPresence(desired);
    } else {
      pendingPresence.current = desired;
    }
  };

  const handleAccept = async () => {
    if (!lastOffer) return;
    setAcceptResult('PROCESSING...');
    const res: any = await socketService.acceptRide(lastOffer.rideId);
    setAcceptResult(res.status?.toUpperCase() || 'FAILED');
    if (res.status === 'success') setTimeout(() => setLastOffer(null), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const networkConfig   = STATUS_CONFIG.network[socketStatus] ?? STATUS_CONFIG.network.disconnected;
  const gpsConfig       = STATUS_CONFIG.gps[gpsStatus]       ?? STATUS_CONFIG.gps.SEARCHING;
  const permConfig      = STATUS_CONFIG.permission[permissionStatus] ?? STATUS_CONFIG.permission.UNKNOWN;
  const presenceConfig  = isAvailable ? STATUS_CONFIG.presence.available : STATUS_CONFIG.presence.offDuty;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Driver Console</Text>
      </View>

      <ScrollView style={styles.content}>

        {/* ── System Status Card ───────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <Indicator label="Network"    value={socketStatus}     config={networkConfig}  />
          <Indicator label="GPS"        value={gpsStatus}        config={gpsConfig}      />
          <Indicator label="Permission" value={permissionStatus} config={permConfig}     />
          <Indicator label="Presence"   value={presenceConfig.label} config={presenceConfig} />
        </View>

        {/* ── Dispatch Switch ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.switchLabel}>Go Available</Text>
              <Text style={styles.switchSub}>Start receiving ride requests</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={togglePresence}
              trackColor={{ false: '#334155', true: Colors.primary }}
              thumbColor={isAvailable ? '#fff' : '#94a3b8'}
            />
          </View>
        </View>

        {/* ── GPS Coordinates ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Live Location</Text>
          {location ? (
            <>
              <Text style={styles.coordValue}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              {lastUpdate && (
                <Text style={styles.coordSub}>
                  Last fix: {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.coordSub}>Waiting for GPS signal...</Text>
          )}
          {gpsStatus === 'OFF' && (
            <Text style={styles.warningText}>⚠️  Enable Location Services on your phone</Text>
          )}
          {permissionStatus === 'DENIED' && (
            <Text style={styles.warningText}>⚠️  Location permission denied — check app settings</Text>
          )}
        </View>

        {/* ── Ride Offer ───────────────────────────────────────────────── */}
        <View style={[styles.card, lastOffer && styles.activeCard]}>
          <Text style={styles.sectionTitle}>Last Ride Offer</Text>
          {lastOffer ? (
            <View>
              <Text style={styles.offerText}>ID: {lastOffer.rideId}</Text>
              <Text style={styles.offerText}>Trace: {lastOffer.traceId}</Text>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.buttonText}>ACCEPT RIDE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>Waiting for offers...</Text>
          )}
        </View>

        {/* ── Accept Result ────────────────────────────────────────────── */}
        {acceptResult && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Acceptance Status</Text>
            <Text style={[styles.resultValue, {
              color: acceptResult === 'SUCCESS' ? Colors.success : Colors.error
            }]}>
              {acceptResult}
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0f172a' },
  header:           { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title:            { fontSize: 22, fontWeight: '800', color: Colors.white },
  content:          { padding: 20 },
  card:             { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16 },
  activeCard:       { borderColor: Colors.primary, borderWidth: 2 },
  sectionTitle:     { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  row:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Indicator
  indicatorRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#334155' },
  indicatorLabel:   { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  indicatorBadge:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  indicatorDot:     { width: 6, height: 6, borderRadius: 3 },
  indicatorValue:   { fontSize: 11, fontWeight: '700' },
  // Switch
  switchLabel:      { color: Colors.white, fontSize: 15, fontWeight: '700' },
  switchSub:        { color: '#64748b', fontSize: 12, marginTop: 2 },
  // Coords
  coordValue:       { color: Colors.white, fontSize: 15, fontWeight: '600', fontFamily: 'monospace', marginBottom: 4 },
  coordSub:         { color: '#64748b', fontSize: 12 },
  warningText:      { color: '#f87171', fontSize: 12, marginTop: 10, fontWeight: '600' },
  // Offer
  emptyText:        { color: '#64748b', fontStyle: 'italic' },
  offerText:        { color: Colors.white, marginBottom: 5, fontSize: 14 },
  acceptButton:     { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  buttonText:       { color: Colors.white, fontWeight: '800' },
  resultValue:      { fontSize: 24, fontWeight: '900', marginTop: 5 },
});
