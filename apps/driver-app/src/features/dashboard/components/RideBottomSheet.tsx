import React, { memo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions
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

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.52;

export interface RideOffer {
  rideId:          string;
  traceId?:        string;
  pickupAddress?:  string;
  destAddress?:    string;
  distanceKm?:     number;
  etaMinutes?:     number;
  priceMAD?:       number;
  customerRating?: number;
}

interface RideBottomSheetProps {
  offer:    RideOffer;
  onAccept: () => void;
  onReject: () => void;
}

export const RideBottomSheet = memo(({ offer, onAccept, onReject }: RideBottomSheetProps) => {
  const translateY = useSharedValue(0);
  const ctx        = useSharedValue(0);

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

  const distance = offer.distanceKm ? `${offer.distanceKm.toFixed(1)} km` : '--';
  const eta      = offer.etaMinutes ? `${offer.etaMinutes} min` : '--';
  const price    = offer.priceMAD   ? `${offer.priceMAD} MAD` : '--';
  const rating   = offer.customerRating ? offer.customerRating.toFixed(1) : '—';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.distanceText}>{distance}</Text>
            <Text style={styles.etaText}>{eta} away</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: AtlasColors.online }]} />
            <Text style={styles.routeLabel} numberOfLines={2}>
              {offer.pickupAddress ?? 'Pickup location'}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: AtlasColors.offline }]} />
            <Text style={styles.routeLabel} numberOfLines={2}>
              {offer.destAddress ?? 'Destination'}
            </Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>★</Text>
          </View>
          <View>
            <Text style={styles.customerName}>Customer</Text>
            <Text style={styles.customerRating}>⭐ {rating}</Text>
          </View>
        </View>

        {/* Accept */}
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
          <Text style={styles.acceptText}>Accept — {price}</Text>
        </TouchableOpacity>

        {/* Reject */}
        <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.8}>
          <Text style={styles.rejectText}>Dismiss</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AtlasColors.neutral,
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  distanceText: {
    fontSize: 13,
    color: AtlasColors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  etaText: {
    fontSize: 12,
    color: AtlasColors.textMuted,
  },
  priceTag: {
    backgroundColor: AtlasColors.primaryGlow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AtlasColors.primary + '40',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: AtlasColors.accent,
  },
  route: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLabel: {
    flex: 1,
    fontSize: 13,
    color: AtlasColors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: AtlasColors.neutral,
    marginLeft: 4,
    marginVertical: 6,
    opacity: 0.5,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AtlasColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AtlasColors.primary + '40',
  },
  avatarText: { fontSize: 18 },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: AtlasColors.textPrimary,
  },
  customerRating: {
    fontSize: 12,
    color: AtlasColors.warning,
    marginTop: 2,
  },
  acceptBtn: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: AtlasColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  rejectBtn: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: AtlasColors.textSecondary,
  },
});
