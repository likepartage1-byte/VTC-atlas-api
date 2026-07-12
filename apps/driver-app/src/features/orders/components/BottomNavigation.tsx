import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Map, LucideIcon, BarChart3, User, List } from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';

interface NavigationTab {
  key:   string;
  label: string;
  icon:  LucideIcon;
}

const TABS: NavigationTab[] = [
  { key: 'orders',      label: 'Orders',      icon: List },
  { key: 'demand',      label: 'Demand',      icon: Map },
  { key: 'performance', label: 'Performance', icon: BarChart3 },
  { key: 'profile',     label: 'Profile',     icon: User },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabPress?: (key: string) => void;
}

export const BottomNavigation = memo(({ activeTab, onTabPress }: BottomNavigationProps) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const IconComponent = tab.icon;
        const isActive      = tab.key === activeTab;
        const tintColor     = isActive ? AtlasColors.primary : AtlasColors.textSecondary;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabPress?.(tab.key)}
            activeOpacity={0.8}
          >
            <IconComponent
              size={20}
              color={tintColor}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.tabLabel, { color: tintColor, fontWeight: isActive ? '800' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: AtlasColors.surface,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingBottom: 28, // extra padding for safe area
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
