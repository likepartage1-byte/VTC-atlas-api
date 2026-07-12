import React, { memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  MapPin,
  Bell,
  Lock,
  Settings,
  HelpCircle,
  MessageSquare,
  Facebook,
  MessageCircle,
  Instagram,
  UserCheck
} from 'lucide-react-native';
import { AtlasColors } from '../../../theme/atlas';
import { useProfileStore } from '../../../store/useProfileStore';

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_W * 0.82;

interface SideDrawerProps {
  isOpen:  boolean;
  onClose: () => void;
}

export const SideDrawer = memo(({ isOpen, onClose }: SideDrawerProps) => {
  const { t } = useTranslation();
  const { profile } = useProfileStore();
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 20, stiffness: 100 })
      : withTiming(-DRAWER_WIDTH, { duration: 250 });
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: isOpen
      ? withTiming(0.6, { duration: 250 })
      : withTiming(0, { duration: 220 }),
  }));

  if (!isOpen && translateX.value === -DRAWER_WIDTH) {
    return null;
  }

  const menuItems = [
    { key: 'wallet',        label: t('wallet'),        icon: Wallet,        value: `${profile.balanceMAD.toFixed(2)} MAD` },
    { key: 'city',          label: t('city'),          icon: MapPin,        value: profile.city },
    { key: 'notifications', label: t('notifications'), icon: Bell },
    { key: 'security',      label: t('security'),      icon: Lock },
    { key: 'settings',      label: t('settings'),      icon: Settings },
    { key: 'help',          label: t('help'),          icon: HelpCircle },
    { key: 'support',       label: t('support'),       icon: MessageSquare },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dark overlay backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Main Drawer Menu */}
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          
          {/* Driver Rich Profile Card */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <Text style={styles.driverName}>{profile.name}</Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {profile.rating.toFixed(2)}</Text>
            </View>
            
            {/* Vehicle Indicator */}
            <View style={styles.vehicleBadge}>
              <Text style={styles.vehicleLabel}>
                🚘 {profile.vehicle.color} {profile.vehicle.make} {profile.vehicle.model}
              </Text>
              <Text style={styles.vehiclePlate}>{profile.vehicle.plate}</Text>
            </View>
          </View>

          {/* List Options */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log(`[Drawer] Clicked ${item.key}`);
                    onClose();
                  }}
                >
                  <View style={styles.menuRowLeft}>
                    <IconComp size={19} color={AtlasColors.textSecondary} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  {item.value ? (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  ) : (
                    <Text style={styles.menuArrow}>→</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer Social Accounts & Passenger Switch */}
          <View style={styles.footerContainer}>
            {/* Mode Switcher */}
            <TouchableOpacity style={styles.modeSwitchBtn} activeOpacity={0.8}>
              <UserCheck size={18} color={AtlasColors.accent} />
              <Text style={styles.modeSwitchText}>{t('passenger_mode')}</Text>
            </TouchableOpacity>

            {/* Social Medias Badges */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Facebook size={16} color={AtlasColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <MessageCircle size={16} color={AtlasColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Instagram size={16} color={AtlasColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>Atlas Driver v1.0.4 - Premium Edition</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: AtlasColors.surface,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: AtlasColors.primary,
    backgroundColor: '#334155',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: AtlasColors.textPrimary,
  },
  ratingBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  ratingText: {
    color: AtlasColors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleBadge: {
    backgroundColor: AtlasColors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  vehicleLabel: {
    fontSize: 11,
    color: AtlasColors.textSecondary,
    fontWeight: '600',
  },
  vehiclePlate: {
    fontSize: 10,
    fontWeight: '800',
    color: AtlasColors.primary,
    marginTop: 2,
  },
  menuContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AtlasColors.textPrimary,
  },
  menuValue: {
    fontSize: 12,
    fontWeight: '800',
    color: AtlasColors.accent,
  },
  menuArrow: {
    fontSize: 14,
    color: AtlasColors.textMuted,
  },
  footerContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 16,
    alignItems: 'center',
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AtlasColors.primary + '20',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AtlasColors.primary + '40',
  },
  modeSwitchText: {
    color: AtlasColors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AtlasColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  versionText: {
    fontSize: 9,
    color: AtlasColors.textMuted,
    marginTop: 8,
  },
});
