import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Colors } from '../../theme/colors';
import { socketService } from '../../services/socket.service';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

const getGpsStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return '#22c55e'; // Green
    case 'DISABLED':
      return '#ef4444'; // Red
    case 'PERMISSION_DENIED':
      return '#f97316'; // Orange
    case 'OFF':
    default:
      return '#64748b'; // Gray
  }
};

const getGpsStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Connected';
    case 'DISABLED':
      return 'GPS Disabled';
    case 'PERMISSION_DENIED':
      return 'No Permission';
    case 'OFF':
    default:
      return 'Radar Off';
  }
};

export const DashboardScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [lastOffer, setLastOffer] = useState<any>(null);
  const [acceptResult, setAcceptResult] = useState<string | null>(null);
  // Tracks a queued presence update when socket wasn't ready yet
  const pendingPresence = React.useRef<'AVAILABLE' | 'ONLINE' | null>(null);

  // Keep a ref of isAvailable to prevent closure stale-value bugs in socket callbacks
  const isAvailableRef = React.useRef(isAvailable);
  useEffect(() => {
    isAvailableRef.current = isAvailable;
  }, [isAvailable]);

  // تفعيل تتبع الموقع وجلب حالته الجغرافية الحية
  const { location: liveLocation, gpsStatus } = useLocationTracking(isAvailable);

  useEffect(() => {
    // الاتصال بالسوكت فور تحميل الشاشة
    socketService.connect((event, data) => {
      if (event === 'status') {
        setSocketStatus(data);
        if (data === 'connected') {
          if (pendingPresence.current) {
            console.log('[Dashboard] Flushing queued presence:', pendingPresence.current);
            socketService.setPresence(pendingPresence.current);
            pendingPresence.current = null;
          } else if (isAvailableRef.current) {
            // Auto-restore database availability if the UI switch is active!
            console.log('[Dashboard] Socket reconnected, auto-restoring presence: AVAILABLE');
            socketService.setPresence('AVAILABLE');
          }
        }
      }
      if (event === 'ride_offer') setLastOffer(data);
    });



    // Heartbeat: silently validates session every 10s.
    // Stops immediately on terminal errors (404/403).
    // On 401: the axios interceptor handles token refresh transparently.
    const interval = setInterval(async () => {
      try {
        const { api } = require('../../api/axios.instance');
        await api.get('/auth/me');
      } catch (e: any) {
        const status = e.response?.status;
        if (status === 404 || status === 403) {
          // Route missing or forbidden — stop silently
          clearInterval(interval);
        }
        // 401 is handled transparently by the axios interceptor (token refresh)
        // Network errors are ignored — next tick will retry
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  const togglePresence = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    const desiredStatus = nextState ? 'AVAILABLE' : 'ONLINE';
    if (socketService.isConnected()) {
      socketService.setPresence(desiredStatus);
    } else {
      // Socket still connecting — queue it, will be flushed on 'connect' event
      console.log('[Dashboard] Socket not ready, queuing presence:', desiredStatus);
      pendingPresence.current = desiredStatus;
    }
  };

  const handleAccept = async () => {
    if (!lastOffer) return;
    setAcceptResult('PROCCESSING...');
    const res: any = await socketService.acceptRide(lastOffer.rideId);
    setAcceptResult(res.status?.toUpperCase() || 'FAILED');
    if (res.status === 'success') {
      setTimeout(() => setLastOffer(null), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Debug Console</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{socketStatus.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Presence Control */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Go Available (Dispatch Radar)</Text>
            <Switch value={isAvailable} onValueChange={togglePresence} />
          </View>
        </View>

        {/* GPS Info */}
        <View style={styles.card}>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <Text style={styles.sectionTitle}>Real-time GPS</Text>
            <View style={[styles.gpsBadge, { backgroundColor: getGpsStatusColor(gpsStatus) }]}>
              <Text style={styles.gpsBadgeText}>{getGpsStatusLabel(gpsStatus).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.value}>Lat: {liveLocation.latitude.toFixed(6)}</Text>
          <Text style={styles.value}>Lng: {liveLocation.longitude.toFixed(6)}</Text>
          {gpsStatus === 'DISABLED' && (
            <Text style={styles.warningText}>⚠️ Please turn on GPS services on your phone</Text>
          )}
          {gpsStatus === 'PERMISSION_DENIED' && (
            <Text style={styles.warningText}>⚠️ Location permission is denied</Text>
          )}
        </View>

        {/* Offer Console */}
        <View style={[styles.card, lastOffer && styles.activeCard]}>
          <Text style={styles.sectionTitle}>Last Ride Offer</Text>
          {lastOffer ? (
            <View>
              <Text style={styles.offerText}>ID: {lastOffer.rideId}</Text>
              <Text style={styles.offerText}>Trace: {lastOffer.traceId}</Text>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.buttonText}>ACCEPT RIDE NOW</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>Waiting for offers...</Text>
          )}
        </View>

        {/* Result Console */}
        {acceptResult && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Acceptance Status</Text>
            <Text style={[styles.resultValue, { color: acceptResult === 'SUCCESS' ? Colors.success : Colors.error }]}>
              {acceptResult}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white },
  badge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: Colors.success, fontSize: 12, fontWeight: '700' },
  content: { padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16 },
  activeCard: { borderColor: Colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
  value: { color: Colors.white, fontSize: 18, fontWeight: '600', fontFamily: 'monospace' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  offerText: { color: Colors.white, marginBottom: 5, fontSize: 14 },
  acceptButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  buttonText: { color: Colors.white, fontWeight: '800' },
  resultValue: { fontSize: 24, fontWeight: '900', marginTop: 5 },
  gpsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  gpsBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  warningText: { color: '#f87171', fontSize: 12, marginTop: 8, fontWeight: '600' }
});
