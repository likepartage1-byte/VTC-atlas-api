import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MoreVertical, Package, MapPin, Navigation, DollarSign, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../ordersRepository';

interface OrderCardProps {
  order: MockOrder;
  onPress: (order: MockOrder) => void;
  driverStatus?: 'OFFLINE' | 'AVAILABLE';
}

// Helper: detect service type
const isMotoService = (serviceType?: string) => {
  const st = (serviceType ?? '').toUpperCase();
  return ['MOTORCYCLE', 'MOTO'].includes(st);
};
const isDeliveryService = (serviceType?: string) => {
  const st = (serviceType ?? '').toUpperCase();
  return st === 'MOTORCYCLE_DELIVERY';
};

export const OrderCard = memo(({ order, onPress, driverStatus }: OrderCardProps) => {
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const { passengerDetail } = order;
  const isMoto = isMotoService(order.serviceType);
  const isDelivery = isDeliveryService(order.serviceType);
  const isMotoAny = isMoto || isDelivery;

  // Service badge label
  const serviceLabel = isDelivery
    ? (isRTL ? '📦 توصيل طرد' : '📦 Livraison')
    : isMoto
    ? (isRTL ? '🏍️ رحلة دراجة' : '🏍️ Moto Ride')
    : null;

  // Payment badge label
  const paymentLabel = isRTL ? 'نقداً' : rawLang.startsWith('es') ? 'Efectivo' : rawLang.startsWith('en') ? 'Cash' : 'Espèces';

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textMain = isDarkMode ? '#F9FAFB' : '#111827';
  const textSub = isDarkMode ? '#A1A1AA' : '#6B7280';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          shadowColor: isDarkMode ? '#000000' : 'rgba(104, 62, 230, 0.08)',
        },
      ]}
      onPress={() => onPress(order)}
      activeOpacity={0.88}
    >
      {/* ── Top Header Bar: Proximity Distance & Service Tag ── */}
      <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.distancePill, { backgroundColor: primaryLightBg }]}>
          <Navigation size={12} color={primaryBrand} style={{ transform: [{ rotate: '45deg' }] }} />
          <Text style={[styles.distanceText, { color: primaryBrand }]}>
            {order.distanceToPickup?.startsWith('~') ? order.distanceToPickup : `~${order.distanceToPickup}`}
          </Text>
        </View>

        {serviceLabel ? (
          <View style={[styles.serviceBadge, { backgroundColor: isMotoAny ? '#FF6B1A15' : primaryLightBg }]}>
            <Text style={[styles.serviceBadgeText, { color: isMotoAny ? '#FF6B1A' : primaryBrand }]}>
              {serviceLabel}
            </Text>
          </View>
        ) : (
          <View style={[styles.cashBadge, { backgroundColor: isDarkMode ? '#1A2E26' : '#ECFDF5' }]}>
            <DollarSign size={11} color="#16A34A" />
            <Text style={styles.cashBadgeText}>{paymentLabel}</Text>
          </View>
        )}
      </View>

      {/* ── Main Body: Passenger Info + Price + Addresses ── */}
      <View style={[styles.mainBody, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Passenger Profile Col */}
        <View style={styles.avatarCol}>
          <Image
            source={{ uri: passengerDetail?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }}
            style={[styles.avatar, { borderColor: cardBorder }]}
          />
          <Text style={[styles.passengerName, { color: textMain }]} numberOfLines={1}>
            {passengerDetail?.name?.split(' ')[0] || (isRTL ? 'راكب' : 'Passager')}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.ratingText, { color: textSub }]}>
              {(passengerDetail?.rating || 4.9).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Route & Price Info Col */}
        <View style={[styles.infoCol, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {/* Price Header */}
          <View style={[styles.priceHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.priceText, { color: textMain }]}>
              {order.offeredPrice} <Text style={styles.currencyText}>MAD</Text>
            </Text>
            {order.isFairPrice && (
              <View style={[styles.fairBadge, { backgroundColor: primaryLightBg }]}>
                <Text style={[styles.fairBadgeText, { color: primaryBrand }]}>
                  {isRTL ? 'سعر عادل' : '⊙ Prix juste'}
                </Text>
              </View>
            )}
          </View>

          {/* Pickup Address */}
          <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.dotMarker, { backgroundColor: '#16A34A' }]} />
            <Text
              style={[
                styles.addressTextBold,
                { color: textMain, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {order.pickupAddress}
            </Text>
          </View>

          {/* Route Connecting Line */}
          <View style={[styles.routeLine, { left: isRTL ? undefined : 4, right: isRTL ? 4 : undefined, backgroundColor: cardBorder }]} />

          {/* Dropoff Address */}
          <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.dotMarker, { backgroundColor: primaryBrand }]} />
            <Text
              style={[
                styles.addressTextGray,
                { color: textSub, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {order.dropoffAddress}
            </Text>
          </View>

          {/* Parcel details if delivery */}
          {isDelivery && order.parcelInfo && (
            <View style={[styles.parcelRow, { borderColor: cardBorder }]}>
              <Package size={12} color={textSub} />
              <Text style={[styles.parcelText, { color: textSub }]}>
                {[
                  order.parcelInfo.type,
                  order.parcelInfo.size,
                  order.parcelInfo.weight,
                ].filter(Boolean).join(' · ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cashBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  mainBody: {
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCol: {
    alignItems: 'center',
    width: 54,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 54,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  infoCol: {
    flex: 1,
    gap: 4,
    position: 'relative',
  },
  priceHeader: {
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fairBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fairBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addressRow: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 1,
  },
  dotMarker: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  addressTextBold: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  addressTextGray: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  routeLine: {
    position: 'absolute',
    top: 40,
    width: 1,
    height: 12,
  },
  parcelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  parcelText: {
    fontSize: 11,
  },
});
