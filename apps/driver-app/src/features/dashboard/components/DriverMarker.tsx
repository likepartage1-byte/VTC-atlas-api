import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface DriverMarkerProps {
  heading?: number; // degrees 0–360
  isOnline?: boolean;
}

/**
 * Custom SVG car marker used on the map.
 * Rotates according to GPS heading so it always points in the direction of travel.
 */
export const DriverMarker = memo(({ isOnline = false }: DriverMarkerProps) => {
  const carColor   = isOnline ? '#6366F1' : '#475569';
  const glowColor  = isOnline ? 'rgba(99,102,241,0.30)' : 'rgba(71,85,105,0.20)';
  const ringColor  = isOnline ? '#818CF8' : '#64748B';

  return (
    <View style={styles.wrapper}>
      {/* Glow halo */}
      <View style={[styles.glow, { backgroundColor: glowColor }]} />
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Defs>
          <RadialGradient id="markerGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={carColor} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        {/* Outer ring */}
        <Circle cx={24} cy={24} r={22} fill="none" stroke={ringColor} strokeWidth={1.5} opacity={0.6} />
        {/* Background circle */}
        <Circle cx={24} cy={24} r={18} fill={carColor} />
        {/* Car icon (top-down view, pointing up = north) */}
        <Path
          d="M24 9 L30 16 L28 16 L28 22 L20 22 L20 16 L18 16 Z"
          fill="white"
          opacity={0.95}
        />
        <Path
          d="M20 21 L18 28 L19 29 L20 29 L20 27 L28 27 L28 29 L29 29 L30 28 L28 21 Z"
          fill="white"
          opacity={0.95}
        />
        <Circle cx={21} cy={28.5} r={1.5} fill={carColor} />
        <Circle cx={27} cy={28.5} r={1.5} fill={carColor} />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  glow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
