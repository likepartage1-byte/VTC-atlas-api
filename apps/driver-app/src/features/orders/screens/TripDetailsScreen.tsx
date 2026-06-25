import React from 'react';
import { View, StyleSheet, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useOrdersStore } from '../../../store/useOrdersStore';
import { BidBottomSheet } from '../components/BidBottomSheet';
import { useRoute, useNavigation } from '@react-navigation/native';

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
    console.log(`[Socket] Sending bid: ${amount} MAD for ${orderId}`);
    // socket.emit('submit_bid', { rideId: orderId, amount });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapZone}>
        {/* Mocking Advanced Dark Map with Neon Line */}
        <View style={styles.mockMap}>
          <View style={styles.neonPath} />
          <View style={[styles.marker, { top: '30%', left: '40%', borderColor: '#32FF7E' }]}>
            <View style={[styles.innerMarker, { backgroundColor: '#32FF7E' }]} />
          </View>
          <View style={[styles.marker, { bottom: '25%', right: '20%', borderColor: '#FF4D4D' }]}>
            <View style={[styles.innerMarker, { backgroundColor: '#FF4D4D' }]} />
          </View>
          <View style={styles.floatingStats}>
            <Text style={styles.statsText}>{order.tripDistance} | {order.tripDuration}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
          <Text style={styles.priceHighlight}>{order.offeredPrice} MAD</Text>
          <View style={styles.addressRow}>
             <Text style={styles.addressLabel}>De:</Text>
             <Text style={styles.addressVal} numberOfLines={1}>{order.pickupAddress}</Text>
          </View>
          <View style={[styles.addressRow, { marginTop: 4 }]}>
             <Text style={styles.addressLabel}>À:</Text>
             <Text style={styles.addressVal} numberOfLines={1}>{order.dropoffAddress}</Text>
          </View>
      </View>

      <BidBottomSheet 
        basePrice={order.offeredPrice}
        onAccept={() => handleBidSubmit(order.offeredPrice)}
        onSubmitBid={handleBidSubmit}
        onClose={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapZone: {
    flex: 1.2,
    position: 'relative',
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonPath: {
    width: 200,
    height: 4,
    backgroundColor: '#32FF7E',
    transform: [{ rotate: '-35deg' }],
    shadowColor: '#32FF7E',
    shadowRadius: 15,
    shadowOpacity: 1,
    borderRadius: 2,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingStats: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  backText: {
    color: '#FFF',
    fontSize: 20,
  },
  summaryCard: {
    backgroundColor: '#111',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  priceHighlight: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
  },
  addressLabel: {
    color: '#555',
    fontSize: 13,
    width: 30,
  },
  addressVal: {
    color: '#AAA',
    fontSize: 13,
    flex: 1,
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
