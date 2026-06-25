import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RideOrder } from '../../../store/useOrdersStore';

interface Props {
  order: RideOrder;
  onPress: () => void;
}

export const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.passengerSide}>
          <View style={styles.avatarContainer}>
             {order.passengerAvatar ? (
               <Image source={{ uri: order.passengerAvatar }} style={styles.avatar} />
             ) : (
               <View style={styles.avatarPlaceholder} />
             )}
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{order.passengerName}</Text>
              {order.isNewPassenger && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NOUVEAU</Text>
                </View>
              )}
            </View>
            <Text style={styles.rating}>⭐ {order.isNewPassenger ? '4.8' : order.passengerRating}</Text>
          </View>
        </View>
        <View style={styles.timingSide}>
          <Text style={styles.distanceText}>{order.distanceToPickup}</Text>
          <Text style={styles.etaText}>{order.pickupEta}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceValue}>{Math.ceil(order.offeredPrice)} MAD</Text>
        {/* Logic for 'Prix juste' - can be based on a field or a threshold */}
        <View style={styles.justPriceBadge}>
          <Text style={styles.justPriceText}>✓ PRIX JUSTE</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
          <View style={styles.rail}>
            <View style={[styles.dot, { backgroundColor: '#32FF7E' }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
          </View>
          <View style={styles.addresses}>
            <Text style={styles.addressText} numberOfLines={1}>{order.pickupAddress}</Text>
            <View style={styles.spacer} />
            <Text style={styles.addressText} numberOfLines={1}>{order.dropoffAddress}</Text>
          </View>
      </View>

      <View style={styles.footer}>
          <Text style={styles.tripMeta}>{order.tripDistance} • {order.tripDuration}</Text>
          <View style={styles.menuDots}>
            <View style={styles.smallDot} />
            <View style={styles.smallDot} />
            <View style={styles.smallDot} />
          </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passengerSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: 'rgba(50, 255, 126, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#32FF7E',
    fontSize: 9,
    fontWeight: '900',
  },
  rating: {
    color: '#AAA',
    fontSize: 13,
  },
  timingSide: {
    alignItems: 'flex-end',
  },
  distanceText: {
    color: '#32FF7E',
    fontWeight: '800',
    fontSize: 14,
  },
  etaText: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 18,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    marginRight: 10,
  },
  justPriceBadge: {
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  justPriceText: {
    color: '#32FF7E',
    fontSize: 11,
    fontWeight: '700',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rail: {
    width: 12,
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#222',
    marginVertical: 4,
  },
  addresses: {
    flex: 1,
  },
  addressText: {
    color: '#EEE',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  tripMeta: {
    color: '#666',
    fontSize: 13,
  },
  menuDots: {
    flexDirection: 'row',
  },
  smallDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#444',
    marginLeft: 3,
  },
});
