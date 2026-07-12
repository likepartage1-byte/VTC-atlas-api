import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { WalletColors } from '../theme/WalletColors';

export const WalletSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Balance Placeholders */}
      <Animated.View style={[styles.shimmer, styles.labelPlaceholder, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.shimmer, styles.balancePlaceholder, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.shimmer, styles.pendingPlaceholder, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.shimmer, styles.btnPlaceholder, { opacity: pulseAnim }]} />

      {/* Transactions List Placeholders */}
      <View style={styles.list}>
        <Animated.View style={[styles.shimmer, styles.sectionTitlePlaceholder, { opacity: pulseAnim }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.shimmer, styles.circlePlaceholder, { opacity: pulseAnim }]} />
          <View style={styles.textGroup}>
            <Animated.View style={[styles.shimmer, styles.linePlaceholderShort, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.shimmer, styles.linePlaceholderLong, { opacity: pulseAnim }]} />
          </View>
        </View>
        <View style={styles.row}>
          <Animated.View style={[styles.shimmer, styles.circlePlaceholder, { opacity: pulseAnim }]} />
          <View style={styles.textGroup}>
            <Animated.View style={[styles.shimmer, styles.linePlaceholderShort, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.shimmer, styles.linePlaceholderLong, { opacity: pulseAnim }]} />
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
  },
  shimmer: {
    backgroundColor: WalletColors.surfaceLight,
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
    width: '60%',
    height: 48,
    borderRadius: 24,
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
    borderRadius: 18,
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
