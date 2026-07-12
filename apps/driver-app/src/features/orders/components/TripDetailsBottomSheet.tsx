import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { X, Check, Edit2, Play, Circle } from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';
import { MockOrder } from '../ordersRepository';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.85;

interface TripDetailsBottomSheetProps {
  order:      MockOrder | null;
  onAccept:   (orderId: string, finalPrice: number) => void;
  onClose:    () => void;
}

export const TripDetailsBottomSheet = memo(({ order, onAccept, onClose }: TripDetailsBottomSheetProps) => {
  if (!order) return null;

  const { passengerDetail } = order;
  const rating   = passengerDetail.rating.toFixed(1);
  const trips    = passengerDetail.tripsCount;
  const price    = order.offeredPrice;

  // Counter choices according to the model (+4 MAD, +10 MAD, etc)
  const counterPrices = [price + 4, price + 10];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dark semi-transparent backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Slide-Up Bottom Sheet Panel */}
      <View style={styles.sheetContainer}>
        {/* Drag handle line indicator */}
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Commande de course</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          
          {/* Static SVG Map Representation matching inDrive UI perfectly (No actual MapView dependencies) */}
          <View style={styles.mapAreaMock}>
            {/* Dark aesthetic path illustration representing A/B route points */}
            <View style={styles.mapSvgContainer}>
              {/* Point A */}
              <View style={[styles.mapPinIndicator, { top: '65%', left: '20%' }]}>
                <View style={[styles.pulseCircle, { backgroundColor: '#32FF7E' }]} />
                <View style={styles.mapLabelTag}>
                  <Text style={styles.tagText}>9 min • {order.distanceToPickup}</Text>
                </View>
              </View>

              {/* Point B */}
              <View style={[styles.mapPinIndicator, { top: '25%', left: '70%' }]}>
                <View style={[styles.pulseCircle, { backgroundColor: '#FF4D4D' }]} />
                <View style={[styles.mapLabelTag, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.tagText}>{order.tripDuration} • {order.tripDistance}</Text>
                </View>
              </View>

              {/* Dotted path SVG representation */}
              <View style={styles.mockPathLine} />
            </View>
          </View>

          {/* Passenger details badge info */}
          <View style={styles.passengerSegment}>
            <View style={styles.passengerLeftRow}>
              <Image source={{ uri: passengerDetail.avatar }} style={styles.passengerAvatar} />
              <View>
                <Text style={styles.passengerName}>{passengerDetail.name}</Text>
                <Text style={styles.passengerRating}>
                  ⭐ {rating}({trips})
                </Text>
                <Text style={styles.elapsedTime}>2 min.</Text>
              </View>
            </View>

            <View style={styles.pickupDistLabel}>
              <Text style={styles.distValue}>~{order.distanceToPickup}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Price Information */}
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{price} MAD</Text>
            {order.isFairPrice && (
              <View style={styles.fairPriceBadge}>
                <Text style={styles.fairPriceText}>Prix juste</Text>
              </View>
            )}
          </View>

          {/* Route Addresses */}
          <View style={styles.addressesSection}>
            <View style={styles.addressLine}>
              <View style={[styles.addressItemDot, { backgroundColor: '#32FF7E' }]} />
              <Text style={styles.addressText} numberOfLines={2}>
                {order.pickupAddress}
              </Text>
            </View>

            <View style={styles.verticalTrack} />

            <View style={styles.addressLine}>
              <View style={[styles.addressItemDot, { backgroundColor: '#FF4D4D' }]} />
              <Text style={styles.addressText} numberOfLines={2}>
                {order.dropoffAddress}
              </Text>
            </View>
          </View>

          {/* Primary Action Button: Accept directly */}
          <TouchableOpacity
            style={styles.acceptActionBtn}
            onPress={() => onAccept(order.id, price)}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptActionText}>Accepter pour {price} MAD</Text>
          </TouchableOpacity>

          {/* Proposer Price (Bidding counters) Title */}
          <Text style={styles.biddingTitle}>Proposez votre prix</Text>

          {/* Counter proposal values selector */}
          <View style={styles.bidControlsRow}>
            {counterPrices.map((bidAmount) => (
              <TouchableOpacity
                key={bidAmount}
                style={styles.bidPresetBtn}
                onPress={() => onAccept(order.id, bidAmount)}
                activeOpacity={0.7}
              >
                <Text style={styles.bidPresetText}>{bidAmount} MAD</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.bidCustomBtn} activeOpacity={0.7}>
              <Edit2 size={16} color={AtlasColors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Bottom dismiss option close */}
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.dismissText}>Fermer</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 900,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1000,
    paddingTop: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Map simulation mock screen
  mapAreaMock: {
    width: '100%',
    height: 180,
    backgroundColor: '#050B14',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 16,
  },
  mapSvgContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPinIndicator: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  mapLabelTag: {
    backgroundColor: '#6366F1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  mockPathLine: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    width: '50%',
    height: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: 20,
  },
  // Passenger segment
  passengerSegment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  passengerRating: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
    marginTop: 2,
  },
  elapsedTime: {
    fontSize: 10,
    color: AtlasColors.textMuted,
    marginTop: 1,
  },
  pickupDistLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  distValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: AtlasColors.accent,
  },
  fairPriceBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fairPriceText: {
    fontSize: 10,
    color: '#818CF8',
    fontWeight: '800',
  },
  addressesSection: {
    marginBottom: 24,
    gap: 8,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#FFF',
    flex: 1,
  },
  verticalTrack: {
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: 3,
  },
  acceptActionBtn: {
    backgroundColor: '#22C55E',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  acceptActionText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
  biddingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: AtlasColors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  bidControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  bidPresetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidPresetText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  bidCustomBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 14,
    color: AtlasColors.textSecondary,
    fontWeight: '700',
  },
});
