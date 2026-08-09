import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Switch,
  Modal,
  Vibration,
  ActivityIndicator,
  Image,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { logout } from '../../store';
import { syncKeepScreenOnNativeSetting } from '../../services/keepAwake.service';
import {
  User,
  Star,
  ChevronRight,
  ChevronLeft,
  Car,
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
  Award,
  Layers,
  Globe,
  Bell,
  Sun,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Shield,
  Scroll,
  LogOut,
  CheckCircle,
  Wallet,
  Settings,
  Map,
  X,
  Camera,
  Trophy,
  Sparkles,
  Zap,
  Crown,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/axios.instance';
import { useAppModeStore } from '../../store/useAppModeStore';

const { width: SCREEN_W } = Dimensions.get('window');
const STAT_CARD_W = (SCREEN_W - 32 - 10) / 2;

// ─── Level colors ─────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  BRONZE:   '#CD7F32',
  SILVER:   '#94A3B8',
  GOLD:     '#F59E0B',
  PREMIER:  '#6366F1',
  PLATINUM: '#6366F1',
  DIAMOND:  '#06B6D4',
};

// ─── Confetti color palette ───────────────────────────────────────────────────
const CONFETTI_COLORS = ['#6366F1', '#F59E0B', '#22C55E', '#06B6D4', '#F43F5E', '#8B5CF6'];

// ─── 4 Languages Notification & Language Modal Translations ─────────────────
const NOTIF_TRANSLATIONS: any = {
  ar: {
    sheet_title: 'تفضيلات الإشعارات',
    lang_sheet_title: 'تغيير اللغة',
    save_btn: 'حفظ التفضيلات',
    rides_title: 'إشعارات الرحلات والطلبات الجديدة',
    rides_desc: 'تنبيهات فورية عند وصول طلب رحلة جديد',
    wallet_title: 'إشعارات الشحن والرصيد والمحفظة',
    wallet_desc: 'تنبيهات الخصومات والشحنات وحساب الرصيد',
    achievements_title: 'إشعارات الإنجازات والعروض',
    achievements_desc: 'تنبيهات عند الحصول على أوسمة ومكافآت',
    sound_title: 'الصوت والاهتزاز',
    sound_desc: 'تشغيل الصوت والاهتزاز عند استلام التنبيهات',
  },
  fr: {
    sheet_title: 'Préférences de notifications',
    lang_sheet_title: 'Changer la langue',
    save_btn: 'Enregistrer les préférences',
    rides_title: 'Alertes de nouvelles courses',
    rides_desc: "Alertes instantanées lors d'une nouvelle demande de course",
    wallet_title: 'Alertes portefeuille & solde',
    wallet_desc: 'Alertes pour les commissions, recharges et solde',
    achievements_title: 'Alertes de succès & promos',
    achievements_desc: 'Notifications lorsque vous débloquez des trophées',
    sound_title: 'Son & Vibration',
    sound_desc: 'Jouer le son et vibrer lors de la réception des alertes',
  },
  es: {
    sheet_title: 'Preferencias de notificaciones',
    lang_sheet_title: 'Cambiar idioma',
    save_btn: 'Guardar preferencias',
    rides_title: 'Alertas de nuevos viajes',
    rides_desc: 'Alertas instantáneas al recibir una nueva solicitud',
    wallet_title: 'Alertas de billetera y saldo',
    wallet_desc: 'Alertas para deducciones, recargas y saldo',
    achievements_title: 'Alertas de logros y ofertas',
    achievements_desc: 'Notificaciones al desbloquear insignias y recompensas',
    sound_title: 'Sonido y Vibración',
    sound_desc: 'Reproducir sonido y vibrar al recibir alertas',
  },
  en: {
    sheet_title: 'Notification Preferences',
    lang_sheet_title: 'Change Language',
    save_btn: 'Save Preferences',
    rides_title: 'New Ride & Order Alerts',
    rides_desc: 'Instant alerts when a new ride request arrives',
    wallet_title: 'Wallet & Balance Alerts',
    wallet_desc: 'Alerts for deductions, top-ups and balance',
    achievements_title: 'Achievements & Promo Alerts',
    achievements_desc: 'Notifications when unlocking badges and rewards',
    sound_title: 'Sound & Vibration',
    sound_desc: 'Play sound and vibrate when receiving alerts',
  },
};

const getNotifTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return NOTIF_TRANSLATIONS[langKey][key] || NOTIF_TRANSLATIONS['ar'][key] || key;
};

// ─── Scoping Helpers ─────────────────────────────────────────────────────────
const getWeekKey = (): string => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

// ─── SectionRow ───────────────────────────────────────────────────────────────
interface SectionRowProps {
  icon: React.FC<any>;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  badge?: number;   // red dot count badge (e.g. documents needing action)
  isRTL: boolean;
  colors: any;
  isLast?: boolean;
}

const SectionRow = ({
  icon: Icon, label, subtitle, onPress, rightElement, badge, isRTL, colors, isLast,
}: SectionRowProps) => {
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  return (
    <TouchableOpacity
      style={[
        styles.sectionRow,
        isRTL && styles.sectionRowRTL,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={() => {
        if (typeof onPress === 'function') {
          try {
            onPress();
          } catch (e) {
            console.error('[PROFILE] SectionRow onPress error:', e);
          }
        }
      }}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress && !rightElement}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
    >
      <View style={[styles.sectionRowLeft, isRTL && styles.sectionRowLeftRTL]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Icon size={18} color={colors.primary} />
        </View>
        <View style={styles.sectionRowText}>
          <Text
            style={[styles.sectionRowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.sectionRowSub, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {/* Right side: badge OR custom element OR chevron */}
      {badge && badge > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.badgeDot}>
            <Text style={styles.badgeDotText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
          {rightElement ?? (onPress ? <Chevron size={16} color={colors.textMuted} style={{ marginLeft: 6 }} /> : null)}
        </View>
      ) : (
        rightElement ?? (onPress ? <Chevron size={16} color={colors.textMuted} /> : null)
      )}
    </TouchableOpacity>
  );
};

// (duplicate removed — see new SectionRow above)

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const dispatch   = useDispatch();
  const { t, i18n }            = useTranslation('profile');
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { activeMode } = useAppModeStore();
  const isRTL = i18n.language === 'ar';

  // ── API Live State (Optimistic instant render) ──
  const [profile, setProfile] = useState<any>(() => {
    const storeUser = useAppModeStore.getState().registeredUser;
    const defaultName = storeUser.fullName || 'السائق الشريك';
    return {
      driver: {
        name: defaultName,
        rating: 5.0,
        user: { fullName: defaultName, email: storeUser.email || '' },
      },
      statistics: { totalTrips: 0, completionRate: 100 },
      weeklyChallenge: { currentLevel: 'SILVER', weekEnd: new Date().toISOString() },
      benefits: {},
    };
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Document badge (needs-action count) ──
  const [docBadgeCount, setDocBadgeCount] = useState(0);

  // ── Modal visibility ──
  const [verifyModalVisible,   setVerifyModalVisible]   = useState(false);
  const [platinumModalVisible, setPlatinumModalVisible] = useState(false);
  const [detailModalVisible,   setDetailModalVisible]   = useState(false);

  // ── Language & Notifications Modals ──
  const [langModalVisible, setLangModalVisible]   = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifState, setNotifState] = useState({
    rides: true,
    wallet: true,
    achievements: true,
    sound: true,
  });

  useFocusEffect(
    useCallback(() => {
      syncKeepScreenOnNativeSetting(false);
    }, [])
  );

  useEffect(() => {
    AsyncStorage.getItem('notif_settings').then((val) => {
      if (val) setNotifState(JSON.parse(val));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (route.params?.openNotif) {
      setNotifModalVisible(true);
    }
  }, [route.params]);

  const toggleNotif = async (key: keyof typeof notifState) => {
    const updated = { ...notifState, [key]: !notifState[key] };
    setNotifState(updated);
    await AsyncStorage.setItem('notif_settings', JSON.stringify(updated));
  };

  const handleLangSelect = async (langCode: string) => {
    setLangModalVisible(false);
    await i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('user_language', langCode);
    const nextIsRTL = langCode === 'ar';
    if (I18nManager.isRTL !== nextIsRTL) {
      I18nManager.allowRTL(nextIsRTL);
      I18nManager.forceRTL(nextIsRTL);
    }
  };

  const langName = useMemo(() => {
    switch (i18n.language) {
      case 'ar': return 'العربية 🇸🇦';
      case 'fr': return 'Français 🇫🇷';
      case 'es': return 'Español 🇪🇸';
      case 'en': return 'English 🇬🇧';
      default: return 'العربية 🇸🇦';
    }
  }, [i18n.language]);

  // ── Confetti particles ──
  const [confettiParticles, setConfettiParticles] = useState<
    { id: number; left: number; color: string; scale: number }[]
  >([]);

  // ── Entrance animations ──
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  // ── Platinum celebration animations ──
  const celebFade   = useRef(new Animated.Value(0)).current;
  const celebScale  = useRef(new Animated.Value(0.3)).current;
  const celebBounce = useRef(new Animated.Value(1)).current;
  const celebFall   = useRef(new Animated.Value(0)).current;

  // ── Verified badge pulse ──
  const badgePulse = useRef(new Animated.Value(1)).current;

  // ─── Fetch profile from API with local caching & optimistic UI ────────────
  const fetchProfile = async (showLoadingIndicator = true) => {
    // Only show full-screen spinner if we don't have any cached/loaded profile yet
    if (showLoadingIndicator && !profile) {
      setLoading(true);
    }
    setErrorMsg(null);
    try {
      const response = await api.get('/driver/profile', { timeout: 4000 });
      if (response.data) {
        setProfile(response.data);
        await AsyncStorage.setItem('driver_profile_cache', JSON.stringify(response.data)).catch(() => {});
      }
    } catch (err: any) {
      console.log('[API Fallback] Profile load notice:', err?.message);
      if (!profile) {
        const storedName = (await AsyncStorage.getItem('registered_full_name')) || 'Utilisateur Yalla VTC';
        const storedEmail = (await AsyncStorage.getItem('registered_email')) || '';
        setProfile({
          driver: {
            name: storedName,
            rating: 5.0,
            user: { fullName: storedName, email: storedEmail },
          },
          statistics: { totalTrips: 0, completionRate: 100 },
          weeklyChallenge: { currentLevel: 'SILVER', weekEnd: new Date().toISOString() },
          benefits: {},
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // 1. Load cached profile immediately so the screen opens instantly
      AsyncStorage.getItem('driver_profile_cache').then(cached => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.driver) {
              setProfile(parsed);
              setLoading(false);
            }
          } catch (_) {}
        }
      }).catch(() => {});

      // 2. Fetch fresh profile silently in background
      fetchProfile(false);

      // Fetch document badge count silently in background
      api.get('/driver/documents', { timeout: 4000 }).then(res => {
        const docs: any[] = res.data?.uploadedDocuments || [];
        const required: string[] = [
          ...(res.data?.basicRequired || []),
          ...(res.data?.conditionalRequired || []),
        ];
        const uploadedTypes = new Set(docs.map((d: any) => d.type));
        const missingCount = required.filter(t => !uploadedTypes.has(t)).length;
        const actionCount = docs.filter((d: any) => {
          const daysLeft = d.expiresAt
            ? Math.ceil((new Date(d.expiresAt).getTime() - Date.now()) / 86400000)
            : null;
          return d.status === 'REJECTED' || d.status === 'EXPIRED' || (daysLeft !== null && daysLeft <= 0);
        }).length;
        setDocBadgeCount(missingCount + actionCount);
      }).catch(() => {});
      return () => {};
    }, [])
  );

  // ─── Derived challenge values from backend ──────────────────────────────────
  const driverData    = profile?.driver || {};
  const statsData     = profile?.statistics || {};
  const challengeData = profile?.weeklyChallenge || {};
  const benefitsData  = profile?.benefits || {};

  const currentLevel = (challengeData.currentLevel || 'SILVER').toUpperCase();
  const isPlatinum   = challengeData.isPlatinum || false;
  const levelColor   = LEVEL_COLORS[currentLevel] || LEVEL_COLORS.SILVER;

  const weekEndDate = useMemo(() => {
    if (!challengeData.weekEnd) return '';
    const date = new Date(challengeData.weekEnd);
    const locale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'es' ? 'es-ES' : 'fr-FR';
    return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  }, [challengeData.weekEnd, i18n.language]);

  // ─── Entrance animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 460, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [profile, fadeAnim, slideAnim]);

  // ─── Verified badge subtle pulse ──────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1.00, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    return () => { badgePulse.stopAnimation(); };
  }, [badgePulse]);

  // ─── Platinum celebration trigger ──────────────────────────────────────────
  useEffect(() => {
    if (!isPlatinum || !profile) return;
    const storageKey = `@profile_platinum_shown_${getWeekKey()}`;
    (async () => {
      const alreadyShown = await AsyncStorage.getItem(storageKey);
      if (!alreadyShown) {
        // Generate confetti
        const particles = Array.from({ length: 50 }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          scale: 0.5 + Math.random() * 0.8,
        }));
        setConfettiParticles(particles);
        setPlatinumModalVisible(true);
        await AsyncStorage.setItem(storageKey, 'true');
      }
    })();
  }, [isPlatinum, profile]);

  // ─── Platinum celebration animations ──────────────────────────────────────
  useEffect(() => {
    if (platinumModalVisible) {
      celebFade.setValue(0);
      celebScale.setValue(0.3);
      celebFall.setValue(0);
      celebBounce.setValue(1);

      Animated.parallel([
        Animated.timing(celebFade,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(celebScale, { toValue: 1, tension: 38, friction: 6, useNativeDriver: true }),
        Animated.timing(celebFall,  { toValue: 1, duration: 4800, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(celebBounce, { toValue: 1.14, duration: 700, useNativeDriver: true }),
          Animated.timing(celebBounce, { toValue: 0.96, duration: 700, useNativeDriver: true }),
          Animated.timing(celebBounce, { toValue: 1.00, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      try { Vibration.vibrate([0, 120, 80, 160]); } catch (_) {}
    } else {
      celebFade.setValue(0);
      celebScale.setValue(0.3);
    }
  }, [platinumModalVisible, celebFade, celebScale, celebFall, celebBounce]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAvatarPress = () => {
    Alert.alert(t('photo_title'), t('photo_coming_soon'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('change_photo'), onPress: () => {} },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout_title', 'تسجيل الخروج'),
      t('logout_confirm', 'هل أنت تأكد من أنك تريد تسجيل الخروج؟'),
      [
        { text: t('cancel', 'إلغاء'), style: 'cancel' },
        {
          text: t('logout', 'تسجيل الخروج'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['driver_access_token', 'driver_refresh_token']);
            } catch (_) {}
            dispatch(logout());
            navigation.reset({ index: 0, routes: [{ name: 'PhoneAuth' }] });
          },
        },
      ]
    );
  };

  const closePlatinumModal = () => {
    Animated.timing(celebFade, { toValue: 0, duration: 260, useNativeDriver: true }).start(() =>
      setPlatinumModalVisible(false)
    );
  };

  // ─── Star renderer ────────────────────────────────────────────────────────
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => {
      const filled = i < Math.floor(rating);
      return (
        <Star key={i} size={14} color={filled ? '#F59E0B' : colors.border} fill={filled ? '#F59E0B' : 'none'} />
      );
    });



  // ─── Error State UI ──────────────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <SafeAreaView style={[styles.loadingCenter, { backgroundColor: colors.bg, padding: 24 }]}>
        <AlertTriangle size={48} color={colors.warning} />
        <Text style={[styles.errorTxt, { color: colors.textPrimary, marginTop: 12 }]}>{errorMsg}</Text>
        <TouchableOpacity
          onPress={() => fetchProfile(true)}
          style={[styles.retryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnTxt}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const displayLevelLabel =
    currentLevel === 'PREMIER' || currentLevel === 'PLATINUM'
      ? t('premier_title', 'Premier Driver')
      : currentLevel === 'GOLD'
      ? t('gold_title', 'Gold Driver')
      : t('silver_title', 'Silver Driver');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          {isRTL ? <ChevronRight size={22} color={colors.textPrimary} /> : <ChevronLeft size={22} color={colors.textPrimary} />}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {t('title')}
        </Text>

        <TouchableOpacity
          style={[styles.navBtn, styles.settingsBtnBg, { backgroundColor: colors.surfaceAlt }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Card ── */}
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>

            {/* Tappable Avatar opens Profil du chauffeur modal */}
            <TouchableOpacity
              onPress={() => setDetailModalVisible(true)}
              activeOpacity={0.85}
              style={styles.avatarWrap}
              accessibilityRole="button"
              accessibilityLabel={t('driver_profile_details')}
            >
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceAlt, borderColor: levelColor }]}>
                {driverData.avatar ? (
                  <Image source={{ uri: driverData.avatar }} style={styles.avatarImage} />
                ) : (
                  <User size={40} color={levelColor} />
                )}
              </View>
              {driverData.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.online, borderColor: colors.surface }]}>
                  <CheckCircle size={12} color="#fff" fill="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDetailModalVisible(true)}
              activeOpacity={0.85}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <Text style={[styles.driverName, { color: colors.textPrimary }]} numberOfLines={1}>
                {driverData.name}
              </Text>
              <Text style={[styles.driverId, { color: colors.textMuted }]}>{driverData.id}</Text>
            </TouchableOpacity>

            {/* Stars row — displayed for DRIVER mode only */}
            {activeMode === 'DRIVER' ? (
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>{renderStars(driverData.rating || 4.96)}</View>
                <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                  {Number(driverData.rating || 4.96).toFixed(2)}
                </Text>
                <Text style={[styles.ratingDivider, { color: colors.textMuted }]}>·</Text>
                <Text style={[styles.tripsText, { color: colors.textMuted }]} numberOfLines={1}>
                  {Number(statsData.completedRides || 0).toLocaleString()} {t('trips')}
                </Text>
              </View>
            ) : (
              <View style={styles.ratingRow}>
                <Text style={[styles.tripsText, { color: colors.textMuted }]} numberOfLines={1}>
                  {Number(statsData.completedRides || 0).toLocaleString()} {t('trips')}
                </Text>
              </View>
            )}

            {/* Verified Badge → opens info modal */}
            {driverData.verified && (
              <TouchableOpacity
                onPress={() => setVerifyModalVisible(true)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Verified Badge"
              >
                <Animated.View
                  style={[
                    styles.onlineBadge,
                    { backgroundColor: colors.onlineGlow, transform: [{ scale: badgePulse }] },
                  ]}
                >
                  <View style={[styles.onlineDot, { backgroundColor: colors.online }]} />
                  <Text style={[styles.onlineTxt, { color: colors.online }]}>{t('verified_driver')}</Text>
                  <ChevronDown size={12} color={colors.online} />
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* ── Driver-only Level Progress Card ── */}
            {activeMode === 'DRIVER' && (
              <View style={[styles.levelWrap, { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.levelHeader, isRTL && styles.levelHeaderRTL]}>
                  {isPlatinum
                    ? <Crown size={16} color={LEVEL_COLORS.PREMIER || LEVEL_COLORS.PLATINUM} />
                    : <Award  size={16} color={levelColor} />
                  }
                  <Text style={[styles.levelLabel, { color: levelColor }]} numberOfLines={1}>
                    {displayLevelLabel}
                  </Text>
                  {isPlatinum && (
                    <View style={[styles.platinumBadgePill, { backgroundColor: (LEVEL_COLORS.PREMIER || LEVEL_COLORS.PLATINUM) + '22' }]}>
                      <Text style={[styles.platinumBadgeTxt, { color: LEVEL_COLORS.PREMIER || LEVEL_COLORS.PLATINUM }]}>✓ Premier</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.ridesCountRow, isRTL && styles.ridesCountRowRTL]}>
                  <Text style={[styles.ridesCount, { color: levelColor }]}>
                    {challengeData.completed || 0}
                  </Text>
                  <Text style={[styles.ridesTotal, { color: colors.textSecondary }]}>
                    {' '}/ {challengeData.target || 30}{' '}
                    {currentLevel === 'SILVER'
                      ? t('weekly_rides_label_silver', 'completed')
                      : t('weekly_rides_label')}
                  </Text>
                </View>

                <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(challengeData.progress || 0) * 100}%`,
                        backgroundColor: levelColor,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.commissionDisplay, isRTL && styles.commissionDisplayRTL]}>
                  <View style={styles.commissionPill}>
                    <Text style={[styles.commissionLabel, { color: colors.textSecondary }]}>
                      {t('commission_label', 'Commission')}
                    </Text>
                    <Text style={[styles.commissionVal, { color: levelColor }]}>
                      {benefitsData.commission}%
                    </Text>
                    <Text style={[styles.taxSubText, { color: colors.textMuted, marginTop: 2, fontSize: 8 }]}>
                      {t('commission_tax_breakdown')}
                    </Text>
                  </View>
                  <View style={styles.priorityPill}>
                    <Text style={[styles.commissionLabel, { color: colors.textSecondary }]}>
                      {t('priority_matching_label', 'Priority Matching')}
                    </Text>
                    <Text style={[styles.priorityVal, { color: benefitsData.priorityMatching ? colors.online : colors.textMuted }]}>
                      {benefitsData.priorityMatching 
                        ? t('priority_enabled', 'Enabled') 
                        : t('priority_disabled', 'Disabled')}
                    </Text>
                  </View>
                </View>

                {isPlatinum ? (
                  <Text style={[styles.ridesRemainingTxt, { color: LEVEL_COLORS.PREMIER || LEVEL_COLORS.PLATINUM, textAlign: isRTL ? 'right' : 'left' }]}>
                    💎 {t('platinum_desc')}
                  </Text>
                ) : (
                  <Text style={[styles.ridesRemainingTxt, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {(() => {
                      const isSilver = currentLevel === 'SILVER';
                      const remaining = challengeData.remaining || 0;
                      const labelKey = isSilver
                        ? (remaining === 1 ? 'rides_remaining_silver_label' : 'rides_remaining_silver_label')
                        : (remaining === 1 ? 'ride_singular_label' : 'rides_remaining_label');
                      return isRTL
                        ? `${t(labelKey)} ${remaining}`
                        : `${remaining} ${t(labelKey)}`;
                    })()}
                  </Text>
                )}

                <View style={[styles.weekEndRow, isRTL && styles.weekEndRowRTL]}>
                  <Clock size={11} color={colors.textMuted} />
                  <Text style={[styles.weekEndTxt, { color: colors.textMuted }]}>
                    {t('week_end_label')} : {weekEndDate}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Driver-only Quick Stats ── */}
          {activeMode === 'DRIVER' && (
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Wallet size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                  {Number(statsData.totalEarnings || 0).toLocaleString()}
                  <Text style={[styles.statCurrency, { color: colors.textMuted }]}> DH</Text>
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                  {t('total_earnings')}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TrendingUp size={18} color={colors.online} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                  {Number(statsData.weekEarnings || 0).toLocaleString()}
                  <Text style={[styles.statCurrency, { color: colors.textMuted }]}> DH</Text>
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                  {t('week_earnings')}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <CheckCircle size={18} color={colors.online} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {statsData.acceptanceRate || 0}
                  <Text style={[styles.statCurrency, { color: colors.textMuted }]}>%</Text>
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                  {t('acceptance_rate')}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AlertTriangle size={18} color={colors.warning} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {statsData.cancellationRate || 0}
                  <Text style={[styles.statCurrency, { color: colors.textMuted }]}>%</Text>
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                  {t('cancel_rate')}
                </Text>
              </View>

              <View
                style={[
                  styles.statCardWide,
                  isRTL && styles.statCardWideRTL,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Clock size={18} color={colors.accent} />
                <View style={styles.statCardWideText}>
                  <Text style={[styles.statValue, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                    {statsData.onlineHoursToday || 0}
                    <Text style={[styles.statCurrency, { color: colors.textMuted }]}> h</Text>
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                    {t('online_hours')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Account Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('account')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={User} label={t('personal_info')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('PersonalInfo')} isLast={activeMode === 'PASSENGER'} />
            {activeMode === 'DRIVER' && (
              <>
                <SectionRow icon={Car}      label={t('vehicle_info')}  isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('VehicleInfo')} />
                <SectionRow icon={FileText} label={t('documents')}     isRTL={isRTL} colors={colors} badge={docBadgeCount} onPress={() => navigation.navigate('Documents')} />
                <SectionRow icon={Wallet}   label={t('wallet', 'المحفظة والدفع')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('Wallet')} isLast />
              </>
            )}
          </View>

          {/* ── Activity Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('activity')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Map} label={t('trip_history')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('TripHistory')} isLast={activeMode === 'PASSENGER'} />
            {activeMode === 'DRIVER' && (
              <>
                <SectionRow icon={Award} label={t('achievements')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('Achievements')} />
                <SectionRow
                  icon={Layers}
                  label={t('driver_level')}
                  isRTL={isRTL}
                  colors={colors}
                  onPress={() => navigation.navigate('DriverLevel')}
                  isLast
                  rightElement={
                    <View style={[styles.levelPill, { backgroundColor: levelColor + '22', borderColor: levelColor + '55' }]}>
                      <Text style={[styles.levelPillTxt, { color: levelColor }]}>{currentLevel}</Text>
                    </View>
                  }
                />
              </>
            )}
          </View>

          {/* ── Preferences Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('preferences')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Globe} label={t('language')} subtitle={langName} isRTL={isRTL} colors={colors} onPress={() => setLangModalVisible(true)} />
            <SectionRow icon={Bell}  label={t('notifications')} isRTL={isRTL} colors={colors} onPress={() => setNotifModalVisible(true)} />
            <SectionRow
              icon={Sun}
              label={t('appearance')}
              subtitle={isDarkMode ? t('dark_mode') : t('light_mode')}
              isRTL={isRTL}
              colors={colors}
              isLast
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primaryGlow }}
                  thumbColor={isDarkMode ? colors.primary : colors.textMuted}
                  accessibilityLabel={t('appearance')}
                />
              }
            />
          </View>

          {/* ── Support Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('support_section')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={HelpCircle}    label={t('help_center')}     isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('HelpCenter')} />
            <SectionRow icon={MessageSquare} label={t('contact_support')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('HelpCenter')} />
            <SectionRow icon={AlertTriangle} label={t('report_problem')}  isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('HelpCenter')} isLast />
          </View>

          {/* ── Legal Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('legal')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Shield} label={t('privacy_policy')}   isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('PrivacyPolicy')} />
            <SectionRow icon={Scroll} label={t('terms_of_service')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('TermsOfService')} isLast />
          </View>

          {/* ── Logout Button ── */}
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.offline + '18', borderColor: colors.offline + '40' }]}
            onPress={handleLogout}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={t('logout')}
          >
            <LogOut size={18} color={colors.offline} />
            <Text style={[styles.logoutTxt, { color: colors.offline }]}>{t('logout')}</Text>
          </TouchableOpacity>

          <Text style={[styles.version, { color: colors.textMuted }]}>Yalla VTC Driver v1.0.0</Text>

        </Animated.View>
      </ScrollView>

      {/* ── Verification modal ── */}
      <Modal
        visible={verifyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVerifyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setVerifyModalVisible(false)}
        >
          <View style={[styles.verifySheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setVerifyModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.verifyIconCircle, { backgroundColor: colors.online + '22' }]}>
              {driverData.verified ? (
                <CheckCircle size={32} color={colors.online} fill={colors.online} />
              ) : (
                <Clock size={32} color={colors.warning} />
              )}
            </View>

            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
              {t('verify_modal_title')}
            </Text>

            <Text style={[styles.verifyDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'center' }]}>
              {t('verify_modal_desc')}
            </Text>

            {['personal_info', 'vehicle_info', 'documents'].map((key) => (
              <View key={key} style={[styles.verifyCheckRow, isRTL && styles.verifyCheckRowRTL]}>
                <CheckCircle size={15} color={driverData.verified ? colors.online : colors.textMuted} />
                <Text style={[styles.verifyCheckTxt, { color: colors.textPrimary }]}>{t(key)}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.verifyCloseBtn, { backgroundColor: colors.online }]}
              onPress={() => setVerifyModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyCloseBtnTxt}>{t('verify_modal_close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Driver Details modal ── */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          {/* Backdrop Touch Closes Sheet */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setDetailModalVisible(false)}
          />

          <View style={[styles.detailSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Close button */}
            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setDetailModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <ScrollView 
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingVertical: 12, paddingBottom: 48 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Title */}
              <Text style={[styles.detailTitleText, { color: colors.textPrimary }]}>
                {t('driver_profile_details')}
              </Text>

              {/* Large Avatar container */}
              <View style={[styles.largeAvatarCircle, { backgroundColor: colors.surfaceAlt, borderColor: levelColor }]}>
                {driverData.avatar ? (
                  <Image source={{ uri: driverData.avatar }} style={styles.largeAvatarImage} />
                ) : (
                  <User size={50} color={levelColor} />
                )}
              </View>

              {/* Name */}
              <Text style={[styles.detailName, { color: colors.textPrimary }]}>
                {driverData.name}
              </Text>

              {/* Driver ID */}
              <Text style={[styles.detailId, { color: colors.textMuted }]}>
                {driverData.id}
              </Text>

              {/* Stats Bar */}
              <View style={[styles.detailStatsBar, { borderColor: colors.border }]}>
                <View style={styles.detailStatItem}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.detailStatVal, { color: colors.textPrimary }]}>
                    {Number(driverData.rating || 5.0).toFixed(2)}
                  </Text>
                  <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>
                    Rating
                  </Text>
                </View>
                <View style={[styles.detailStatItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
                  <Car size={14} color={colors.primary} />
                  <Text style={[styles.detailStatVal, { color: colors.textPrimary }]}>
                    {statsData.completedRides || 0}
                  </Text>
                  <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>
                    {t('trips')}
                  </Text>
                </View>
                <View style={styles.detailStatItem}>
                  <Award size={14} color={levelColor} />
                  <Text style={[styles.detailStatVal, { color: levelColor }]}>
                    {currentLevel}
                  </Text>
                  <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>
                    {t('level')}
                  </Text>
                </View>
              </View>

              {/* Verified & Joined Date details */}
              <View style={[styles.detailListCard, { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.detailListRow, isRTL && styles.detailListRowRTL]}>
                  <Text style={[styles.detailListLabel, { color: colors.textSecondary }]}>
                    {t('verification_status')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color={driverData.verified ? colors.online : colors.warning} fill={driverData.verified ? colors.online : 'none'} />
                    <Text style={[styles.detailListVal, { color: driverData.verified ? colors.online : colors.warning }]}>
                      {driverData.verified ? t('verified_driver') : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailListRow, isRTL && styles.detailListRowRTL, { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>
                  <Text style={[styles.detailListLabel, { color: colors.textSecondary }]}>
                    {t('joined_date_label')}
                  </Text>
                  <Text style={[styles.detailListVal, { color: colors.textPrimary }]}>
                    {t('member_since')}
                  </Text>
                </View>
              </View>

              {/* Badges Section */}
              <View style={styles.detailBadgesSection}>
                <Text style={[styles.detailBadgesTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('badges_label')}
                </Text>
                <View style={styles.detailBadgesGrid}>
                  {/* Verified Badge */}
                  {driverData.verified && (
                    <View style={[styles.detailBadgeItem, { backgroundColor: colors.online + '0A', borderColor: colors.online + '33' }]}>
                      <Text style={styles.detailBadgeIcon}>🏅</Text>
                      <Text style={[styles.detailBadgeTxt, { color: colors.textPrimary }]}>
                        {t('badge_verified_title')}
                      </Text>
                    </View>
                  )}

                  {/* High rides count badge */}
                  {Number(statsData.completedRides || 0) >= 10 && (
                    <View style={[styles.detailBadgeItem, { backgroundColor: colors.primary + '0A', borderColor: colors.primary + '33' }]}>
                      <Text style={styles.detailBadgeIcon}>🏅</Text>
                      <Text style={[styles.detailBadgeTxt, { color: colors.textPrimary }]}>
                        {Number(statsData.completedRides || 0) >= 1000 ? t('badge_rides_title') : `${statsData.completedRides} ${t('trips')}`}
                      </Text>
                    </View>
                  )}

                  {/* High rating badge */}
                  {Number(driverData.rating || 5.0) >= 4.8 && (
                    <View style={[styles.detailBadgeItem, { backgroundColor: '#F59E0B0A', borderColor: '#F59E0B33' }]}>
                      <Text style={styles.detailBadgeIcon}>🏅</Text>
                      <Text style={[styles.detailBadgeTxt, { color: colors.textPrimary }]}>
                        {t('badge_excellent_title')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Demander un changement de photo (Alert trigger) */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    t('change_photo_request'),
                    t('change_photo_security_alert'),
                    [{ text: t('verify_modal_close'), style: 'default' }]
                  );
                }}
                style={[styles.photoRequestBtn, { borderColor: colors.primary + '66' }]}
                activeOpacity={0.7}
              >
                <Camera size={14} color={colors.primary} />
                <Text style={[styles.photoRequestTxt, { color: colors.primary }]}>
                  {t('change_photo_request')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Platinum celebration modal ── */}
      <Modal
        visible={platinumModalVisible}
        transparent
        animationType="none"
        onRequestClose={closePlatinumModal}
      >
        <Animated.View style={[styles.celebOverlay, { opacity: celebFade }]}>

          {/* Confetti particles */}
          {confettiParticles.map((p) => {
            const translateY = celebFall.interpolate({
              inputRange: [0, 1],
              outputRange: [-60, 900 * p.scale],
            });
            const rotate = celebFall.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${340 * p.scale}deg`],
            });
            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.confettiParticle,
                  {
                    left: `${p.left}%` as any,
                    backgroundColor: p.color,
                    transform: [{ translateY }, { rotate }, { scale: p.scale }],
                  },
                ]}
              />
            );
          })}

          <Animated.View
            style={[
              styles.celebCard,
              { backgroundColor: colors.surface, borderColor: LEVEL_COLORS.PLATINUM + '66' },
              { transform: [{ scale: celebScale }] },
            ]}
          >
            <View style={styles.celebSparklesRow}>
              <Sparkles size={22} color={LEVEL_COLORS.PLATINUM} />
              <Text style={styles.celebEmoji}>👑</Text>
              <Sparkles size={22} color={LEVEL_COLORS.PLATINUM} />
            </View>

            <Animated.View style={{ transform: [{ scale: celebBounce }], marginVertical: 8 }}>
              <Trophy size={64} color={LEVEL_COLORS.PLATINUM} />
            </Animated.View>

            <Text style={[styles.celebCongrats, { color: LEVEL_COLORS.PLATINUM }]}>
              {t('platinum_congrats')}
            </Text>
            <Text style={[styles.celebTitle, { color: colors.textPrimary }]}>
              {t('platinum_title')}
            </Text>
            <Text style={[styles.celebDesc, { color: colors.textSecondary }]}>
              {t('platinum_desc')}
            </Text>

            {/* Benefits inside celebration */}
            <View style={[styles.benefitsCard, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.benefitsTitle, { color: colors.textMuted }]}>
                {t('platinum_benefits_title')}
              </Text>

              {[
                { icon: Zap,    key: 'benefit_commission', customLabel: `Commission reduced to ${benefitsData.commission || 8}%` },
                { icon: Zap,    key: 'benefit_priority' },
                { icon: Crown,  key: 'benefit_badge' },
              ].map(({ icon: Icon, key, customLabel }) => (
                <View key={key} style={[styles.benefitRow, isRTL && styles.benefitRowRTL]}>
                  <View style={[styles.benefitIconWrap, { backgroundColor: LEVEL_COLORS.PLATINUM + '22' }]}>
                    <Icon size={14} color={LEVEL_COLORS.PLATINUM} />
                  </View>
                  <Text style={[styles.benefitTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {customLabel || t(key)}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.celebCloseBtn, { backgroundColor: LEVEL_COLORS.PLATINUM }]}
              onPress={closePlatinumModal}
              activeOpacity={0.82}
            >
              <Text style={styles.celebCloseBtnTxt}>{t('close')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* ── Language Selector Modal Sheet ── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.sheetHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.sheetTitleTxt, { color: colors.textPrimary }]}>
                🌐 {getNotifTr('lang_sheet_title', i18n.language)}
              </Text>
              <TouchableOpacity
                style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => setLangModalVisible(false)}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { code: 'ar', label: 'العربية', flag: '🇸🇦' },
              { code: 'fr', label: 'Français', flag: '🇫🇷' },
              { code: 'es', label: 'Español', flag: '🇪🇸' },
              { code: 'en', label: 'English', flag: '🇬🇧' },
            ].map((langItem) => {
              const isSelected = i18n.language === langItem.code;
              return (
                <TouchableOpacity
                  key={langItem.code}
                  activeOpacity={0.8}
                  style={[
                    styles.langItemRow,
                    { backgroundColor: isSelected ? colors.primary + '14' : colors.surfaceAlt,
                      borderColor: isSelected ? colors.primary : colors.border },
                    isRTL && { flexDirection: 'row-reverse' },
                  ]}
                  onPress={() => handleLangSelect(langItem.code)}
                >
                  <Text style={{ fontSize: 22, marginHorizontal: 8 }}>{langItem.flag}</Text>
                  <Text style={[styles.langItemLabel, { color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                    {langItem.label}
                  </Text>
                  {isSelected && <CheckCircle size={20} color={colors.primary} fill={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Notifications Preferences Modal Sheet ── */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setNotifModalVisible(false)}
        >
          <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.sheetHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.sheetTitleTxt, { color: colors.textPrimary }]}>
                🔔 {getNotifTr('sheet_title', i18n.language)}
              </Text>
              <TouchableOpacity
                style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => setNotifModalVisible(false)}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { key: 'rides', label: getNotifTr('rides_title', i18n.language), desc: getNotifTr('rides_desc', i18n.language) },
              { key: 'wallet', label: getNotifTr('wallet_title', i18n.language), desc: getNotifTr('wallet_desc', i18n.language) },
              { key: 'achievements', label: getNotifTr('achievements_title', i18n.language), desc: getNotifTr('achievements_desc', i18n.language) },
              { key: 'sound', label: getNotifTr('sound_title', i18n.language), desc: getNotifTr('sound_desc', i18n.language) },
            ].map((nItem) => {
              const val = notifState[nItem.key as keyof typeof notifState];
              return (
                <View
                  key={nItem.key}
                  style={[
                    styles.notifItemRow,
                    { borderBottomColor: colors.border },
                    isRTL && { flexDirection: 'row-reverse' },
                  ]}
                >
                  <View style={{ flex: 1, marginHorizontal: 6, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={[styles.notifItemTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {nItem.label}
                    </Text>
                    <Text style={[styles.notifItemDesc, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {nItem.desc}
                    </Text>
                  </View>
                  <Switch
                    value={val}
                    onValueChange={() => toggleNotif(nItem.key as keyof typeof notifState)}
                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                    thumbColor={val ? colors.primary : colors.textMuted}
                  />
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.notifDoneBtn, { backgroundColor: colors.primary }]}
              onPress={() => setNotifModalVisible(false)}
            >
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>{getNotifTr('save_btn', i18n.language)}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitleTxt: {
    fontSize: 17,
    fontWeight: '700',
  },
  langItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  langItemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  notifItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notifItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  notifItemDesc: {
    fontSize: 11.5,
  },
  notifDoneBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtnBg: { borderRadius: 12 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    flex: 1,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 22,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 10,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
    maxWidth: '80%',
  },
  driverId: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  starsRow:     { flexDirection: 'row', gap: 2 },
  ratingText:   { fontSize: 14, fontWeight: '700' },
  ratingDivider:{ fontSize: 14 },
  tripsText:    { fontSize: 13 },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 2,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt:  { fontSize: 12, fontWeight: '600' },

  levelWrap: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 6,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelHeaderRTL: { flexDirection: 'row-reverse' },
  levelLabel: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  platinumBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  platinumBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  ridesCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  ridesCountRowRTL: { flexDirection: 'row-reverse' },
  ridesCount: {
    fontSize: 26,
    fontWeight: '900',
  },
  ridesTotal: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  commissionDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 2,
    gap: 12,
  },
  commissionDisplayRTL: {
    flexDirection: 'row-reverse',
  },
  commissionPill: {
    flex: 1,
    alignItems: 'center',
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  commissionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  commissionVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  taxSubText: {
    fontSize: 8.5,
    fontWeight: 'normal',
    textTransform: 'none',
  },
  priorityVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  ridesRemainingTxt: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  weekEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  weekEndRowRTL: { flexDirection: 'row-reverse' },
  weekEndTxt: { fontSize: 11 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    width: STAT_CARD_W,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  statCardWide: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  statCardWideRTL:  { flexDirection: 'row-reverse' },
  statCardWideText: { flex: 1, gap: 4 },
  statValue:        { fontSize: 22, fontWeight: '800' },
  statCurrency:     { fontSize: 14, fontWeight: '500' },
  statLabel:        { fontSize: 12, fontWeight: '500', lineHeight: 16 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 54,
    paddingVertical: 12,
    gap: 8,
  },
  sectionRowRTL:     { flexDirection: 'row-reverse' },
  sectionRowLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sectionRowLeftRTL: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sectionRowText:  { flex: 1, gap: 2 },
  sectionRowLabel: { fontSize: 14, fontWeight: '600' },
  sectionRowSub:   { fontSize: 12, fontWeight: '400' },
  badgeDot: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  levelPillTxt: { fontSize: 12, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    marginTop: 4,
  },
  logoutTxt: { fontSize: 15, fontWeight: '700' },

  version: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 4,
    paddingBottom: 4,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTxt: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  verifySheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    paddingBottom: 36,
  },
  sheetCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  verifyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  verifyDesc: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 4,
  },
  verifyCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifyCheckRowRTL: { flexDirection: 'row-reverse', alignSelf: 'flex-end' },
  verifyCheckTxt: { fontSize: 14, fontWeight: '500' },
  verifyCloseBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  verifyCloseBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  celebOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.84)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  celebCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  celebSparklesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  celebEmoji: { fontSize: 28 },
  celebCongrats: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  celebTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  celebDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  benefitsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  benefitsTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitRowRTL: { flexDirection: 'row-reverse' },
  benefitIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  benefitTxt: { fontSize: 13, fontWeight: '500', flex: 1 },
  celebCloseBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  celebCloseBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  detailSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxHeight: '85%',
  },
  detailTitleText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  largeAvatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  largeAvatarImage: {
    width: '100%',
    height: '100%',
  },
  detailName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailId: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailStatsBar: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 20,
  },
  detailStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailStatVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailListCard: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  detailListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailListRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailListLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailListVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailBadgesSection: {
    width: '100%',
    marginBottom: 24,
  },
  detailBadgesTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  detailBadgesGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  detailBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  detailBadgeIcon: {
    fontSize: 16,
  },
  detailBadgeTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  photoRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  photoRequestTxt: {
    fontSize: 14,
    fontWeight: '800',
  },
});
