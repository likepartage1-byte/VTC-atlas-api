import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  Car,
  Navigation,
  DollarSign,
  Zap,
  Calendar,
  X,
  PlusCircle,
  Percent,
  CheckCircle2,
  Trophy,
  Sparkles,
  Award,
} from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { useWallet } from '../hooks/useWallet';

const LIME_GREEN = '#8BE034';

export const IncomeScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const { colors, isDarkMode } = useTheme();
  const isRTL = i18n.language === 'ar';

  // --- Fetch aggregated data using hook ---
  const { dailySummary, weeklySummary, isLoadingIncome, fetchIncomeData } = useWallet();

  // --- Active Date State ---
  const [activeDate, setActiveDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // --- Goal Setting State ---
  const [goalMode, setGoalMode] = useState<'daily' | 'weekly'>('daily');
  const [goalValue, setGoalValue] = useState<number | null>(null);
  const [tempGoalInput, setTempGoalInput] = useState<string>('500');
  const [goalModalVisible, setGoalModalVisible] = useState<boolean>(false);

  // --- Celebration State ---
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);
  const [currentCelebration, setCurrentCelebration] = useState<{
    id: string;
    title: string;
    description: string;
    badge: string;
    value: number;
    goalValue: number;
    ratio: number;
  } | null>(null);

  // Animated values
  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const bounceAnim = useMemo(() => new Animated.Value(1), []);
  const fallProgress = useMemo(() => new Animated.Value(0), []);
  
  // Confetti particles
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; left: number; color: string; scale: number; speed: number }>>([]);

  useEffect(() => {
    if (celebrationVisible) {
      // 1. Generate 45 random confetti particles
      const colorsList = ['#8BE034', '#FFD700', '#FF4500', '#00FFFF', '#FF00FF', '#1E90FF'];
      const particles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // percentage X
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        scale: 0.5 + Math.random() * 0.8,
        speed: 1500 + Math.random() * 2000,
      }));
      setConfettiParticles(particles);

      // 2. Play modal scale & fade animations
      scaleAnim.setValue(0.3);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start();

      // 3. Play Trophy bounce loops
      bounceAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0.95, duration: 800, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      // 4. Play Confetti fall animation
      fallProgress.setValue(0);
      Animated.timing(fallProgress, {
        toValue: 1,
        duration: 4500,
        useNativeDriver: true,
      }).start();

      // 5. Trigger double beat haptic vibration
      try {
        Vibration.vibrate([0, 100, 80, 150]);
      } catch (e) {}
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(1);
      fallProgress.setValue(0);
    }
  }, [celebrationVisible, scaleAnim, fadeAnim, bounceAnim, fallProgress]);

  // --- Achievement Trigger Engine ---
  useEffect(() => {
    if (!dailySummary) return;

    const netIncome = dailySummary.netIncome;
    const dateKey = dailySummary.date;

    const runAchievementCheck = async () => {
      const milestonesList = [
        { id: '1000', value: 1000, titleKey: 'milestone_1000_title', descKey: 'milestone_1000_desc', badge: '👑' },
        { id: '750',  value: 750,  titleKey: 'milestone_750_title',  descKey: 'milestone_750_desc',  badge: '💎' },
        { id: 'goal', value: goalValue || 999999, isGoal: true, titleKey: 'congrats_title', descKey: 'goal_reached_desc', badge: '🏆' },
        { id: '250',  value: 250,  titleKey: 'milestone_250_title',  descKey: 'milestone_250_desc',  badge: '🥈' },
        { id: '100',  value: 100,  titleKey: 'milestone_100_title',  descKey: 'milestone_100_desc',  badge: '🥉' },
      ];

      const reached = milestonesList.filter(m => netIncome >= m.value);
      if (reached.length === 0) return;

      try {
        const storageKey = `@wallet_achievements_shown_${dateKey}`;
        const storedStr = await AsyncStorage.getItem(storageKey);
        const shownIds: string[] = storedStr ? JSON.parse(storedStr) : [];

        const sortedReached = [...reached].sort((a, b) => b.value - a.value);
        const highestNew = sortedReached.find(m => !shownIds.includes(m.id));

        if (highestNew) {
          const targetLimit = highestNew.isGoal ? (goalValue || 500) : highestNew.value;
          const ratioVal = Math.round((netIncome / targetLimit) * 100);

          setCurrentCelebration({
            id: highestNew.id,
            title: t(highestNew.titleKey),
            description: t(highestNew.descKey),
            badge: highestNew.badge,
            value: netIncome,
            goalValue: targetLimit,
            ratio: ratioVal,
          });
          setCelebrationVisible(true);

          const newShownIds = Array.from(new Set([...shownIds, ...reached.map(m => m.id)]));
          await AsyncStorage.setItem(storageKey, JSON.stringify(newShownIds));
        } else {
          const missingIds = reached.map(m => m.id).filter(id => !shownIds.includes(id));
          if (missingIds.length > 0) {
            const newShownIds = [...shownIds, ...missingIds];
            await AsyncStorage.setItem(storageKey, JSON.stringify(newShownIds));
          }
        }
      } catch (err) {
        console.error('Failed to run achievement check:', err);
      }
    };

    runAchievementCheck();
  }, [dailySummary, goalValue, t]);



  useEffect(() => {
    fetchIncomeData(activeDate, isRTL);
  }, [activeDate, fetchIncomeData, isRTL]);

  // --- Theme Mappings ---
  const screenBg = isDarkMode ? '#121319' : colors.bg;
  const cardBg = isDarkMode ? '#1E202B' : colors.surfaceAlt || '#F3F4F6';
  const textWhite = isDarkMode ? '#ffffff' : colors.textPrimary;
  const textGrey = isDarkMode ? '#A0A3B5' : colors.textSecondary;
  const progressBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const borderCol = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.border;
  const sheetBgColor = isDarkMode ? '#1E202B' : colors.surface;
  const inputBg = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : '#F9FAFB';

  // --- Date Actions ---
  const handlePrevDay = () => {
    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() - 1);
    setActiveDate(newDate);
  };

  const handleNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeDate.getTime() >= today.getTime()) {
      return; // Cannot navigate to future dates
    }

    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() + 1);
    setActiveDate(newDate);
  };

  const isTodayActive = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeDate.getTime() >= today.getTime();
  }, [activeDate]);

  // --- Formatting Helpers ---
  const formattedActiveDate = useMemo(() => {
    const locale = i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en');
    return activeDate.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [activeDate, i18n.language]);

  // --- Weekly Chart Calculation ---
  const weeklyChartData = useMemo(() => {
    if (!weeklySummary?.dailySummaries) return [];
    
    const summaries = weeklySummary.dailySummaries;
    const maxIncome = Math.max(...summaries.map((s) => s.netIncome), 1); // Avoid index division by zero
    const locale = i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en');

    return summaries.map((s) => {
      const parsedDate = new Date(s.date + 'T00:00:00'); // Force local timezone instantiation
      return {
        date: parsedDate,
        dayName: parsedDate.toLocaleDateString(locale, { weekday: 'short' }),
        income: s.netIncome,
        ratio: s.netIncome / maxIncome,
      };
    });
  }, [weeklySummary, i18n.language]);

  // --- Save Target handler ---
  const handleSaveGoal = () => {
    const parsed = parseInt(tempGoalInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert(t('warning_title') || 'Alert', t('invalid_goal_error') || 'Please enter a valid goal amount.');
      return;
    }
    setGoalValue(parsed);
    setGoalModalVisible(false);
  };

  // --- Goal Progress Tracker ---
  const goalProgress = useMemo(() => {
    if (goalValue === null || goalValue === 0) return 0;
    const currentCompleted = goalMode === 'daily' 
      ? (dailySummary?.netIncome ?? 0) 
      : (weeklySummary?.totalNetIncome ?? 0);
    const ratio = currentCompleted / goalValue;
    return Math.min(Math.round(ratio * 100), 100);
  }, [goalValue, goalMode, dailySummary?.netIncome, weeklySummary?.totalNetIncome]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      <WalletHeader title={t('income') || 'Income'} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ─── 1. Main Daily Balance Card ───────────────────────────────── */}
        <View style={styles.cardWrapper}>
          <WalletCard style={[styles.mainCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[styles.cardLabel, { color: textGrey, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('today_income') || "Today's Income"}
            </Text>
            <Text style={[styles.mainIncomeVal, { color: textWhite, textAlign: isRTL ? 'right' : 'left' }]}>
              {formatCurrency(dailySummary?.netIncome ?? 0, 'MAD')}
            </Text>

            {/* Nav Arrows Section: dynamically reverses based on RTL */}
            <View style={[styles.navDateRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {/* Previous Day: pointing to past */}
              <TouchableOpacity
                onPress={handlePrevDay}
                style={[styles.arrowBtn, { backgroundColor: progressBg }]}
                activeOpacity={0.8}
              >
                {isRTL ? <ChevronRight size={20} color={textWhite} /> : <ChevronLeft size={20} color={textWhite} />}
              </TouchableOpacity>

              <Text style={[styles.dateTextLabel, { color: textWhite }]} numberOfLines={1}>
                {formattedActiveDate}
              </Text>

              {/* Next Day: pointing to future */}
              <TouchableOpacity
                onPress={handleNextDay}
                disabled={isTodayActive}
                style={[
                  styles.arrowBtn,
                  { backgroundColor: progressBg },
                  isTodayActive && { opacity: 0.3 }
                ]}
                activeOpacity={0.8}
              >
                {isRTL ? <ChevronLeft size={20} color={textWhite} /> : <ChevronRight size={20} color={textWhite} />}
              </TouchableOpacity>
            </View>

            {/* Quick stats on main card */}
            <View style={[styles.cardStatsGrid, isRTL && styles.rtlRow]}>
              <View style={styles.cardStatColumn}>
                <Text style={[styles.cardStatTitle, { color: textGrey }]}>
                  {t('number_of_rides') || 'Number of Rides'}
                </Text>
                <Text style={[styles.cardStatValue, { color: textWhite }]}>
                  {dailySummary?.ridesCount ?? 0}
                </Text>
              </View>

              <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />

              <View style={styles.cardStatColumn}>
                <Text style={[styles.cardStatTitle, { color: textGrey }]}>
                  {t('avg_profit_per_ride') || 'Average per Ride'}
                </Text>
                <Text style={[styles.cardStatValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.avgProfitPerRide ?? 0, 'MAD')}
                </Text>
              </View>

              <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />

              <View style={styles.cardStatColumn}>
                <Text style={[styles.cardStatTitle, { color: textGrey }]}>
                  {t('work_duration') || 'Duration of Work'}
                </Text>
                <Text style={[styles.cardStatValue, { color: textWhite }]}>
                  {dailySummary?.workHours ?? 0} {t('hours_unit') || 'h'}
                </Text>
              </View>
            </View>
          </WalletCard>
        </View>

        {/* Loading Overlay inside the Scroll if fetching summaries */}
        {isLoadingIncome && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={LIME_GREEN} />
          </View>
        )}

        {/* ─── 2. Weekly Bar Chart ────────────────────────────────────── */}
        <View style={styles.cardWrapper}>
          <WalletCard style={[styles.chartCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[styles.sectionTitle, { color: textWhite, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('weekly_chart_title')}
            </Text>

            <View style={styles.chartBlock}>
              {weeklyChartData.map((d, index) => {
                const isActiveDay = d.date.toDateString() === activeDate.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.chartRow, isRTL && styles.rtlRow]}
                    onPress={() => setActiveDate(d.date)}
                    activeOpacity={0.8}
                  >
                    {/* Day label */}
                    <Text
                      style={[
                        styles.chartDayText,
                        { color: textWhite, textAlign: isRTL ? 'right' : 'left' },
                        isActiveDay && { color: LIME_GREEN, fontWeight: '800' }
                      ]}
                    >
                      {d.dayName}
                    </Text>

                    {/* Progress Bar Column */}
                    <View style={styles.chartBarWrapper}>
                      <View style={[styles.chartBarBg, { backgroundColor: progressBg }]}>
                        <View
                          style={[
                            styles.chartBarFill,
                            {
                              width: `${d.ratio * 100}%`,
                              backgroundColor: isActiveDay ? LIME_GREEN : colors.primary
                            }
                          ]}
                        />
                      </View>
                    </View>

                    {/* Amount */}
                    <Text style={[styles.chartValText, { color: textWhite, textAlign: isRTL ? 'left' : 'right' }, isActiveDay && { color: LIME_GREEN, fontWeight: '800' }]}>
                      {d.income.toFixed(2)} {t('currency_symbol')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </WalletCard>
        </View>
        {/* ─── 3. Target Setting Card ─── */}
        <View style={styles.cardWrapper}>
          <WalletCard style={[styles.goalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            {goalValue === null ? (
              // Start State: Not set
              <TouchableOpacity
                onPress={() => {
                  setTempGoalInput('500');
                  setGoalModalVisible(true);
                }}
                style={[styles.goalContainerStart, isRTL && styles.rtlRow]}
                activeOpacity={0.85}
              >
                <View style={styles.goalInfoLeft}>
                  <Text style={[styles.goalHeaderTitle, { color: textWhite, textAlign: isRTL ? 'right' : 'left' }]}>
                    🎯 {t('set_your_goal') || 'حدد هدفك'}
                  </Text>
                  <Text style={[styles.goalDescText, { color: textGrey, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('set_goal_desc') || 'حدد هدفاً يومياً أو أسبوعياً وتابع نسبة تحقيقه.'}
                  </Text>
                </View>
                <ChevronRight size={24} color={LIME_GREEN} style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
              </TouchableOpacity>
            ) : (
              // Active Goal State: Progress bar
              <View style={styles.goalContainerActive}>
                <View style={[styles.goalHeaderActiveRow, isRTL && styles.rtlRow]}>
                  <View style={[styles.goalLeftInfo, isRTL ? styles.rtlAlignRight : styles.ltrAlignLeft]}>
                    <Text style={[styles.goalLabelText, { color: textGrey }]}>
                      {goalMode === 'daily' ? t('daily_goal') : t('weekly_goal')}
                    </Text>
                    <Text style={[styles.goalGoalVal, { color: textWhite }]}>
                      {goalValue} {t('currency_symbol')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setTempGoalInput(goalValue.toString());
                      setGoalModalVisible(true);
                    }}
                    style={styles.editGoalBtn}
                  >
                    <Text style={{ color: LIME_GREEN, fontSize: 13, fontWeight: '700' }}>
                      {t('edit')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Progress bar fill */}
                <View style={styles.goalProgressBarContainer}>
                  <View style={[styles.goalProgressBg, { backgroundColor: progressBg }]}>
                    <View
                      style={[
                        styles.goalProgressFill,
                        { width: `${goalProgress}%`, backgroundColor: LIME_GREEN }
                      ]}
                    />
                  </View>
                  <View style={[styles.goalDetailsRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.goalDetailsLabel, { color: textGrey }]}>
                      {t('completed')}: {goalMode === 'daily' ? (dailySummary?.netIncome ?? 0) : (weeklySummary?.totalNetIncome ?? 0)} / {goalValue} {t('currency_symbol')}
                    </Text>
                    <Text style={[styles.goalPercentageText, { color: LIME_GREEN }]}>
                      {goalProgress}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </WalletCard>
        </View>

        {/* ─── 4. Activity Statistics List ────────────────────────────── */}
        <View style={styles.cardWrapper}>
          <WalletCard style={[styles.statsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[styles.sectionTitle, { color: textWhite, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('activity_section') || 'Activity'}
            </Text>

            <View style={styles.statsCustomList}>
              {/* Gross Income */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <DollarSign size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('gross_income')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.grossIncome ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Net Income */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <CheckCircle2 size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('net_income')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: LIME_GREEN, fontWeight: '800' }]}>
                  {formatCurrency(dailySummary?.netIncome ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Rides */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Car size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('number_of_rides') || 'Number of Rides'}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {dailySummary?.ridesCount ?? 0}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Work Hours */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Clock size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('work_duration') || 'Duration of Work'}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {dailySummary?.workHours ?? 0} {t('hours_unit') || 'h'}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Average Profit per Ride */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <DollarSign size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('avg_profit_per_ride') || 'Average per Ride'}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.avgProfitPerRide ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Commission */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Percent size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('total_commissions')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.totalCommissions ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Taxes */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Percent size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('total_taxes')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.totalTaxes ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Fees */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Percent size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('total_fees')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {formatCurrency(dailySummary?.totalFees ?? 0, 'MAD')}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Distance Covered */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Navigation size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('distance_covered') || 'Distance Covered'}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {dailySummary?.distanceCovered ?? 0} {t('distance_unit') || 'km'}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Best Day of Week (Weekly Property) */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Calendar size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('best_day_week')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {weeklySummary?.bestDay && weeklySummary.bestDay !== '--' ? t(weeklySummary.bestDay) : '--'}
                </Text>
              </View>
              <View style={[styles.fieldDivider, { backgroundColor: borderCol }]} />

              {/* Peak Hour (Weekly Property) */}
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <View style={[styles.statFieldLeft, isRTL && styles.rtlRow]}>
                  <Zap size={16} color={LIME_GREEN} />
                  <Text style={[styles.statFieldKeyLabel, { color: textGrey }]}>
                    {t('weekly_peak_hours')}
                  </Text>
                </View>
                <Text style={[styles.statFieldValue, { color: textWhite }]}>
                  {weeklySummary?.peakHour ?? '--'}
                </Text>
              </View>
            </View>
          </WalletCard>
        </View>

      </ScrollView>

      {/* ─── 5. Target Select Modal (Bottom Sheet style) ──────────────── */}
      <Modal
        visible={goalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: sheetBgColor }]}>
            {/* Header */}
            <View style={[styles.modalHeader, isRTL && styles.rtlRow]}>
              <Text style={[styles.modalTitle, { color: textWhite }]}>
                🎯 {t('goal_dialog_title')}
              </Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={textWhite} />
              </TouchableOpacity>
            </View>

            {/* Tabs Row */}
            <View style={[styles.tabsRow, { backgroundColor: progressBg }, isRTL && styles.rtlRow]}>
              <TouchableOpacity
                onPress={() => setGoalMode('daily')}
                style={[
                  styles.tabBtn,
                  goalMode === 'daily' && { backgroundColor: colors.surface }
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: textGrey },
                    goalMode === 'daily' && { color: colors.primary, fontWeight: '800' }
                  ]}
                >
                  {t('daily_tab')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGoalMode('weekly')}
                style={[
                  styles.tabBtn,
                  goalMode === 'weekly' && { backgroundColor: colors.surface }
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: textGrey },
                    goalMode === 'weekly' && { color: colors.primary, fontWeight: '800' }
                  ]}
                >
                  {t('weekly_tab')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textGrey, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('goal_value')} ({t('currency_symbol')})
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBg, color: textWhite, textAlign: isRTL ? 'right' : 'left' }]}
                keyboardType="numeric"
                value={tempGoalInput}
                onChangeText={setTempGoalInput}
                placeholder="500"
                placeholderTextColor={textGrey}
              />
            </View>

            {/* Save Button */}
            <WalletButton
              label={t('save_goal')}
              onPress={handleSaveGoal}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            />
          </View>
        </View>
      </Modal>

      {/* ─── 4. Achievement Celebration Modal ────────────────────────────── */}
      <Modal
        visible={celebrationVisible}
        transparent
        animationType="none"
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <Animated.View style={[styles.celebrationOverlay, { opacity: fadeAnim }]}>
          {/* Confetti Overlay */}
          {confettiParticles.map((p) => {
            const translateY = fallProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [-80, 850 * p.scale]
            });
            const rotation = fallProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${360 * p.scale}deg`]
            });
            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.confettiParticle,
                  {
                    left: `${p.left}%`,
                    backgroundColor: p.color,
                    transform: [
                      { translateY },
                      { rotate: rotation },
                      { scale: p.scale },
                    ],
                  },
                ]}
              />
            );
          })}

          <Animated.View style={[styles.celebrationCard, { transform: [{ scale: scaleAnim }], backgroundColor: sheetBgColor, borderColor: borderCol }]}>
            {/* Header Sparkles */}
            <View style={styles.celebrationSparkles}>
              <Sparkles size={24} color="#FFD700" />
              <Text style={styles.celebrationBadge}>{currentCelebration?.badge}</Text>
              <Sparkles size={24} color="#FFD700" />
            </View>

            {/* Bounce Trophy wrapper */}
            <Animated.View style={{ transform: [{ scale: bounceAnim }], marginVertical: 12 }}>
              <Trophy size={72} color="#FFD700" style={styles.trophyShadow} />
            </Animated.View>

            {/* Title / Congrats */}
            <Text style={[styles.celebrationTitle, { color: textWhite }]}>
              {currentCelebration?.title}
            </Text>

            {/* Message */}
            <Text style={[styles.celebrationMessage, { color: textGrey }]}>
              {currentCelebration?.description}
            </Text>

            {/* Progress Container */}
            <View style={[styles.celebrationProgressBlock, { backgroundColor: cardBg }]}>
              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <Text style={{ color: textGrey, fontSize: 13 }}>{t('gross_income')}</Text>
                <Text style={{ color: textWhite, fontWeight: '700', fontSize: 14 }}>
                  {formatCurrency(currentCelebration?.value ?? 0, 'MAD')}
                </Text>
              </View>

              <View style={[styles.statRowField, isRTL && styles.rtlRow]}>
                <Text style={{ color: textGrey, fontSize: 13 }}>{t('daily_goal')}</Text>
                <Text style={{ color: textWhite, fontWeight: '700', fontSize: 14 }}>
                  {formatCurrency(currentCelebration?.goalValue ?? 500, 'MAD')}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.celebrationProgressBg}>
                <View style={[styles.celebrationProgressFill, { width: `${Math.min(currentCelebration?.ratio ?? 0, 100)}%` }]} />
              </View>

              <View style={[styles.statRowField, isRTL && styles.rtlRow, { justifyContent: 'space-between', marginTop: 4 }]}>
                <Text style={{ color: LIME_GREEN, fontWeight: '800', fontSize: 14 }}>
                  {currentCelebration?.ratio}%
                </Text>
                <Text style={{ color: textGrey, fontSize: 12 }}>{t('completed')}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.celebrationActions}>
              <TouchableOpacity
                style={[styles.celebrationsBtnPrimary, { backgroundColor: LIME_GREEN }]}
                onPress={() => setCelebrationVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.celebrationBtnPrimaryText}>
                  {t('continue_driving') || 'Continue Driving'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.celebrationsBtnSecondary, { borderColor: borderCol }]}
                onPress={() => setCelebrationVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.celebrationBtnSecondaryText, { color: textWhite }]}>
                  {t('view_income_details') || 'View Income Details'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  mainCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainIncomeVal: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  navDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextLabel: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  cardStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardStatColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  cardStatTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardStatValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  verticalDivider: {
    width: 1,
    height: 28,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  chartBlock: {
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 12,
  },
  chartDayText: {
    width: 50,
    fontSize: 12,
    fontWeight: '700',
  },
  chartBarWrapper: {
    flex: 1,
  },
  chartBarBg: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  chartValText: {
    width: 75,
    fontSize: 11,
    fontWeight: '700',
  },
  goalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  goalContainerStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  goalInfoLeft: {
    flex: 1,
    gap: 6,
  },
  goalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  goalDescText: {
    fontSize: 12,
    lineHeight: 18,
  },
  goalContainerActive: {
    gap: 16,
  },
  goalHeaderActiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLeftInfo: {
    gap: 4,
  },
  goalLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  goalGoalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  editGoalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 224, 52, 0.08)',
  },
  goalProgressBarContainer: {
    gap: 8,
  },
  goalProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDetailsLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalPercentageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  statsCustomList: {
    gap: 12,
  },
  statRowField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statFieldKeyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statFieldValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Modal Sheet Styles ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  celebrationSparkles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  celebrationBadge: {
    fontSize: 28,
  },
  trophyShadow: {
    shadowColor: 'rgba(255, 215, 0, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  celebrationMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  celebrationProgressBlock: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    gap: 8,
  },
  celebrationProgressBg: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 4,
  },
  celebrationProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#8BE034',
  },
  celebrationActions: {
    width: '100%',
    gap: 12,
  },
  celebrationsBtnPrimary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationBtnPrimaryText: {
    color: '#121319',
    fontSize: 15,
    fontWeight: '800',
  },
  celebrationsBtnSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.85,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlAlignRight: {
    alignItems: 'flex-end',
  },
  ltrAlignLeft: {
    alignItems: 'flex-start',
  },
});
