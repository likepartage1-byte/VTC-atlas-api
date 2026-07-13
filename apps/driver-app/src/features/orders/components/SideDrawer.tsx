import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  I18nManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Wallet,
  Bell,
  Settings,
  HelpCircle,
  User,
  Package,
  Globe,
  Moon,
  ChevronRight,
  RefreshCw,
  LogOut,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_W * 0.84; // 84% width as requested

interface SideDrawerProps {
  isOpen:  boolean;
  onClose: () => void;
}

export const SideDrawer = memo(({ isOpen, onClose }: SideDrawerProps) => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  
  const [langSheetVisible, setLangSheetVisible] = useState(false);

  // Drawer slide animation
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 20, stiffness: 100 })
      : withTiming(-DRAWER_WIDTH, { duration: 240 });
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: 220 }),
  }));

  // Define Menu Items in the requested order
  const MENU_ITEMS = [
    { key: 'profile',      label: t('profile'),      icon: User },
    { key: 'wallet',       label: t('wallet'),       icon: Wallet },
    { key: 'orders',       label: t('orders'),       icon: Package },
    { key: 'notifications',label: t('notifications'),icon: Bell },
    { key: 'settings',     label: t('settings'),     icon: Settings },
    { key: 'help',         label: t('help'),         icon: HelpCircle },
  ];

  const handleLangSelect = async (langCode: string) => {
    setLangSheetVisible(false);
    onClose();
    
    // Set language in i18next
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);

    // Apply RTL for Arabic
    const isRTL = langCode === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return 'Français';
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop, 
            backdropOpacity, 
            { pointerEvents: isOpen ? 'auto' : 'none' }
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View style={[styles.drawer, drawerStyle, { backgroundColor: colors.surface }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
          
          {/* 👤 Profile stats Header */}
          <View style={[styles.profileHeader, { borderBottomColor: colors.surfaceAlt }]}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.surfaceAlt }]}>
              <User size={32} color={colors.textSecondary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.driverName, { color: colors.textPrimary }]}>Khalid</Text>
              <Text style={styles.driverRating}>⭐ 4.96</Text>
            </View>
          </View>

          {/* 🔗 List Items */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuRow, { borderBottomColor: colors.surfaceAlt }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    if (item.key === 'wallet') {
                      navigation.navigate('Wallet');
                    }
                  }}
                >
                  <View style={styles.menuLeft}>
                    <Icon size={20} color={colors.textSecondary} />
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ⚙️ Preferences: Language & Dark Mode */}
          <View style={[styles.preferencesSection, { borderTopColor: colors.surfaceAlt, borderBottomColor: colors.surfaceAlt }]}>
            
            {/* 🌐 Language Row */}
            <TouchableOpacity 
              style={styles.prefRow} 
              activeOpacity={0.7}
              onPress={() => setLangSheetVisible(true)}
            >
              <View style={styles.menuLeft}>
                <Globe size={20} color={colors.textSecondary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {t('wallet:language', 'Langue')}
                </Text>
              </View>
              <Text style={[styles.prefValue, { color: colors.primary }]}>
                {getLanguageName(i18n.language)}
              </Text>
            </TouchableOpacity>

            {/* 🌙 Dark Mode Row */}
            <TouchableOpacity 
              style={styles.prefRow} 
              activeOpacity={0.7}
              onPress={toggleTheme}
            >
              <View style={styles.menuLeft}>
                <Moon size={20} color={colors.textSecondary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {colors.bg === '#0A0F1E' ? t('wallet:darkMode', 'Mode sombre') : t('wallet:lightMode', 'Mode clair')}
                </Text>
              </View>
              
              <View style={[styles.modeToggleCapsule, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.modeToggleText, { color: isDarkMode ? colors.primary : colors.textMuted }]}>
                  {isDarkMode ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

          </View>

          {/* 🚗 Switch Mode Bottom Container */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.switchModeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary + '30' }]} onPress={onClose}>
              <Text style={[styles.switchModeText, { color: colors.primary }]}>
                {t('passenger_mode')}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              Atlas Driver • v1.0.0
            </Text>
          </View>

        </ScrollView>
      </Animated.View>

      {/* 🌐 Language Bottom Sheet Modal */}
      <Modal
        visible={langSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLangSheetVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.surfaceAlt }]}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {t('wallet:lang_select_title', 'Selectionner langue')}
                  </Text>
                </View>

                {/* Format selectable code lists */}
                {['ar', 'fr', 'en', 'es'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.langOptionBtn, { borderBottomColor: colors.surfaceAlt }]}
                    activeOpacity={0.7}
                    onPress={() => handleLangSelect(code)}
                  >
                    <Text style={[styles.langOptionText, { color: code === i18n.language ? colors.primary : colors.textPrimary }]}>
                      {getLanguageName(code)}
                    </Text>
                    {code === i18n.language && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', // Custom background opacity as requested
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 54,
    paddingBottom: 28,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 14,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
  },
  driverRating: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
    marginTop: 2,
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  preferencesSection: {
    marginTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  prefValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeToggleCapsule: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    paddingTop: 32,
    gap: 12,
    alignItems: 'center',
  },
  switchModeBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  langOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  langOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
