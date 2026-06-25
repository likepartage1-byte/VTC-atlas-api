import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useOrdersStore } from '../../../store/useOrdersStore';
import { BidBottomSheet } from '../components/BidBottomSheet';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Atlas Premium Dark Map Style
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#888888" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#333333" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#555555" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#777777" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export const TripDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { orders } = useOrdersStore();
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.errorView}>
        <Text style={styles.errorText}>Détails non disponibles</Text>
      </View>
    );
  }

  const handleBidSubmit = (amount: number) => {
    // Logic for real socket emit will go here
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
          {/* Pickup Marker (Neon Green) */}
          <Marker
            coordinate={{ latitude: order.pickupLat, longitude: order.pickupLng }}
            title="Point de départ"
          >
            <View style={[styles.customMarker, { borderColor: '#32FF7E' }]}>
               <View style={[styles.markerDot, { backgroundColor: '#32FF7E' }]} />
            </View>
          </Marker>

          {/* Destination Marker (Neon Red) */}
          <Marker
            coordinate={{ latitude: order.dropoffLat, longitude: order.dropoffLng }}
            title="Destination"
          >
            <View style={[styles.customMarker, { borderColor: '#FF4D4D' }]}>
               <View style={[styles.markerDot, { backgroundColor: '#FF4D4D' }]} />
            </View>
          </Marker>

          {/* Atlas Neon Path */}
          <Polyline
            coordinates={[
              { latitude: order.pickupLat, longitude: order.pickupLng },
              { latitude: order.dropoffLat, longitude: order.dropoffLng },
            ]}
            strokeColor="#32FF7E"
            strokeWidth={4}
            lineCap="round"
          />
        </MapView>

        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
           <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.floatingHeader}>
          <Text style={styles.headerTitle}>Nouvelle offre</Text>
          <View style={styles.badgeRow}>
            <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{order.tripDistance}</Text>
            </View>
            <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{order.tripDuration}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.addressSection}>
            <View style={styles.addressLine}>
                <View style={[styles.dot, { backgroundColor: '#32FF7E' }]} />
                <Text style={styles.addressText} numberOfLines={1}>{order.pickupAddress}</Text>
            </View>
            <View style={styles.connector} />
            <View style={styles.addressLine}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
                <Text style={styles.addressText} numberOfLines={1}>{order.dropoffAddress}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapZone: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  metaBadge: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  metaText: {
    color: '#32FF7E',
    fontSize: 12,
    fontWeight: '800',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 25,
    width: 44,
    height: 44,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
  },
  bottomSection: {
    backgroundColor: '#111',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
  },
  addressSection: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  addressText: {
    color: '#EEE',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: '#222',
    marginLeft: 4,
    marginVertical: 4,
  },
  errorView: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#444',
  }
});
