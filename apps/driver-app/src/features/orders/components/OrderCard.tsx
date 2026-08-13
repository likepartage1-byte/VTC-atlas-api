import React, { memo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated,
} from 'react-native';
import {
  MoreVertical,
  Package,
  MapPin,
  Navigation,
  DollarSign,
  Star,
  EyeOff,
  AlertTriangle,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../repositories/mockOrdersRepository';

interface OrderCardProps {
  order: MockOrder;
  onPress: (order: MockOrder) => void;
  onPressAvatar?: (order: MockOrder) => void;
  onSelectOnMap?: (order: MockOrder) => void;
  onHideOrder?: (orderId: string) => void;
  onReportOrder?: (order: MockOrder) => void;
  driverStatus?: 'OFFLINE' | 'AVAILABLE';
}

const isMotoService = (serviceType?: string) => {
  const st = (serviceType ?? '').toUpperCase();
  return ['MOTORCYCLE', 'MOTO'].includes(st);
};
const isDeliveryService = (serviceType?: string) => {
  const st = (serviceType ?? '').toUpperCase();
  return st === 'MOTORCYCLE_DELIVERY';
};

export const OrderCard = memo(({
  order,
  onPress,
  onPressAvatar,
  onSelectOnMap,
  onHideOrder,
  onReportOrder,
  driverStatus,
}: OrderCardProps) => {
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [showActionsMenu, setShowActionsMenu] = useState<boolean>(false);

  // Swipe animation value
  const translateX = useRef(new Animated.Value(0)).current;

  // Swipe PanResponder: Right -> Hide, Left -> Reveal Actions Menu
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow horizontal dragging
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 90) {
          // Swipe Right -> Hide order directly (Masquer)
          Animated.timing(translateX, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            if (onHideOrder) onHideOrder(order.id);
          });
        } else if (gestureState.dx < -60) {
          // Swipe Left -> Reveal actions bar menu
          setShowActionsMenu(true);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset card position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const { passengerDetail } = order;
  const isMoto = isMotoService(order.serviceType);
  const isDelivery = isDeliveryService(order.serviceType);
  const isMotoAny = isMoto || isDelivery;

  const serviceLabel = isDelivery
    ? (isRTL ? '📦 توصيل طرد' : rawLang.startsWith('es') ? '📦 Entrega' : rawLang.startsWith('en') ? '📦 Package Delivery' : '📦 Livraison')
    : isMoto
    ? (isRTL ? '🏍️ رحلة دراجة' : rawLang.startsWith('es') ? '🏍️ Moto' : rawLang.startsWith('en') ? '🏍️ Moto Ride' : '🏍️ Course Moto')
    : null;

  const paymentLabel = isRTL ? 'نقداً' : rawLang.startsWith('es') ? 'Efectivo' : rawLang.startsWith('en') ? 'Cash' : 'Espèces';
  const passengerFallback = isRTL ? 'راكب' : rawLang.startsWith('es') ? 'Pasajero' : rawLang.startsWith('en') ? 'Passenger' : 'Passager';
  const fairPriceLabel = isRTL ? 'سعر عادل' : rawLang.startsWith('es') ? '⊙ Precio justo' : rawLang.startsWith('en') ? '⊙ Fair price' : '⊙ Prix juste';
  const selectOnMapLabel = isRTL ? 'اختيار على الخريطة' : rawLang.startsWith('es') ? 'Ver en mapa' : rawLang.startsWith('en') ? 'Select on Map' : 'Choisir sur la carte';
  const hideLabel = isRTL ? 'إخفاء' : rawLang.startsWith('es') ? 'Ocultar' : rawLang.startsWith('en') ? 'Hide' : 'Masquer';
  const reportLabel = isRTL ? 'إبلاغ' : rawLang.startsWith('es') ? 'Denunciar' : rawLang.startsWith('en') ? 'Report' : 'Plainte';

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const cardBorder = isDarkMode ? '#2D3038' : '#E5E7EB';
  const surfaceAltBg = isDarkMode ? '#20232B' : '#F8F7FC';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textMain = isDarkMode ? '#F9FAFB' : '#111827';
  const textSub = isDarkMode ? '#A1A1AA' : '#6B7280';

  const toggleMenu = (e: any) => {
    e?.stopPropagation?.();
    setShowActionsMenu(!showActionsMenu);
  };

  const handleSelectOnMap = (e: any) => {
    e?.stopPropagation?.();
    setShowActionsMenu(false);
    if (onSelectOnMap) {
      onSelectOnMap(order);
    } else {
      onPress(order);
    }
  };

  const handleHide = (e: any) => {
    e?.stopPropagation?.();
    setShowActionsMenu(false);
    if (onHideOrder) {
      onHideOrder(order.id);
    }
  };

  const handleReport = (e: any) => {
    e?.stopPropagation?.();
    setShowActionsMenu(false);
    if (onReportOrder) {
      onReportOrder(order);
    }
  };

  return (
    <Animated.View style={[styles.outerContainer, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
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
        {/* ── Top Header Bar: Proximity Distance & 3 Vertical Dots (⋮) ──────── */}
        <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
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

          {/* 3 Vertical Dots Button (⋮) matching Screenshot #1 */}
          <TouchableOpacity
            style={[styles.threeDotsBtn, { backgroundColor: surfaceAltBg }]}
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <MoreVertical size={18} color={textSub} />
          </TouchableOpacity>
        </View>

        {/* ── Main Body: Passenger Info + Price + Addresses ─────────────────── */}
        <View style={[styles.mainBody, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {/* Passenger Profile Col (Tapping avatar opens Passenger Profile Preview) */}
          <TouchableOpacity
            style={styles.avatarCol}
            onPress={(e) => {
              e.stopPropagation();
              if (onPressAvatar) {
                onPressAvatar(order);
              } else {
                onPress(order);
              }
            }}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: passengerDetail?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }}
              style={[styles.avatar, { borderColor: cardBorder }]}
            />
            <Text style={[styles.passengerName, { color: textMain }]} numberOfLines={1}>
              {passengerDetail?.name?.split(' ')[0] || passengerFallback}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={10} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingText, { color: textSub }]}>
                {(passengerDetail?.rating || 4.9).toFixed(1)}
              </Text>
            </View>
          </TouchableOpacity>

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
                    {fairPriceLabel}
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
          </View>
        </View>

        {/* ── Screenshot #1 Actions Menu Bar (Revealed on ⋮ tap or Swipe Left) ── */}
        {showActionsMenu && (
          <View style={[styles.actionsBarContainer, { backgroundColor: surfaceAltBg, borderColor: cardBorder }]}>
            {/* 1. Choisir sur la carte (📍) */}
            <TouchableOpacity style={styles.actionBtnItem} onPress={handleSelectOnMap}>
              <MapPin size={18} color={primaryBrand} />
              <Text style={[styles.actionBtnText, { color: textMain }]}>
                {selectOnMapLabel}
              </Text>
            </TouchableOpacity>

            {/* 2. Masquer (🙈) */}
            <TouchableOpacity style={styles.actionBtnItem} onPress={handleHide}>
              <EyeOff size={18} color={textSub} />
              <Text style={[styles.actionBtnText, { color: textSub }]}>
                {hideLabel}
              </Text>
            </TouchableOpacity>

            {/* 3. Plainte (⚠️) */}
            <TouchableOpacity style={styles.actionBtnItem} onPress={handleReport}>
              <AlertTriangle size={18} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>
                {reportLabel}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
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
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    borderRadius: 8,
  },
  cashBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  threeDotsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBody: {
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCol: {
    alignItems: 'center',
    width: 60,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoCol: {
    flex: 1,
  },
  priceHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
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
    fontSize: 11,
    fontWeight: '700',
  },
  addressRow: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  dotMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    width: 1,
    height: 10,
    marginLeft: 3.5,
    marginVertical: 1,
  },
  actionsBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderRadius: 10,
  },
  actionBtnItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
