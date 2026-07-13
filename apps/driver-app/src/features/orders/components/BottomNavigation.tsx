import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { List, Zap, BarChart2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabPress?: (key: string) => void;
}

export const BottomNavigation = memo(({ activeTab, onTabPress }: BottomNavigationProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tabs = [
    { key: 'orders',      label: t('orders'),      icon: List },
    { key: 'demand',      label: t('demand'),       icon: Zap },
    { key: 'performance', label: t('performance'),  icon: BarChart2 },
  ];

  return (
    <View style={[styles.container, {
      backgroundColor: colors.surface,
      borderTopColor: colors.surfaceAlt,
    }]}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive      = tab.key === activeTab;
        const tintColor     = isActive ? colors.primary : colors.textSecondary;

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
            <Text
              style={[styles.tabLabel, { color: tintColor, fontWeight: isActive ? '800' : '500' }]}
              numberOfLines={1}
            >
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
    flexDirection:   'row',
    borderTopWidth:  1,
    paddingVertical: 10,
    paddingBottom:   28,
    justifyContent:  'space-around',
    alignItems:      'center',
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
  },
  tabButton: {
    alignItems:     'center',
    justifyContent: 'center',
    gap:             4,
    flex:            1,
  },
  tabLabel: {
    fontSize:     10,
    letterSpacing: 0.1,
  },
});
