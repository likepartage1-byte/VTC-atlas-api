import React, { memo, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { AtlasColors } from '../../../theme/atlas';

interface FloatingButtonsProps {
  onLocate: () => void;   // Re-center map on driver
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const FAB = memo(({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    {children}
  </TouchableOpacity>
));

export const FloatingButtons = memo(({ onLocate, onZoomIn, onZoomOut }: FloatingButtonsProps) => {
  return (
    <View style={styles.container}>
      <FAB onPress={onZoomIn}>
        {/* + */}
        <View style={styles.iconLine} />
        <View style={[styles.iconLine, styles.iconLineH]} />
      </FAB>

      <FAB onPress={onZoomOut}>
        {/* – */}
        <View style={styles.iconLine} />
      </FAB>

      <View style={styles.divider} />

      <FAB onPress={onLocate}>
        {/* Target crosshair */}
        <View style={styles.crosshairOuter}>
          <View style={styles.crosshairInner} />
        </View>
      </FAB>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: '40%',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AtlasColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: AtlasColors.textPrimary,
    borderRadius: 1,
  },
  iconLineH: {
    transform: [{ rotate: '90deg' }],
  },
  divider: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  crosshairOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: AtlasColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: AtlasColors.primary,
  },
});
