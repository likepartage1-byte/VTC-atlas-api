import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RideOrder } from '../../../store/useOrdersStore';

interface Props {
  order: RideOrder;
  onPress: (order: RideOrder) => void;
}

export const OrderCard = memo(({ order, onPress }: Props) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(order)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.passengerInfo}>
          <Image 
            source={{ uri: order.passengerAvatar || 'https://i.pravatar.cc/100' }} 
            style={styles.avatar} 
          />
          <View>
            <View style={styles.nameRow}>
               <Text style={styles.name}>{order.passengerName.split(' ')[0]}</Text>
               {order.isVerified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>
            <Text style={styles.rating}>⭐ {order.passengerRating} • {order.passengerTripsCount} trajets</Text>
          </View>
        </View>
        <View style={styles.timerContainer}>
           <Text style={styles.timerText}>30s</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{order.offeredPrice} MAD</Text>
        <View style={styles.distanceBadge}>
           <Text style={styles.distanceText}>{order.distanceToPickup}</Text>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressLine}>
          <View style={[styles.dot, { backgroundColor: '#32FF7E' }]} />
          <Text style={styles.addressText} numberOfLines={1}>{order.pickupAddress}</Text>
        </View>
        <View style={styles.addressLine}>
          <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
          <Text style={styles.addressText} numberOfLines={1}>{order.dropoffAddress}</Text>
        </View>
      </View>

      <View style={styles.footer}>
         <Text style={styles.footerText}>Client {order.isNewPassenger ? 'Nouveau' : 'Fidèle'}</Text>
         <Text style={styles.acceptAction}>VOIR DÉTAILS →</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  verifiedIcon: {
    color: '#32FF7E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rating: {
    color: '#666',
    fontSize: 11,
  },
  timerContainer: {
    backgroundColor: 'rgba(50, 255, 126, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    height: 24,
  },
  timerText: {
    color: '#32FF7E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
  },
  distanceBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  addressContainer: {
    marginBottom: 15,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  addressText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 12,
  },
  footerText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
  },
  acceptAction: {
    color: '#32FF7E',
    fontSize: 12,
    fontWeight: '800',
  }
});
