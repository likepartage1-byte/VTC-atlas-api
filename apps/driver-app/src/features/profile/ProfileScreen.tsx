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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
  isRTL: boolean;
  colors: any;
  isLast?: boolean;
}

const SectionRow = ({
  icon: Icon, label, subtitle, onPress, rightElement, isRTL, colors, isLast,
}: SectionRowProps) => {
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  return (
    <TouchableOpacity
      style={[
        styles.sectionRow,
        isRTL && styles.sectionRowRTL,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
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
      {rightElement ?? (onPress ? <Chevron size={16} color={colors.textMuted} /> : null)}
    </TouchableOpacity>
  );
};

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { t, i18n }            = useTranslation('profile');
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const isRTL = i18n.language === 'ar';

  // ── API Live State ──
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Modal visibility ──
  const [verifyModalVisible,   setVerifyModalVisible]   = useState(false);
  const [platinumModalVisible, setPlatinumModalVisible] = useState(false);
  const [detailModalVisible,   setDetailModalVisible]   = useState(false);

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

  // ─── Fetch profile from API ────────────────────────────────────────────────
  const fetchProfile = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get('/driver/profile');
      setProfile(response.data);
    } catch (err: any) {
      console.error('[API] Error loading driver profile:', err);
      setErrorMsg(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
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
    Alert.alert(t('logout_title'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['driver_access_token', 'driver_refresh_token']);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
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

  const langName =
    i18n.language === 'ar' ? 'العربية' :
    i18n.language === 'fr' ? 'Français' :
    i18n.language === 'es' ? 'Español' : 'English';

  // ─── Loading State UI ────────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.loadingCenter, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

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

            {/* Stars row */}
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>{renderStars(driverData.rating || 5.0)}</View>
              <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                {Number(driverData.rating || 5.0).toFixed(2)}
              </Text>
              <Text style={[styles.ratingDivider, { color: colors.textMuted }]}>·</Text>
              <Text style={[styles.tripsText, { color: colors.textMuted }]} numberOfLines={1}>
                {Number(statsData.completedRides || 0).toLocaleString()} {t('trips')}
              </Text>
            </View>

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

            {/* ── Weekly Level Progress (Dynamic Backend Calculations) ── */}
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

              {/* Commission section inside challenge card */}
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

              {/* Week countdown range */}
              <View style={[styles.weekEndRow, isRTL && styles.weekEndRowRTL]}>
                <Clock size={11} color={colors.textMuted} />
                <Text style={[styles.weekEndTxt, { color: colors.textMuted }]}>
                  {t('week_end_label')} : {weekEndDate}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Quick Stats ── */}
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

          {/* ── Account Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('account')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={User}       label={t('personal_info')} isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('PersonalInfo')} />
            <SectionRow icon={Car}        label={t('vehicle_info')}  isRTL={isRTL} colors={colors} onPress={() => navigation.navigate('VehicleInfo')} />
            <SectionRow icon={FileText}   label={t('documents')}     isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={CreditCard} label={t('payment_info')}  isRTL={isRTL} colors={colors} onPress={() => {}} isLast />
          </View>

          {/* ── Activity Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('activity')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Wallet} label={t('earnings')} isRTL={isRTL} colors={colors}
              onPress={() => navigation.navigate('Wallet')} />
            <SectionRow icon={Map}   label={t('trip_history')} isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={Award} label={t('achievements')} isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow
              icon={Layers}
              label={t('driver_level')}
              isRTL={isRTL}
              colors={colors}
              isLast
              rightElement={
                <View style={[styles.levelPill, { backgroundColor: levelColor + '22', borderColor: levelColor + '55' }]}>
                  <Text style={[styles.levelPillTxt, { color: levelColor }]}>{currentLevel}</Text>
                </View>
              }
            />
          </View>

          {/* ── Preferences Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('preferences')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Globe} label={t('language')} subtitle={langName} isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={Bell}  label={t('notifications')} isRTL={isRTL} colors={colors} onPress={() => {}} />
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
            <SectionRow icon={HelpCircle}    label={t('help_center')}     isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={MessageSquare} label={t('contact_support')} isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={AlertTriangle} label={t('report_problem')}  isRTL={isRTL} colors={colors} onPress={() => {}} isLast />
          </View>

          {/* ── Legal Sections ── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('legal')}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SectionRow icon={Shield} label={t('privacy_policy')}   isRTL={isRTL} colors={colors} onPress={() => {}} />
            <SectionRow icon={Scroll} label={t('terms_of_service')} isRTL={isRTL} colors={colors} onPress={() => {}} isLast />
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

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
