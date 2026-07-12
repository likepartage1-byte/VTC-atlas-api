import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AtlasColors } from '../../../theme/atlas';

type NetworkStatus = 'connected' | 'disconnected';
type GpsStatus     = 'ON' | 'OFF' | 'SEARCHING';
type PermStatus    = 'GRANTED' | 'DENIED' | 'UNKNOWN';

interface StatusBadgeProps {
  networkStatus:    NetworkStatus;
  gpsStatus:        GpsStatus;
  permissionStatus: PermStatus;
  isAvailable:      boolean;
}

const BADGE_CONFIG = {
  network: {
    connected:    { color: AtlasColors.online,  label: 'NET', dot: '●' },
    disconnected: { color: AtlasColors.offline, label: 'NET', dot: '●' },
  },
  gps: {
    ON:        { color: AtlasColors.online,  label: 'GPS' },
    OFF:       { color: AtlasColors.offline, label: 'GPS' },
    SEARCHING: { color: AtlasColors.warning, label: 'GPS' },
  },
  perm: {
    GRANTED: { color: AtlasColors.online,   label: 'LOC' },
    DENIED:  { color: AtlasColors.offline,  label: 'LOC' },
    UNKNOWN: { color: AtlasColors.neutral,  label: 'LOC' },
  },
};

const Pill = memo(({ color, label }: { color: string; label: string }) => (
  <View style={[styles.pill, { borderColor: color + '60', backgroundColor: color + '20' }]}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={[styles.pillText, { color }]}>{label}</Text>
  </View>
));

export const StatusBar = memo(({
  networkStatus, gpsStatus, permissionStatus, isAvailable
}: StatusBadgeProps) => {
  const net  = BADGE_CONFIG.network[networkStatus];
  const gps  = BADGE_CONFIG.gps[gpsStatus];
  const perm = BADGE_CONFIG.perm[permissionStatus];
  const presColor = isAvailable ? AtlasColors.online : AtlasColors.neutral;
  const presLabel = isAvailable ? 'AVAIL' : 'OFF';

  return (
    <View style={styles.bar}>
      <Pill color={net.color}   label={net.label}  />
      <Pill color={gps.color}   label={gps.label}  />
      <Pill color={perm.color}  label={perm.label} />
      <Pill color={presColor}   label={presLabel}  />
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
