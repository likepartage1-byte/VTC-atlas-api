import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Navigation, MoreVertical, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';
import { MockOrder } from '../ordersRepository';

interface OrderCardProps {
  order:   MockOrder;
  onPress: (order: MockOrder) => void;
}

export const OrderCard = memo(({ order, onPress }: OrderCardProps) => {
  const { passengerDetail } = order;
  const rating   = passengerDetail.rating.toFixed(1);
  const trips    = passengerDetail.tripsCount;
  const price    = `${order.offeredPrice} MAD`;
  const distance = order.distanceToPickup;
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(order)}
      activeOpacity={0.85}
    >
      {/* Top Passenger Section */}
      <View style={styles.header}>
        <View style={styles.passengerInfo}>
          <Image
            source={{ uri: passengerDetail.avatar }}
            style={styles.avatar}
          />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{passengerDetail.name}</Text>
              {passengerDetail.isVerified && (
                <CheckCircle2 size={13} color={AtlasColors.online} strokeWidth={2.5} style={styles.checkIcon} />
              )}
            </View>
            <Text style={styles.ratingText}>
              ⭐ {rating}  •  {trips} rides
            </Text>
          </View>
        </View>

        {/* Options vertical dots button */}
        <TouchableOpacity style={styles.optionsBtn} activeOpacity={0.6}>
          <MoreVertical size={16} color={AtlasColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Spacing Divider */}
      <View style={styles.divider} />

      {/* Middle Financial & Metrics Section */}
      <View style={styles.metricsContainer}>
        <View>
          <Text style={styles.priceText}>{price}</Text>
          {order.isFairPrice && (
            <View style={styles.fairPriceBadge}>
              <Text style={styles.fairPriceText}>Prix juste</Text>
            </View>
          )}
        </View>

        <View style={styles.etaContainer}>
          <Text style={styles.etaHeading}>Pickup Distance</Text>
          <Text style={styles.etaValue}>{distance} ({order.pickupEta})</Text>
        </View>
      </View>

      {/* Location Addresses Route */}
      <View style={styles.routeContainer}>
        {/* Pickup Item */}
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: AtlasColors.online }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.pickupAddress}
          </Text>
        </View>

        {/* Connector vertical line */}
        <View style={styles.routeConnector} />

        {/* Dropoff Item */}
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: AtlasColors.offline }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.dropoffAddress}
          </Text>
        </View>
      </View>

      {/* Footer Interactive Hint */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>
          Passenger since {passengerDetail.memberSince} • {passengerDetail.paymentMethod}
        </Text>
        <Text style={styles.footerAction}>OFFER BID →</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#334155',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
  },
  checkIcon: {
    marginLeft: 2,
  },
  ratingText: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
    marginTop: 2,
  },
  optionsBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: AtlasColors.accent,
  },
  fairPriceBadge: {
    backgroundColor: AtlasColors.online + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  fairPriceText: {
    fontSize: 9,
    color: AtlasColors.online,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaHeading: {
    fontSize: 9,
    color: AtlasColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
    marginTop: 2,
  },
  routeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeText: {
    fontSize: 11,
    color: AtlasColors.textPrimary,
    fontWeight: '500',
  },
  routeConnector: {
    width: 1,
    height: 10,
    backgroundColor: AtlasColors.neutral,
    marginLeft: 2.5,
    marginVertical: 3,
    opacity: 0.25,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  footerLabel: {
    fontSize: 10,
    color: AtlasColors.textMuted,
  },
  footerAction: {
    fontSize: 11,
    fontWeight: '800',
    color: AtlasColors.primary,
  },
});
