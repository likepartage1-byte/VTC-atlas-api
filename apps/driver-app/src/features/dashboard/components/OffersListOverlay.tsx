import React, { memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity
} from 'react-native';
import { AtlasColors } from '../../../theme/atlas';
import { RideOffer } from './RideBottomSheet';

interface OffersListOverlayProps {
  offers:      RideOffer[];
  selectedId:  string | null;
  onSelect:    (offer: RideOffer) => void;
  isOnline:    boolean;
}

export const OffersListOverlay = memo(({
  offers, selectedId, onSelect, isOnline
}: OffersListOverlayProps) => {
  if (!isOnline) {
    return (
      <View style={styles.offlineBox}>
        <Text style={styles.offlineText}>You are currently offline</Text>
        <Text style={styles.offlineSubText}>Go available to start receiving nearby rides</Text>
      </View>
    );
  }

  if (offers.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <View style={styles.pulsingRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.emptyText}>Searching for orders nearby...</Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }: { item: RideOffer }) => {
    const isSelected = item.rideId === selectedId;
    const distance   = item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : '2.3 km';
    const price      = item.priceMAD ? `${item.priceMAD} MAD` : '75 MAD';

    const st = (item.serviceType ?? '').toUpperCase();
    const isDelivery = st === 'MOTORCYCLE_DELIVERY';
    const isMoto = ['MOTORCYCLE', 'MOTO'].includes(st);
    const serviceLabel = isDelivery ? '📦 توصيل' : isMoto ? '🏍️ دراجة' : null;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.selectedCard
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardPrice}>{price}</Text>
          {serviceLabel ? (
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF6B1A', backgroundColor: '#FF6B1A18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              {serviceLabel}
            </Text>
          ) : (
            <Text style={styles.cardDist}>📍 {distance} away</Text>
          )}
        </View>
        <View style={styles.cardRoute}>
          <Text style={styles.routeText} numberOfLines={1}>
            <Text style={styles.markerA}>A </Text>
            {item.pickupAddress ?? 'Pickup point'}
          </Text>
          <Text style={styles.routeText} numberOfLines={1}>
            <Text style={styles.markerB}>B </Text>
            {item.destAddress ?? 'Destination'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Offers</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{offers.length}</Text>
        </View>
      </View>

      <FlatList
        data={offers}
        renderItem={renderItem}
        keyExtractor={(item) => item.rideId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={260}
        decelerationRate="fast"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: AtlasColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: AtlasColors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  listContent: {
    paddingVertical: 4,
    gap: 12,
  },
  card: {
    width: 250,
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedCard: {
    borderColor: AtlasColors.primary,
    backgroundColor: AtlasColors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: AtlasColors.accent,
  },
  cardDist: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
  },
  cardRoute: {
    gap: 4,
  },
  routeText: {
    fontSize: 11,
    color: AtlasColors.textPrimary,
    fontWeight: '500',
  },
  markerA: {
    color: AtlasColors.online,
    fontWeight: '800',
  },
  markerB: {
    color: AtlasColors.offline,
    fontWeight: '800',
  },
  // States
  offlineBox: {
    backgroundColor: AtlasColors.surfaceAlt + '60',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: AtlasColors.textSecondary,
    marginBottom: 2,
  },
  offlineSubText: {
    fontSize: 11,
    color: AtlasColors.textMuted,
  },
  emptyBox: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pulsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AtlasColors.online,
  },
  emptyText: {
    fontSize: 12,
    color: AtlasColors.textSecondary,
    fontWeight: '600',
  },
});
