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
  ChevronLeft,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── The drawer takes up to 85% of screen, leaving a visible close area ───────
const DRAWER_WIDTH = SCREEN_W * 0.85;

interface SideDrawerProps {
  isOpen:  boolean;
  onClose: () => void;
}

export const SideDrawer = memo(({ isOpen, onClose }: SideDrawerProps) => {
  const navigation   = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { isDarkMode, colors, toggleTheme } = useTheme();

  const [langSheetVisible, setLangSheetVisible] = useState(false);

  // Is current language Arabic (RTL)?
  const isRTL = i18n.language === 'ar';

  // Drawer slides from left (always, as user requested)
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = isOpen
      ? withSpring(0, { damping: 22, stiffness: 120 })
      : withTiming(-DRAWER_WIDTH, { duration: 240 });
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: 220 }),
  }));

  const MENU_ITEMS = [
    { key: 'profile',       label: t('profile'),       icon: User },
    { key: 'wallet',        label: t('wallet'),        icon: Wallet },
    { key: 'orders',        label: t('orders'),        icon: Package },
    { key: 'notifications', label: t('notifications'), icon: Bell },
    { key: 'settings',      label: t('settings'),      icon: Settings },
    { key: 'help',          label: t('help'),          icon: HelpCircle },
  ];

  const handleLangSelect = async (langCode: string) => {
    setLangSheetVisible(false);
    onClose();
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);
    const nextIsRTL = langCode === 'ar';
    if (I18nManager.isRTL !== nextIsRTL) {
      I18nManager.allowRTL(nextIsRTL);
      I18nManager.forceRTL(nextIsRTL);
    }
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'es': return 'Español';
      default:   return 'Français';
    }
  };

  // ── Direction-aware row: for RTL, icon+text come from right, chevron from left ─
  // We use explicit flexDirection instead of the web-only `direction` prop
  const rowStyle = [
    styles.menuRow,
    { borderBottomColor: colors.surfaceAlt },
    isRTL && styles.menuRowRTL,
  ];

  const menuLeftStyle = [
    styles.menuLeft,
    isRTL && styles.menuLeftRTL,
  ];

  const prefRowStyle = [
    styles.prefRow,
    isRTL && styles.prefRowRTL,
  ];

  // Chevron direction based on RTL
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>

      {/* ── Backdrop: fully opaque black Layer — blocks all touches ─── */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, backdropOpacity]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      {/* ── Drawer Panel ──────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.drawer,
          drawerStyle,
          { backgroundColor: colors.surface },
          I18nManager.isRTL 
            ? { right: 0, left: undefined, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderTopRightRadius: 0, borderBottomRightRadius: 0 } 
            : { left: 0, right: undefined, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile Header ─────────────────────────────────────── */}
          <View style={[
            styles.profileHeader,
            isRTL && styles.profileHeaderRTL,
            { borderBottomColor: colors.surfaceAlt },
          ]}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
              <User size={28} color={colors.textSecondary} />
            </View>
            <View style={[styles.profileInfo, isRTL && styles.profileInfoRTL]}>
              <Text style={[styles.driverName, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                Khalid
              </Text>
              <Text style={[styles.rating, { textAlign: isRTL ? 'right' : 'left' }]}>
                ⭐ 4.96
              </Text>
            </View>
          </View>

          {/* ── Menu Items ──────────────────────────────────────────── */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={rowStyle}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    if (item.key === 'wallet') {
                      (global as any).walletNavStartTime = Date.now();
                      console.time("Wallet Navigation");
                      console.log(`[WALLET PERF] [1] Drawer Press — t=0ms — ${new Date().toISOString()}`);
                      navigation.navigate('Wallet');
                    } else if (item.key === 'profile') {
                      navigation.navigate('Profile');
                    }
                  }}
                >
                  {/* In RTL: Chevron → Text+Icon. In LTR: Icon+Text → Chevron */}
                  {isRTL && <Chevron size={16} color={colors.textMuted} />}

                  <View style={menuLeftStyle}>
                    {!isRTL && <Icon size={20} color={colors.textSecondary} />}
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                    {isRTL && <Icon size={20} color={colors.textSecondary} />}
                  </View>

                  {!isRTL && <Chevron size={16} color={colors.textMuted} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Preferences: Language & Dark Mode ──────────────────── */}
          <View style={[styles.prefsSection, {
            borderTopColor:    colors.surfaceAlt,
            borderBottomColor: colors.surfaceAlt,
          }]}>
            {/* Language Row */}
            <TouchableOpacity
              style={prefRowStyle}
              activeOpacity={0.7}
              onPress={() => setLangSheetVisible(true)}
            >
              {isRTL ? (
                <>
                  <Text style={[styles.prefValue, { color: colors.primary }]}>
                    {getLanguageName(i18n.language)}
                  </Text>
                  <View style={[styles.menuLeft, styles.menuLeftRTL]}>
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {t('wallet:language', 'Langue')}
                    </Text>
                    <Globe size={20} color={colors.textSecondary} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.menuLeft}>
                    <Globe size={20} color={colors.textSecondary} />
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {t('wallet:language', 'Langue')}
                    </Text>
                  </View>
                  <Text style={[styles.prefValue, { color: colors.primary }]}>
                    {getLanguageName(i18n.language)}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Dark Mode Row */}
            <TouchableOpacity
              style={prefRowStyle}
              activeOpacity={0.7}
              onPress={toggleTheme}
            >
              {isRTL ? (
                <>
                  <View style={[styles.toggleCapsule, { backgroundColor: isDarkMode ? colors.primary + '22' : colors.surfaceAlt }]}>
                    <Text style={[styles.toggleText, { color: isDarkMode ? colors.primary : colors.textMuted }]}>
                      {isDarkMode ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                  <View style={[styles.menuLeft, styles.menuLeftRTL]}>
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {isDarkMode ? t('wallet:darkMode', 'Mode sombre') : t('wallet:lightMode', 'Mode clair')}
                    </Text>
                    <Moon size={20} color={colors.textSecondary} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.menuLeft}>
                    <Moon size={20} color={colors.textSecondary} />
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                      {isDarkMode ? t('wallet:darkMode', 'Mode sombre') : t('wallet:lightMode', 'Mode clair')}
                    </Text>
                  </View>
                  <View style={[styles.toggleCapsule, { backgroundColor: isDarkMode ? colors.primary + '22' : colors.surfaceAlt }]}>
                    <Text style={[styles.toggleText, { color: isDarkMode ? colors.primary : colors.textMuted }]}>
                      {isDarkMode ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Footer: Passenger Mode ─────────────────────────────── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.switchModeBtn, {
                backgroundColor: colors.surfaceAlt,
                borderColor:     colors.primary + '30',
              }]}
              onPress={onClose}
            >
              <Text style={[styles.switchModeText, { color: colors.primary }]}>
                {t('passenger_mode')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.version, { color: colors.textMuted }]}>
              Atlas Driver • v1.0.0
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* ── Language Bottom Sheet ──────────────────────────────────── */}
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
                <View style={[styles.modalHandle, { backgroundColor: colors.surfaceAlt }]} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t('wallet:lang_select_title', 'Sélectionner la langue')}
                </Text>
                {(['ar', 'fr', 'en', 'es'] as const).map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[styles.langOption, { borderBottomColor: colors.surfaceAlt }]}
                    activeOpacity={0.7}
                    onPress={() => handleLangSelect(code)}
                  >
                    <Text style={[
                      styles.langOptionText,
                      { color: code === i18n.language ? colors.primary : colors.textPrimary },
                    ]}>
                      {getLanguageName(code)}
                    </Text>
                    {code === i18n.language && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
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
  /* ── Backdrop: covers entire screen behind drawer ─────────── */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
    zIndex: 999,
  },

  /* ── Drawer Panel ─────────────────────────────────────────── */
  drawer: {
    position:  'absolute',
    left:      0,
    top:       0,
    bottom:    0,
    width:     DRAWER_WIDTH,
    zIndex:    1000,
    shadowColor:    '#000',
    shadowOffset:   { width: 6, height: 0 },
    shadowOpacity:  0.35,
    shadowRadius:   20,
    elevation:      20,
    borderTopRightRadius:    20,
    borderBottomRightRadius: 20,
  },

  scrollContent: {
    flexGrow:      1,
    paddingTop:    56,
    paddingBottom: 30,
  },

  /* ── Profile ──────────────────────────────────────────────── */
  profileHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 20,
    paddingBottom:  24,
    borderBottomWidth: 1,
    marginBottom:   18,
  },
  profileHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width:        52,
    height:       52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems:     'center',
  },
  profileInfo: {
    marginLeft: 14,
  },
  profileInfoRTL: {
    marginLeft:  0,
    marginRight: 14,
  },
  driverName: {
    fontSize:   16,
    fontWeight: '800',
  },
  rating: {
    fontSize:   12,
    color:      '#F59E0B',
    fontWeight: '700',
    marginTop:   2,
  },

  /* ── Menu List ────────────────────────────────────────────── */
  menuList: {
    paddingHorizontal: 20,
  },
  menuRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuRowRTL: {
    // row-reverse: chevron on left, icon+text on right
    flexDirection: 'row-reverse',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            12,
  },
  menuLeftRTL: {
    flexDirection: 'row-reverse',
  },
  menuLabel: {
    fontSize:   14,
    fontWeight: '600',
  },

  /* ── Preferences ──────────────────────────────────────────── */
  prefsSection: {
    marginTop:    16,
    paddingHorizontal: 20,
    borderTopWidth:    1,
    borderBottomWidth: 1,
    paddingVertical:   6,
  },
  prefRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 14,
  },
  prefRowRTL: {
    flexDirection: 'row-reverse',
  },
  prefValue: {
    fontSize:   13,
    fontWeight: '700',
  },
  toggleCapsule: {
    paddingVertical:   4,
    paddingHorizontal: 12,
    borderRadius:      12,
  },
  toggleText: {
    fontSize:   11,
    fontWeight: '800',
  },

  /* ── Footer ───────────────────────────────────────────────── */
  footer: {
    paddingHorizontal: 20,
    paddingTop:  32,
    gap:          12,
    alignItems:  'center',
  },
  switchModeBtn: {
    width:          '100%',
    height:          46,
    borderRadius:    12,
    justifyContent: 'center',
    alignItems:     'center',
    borderWidth:     1,
  },
  switchModeText: {
    fontSize:   13,
    fontWeight: '700',
  },
  version: {
    fontSize:  10,
    marginTop:  4,
  },

  /* ── Language Bottom Sheet ─────────────────────────────────── */
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop:    12,
  },
  modalHandle: {
    width:        40,
    height:        4,
    borderRadius:  2,
    alignSelf:    'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize:     16,
    fontWeight:   '800',
    marginBottom: 16,
    textAlign:    'center',
  },
  langOption: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  langOptionText: {
    fontSize:   15,
    fontWeight: '700',
  },
  activeDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
});
