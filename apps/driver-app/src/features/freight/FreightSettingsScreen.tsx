import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Volume2,
  Vibrate,
  ShieldCheck,
  Check,
  Package,
  MapPin,
  Circle,
  CheckSquare,
  Square,
  DollarSign,
  Navigation as NavIcon,
  RefreshCw,
  Sliders,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MOROCCAN_CITIES, MoroccanCity } from './FreightCargoScreen';

export const FreightSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors = AtlasLightColors, isDarkMode = false } = useTheme() || {};

  const { i18n } = useTranslation();
  const lang = (i18n.language || 'ar').slice(0, 2);
  const isRTL = lang === 'ar';

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>('300');
  const [minFareDH, setMinFareDH] = useState<string>('200');

  const [selectedCities, setSelectedCities] = useState<string[]>(['casablanca', 'rabat', 'marrakech']);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['small_truck', 'utility_van']);

  const toggleCity = (cityId: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId]
    );
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((v) => v !== vehicleId) : [...prev, vehicleId]
    );
  };

  const handleSaveSettings = async () => {
    Vibration.vibrate(40);
    try {
      await AsyncStorage.setItem('@yalla_freight_settings_cities', JSON.stringify(selectedCities));
      await AsyncStorage.setItem('@yalla_freight_settings_vehicles', JSON.stringify(selectedVehicles));
      Alert.alert('✅ تم حفظ التفضيلات', 'تم تحديث تفضيلات الشحن والنقل الخاصة بك بنجاح.');
      navigation.goBack();
    } catch (err) {
      console.log('Error saving freight settings:', err);
    }
  };

  const topPadding = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 12);

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* HEADER BAR */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ⚙️ إعدادات الشحن والنقل
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* NOTIFICATION SETTINGS */}
        <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            🔔 الإشعارات والتنبيهات
          </Text>

          <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.rowTxt, { color: colors.textPrimary }]}>تنبيهات صوتية فورية</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#94A3B8', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.rowTxt, { color: colors.textPrimary }]}>اهتزاز الجهاز عند وصول طلب جديد</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#94A3B8', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* CITY COVERAGE */}
        <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            🗺️ مدن التغطية والاستقبال
          </Text>
          <Text style={[styles.subTxt, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', marginBottom: 12 }]}>
            حدد المدن التي ترغب باستقبال طلبات الشحن منها وإليها:
          </Text>

          <View style={styles.grid}>
            {MOROCCAN_CITIES.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              return (
                <TouchableOpacity
                  key={city.id}
                  activeOpacity={0.8}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: isSelected ? colors.primary + '18' : colors.surfaceAlt,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleCity(city.id)}
                >
                  <Text style={[styles.chipTxt, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                    {isSelected ? '✓ ' : ''}{city.nameAr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* VEHICLE TYPES PREFERENCES */}
        <View style={[styles.card3D, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            🚚 أنواع المركبات المقبولة لديك
          </Text>

          {[
            { id: 'small_truck', label: '🚚 شاحنة صغيرة' },
            { id: 'medium_truck', label: '🚛 شاحنة متوسطة' },
            { id: 'large_truck', label: '🚛 شاحنة كبيرة' },
            { id: 'utility_van', label: '🚐 سيارة نفعية (Fourgon)' },
          ].map((item) => {
            const isChecked = selectedVehicles.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.checkRow, isRTL && { flexDirection: 'row-reverse' }]}
                onPress={() => toggleVehicle(item.id)}
              >
                <Text style={[styles.checkTxt, { color: colors.textPrimary }]}>{item.label}</Text>
                <View style={[styles.checkIcon, { backgroundColor: isChecked ? colors.primary : 'transparent', borderColor: isChecked ? colors.primary : colors.border }]}>
                  {isChecked && <Check size={14} color="#FFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveSettings}
        >
          <Check size={20} color="#FFF" />
          <Text style={styles.saveBtnTxt}>حفظ التفضيلات الإعدادية 💾</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },
  card3D: { padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  subTxt: { fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowTxt: { fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  checkTxt: { fontSize: 14, fontWeight: '600' },
  checkIcon: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 10 },
  saveBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
