import React, { memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Wallet,
  MapPin,
  Bell,
  Lock,
  Settings,
  HelpCircle,
  MessageSquare,
  User,
  Car,
} from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_W * 0.82;

interface SideDrawerProps {
  isOpen:  boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { key: 'wallet',        label: 'Portefeuille',    icon: Wallet },
  { key: 'city',          label: 'Ville',           icon: MapPin },
  { key: 'notifications', label: 'Notifications',   icon: Bell },
  { key: 'security',      label: 'Sécurité',        icon: Lock },
  { key: 'settings',      label: 'Paramètres',      icon: Settings },
  { key: 'help',          label: 'Aide',            icon: HelpCircle },
  { key: 'support',       label: 'Support',         icon: MessageSquare },
];

export const SideDrawer = memo(({ isOpen, onClose }: SideDrawerProps) => {
  const navigation = useNavigation<any>();
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 20, stiffness: 100 })
      : withTiming(-DRAWER_WIDTH, { duration: 240 });
  }, [isOpen]);

  const drawerStyle  = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: 220 }),
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropOpacity]} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

          {/* ── Placeholder profile header ─────────────────── */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              <User size={28} color={AtlasColors.textMuted} />
            </View>
            <Text style={styles.driverName}>Hamza El Aourf</Text>
            <Text style={styles.driverRating}>⭐ 4.85</Text>
            <View style={styles.vehicleBadge}>
              <Car size={12} color={AtlasColors.primary} />
              <Text style={styles.vehicleText}>Dacia Logan • 12-A-34567</Text>
            </View>
          </View>

          {/* ── Menu list ──────────────────────────────────── */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    if (item.key === 'wallet') {
                      navigation.navigate('Wallet');
                    }
                  }}
                >
                  <View style={styles.menuLeft}>
                    <Icon size={18} color={AtlasColors.textSecondary} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.menuChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Footer placeholder ─────────────────────────── */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.passengerModeBtn} onPress={onClose}>
              <Text style={styles.passengerModeText}>Mode Passager</Text>
            </TouchableOpacity>
            <Text style={styles.version}>Atlas Driver • v1.0</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 999,
  },
  drawer: {
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    width:           DRAWER_WIDTH,
    backgroundColor: '#111827',
    borderTopRightRadius:    18,
    borderBottomRightRadius: 18,
    zIndex:          1000,
    shadowColor:     '#000',
    shadowOffset:    { width: 6, height: 0 },
    shadowOpacity:   0.35,
    shadowRadius:    20,
    elevation:       20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems:       'center',
    paddingHorizontal: 20,
    marginBottom:      28,
  },
  avatarPlaceholder: {
    width:           68,
    height:          68,
    borderRadius:    34,
    backgroundColor: '#1C2438',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     AtlasColors.primary,
    marginBottom:    10,
  },
  driverName: {
    fontSize:   15,
    fontWeight: '800',
    color:      AtlasColors.textPrimary,
  },
  driverRating: {
    fontSize:  11,
    color:     '#F59E0B',
    marginTop:  3,
    fontWeight: '700',
  },
  vehicleBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:              5,
    backgroundColor: '#1C2438',
    borderRadius:     8,
    paddingHorizontal: 10,
    paddingVertical:   5,
    marginTop:         12,
  },
  vehicleText: {
    fontSize:   10,
    color:      AtlasColors.textSecondary,
    fontWeight: '600',
  },
  menuList: {
    paddingHorizontal: 16,
    flex: 1,
  },
  menuRow: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingVertical:   15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            12,
  },
  menuLabel: {
    fontSize:   13,
    fontWeight: '600',
    color:      AtlasColors.textPrimary,
  },
  menuChevron: {
    fontSize: 18,
    color:    AtlasColors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop:         32,
    alignItems:        'center',
    gap:                12,
  },
  passengerModeBtn: {
    backgroundColor: '#1C2438',
    borderRadius:    12,
    paddingVertical:  10,
    paddingHorizontal: 24,
    borderWidth:       1,
    borderColor:       AtlasColors.primary + '40',
  },
  passengerModeText: {
    fontSize:   12,
    fontWeight: '700',
    color:      AtlasColors.accent,
  },
  version: {
    fontSize: 9,
    color:    AtlasColors.textMuted,
  },
});
