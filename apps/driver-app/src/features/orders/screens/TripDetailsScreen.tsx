import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useOrdersStore } from '../../../store/useOrdersStore';
import { BidBottomSheet } from '../components/BidBottomSheet';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#888888" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export const TripDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { orders } = useOrdersStore();
  
  const order = orders.find(o => o.id === orderId);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!order) {
    return (
      <View style={styles.errorView}>
        <Text style={styles.errorText}>Détails non disponibles</Text>
      </View>
    );
  }

  const handleBidSubmit = (amount: number) => {
    console.log(`[Socket] Sending bid: ${amount} MAD for ${orderId}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapZone}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: (order.pickupLat + order.dropoffLat) / 2,
            longitude: (order.pickupLng + order.dropoffLng) / 2,
            latitudeDelta: Math.abs(order.pickupLat - order.dropoffLat) * 2,
            longitudeDelta: Math.abs(order.pickupLng - order.dropoffLng) * 2,
          }}
        >
          <Marker coordinate={{ latitude: order.pickupLat, longitude: order.pickupLng }}>
            <View style={[styles.customMarker, { borderColor: '#32FF7E' }]}>
               <View style={[styles.markerDot, { backgroundColor: '#32FF7E' }]} />
            </View>
          </Marker>

          <Marker coordinate={{ latitude: order.dropoffLat, longitude: order.dropoffLng }}>
            <View style={[styles.customMarker, { borderColor: '#FF4D4D' }]}>
               <View style={[styles.markerDot, { backgroundColor: '#FF4D4D' }]} />
            </View>
          </Marker>

          <Polyline
            coordinates={[
              { latitude: order.pickupLat, longitude: order.pickupLng },
              { latitude: order.dropoffLat, longitude: order.dropoffLng },
            ]}
            strokeColor="#32FF7E"
            strokeWidth={4}
          />
        </MapView>

        {/* 1. Passenger Persona Card */}
        <View style={styles.personaCard}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(timeLeft / 30) * 100}%` }]} />
          </View>
          <View style={styles.personaRow}>
            <Image 
              source={{ uri: order.passengerAvatar || 'https://i.pravatar.cc/100' }} 
              style={styles.avatar} 
            />
            <View style={styles.personaInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.passengerName}>{order.passengerName.split(' ')[0]}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {order.passengerRating}</Text>
                </View>
              </View>
              <Text style={styles.verificationText}>
                {order.isVerified ? '🟢 Vérifié' : '⚪ En attente'} • {order.passengerTripsCount || 12} trajets
              </Text>
            </View>
            <View style={styles.timerCircle}>
               <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        {/* 2. Fare Hero Section */}
        <View style={styles.fareHero}>
            <View>
              <Text style={styles.fareAmount}>{order.offeredPrice}</Text>
              <Text style={styles.fareCurrency}>MAD</Text>
            </View>
            <View style={styles.fareLabels}>
              <Text style={styles.fareStatus}>Prix proposé</Text>
              <View style={styles.trustBadge}>
                 <Text style={styles.trustText}>✓ Paiement vérifié</Text>
              </View>
            </View>
        </View>

        {/* 3. ETA + Distance Chips */}
        <View style={styles.chipsRow}>
            <View style={styles.chip}>
                <Text style={styles.chipText}>🚗 {order.pickupEta || '8 min'}</Text>
            </View>
            <View style={styles.chip}>
                <Text style={styles.chipText}>📍 {order.distanceToPickup || '3.4 km'}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: '#1A3324' }]}>
                <Text style={[styles.chipText, { color: '#32FF7E' }]}>Client Fidèle</Text>
            </View>
        </View>

        <View style={styles.addressBox}>
            <View style={styles.addrLine}>
              <View style={[styles.dot, { backgroundColor: '#32FF7E' }]} />
              <Text style={styles.addrText} numberOfLines={1}>{order.pickupAddress}</Text>
            </View>
            <View style={styles.addrLine}>
              <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
              <Text style={styles.addrText} numberOfLines={1}>{order.dropoffAddress}</Text>
            </View>
        </View>

        <BidBottomSheet 
          basePrice={order.offeredPrice}
          onAccept={() => handleBidSubmit(order.offeredPrice)}
          onSubmitBid={handleBidSubmit}
          onClose={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapZone: { flex: 1.1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  personaCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOpacity: 0.5,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#333',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#32FF7E',
  },
  personaRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, backgroundColor: '#333' },
  personaInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  passengerName: { color: '#FFF', fontSize: 18, fontWeight: '700', marginRight: 8 },
  ratingBadge: { backgroundColor: '#2A2A2A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  verificationText: { color: '#AAA', fontSize: 12 },
  timerCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#32FF7E', justifyContent: 'center', alignItems: 'center' },
  timerText: { color: '#32FF7E', fontSize: 12, fontWeight: 'bold' },
  backBtn: { position: 'absolute', bottom: 20, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  backText: { color: '#FFF', fontSize: 22 },
  bottomSection: { backgroundColor: '#0A0A0A', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 20 },
  fareHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  fareAmount: { color: '#FFF', fontSize: 56, fontWeight: '900', lineHeight: 60 },
  fareCurrency: { color: '#32FF7E', fontSize: 16, fontWeight: '700', marginLeft: 2 },
  fareLabels: { alignItems: 'flex-end' },
  fareStatus: { color: '#555', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  trustBadge: { backgroundColor: 'rgba(50, 255, 126, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  trustText: { color: '#32FF7E', fontSize: 11, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { backgroundColor: '#1A1A1A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  chipText: { color: '#EEE', fontSize: 13, fontWeight: '700' },
  addressBox: { backgroundColor: '#141414', borderRadius: 15, padding: 15, marginBottom: 10 },
  addrLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  addrText: { color: '#888', fontSize: 13, flex: 1 },
  errorView: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#444' }
});
