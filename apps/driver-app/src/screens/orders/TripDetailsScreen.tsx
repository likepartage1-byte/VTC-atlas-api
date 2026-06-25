import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { useOrdersStore } from '../../store/orders.store';
import { BidBottomSheet } from './BidBottomSheet';
import { useRoute, useNavigation } from '@react-navigation/native';

export const TripDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };
  const { orders } = useOrdersStore();
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
      </View>
    );
  }

  const handleSubmitBid = (amount: number) => {
    console.log(`Submitting bid: ${amount} for ride ${orderId}`);
    // Socket.emit('submit_bid', { rideId: orderId, amount });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mockMap}>
          {/* Neon Route Representation */}
          <View style={styles.neonPath} />
          <View style={[styles.marker, { top: '30%', left: '40%', backgroundColor: '#32FF7E' }]}>
            <Text style={styles.markerText}>A</Text>
          </View>
          <View style={[styles.marker, { bottom: '30%', right: '30%', backgroundColor: '#FF4D4D' }]}>
            <Text style={styles.markerText}>B</Text>
          </View>
        </View>
      </View>

      <BidBottomSheet 
        basePrice={order.offeredPrice}
        onAcceptBase={() => handleSubmitBid(order.offeredPrice)}
        onSubmitBid={handleSubmitBid}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonPath: {
    width: 2,
    height: '40%',
    backgroundColor: '#32FF7E',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#32FF7E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  marker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#666',
  }
});
