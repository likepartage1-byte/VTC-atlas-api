import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AtlasColors } from '../../../theme/atlas';

interface PassengerMarkerProps {
  name: string;
}

export const PassengerMarker = memo(({ name }: PassengerMarkerProps) => {
  return (
    <View style={styles.wrapper}>
      {/* Pulse rings */}
      <View style={styles.pulseRing} />
      
      <Svg width={40} height={40} viewBox="0 0 40 40">
        {/* Border ring */}
        <Circle cx={20} cy={20} r={18} fill={AtlasColors.surfaceAlt} stroke={AtlasColors.warning} strokeWidth={2} />
        
        {/* Human icon */}
        <Path
          d="M20 10 C22.2 10 24 11.8 24 14 C24 16.2 22.2 18 20 18 C17.8 18 16 16.2 16 14 C16 11.8 17.8 10 20 10 ZH"
          fill={AtlasColors.textPrimary}
        />
        <Path
          d="M20 20 C14.5 20 10 24.5 10 30 L30 30 C30 24.5 25.5 20 20 20 Z"
          fill={AtlasColors.textPrimary}
        />
      </Svg>

      {/* Small floating name card */}
      <View style={styles.labelCard}>
        <Text style={styles.labelText}>{name}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: AtlasColors.warning,
    opacity: 0.4,
    transform: [{ scale: 1.2 }],
  },
  labelCard: {
    backgroundColor: AtlasColors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  labelText: {
    color: AtlasColors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
});
