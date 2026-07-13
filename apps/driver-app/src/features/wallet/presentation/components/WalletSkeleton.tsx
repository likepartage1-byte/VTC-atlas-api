import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../../../theme/ThemeContext';

export const WalletSkeleton = () => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Balance Placeholders */}
      <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.labelPlaceholder, animatedStyle]} />
      <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.balancePlaceholder, animatedStyle]} />
      <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.pendingPlaceholder, animatedStyle]} />
      <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.btnPlaceholder, animatedStyle]} />

      {/* Transactions List Placeholders */}
      <View style={styles.list}>
        <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.sectionTitlePlaceholder, animatedStyle]} />
        
        <View style={styles.row}>
          <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.circlePlaceholder, animatedStyle]} />
          <View style={styles.textGroup}>
            <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.linePlaceholderShort, animatedStyle]} />
            <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.linePlaceholderLong, animatedStyle]} />
          </View>
        </View>

        <View style={styles.row}>
          <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.circlePlaceholder, animatedStyle]} />
          <View style={styles.textGroup}>
            <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.linePlaceholderShort, animatedStyle]} />
            <Animated.View style={[styles.shimmer, { backgroundColor: colors.surfaceAlt }, styles.linePlaceholderLong, animatedStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  shimmer: {
    borderRadius: 8,
  },
  labelPlaceholder: {
    width: 60,
    height: 12,
    marginBottom: 20,
  },
  balancePlaceholder: {
    width: 180,
    height: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  pendingPlaceholder: {
    width: 140,
    height: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  btnPlaceholder: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    marginBottom: 48,
  },
  list: {
    width: '100%',
    gap: 20,
  },
  sectionTitlePlaceholder: {
    width: 100,
    height: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circlePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
  linePlaceholderShort: {
    width: '40%',
    height: 14,
  },
  linePlaceholderLong: {
    width: '70%',
    height: 10,
  },
});
