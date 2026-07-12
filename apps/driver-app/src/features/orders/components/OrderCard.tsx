import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';
import { MockOrder } from '../ordersRepository';

interface OrderCardProps {
  order:   MockOrder;
  onPress: (order: MockOrder) => void;
}

export const OrderCard = memo(({ order, onPress }: OrderCardProps) => {
  const { passengerDetail } = order;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(order)}
      activeOpacity={0.82}
    >
      {/* ─── Row: Distance (top) ─────────────────────────── */}
      <Text style={styles.distanceLabel}>~{order.distanceToPickup}</Text>

      {/* ─── Row: Avatar + Details + Dots ─────────────────── */}
      <View style={styles.mainRow}>
        {/* Left: avatar column */}
        <View style={styles.avatarCol}>
          <Image source={{ uri: passengerDetail.avatar }} style={styles.avatar} />
          <Text style={styles.avatarName} numberOfLines={1}>
            {passengerDetail.name.split(' ')[0]}
          </Text>
          <Text style={styles.avatarRating}>
            ⭐ {passengerDetail.rating.toFixed(1)}({passengerDetail.tripsCount})
          </Text>
          <Text style={styles.avatarEta}>{order.pickupEta}.</Text>
        </View>

        {/* Center: price + addresses */}
        <View style={styles.centerCol}>
          {/* Price + Prix juste badge */}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{order.offeredPrice} MAD</Text>
            {order.isFairPrice && (
              <View style={styles.fairBadge}>
                <Text style={styles.fairBadgeText}>⊙ Prix juste</Text>
              </View>
            )}
          </View>

          {/* Pickup address */}
          <Text style={styles.addressBold} numberOfLines={1}>
            {order.pickupAddress}
          </Text>

          {/* Dropoff address */}
          <Text style={styles.addressGray} numberOfLines={1}>
            {order.dropoffAddress}
          </Text>
        </View>

        {/* Right: more options dots */}
        <TouchableOpacity style={styles.dotsBtn} activeOpacity={0.6}>
          <MoreVertical size={18} color={AtlasColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131C2E',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  distanceLabel: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
    marginBottom: 6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  // ─── Avatar column ────────────────────────────────────────
  avatarCol: {
    alignItems: 'center',
    width: 52,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 10,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
    textAlign: 'center',
  },
  avatarRating: {
    fontSize: 9,
    color: AtlasColors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  avatarEta: {
    fontSize: 9,
    color: AtlasColors.textMuted,
    marginTop: 1,
  },
  // ─── Center column ────────────────────────────────────────
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
    color: AtlasColors.textPrimary,
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
    color: '#818CF8',
  },
  addressBold: {
    fontSize: 13,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
    marginTop: 2,
  },
  addressGray: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
    marginTop: 1,
  },
  // ─── Dots button ──────────────────────────────────────────
  dotsBtn: {
    paddingTop: 2,
    paddingHorizontal: 4,
  },
});
