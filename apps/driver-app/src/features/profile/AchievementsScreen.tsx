import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Zap,
  ShieldCheck,
  TrendingUp,
  Layers,
  Crown,
  Calendar,
  Sparkles,
  Inbox,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';

const { width: SCREEN_W } = Dimensions.get('window');

export interface AchievementItem {
  id: string;
  iconName: string;
  title: { ar: string; fr: string; es: string; en: string };
  description: { ar: string; fr: string; es: string; en: string };
  isUnlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  targetProgress: number;
  category: 'rides' | 'rating' | 'commitment' | 'level';
}

// ── 4 Languages Localization ──────────────────────────────────────────────────
const TRANSLATIONS: any = {
  ar: {
    achievements_title: 'الإنجازات',
    current_level_lbl: 'المستوى الحالي: ',
    view_level_btn: 'عرض مستوى السائق',
    summary_title: 'تقدم الإنجازات',
    unlocked_count: 'تم إنجاز {{count}} من أصل {{total}}',
    earned_section: '🏆 الإنجازات المكتسبة',
    in_progress_section: '⏳ إنجازات قيد التقدم',
    unlocked_on: 'تم الحصول عليه في {{date}}',
    empty_title: 'لا توجد إنجازات حتى الآن.',
    empty_desc: 'أكمل أول رحلة مع Yalla VTC لتبدأ رحلتك في جمع الإنجازات.',
    loading: 'جاري تحميل الإنجازات...',
    level_gold: 'الذهبي (Gold)',
    level_silver: 'الفضي (Silver)',
    level_bronze: 'البرونزي (Bronze)',
    level_platinum: 'الماسي (Platinum)',
  },
  fr: {
    achievements_title: 'Succès et Récompenses',
    current_level_lbl: 'Niveau actuel : ',
    view_level_btn: 'Voir niveau chauffeur',
    summary_title: 'Progression globale',
    unlocked_count: '{{count}} sur {{total}} débloqués',
    earned_section: '🏆 Succès Débloqués',
    in_progress_section: '⏳ En cours de réalisation',
    unlocked_on: 'Obtenu le {{date}}',
    empty_title: 'Aucun succès pour le moment.',
    empty_desc: 'Effectuez votre première course avec Yalla VTC pour commencer à débloquer vos trophées.',
    loading: 'Chargement des succès...',
    level_gold: 'Or (Gold)',
    level_silver: 'Argent (Silver)',
    level_bronze: 'Bronze',
    level_platinum: 'Platine (Platinum)',
  },
  es: {
    achievements_title: 'Logros y Reconocimientos',
    current_level_lbl: 'Nivel actual: ',
    view_level_btn: 'Ver nivel de conductor',
    summary_title: 'Progreso global',
    unlocked_count: '{{count}} de {{total}} desbloqueados',
    earned_section: '🏆 Logros Conseguidos',
    in_progress_section: '⏳ En progreso',
    unlocked_on: 'Conseguido el {{date}}',
    empty_title: 'Sin logros todavía.',
    empty_desc: 'Complete su primer viaje con Yalla VTC para empezar a desbloquear insignias.',
    loading: 'Cargando logros...',
    level_gold: 'Oro (Gold)',
    level_silver: 'Plata (Silver)',
    level_bronze: 'Bronce',
    level_platinum: 'Platino (Platinum)',
  },
  en: {
    achievements_title: 'Achievements',
    current_level_lbl: 'Current Level: ',
    view_level_btn: 'View Driver Level',
    summary_title: 'Overall Progress',
    unlocked_count: '{{count}} of {{total}} unlocked',
    earned_section: '🏆 Earned Achievements',
    in_progress_section: '⏳ In-Progress Achievements',
    unlocked_on: 'Unlocked on {{date}}',
    empty_title: 'No achievements yet.',
    empty_desc: 'Complete your first ride with Yalla VTC to start unlocking achievements.',
    loading: 'Loading achievements...',
    level_gold: 'Gold',
    level_silver: 'Silver',
    level_bronze: 'Bronze',
    level_platinum: 'Platinum',
  },
};

const getTr = (key: string, lang: string, params?: any) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  let str = TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
  if (params) {
    Object.keys(params).forEach((p) => {
      str = str.replace(`{{${p}}}`, params[p]);
    });
  }
  return str;
};

// ── Built-in Master Achievements List ──────────────────────────────────────────
const MASTER_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-01',
    iconName: 'Zap',
    title: { ar: 'أول رحلة مكتملة', fr: 'Première course terminée', es: 'Primer viaje completado', en: 'First Completed Ride' },
    description: { ar: 'إكمال أول رحلة لك بنجاح مع ركاب Yalla VTC.', fr: 'Effectuer votre toute première course avec un passager.', es: 'Completar su primer viaje con un pasajero.', en: 'Successfully complete your very first ride with passengers.' },
    isUnlocked: true,
    unlockedAt: '2026-05-10',
    currentProgress: 1,
    targetProgress: 1,
    category: 'rides',
  },
  {
    id: 'ach-02',
    iconName: 'Award',
    title: { ar: 'إكمال 10 رحلات', fr: '10 Courses effectuées', es: '10 Viajes completados', en: '10 Completed Rides' },
    description: { ar: 'الوصول إلى 10 رحلات ناجحة ومكتملة.', fr: 'Atteindre le cap des 10 courses réussies.', es: 'Alcanzar los 10 viajes con éxito.', en: 'Reach the milestone of 10 completed rides.' },
    isUnlocked: true,
    unlockedAt: '2026-05-18',
    currentProgress: 10,
    targetProgress: 10,
    category: 'rides',
  },
  {
    id: 'ach-03',
    iconName: 'Trophy',
    title: { ar: 'إكمال 50 رحلة', fr: '50 Courses effectuées', es: '50 Viajes completados', en: '50 Completed Rides' },
    description: { ar: 'قطع 50 رحلة احترافية بنجاح على المنصة.', fr: 'Réaliser 50 courses professionnelles avec succès.', es: 'Realizar 50 viajes profesionales con éxito.', en: 'Complete 50 professional rides on the platform.' },
    isUnlocked: true,
    unlockedAt: '2026-06-25',
    currentProgress: 50,
    targetProgress: 50,
    category: 'rides',
  },
  {
    id: 'ach-04',
    iconName: 'Star',
    title: { ar: 'أول تقييم 5 نجوم', fr: 'Premier 5 étoiles', es: 'Primera calificación 5 estrellas', en: 'First 5-Star Rating' },
    description: { ar: 'الحصول على تقييم 5 نجوم كامل من أحد الركاب.', fr: 'Recevoir une note parfaite de 5 étoiles de la part d\'un passager.', es: 'Recibir una puntuación perfecta de 5 estrellas de un pasajero.', en: 'Receive a perfect 5-star rating from a passenger.' },
    isUnlocked: true,
    unlockedAt: '2026-05-12',
    currentProgress: 1,
    targetProgress: 1,
    category: 'rating',
  },
  {
    id: 'ach-05',
    iconName: 'ShieldCheck',
    title: { ar: 'أسبوع بدون إلغاء', fr: 'Semaine sans annulation', es: 'Semana sin cancelaciones', en: '1 Week Zero Cancellations' },
    description: { ar: 'العمل لمدة أسبوع كامل دون أي إلغاء للرحلات.', fr: 'Conduire pendant une semaine entière sans aucune annulation.', es: 'Conducir durante una semana completa sin cancelaciones.', en: 'Drive for a full week without any ride cancellations.' },
    isUnlocked: true,
    unlockedAt: '2026-07-02',
    currentProgress: 7,
    targetProgress: 7,
    category: 'commitment',
  },
  {
    id: 'ach-06',
    iconName: 'Crown',
    title: { ar: 'سائق متميز', fr: 'Chauffeur d\'Élite', es: 'Conductor Destacado', en: 'Outstanding Driver' },
    description: { ar: 'الحفاظ على تقييم 4.8 أو أعلى لجميع الرحلات.', fr: 'Maintenir une évaluation supérieure ou égale à 4.8.', es: 'Mantener una valoración superior o igual a 4.8.', en: 'Maintain an average rating of 4.8 or higher.' },
    isUnlocked: true,
    unlockedAt: '2026-07-15',
    currentProgress: 4.9,
    targetProgress: 4.8,
    category: 'rating',
  },
  {
    id: 'ach-07',
    iconName: 'TrendingUp',
    title: { ar: 'إكمال 100 رحلة', fr: '100 Courses effectuées', es: '100 Viajes completados', en: '100 Completed Rides' },
    description: { ar: 'الوصول إلى إنجاز 100 رحلة ناجحة.', fr: 'Franchir le cap des 100 courses accomplies.', es: 'Alcanzar el hito de 100 viajes completados.', en: 'Reach the milestone of 100 completed rides.' },
    isUnlocked: false,
    currentProgress: 72,
    targetProgress: 100,
    category: 'rides',
  },
  {
    id: 'ach-08',
    iconName: 'Sparkles',
    title: { ar: 'إكمال 250 رحلة', fr: '250 Courses effectuées', es: '250 Viajes completados', en: '250 Completed Rides' },
    description: { ar: 'الوصول إلى 250 رحلة مكتملة بثبات واحترافية.', fr: 'Atteindre 250 courses effectuées avec excellence.', es: 'Completar 250 viajes con excelencia.', en: 'Complete 250 rides with consistent excellence.' },
    isUnlocked: false,
    currentProgress: 72,
    targetProgress: 250,
    category: 'rides',
  },
  {
    id: 'ach-09',
    iconName: 'Trophy',
    title: { ar: 'إكمال 500 رحلة', fr: '500 Courses effectuées', es: '500 Viajes completados', en: '500 Completed Rides' },
    description: { ar: 'الوصول إلى النادي الذهبي المكون من 500 رحلة.', fr: 'Rejoindre le club d\'élite des 500 courses.', es: 'Unirse al club de élite de 500 viajes.', en: 'Join the elite 500 rides club.' },
    isUnlocked: false,
    currentProgress: 72,
    targetProgress: 500,
    category: 'rides',
  },
  {
    id: 'ach-10',
    iconName: 'Calendar',
    title: { ar: 'شهر بدون مخالفات', fr: 'Mois sans infraction', es: 'Mes sin infracciones', en: '1 Month Zero Violations' },
    description: { ar: 'السياقة بإنضباط تام لمدة 30 يوماً دون أي تنبيهات.', fr: 'Conduire avec une discipline irréprochable pendant 30 jours.', es: 'Conducir con perfecta disciplina durante 30 días.', en: 'Drive with perfect discipline for 30 consecutive days.' },
    isUnlocked: false,
    currentProgress: 21,
    targetProgress: 30,
    category: 'commitment',
  },
];

export const AchievementsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('Gold');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      // Attempt backend API fetch
      let fetched: AchievementItem[] = [];
      try {
        const res = await api.get('/driver/achievements');
        if (res.data && Array.isArray(res.data.items)) {
          fetched = res.data.items;
        }
        if (res.data?.level) setCurrentLevel(res.data.level);
      } catch (e) {
        // Graceful fallback
      }

      if (fetched.length === 0) {
        fetched = MASTER_ACHIEVEMENTS;
      }
      setAchievements(fetched);
    } catch (err) {
      console.warn('[AchievementsScreen] fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
  };

  const unlockedList = useMemo(() => achievements.filter((a) => a.isUnlocked), [achievements]);
  const inProgressList = useMemo(() => achievements.filter((a) => !a.isUnlocked), [achievements]);
  const progressPct = useMemo(() => {
    if (achievements.length === 0) return 0;
    return Math.round((unlockedList.length / achievements.length) * 100);
  }, [unlockedList, achievements]);

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const color = isUnlocked ? colors.primary : colors.textMuted;
    switch (iconName) {
      case 'Zap': return <Zap size={22} color={isUnlocked ? '#F59E0B' : color} />;
      case 'Award': return <Award size={22} color={isUnlocked ? '#3B82F6' : color} />;
      case 'Trophy': return <Trophy size={22} color={isUnlocked ? '#EAB308' : color} />;
      case 'Star': return <Star size={22} color={isUnlocked ? '#F59E0B' : color} fill={isUnlocked ? '#F59E0B' : 'transparent'} />;
      case 'ShieldCheck': return <ShieldCheck size={22} color={isUnlocked ? '#22C55E' : color} />;
      case 'Crown': return <Crown size={22} color={isUnlocked ? '#EC4899' : color} />;
      case 'Sparkles': return <Sparkles size={22} color={isUnlocked ? '#A855F7' : color} />;
      case 'TrendingUp': return <TrendingUp size={22} color={color} />;
      default: return <Award size={22} color={color} />;
    }
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {getTr('achievements_title', lang)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Driver Level Header Bar */}
      <View style={[styles.levelBar, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Layers size={18} color="#EAB308" />
          <Text style={[styles.levelBarText, { color: colors.textPrimary }]}>
            {getTr('current_level_lbl', lang)}
            <Text style={{ color: '#EAB308', fontWeight: '800' }}>{currentLevel}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.levelBtn, { backgroundColor: 'rgba(234,179,8,0.12)', borderColor: '#EAB308' }]}
          onPress={() => navigation.navigate('DriverLevel')}
        >
          <Text style={styles.levelBtnText}>{getTr('view_level_btn', lang)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Progress Summary Hero Card */}
        <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1E293B' : '#0F172A' }]}>
          <View style={[styles.summaryTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View>
              <Text style={styles.summaryTitle}>{getTr('summary_title', lang)}</Text>
              <Text style={styles.summaryCount}>
                {getTr('unlocked_count', lang, { count: unlockedList.length, total: achievements.length })}
              </Text>
            </View>
            <Text style={styles.summaryPct}>{progressPct}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {getTr('loading', lang)}
            </Text>
          </View>
        ) : achievements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Trophy size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitleText, { color: colors.textPrimary }]}>
              {getTr('empty_title', lang)}
            </Text>
            <Text style={[styles.emptyDescText, { color: colors.textMuted }]}>
              {getTr('empty_desc', lang)}
            </Text>
          </View>
        ) : (
          <>
            {/* Section 1: Earned Achievements */}
            {unlockedList.length > 0 && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {getTr('earned_section', lang)}
                </Text>

                {unlockedList.map((item) => {
                  const title = item.title[lang as keyof typeof item.title] || item.title.ar;
                  const desc = item.description[lang as keyof typeof item.description] || item.description.ar;
                  return (
                    <View
                      key={item.id}
                      style={[styles.achCard, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
                    >
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                        {getBadgeIcon(item.iconName, true)}
                      </View>

                      <View style={[{ flex: 1, marginHorizontal: 12 }, isRTL && { alignItems: 'flex-end' }]}>
                        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                          <Text style={[styles.achTitle, { color: colors.textPrimary }]}>{title}</Text>
                          <CheckCircle2 size={16} color="#22C55E" />
                        </View>
                        <Text style={[styles.achDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                          {desc}
                        </Text>
                        {item.unlockedAt && (
                          <Text style={[styles.unlockedDateText, { color: colors.textMuted }]}>
                            {getTr('unlocked_on', lang, { date: item.unlockedAt })}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Section 2: In-Progress Achievements */}
            {inProgressList.length > 0 && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {getTr('in_progress_section', lang)}
                </Text>

                {inProgressList.map((item) => {
                  const title = item.title[lang as keyof typeof item.title] || item.title.ar;
                  const desc = item.description[lang as keyof typeof item.description] || item.description.ar;
                  const pct = Math.min(100, Math.round((item.currentProgress / item.targetProgress) * 100));

                  return (
                    <View
                      key={item.id}
                      style={[styles.achCard, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
                    >
                      <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
                        {getBadgeIcon(item.iconName, false)}
                      </View>

                      <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={[styles.achTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
                        <Text style={[styles.achDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                          {desc}
                        </Text>

                        {/* Progress Bar & Counter */}
                        <View style={{ marginTop: 10 }}>
                          <View style={[styles.cardProgHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.cardProgText, { color: colors.textMuted }]}>
                              {item.currentProgress} / {item.targetProgress}
                            </Text>
                            <Text style={[styles.cardProgPct, { color: colors.primary }]}>{pct}%</Text>
                          </View>
                          <View style={[styles.cardProgTrack, { backgroundColor: colors.surfaceAlt }]}>
                            <View style={[styles.cardProgFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  levelBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  levelBarText: { fontSize: 13.5, fontWeight: '600' },
  levelBtn: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  levelBtnText: { fontSize: 12, fontWeight: '700', color: '#EAB308' },
  scrollContent: { padding: 16 },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
  },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  summaryTitle: { color: '#94A3B8', fontSize: 12.5, fontWeight: '600', marginBottom: 2 },
  summaryCount: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  summaryPct: { color: '#4ADE80', fontSize: 24, fontWeight: '800' },
  progressBarTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  sectionWrap: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  achCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  achTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  achDesc: { fontSize: 12.5, lineHeight: 17, marginBottom: 4 },
  unlockedDateText: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  cardProgHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardProgText: { fontSize: 11.5, fontWeight: '600' },
  cardProgPct: { fontSize: 11.5, fontWeight: '700' },
  cardProgTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  cardProgFill: { height: '100%', borderRadius: 3 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 60 },
  loadingText: { fontSize: 13.5, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitleText: { fontSize: 17, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  emptyDescText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
});

export default AchievementsScreen;
