import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { RideOrder } from '../../store/orders.store';

interface Props {
  order: RideOrder;
  onPress: () => void;
}

export const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.passengerInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.name}>{order.passengerName}</Text>
            <Text style={styles.rating}>⭐ {order.passengerRating}</Text>
          </View>
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.distance}>{order.distanceToPickup}</Text>
          <Text style={styles.eta}>{order.pickupEta}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Offre du client</Text>
        <Text style={styles.priceValue}>{Math.ceil(order.offeredPrice)} MAD</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: '#32FF7E' }]} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.address} numberOfLines={1}>{order.pickupAddress}</Text>
          <Text style={styles.address} numberOfLines={1}>{order.dropoffAddress}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tripMeta}>{order.tripDistance} • {order.tripDuration}</Text>
        <View style={styles.actionBadge}>
          <Text style={styles.badgeText}>PRIX JUSTE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 10,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rating: {
    color: '#AAA',
    fontSize: 12,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  distance: {
    color: '#32FF7E',
    fontWeight: 'bold',
  },
  eta: {
    color: '#AAA',
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  priceLabel: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    color: '#32FF7E',
    fontSize: 32,
    fontWeight: '900',
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  dotContainer: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  addressContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  address: {
    color: '#DDD',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tripMeta: {
    color: '#888',
    fontSize: 12,
  },
  actionBadge: {
    backgroundColor: 'rgba(50, 255, 126, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#32FF7E',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
