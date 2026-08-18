import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAppModeStore } from '../store/useAppModeStore';
import { useTheme } from '../theme/ThemeContext';
import { RefreshCw } from 'lucide-react-native';

export const ModeSwitcherBadge: React.FC<{ style?: any }> = ({ style }) => {
  const { activeMode, isDriverEligible, toggleMode } = useAppModeStore();
  const { colors } = useTheme();

  if (!isDriverEligible) return null;

  const isDriver = activeMode === 'DRIVER';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleMode}
      style={[
        styles.badge,
        {
          backgroundColor: isDriver ? '#10B981' + '20' : '#3B82F6' + '20',
          borderColor: isDriver ? '#10B981' : '#3B82F6',
        },
        style,
      ]}
    >
      <RefreshCw size={12} color={isDriver ? '#10B981' : '#3B82F6'} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: isDriver ? '#10B981' : '#3B82F6' }]}>
        {isDriver ? '🚗 Mode Chauffeur' : '👤 Mode Passager'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
