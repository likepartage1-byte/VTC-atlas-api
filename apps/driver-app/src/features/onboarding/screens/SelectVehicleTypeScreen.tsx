import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { DrawerHeader } from '../../../components/DrawerHeader';

export interface VehicleOption {
  id: 'MOTORCYCLE' | 'TAXI' | 'CAR' | 'TRUCK';
  emoji: string;
  titleAr: string;
  titleEn: string;
  descAr: string[];
  descEn: string[];
  route: string;
  badge?: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'MOTORCYCLE',
    emoji: '🏍️',
    titleAr: 'دراجة نارية (Motorcycle)',
    titleEn: 'Motorcycle',
    descAr: ['نقل الركاب بالدراجة', 'توصيل الطرود والمستندات'],
    descEn: ['Passenger Transport', 'Parcel & Document Delivery'],
    route: 'MotorcycleInfo',
    badge: 'Phase 1 Active',
  },
  {
    id: 'TAXI',
    emoji: '🚕',
    titleAr: 'سيارة أجرة (Taxi)',
    titleEn: 'Taxi Driver',
    descAr: ['استقبال طلبات التاكسي فقط', 'عداد الرحلات والتنقل في المدينة'],
    descEn: ['Taxi Requests Only', 'City Travel & Metering'],
    route: 'VehicleInfo',
  },
  {
    id: 'CAR',
    emoji: '🚗',
    titleAr: 'سيارة سياحية (VTC)',
    titleEn: 'VTC / Private Car',
    descAr: ['استقبال طلبات النقل الخاص والرحلات بين المدن', 'سيارات الفئة العادية والـ VIP'],
    descEn: ['Private VTC Rides & Intercity', 'Economy & VIP Categories'],
    route: 'VehicleInfo',
  },
  {
    id: 'TRUCK',
    emoji: '🚚',
    titleAr: 'سيارة نفعية / شاحنة (Freight & Cargo)',
    titleEn: 'Freight & Cargo Truck',
    descAr: ['الشحن والنقل والخدمات اللوجستية', 'نقل البضائع والأثاث'],
    descEn: ['Cargo & Logistics Transport', 'Furniture & Heavy Goods'],
    route: 'FreightCargo',
  },
];

import { setVehicleModeCache } from '../../../hooks/useVehicleMode';

export const SelectVehicleTypeScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const handleSelect = (option: VehicleOption) => {
    setVehicleModeCache(option.id);
    navigation.navigate(option.route as never);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* App Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topNavTitle, { color: colors.textPrimary }]}>
          {isRTL ? 'تسجيل سائق جديد' : 'Driver Registration'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            {isRTL ? 'اختر نوع المركبة التي ستعمل بها' : 'Select your Vehicle Category'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isRTL
              ? 'سيقوم النظام بفتح نموذج التسجيل والوثائق المخصصة لهذه المركبة فقط'
              : 'The system will load the dedicated registration & docs for this vehicle only'}
          </Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {VEHICLE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                opt.id === 'MOTORCYCLE' && { borderColor: '#FF6B1A', borderWidth: 2 },
              ]}
              activeOpacity={0.85}
              onPress={() => handleSelect(opt)}
            >
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 36 }}>{opt.emoji}</Text>
                <View style={styles.cardTextCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                      {isRTL ? opt.titleAr : opt.titleEn}
                    </Text>
                    {opt.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{opt.badge}</Text>
                      </View>
                    )}
                  </View>
                  {(isRTL ? opt.descAr : opt.descEn).map((desc, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={{ color: '#FF6B1A', fontSize: 12 }}>• </Text>
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{desc}</Text>
                    </View>
                  ))}
                </View>
                <Chevron size={22} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  topNavTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginVertical: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionsList: {
    gap: 14,
    marginTop: 8,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#FF6B1A18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B1A',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bulletText: {
    fontSize: 12,
  },
});
