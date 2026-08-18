import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Award,
  Layers,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Star,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

const TRANSLATIONS: any = {
  ar: {
    driver_level_title: 'مستوى السائق والمزايا',
    current_level: 'المستوى الحالي',
    level_gold: 'الذهبـي (Gold)',
    level_gold_sub: 'أداء متميز وتغطية ممتازة للرحلات 🌟',
    perks_title: '🎁 مزايا المستوى الحالي',
    perk1: 'خصم خاص على عمولة المنصة 2%',
    perk2: 'أولوية استقبال الطلبات القريبة والعالية القيمة',
    perk3: 'دعم فني مخصص ومباشر على مدار 24 ساعة',
    next_level_title: 'الوصول للمستوى الماسي (Platinum)',
    next_level_desc: 'أكمل 28 رحلة أخرى هذا الشهر للترقية للمستوى الماسي والاستمتاع بأعلى المزايا.',
    all_levels_title: 'مستويات المنصة والمزايا',
    bronze_level: 'البرونزي (Bronze)',
    silver_level: 'الفضي (Silver)',
    gold_level: 'الذهبي (Gold)',
    platinum_level: 'الماسي (Platinum)',
  },
  fr: {
    driver_level_title: 'Niveau Chauffeur & Privilèges',
    current_level: 'Niveau Actuel',
    level_gold: 'Or (Gold)',
    level_gold_sub: 'Excellente performance et haute fiabilité 🌟',
    perks_title: '🎁 Avantages du niveau actuel',
    perk1: 'Réduction de 2% sur la commission plateforme',
    perk2: 'Priorité d\'attribution des courses à haute valeur',
    perk3: 'Support chauffeur prioritaire 24h/7j',
    next_level_title: 'Passer au niveau Platine (Platinum)',
    next_level_desc: 'Effectuez 28 courses de plus ce mois-ci pour passer Platine.',
    all_levels_title: 'Tous les niveaux & Avantages',
    bronze_level: 'Bronze',
    silver_level: 'Argent (Silver)',
    gold_level: 'Or (Gold)',
    platinum_level: 'Platine (Platinum)',
  },
  es: {
    driver_level_title: 'Nivel del Conductor y Beneficios',
    current_level: 'Nivel Actual',
    level_gold: 'Oro (Gold)',
    level_gold_sub: 'Excelente rendimiento y alta confiabilidad 🌟',
    perks_title: '🎁 Beneficios de su nivel actual',
    perk1: 'Descuento del 2% en la comisión de plataforma',
    perk2: 'Prioridad en solicitudes de alto valor',
    perk3: 'Soporte prioritario 24/7',
    next_level_title: 'Avanzar al nivel Platino (Platinum)',
    next_level_desc: 'Complete 28 viajes más este mes para subir a Platino.',
    all_levels_title: 'Todos los niveles y beneficios',
    bronze_level: 'Bronce',
    silver_level: 'Plata (Silver)',
    gold_level: 'Oro (Gold)',
    platinum_level: 'Platino (Platinum)',
  },
  en: {
    driver_level_title: 'Driver Level & Perks',
    current_level: 'Current Level',
    level_gold: 'Gold',
    level_gold_sub: 'Outstanding performance & high reliability 🌟',
    perks_title: '🎁 Current Level Benefits',
    perk1: '2% Discount on platform commission',
    perk2: 'Priority dispatch for high-value rides',
    perk3: 'Dedicated 24/7 priority support line',
    next_level_title: 'Progress to Platinum Level',
    next_level_desc: 'Complete 28 more rides this month to upgrade to Platinum.',
    all_levels_title: 'Platform Tier Levels',
    bronze_level: 'Bronze',
    silver_level: 'Silver',
    gold_level: 'Gold',
    platinum_level: 'Platinum',
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
};

export const DriverLevelScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

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
          {getTr('driver_level_title', lang)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Level Hero Card */}
        <View style={[styles.levelHeroCard, { backgroundColor: '#1E293B' }]}>
          <View style={[styles.crownBox, { backgroundColor: 'rgba(234,179,8,0.18)' }]}>
            <Crown size={32} color="#EAB308" />
          </View>
          <Text style={styles.levelHeroSub}>{getTr('current_level', lang)}</Text>
          <Text style={styles.levelHeroTitle}>{getTr('level_gold', lang)}</Text>
          <Text style={styles.levelHeroDesc}>{getTr('level_gold_sub', lang)}</Text>
        </View>

        {/* Perks Section */}
        <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {getTr('perks_title', lang)}
          </Text>

          {['perk1', 'perk2', 'perk3'].map((pKey, pIdx) => (
            <View key={pIdx} style={[styles.perkRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <CheckCircle2 size={18} color="#22C55E" style={{ marginTop: 2 }} />
              <Text style={[styles.perkText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {getTr(pKey, lang)}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress to Next Level */}
        <View style={[styles.cardSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            🚀 {getTr('next_level_title', lang)}
          </Text>
          <Text style={[styles.nextDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {getTr('next_level_desc', lang)}
          </Text>

          <View style={{ marginTop: 12 }}>
            <View style={[styles.progHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.progText, { color: colors.textMuted }]}>72 / 100 Trips</Text>
              <Text style={[styles.progPct, { color: colors.primary }]}>72%</Text>
            </View>
            <View style={[styles.progTrack, { backgroundColor: colors.surfaceAlt }]}>
              <View style={[styles.progFill, { width: '72%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

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
  scrollContent: { padding: 16 },
  levelHeroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 4,
  },
  crownBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  levelHeroSub: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  levelHeroTitle: { color: '#EAB308', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  levelHeroDesc: { color: '#CBD5E1', fontSize: 13, textAlign: 'center' },
  cardSection: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  perkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  perkText: { fontSize: 13, flex: 1, lineHeight: 18 },
  nextDesc: { fontSize: 13, lineHeight: 18 },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progText: { fontSize: 12, fontWeight: '600' },
  progPct: { fontSize: 12, fontWeight: '700' },
  progTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 4 },
});

export default DriverLevelScreen;
