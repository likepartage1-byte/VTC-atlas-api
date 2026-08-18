import React, { memo, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { AtlasColors } from '../../../theme/atlas';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.65; // Slightly taller to fit rich customer profile & counters

export interface RideOffer {
  rideId:          string;
  traceId?:        string;
  pickupAddress?:  string;
  destAddress?:    string;
  distanceKm?:     number;
  etaMinutes?:     number;
  priceMAD?:       number;
  customerRating?: number;
  
  // Rich Customer Details
  customerName?:    string;
  customerRides?:   number;
  customerSince?:   string;
  paymentMethod?:   string;
  pickupCoords?:    { latitude: number; longitude: number };
  destCoords?:      { latitude: number; longitude: number };
  serviceType?:     string;
  parcelInfo?: {
    type?: string;
    size?: string;
    weight?: string;
    instructions?: string;
  };
}

interface RideBottomSheetProps {
  offer:     RideOffer;
  onAccept:  (customPrice?: number) => void;
  onReject:  () => void;
}

export const RideBottomSheet = memo(({ offer, onAccept, onReject }: RideBottomSheetProps) => {
  const translateY = useSharedValue(0);
  const ctx        = useSharedValue(0);
  const [selectedOfferPrice, setSelectedOfferPrice] = useState<number>(offer.priceMAD ?? 75);

  const panGesture = Gesture.Pan()
    .onStart(() => { ctx.value = translateY.value; })
    .onUpdate((e) => {
      const next = ctx.value + e.translationY;
      translateY.value = Math.max(0, next); // drag down only
    })
    .onEnd((e) => {
      if (e.translationY > SHEET_HEIGHT * 0.35) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 280 }, () => {
          runOnJS(onReject)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const distance = offer.distanceKm ? `${offer.distanceKm.toFixed(1)} km` : '2.3 km';
  const eta      = offer.etaMinutes ? `${offer.etaMinutes} min` : '9 min';
  const price    = offer.priceMAD   ? `${offer.priceMAD}` : '75';
  const rating   = offer.customerRating ? offer.customerRating.toFixed(1) : '4.9';
  const name     = offer.customerName ?? 'Mohamed';
  const rides    = offer.customerRides ?? 327;
  const since    = offer.customerSince ?? '2023';
  const payment  = offer.paymentMethod ?? 'Cash payment';

  // Incremental offer options
  const basePrice = offer.priceMAD ?? 75;
  const offerOption1 = basePrice + 4;
  const offerOption2 = basePrice + 10;
  const offerOption3 = basePrice + 15;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.etaText}>{eta} away ({distance})</Text>
            <Text style={styles.orderLabel}>
              {offer.serviceType === 'MOTORCYCLE_DELIVERY'
                ? '📦 Motorcycle Delivery Request'
                : offer.serviceType === 'MOTORCYCLE'
                ? '🏍️ Motorcycle Ride Request'
                : 'Ride Proposal'}
            </Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{selectedOfferPrice} MAD</Text>
          </View>
        </View>

        {/* Route (A -> B) */}
        <View style={styles.route}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: AtlasColors.online }]} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {offer.pickupAddress ?? 'Reservation transport (Ménara)'}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: AtlasColors.offline }]} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {offer.destAddress ?? 'Hotel Riu Tikida Palmeraie'}
            </Text>
          </View>
        </View>

        {/* Parcel details for delivery orders */}
        {offer.serviceType === 'MOTORCYCLE_DELIVERY' && offer.parcelInfo && (
          <View style={{ backgroundColor: '#FF6B1A12', padding: 10, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: '#FF6B1A40' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF6B1A', marginBottom: 4 }}>📦 Parcel Information</Text>
            <Text style={{ fontSize: 12, color: '#334155' }}>
              Type: {offer.parcelInfo.type || 'Package'} | Size: {offer.parcelInfo.size || 'Medium'} | Weight: {offer.parcelInfo.weight || '2kg'}
            </Text>
            {offer.parcelInfo.instructions && (
              <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#64748B', marginTop: 2 }}>
                Instructions: {offer.parcelInfo.instructions}
              </Text>
            )}
          </View>
        )}

        {/* Rich Passenger Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileMain}>
              <Text style={styles.passengerName}>{name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>⭐ {rating}</Text>
                <Text style={styles.ridesCount}>•  {rides} rides</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Member Since</Text>
              <Text style={styles.metaValue}>{since}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Method</Text>
              <Text style={styles.metaValue}>{payment}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Pickup Proximity</Text>
              <Text style={styles.metaValue}>{distance}</Text>
            </View>
          </View>
        </View>

        {/* Counter Offers Bar (Propose your price) */}
        <Text style={styles.counterTitle}>PROPOSE COUNTER OFFER</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={[styles.counterBtn, selectedOfferPrice === offerOption1 && styles.activeCounterBtn]}
            onPress={() => setSelectedOfferPrice(offerOption1)}
          >
            <Text style={[styles.counterText, selectedOfferPrice === offerOption1 && styles.activeCounterText]}>
              {offerOption1} MAD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.counterBtn, selectedOfferPrice === offerOption2 && styles.activeCounterBtn]}
            onPress={() => setSelectedOfferPrice(offerOption2)}
          >
            <Text style={[styles.counterText, selectedOfferPrice === offerOption2 && styles.activeCounterText]}>
              {offerOption2} MAD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.counterBtn, selectedOfferPrice === offerOption3 && styles.activeCounterBtn]}
            onPress={() => setSelectedOfferPrice(offerOption3)}
          >
            <Text style={[styles.counterText, selectedOfferPrice === offerOption3 && styles.activeCounterText]}>
              {offerOption3} MAD
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action Buttons */}
        <View style={{ gap: 8, marginTop: 4 }}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(selectedOfferPrice)}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptText}>
              Accept for {selectedOfferPrice} MAD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.8}>
            <Text style={styles.rejectText}>Decline Offer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: AtlasColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 999,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AtlasColors.neutral,
    marginTop: 10,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flex: 1 },
  etaText: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
    fontWeight: '500',
  },
  orderLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: AtlasColors.textPrimary,
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: AtlasColors.primaryGlow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AtlasColors.primary + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: AtlasColors.accent,
  },
  route: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLabel: {
    flex: 1,
    fontSize: 12,
    color: AtlasColors.textPrimary,
    fontWeight: '500',
  },
  routeLine: {
    width: 1.5,
    height: 12,
    backgroundColor: AtlasColors.neutral,
    marginLeft: 3,
    marginVertical: 4,
    opacity: 0.3,
  },
  // Rich Passenger Profile
  profileCard: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AtlasColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AtlasColors.primary + '45',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: AtlasColors.accent,
  },
  profileMain: { flex: 1 },
  passengerName: {
    fontSize: 14,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingStars: {
    fontSize: 12,
    color: AtlasColors.warning,
    fontWeight: '600',
  },
  ridesCount: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
    marginLeft: 6,
  },
  metaDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    color: AtlasColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: AtlasColors.textPrimary,
  },
  // Counters
  counterTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: AtlasColors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  counterBtn: {
    flex: 1,
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  activeCounterBtn: {
    borderColor: AtlasColors.primary,
    backgroundColor: AtlasColors.primary + '15',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: AtlasColors.textSecondary,
  },
  activeCounterText: {
    color: AtlasColors.accent,
  },
  // Buttons
  acceptBtn: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: AtlasColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: AtlasColors.textSecondary,
  },
});
