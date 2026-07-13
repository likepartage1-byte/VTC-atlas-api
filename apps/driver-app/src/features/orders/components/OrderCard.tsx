import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../ordersRepository';

interface OrderCardProps {
  order:   MockOrder;
  onPress: (order: MockOrder) => void;
}

export const OrderCard = memo(({ order, onPress }: OrderCardProps) => {
  const { colors } = useTheme();
  const { passengerDetail } = order;

  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: colors.surface,
        borderBottomColor: colors.surfaceAlt,
      }]}
      onPress={() => onPress(order)}
      activeOpacity={0.82}
    >
      {/* ─── Row: Distance (top) ─────────────────────────── */}
      <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
        ~{order.distanceToPickup}
      </Text>

      {/* ─── Row: Avatar + Details + Dots ─────────────────── */}
      <View style={styles.mainRow}>
        {/* Left: avatar column */}
        <View style={styles.avatarCol}>
          <Image source={{ uri: passengerDetail.avatar }} style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]} />
          <Text style={[styles.avatarName, { color: colors.textPrimary }]} numberOfLines={1}>
            {passengerDetail.name.split(' ')[0]}
          </Text>
          <Text style={[styles.avatarRating, { color: colors.textSecondary }]}>
            ⭐ {passengerDetail.rating.toFixed(1)}({passengerDetail.tripsCount})
          </Text>
          <Text style={[styles.avatarEta, { color: colors.textMuted }]}>{order.pickupEta}.</Text>
        </View>

        {/* Center: price + addresses */}
        <View style={styles.centerCol}>
          {/* Price + Prix juste badge */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.textPrimary }]}>
              {order.offeredPrice} MAD
            </Text>
            {order.isFairPrice && (
              <View style={styles.fairBadge}>
                <Text style={[styles.fairBadgeText, { color: colors.accent }]}>⊙ Prix juste</Text>
              </View>
            )}
          </View>

          {/* Pickup address */}
          <Text style={[styles.addressBold, { color: colors.textPrimary }]} numberOfLines={1}>
            {order.pickupAddress}
          </Text>

          {/* Dropoff address */}
          <Text style={[styles.addressGray, { color: colors.textSecondary }]} numberOfLines={1}>
            {order.dropoffAddress}
          </Text>
        </View>

        {/* Right: more options dots */}
        <TouchableOpacity style={styles.dotsBtn} activeOpacity={0.6}>
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 2,
    borderBottomWidth: 1,
  },
  distanceLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCol: {
    alignItems: 'center',
    width: 52,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatarRating: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  avatarEta: {
    fontSize: 9,
    marginTop: 1,
  },
  centerCol: {
    flex: 1,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
  },
  fairBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  fairBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressBold: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  addressGray: {
    fontSize: 12,
    marginTop: 1,
  },
  dotsBtn: {
    paddingTop: 2,
    paddingHorizontal: 4,
  },
});
