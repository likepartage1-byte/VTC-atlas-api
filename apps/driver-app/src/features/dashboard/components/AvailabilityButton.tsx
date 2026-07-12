import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { AtlasColors } from '../../../theme/atlas';

interface AvailabilityButtonProps {
  isAvailable: boolean;
  onToggle: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AvailabilityButton = memo(({ isAvailable, onToggle }: AvailabilityButtonProps) => {
  const scale    = useSharedValue(1);
  const progress = useSharedValue(isAvailable ? 1 : 0);

  // Sync progress with isAvailable changes
  React.useEffect(() => {
    progress.value = withTiming(isAvailable ? 1 : 0, { duration: 350 });
  }, [isAvailable]);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.94, { damping: 15 }),
      withSpring(1,    { damping: 12 })
    );
    onToggle();
  }, [onToggle]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [AtlasColors.surfaceAlt, AtlasColors.primary]
    ),
    shadowColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', AtlasColors.primary]
    ),
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.button, containerStyle]}
    >
      <View style={styles.inner}>
        {/* Pulse dot */}
        <View style={[styles.statusDot,
          { backgroundColor: isAvailable ? AtlasColors.online : AtlasColors.neutral }
        ]} />
        <Text style={[styles.label, { color: isAvailable ? '#fff' : AtlasColors.textSecondary }]}>
          {isAvailable ? 'GO OFFLINE' : 'GO AVAILABLE'}
        </Text>
      </View>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
