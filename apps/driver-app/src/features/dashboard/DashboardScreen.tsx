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

export const DashboardScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [lastOffer, setLastOffer] = useState<any>(null);
  const [acceptResult, setAcceptResult] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  // تفعيل تتبع الموقع عند دخول وضع "AVAILABLE"
  useLocationTracking(isAvailable);

  useEffect(() => {
    // الاتصال بالسوكت فور تحميل الشاشة
    socketService.connect((event, data) => {
      if (event === 'status') setSocketStatus(data);
      if (event === 'ride_offer') setLastOffer(data);
    });

    const watchId = Geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.log(err),
      { distanceFilter: 5 }
    );

    return () => {
      socketService.disconnect();
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const togglePresence = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    socketService.setPresence(nextState ? 'AVAILABLE' : 'ONLINE');
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
          <Text style={styles.sectionTitle}>Real-time GPS</Text>
          <Text style={styles.value}>Lat: {location.lat.toFixed(6)}</Text>
          <Text style={styles.value}>Lng: {location.lng.toFixed(6)}</Text>
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
  resultValue: { fontSize: 24, fontWeight: '900', marginTop: 5 }
});
