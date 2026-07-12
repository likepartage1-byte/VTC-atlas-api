import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AtlasColors } from '../../../theme/atlas';

interface LocationInfoProps {
  latitude:    number;
  longitude:   number;
  speed?:      number | null;  // m/s from GPS
  lastUpdate?: Date | null;
  gpsStatus:   'ON' | 'OFF' | 'SEARCHING';
}

export const LocationInfo = memo(({
  latitude, longitude, speed, lastUpdate, gpsStatus
}: LocationInfoProps) => {
  const speedKmh = speed != null ? (speed * 3.6).toFixed(0) : '--';
  const timeStr  = lastUpdate
    ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  const isActive = gpsStatus === 'ON';

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={[styles.iconDot, { backgroundColor: isActive ? AtlasColors.online : AtlasColors.neutral }]} />
        <View>
          <Text style={styles.value}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
          <Text style={styles.label}>Coordinates</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.item}>
        <View style={[styles.iconDot, { backgroundColor: AtlasColors.primary }]} />
        <View>
          <Text style={styles.value}>{speedKmh} km/h</Text>
          <Text style={styles.label}>Speed</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.item}>
        <View style={[styles.iconDot, { backgroundColor: AtlasColors.warning }]} />
        <View>
          <Text style={styles.value}>{timeStr}</Text>
          <Text style={styles.label}>Last fix</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AtlasColors.overlay,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 1,
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    color: AtlasColors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 9,
    color: AtlasColors.textMuted,
    marginTop: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
