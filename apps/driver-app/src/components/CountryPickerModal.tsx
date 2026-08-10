import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  I18nManager,
  Platform,
} from 'react-native';
import { ArrowLeft, ArrowRight, Search, X, Check } from 'lucide-react-native';
import {
  CountryItem,
  ALL_COUNTRIES,
  searchCountries,
  getLocalizedCountryName,
} from '../constants/countries';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryItem) => void;
  selectedCountry?: CountryItem;
  activeLang: string;
}

const PICKER_TITLES: Record<string, string> = {
  ar: 'اختر الدولة',
  fr: 'Choisir le pays',
  en: 'Select Country',
  es: 'Seleccionar país',
};

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  ar: 'ابحث عن دولة (الاسم أو رمز الاتصال)...',
  fr: 'Rechercher un pays (nom ou indicatif)...',
  en: 'Search country (name or code)...',
  es: 'Buscar país (nombre o código)...',
};

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountry,
  activeLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isRTL = I18nManager.isRTL || (activeLang || 'ar').toLowerCase().substring(0, 2) === 'ar';

  const title = PICKER_TITLES[activeLang] || PICKER_TITLES['ar'];
  const placeholder = SEARCH_PLACEHOLDERS[activeLang] || SEARCH_PLACEHOLDERS['ar'];

  const filteredData = searchCountries(searchQuery, activeLang);

  const handleSelect = (country: CountryItem) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalSheet}>
          {/* Top Sheet Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              {isRTL ? <ArrowRight size={20} color="#111827" /> : <ArrowLeft size={20} color="#111827" />}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Search Box */}
          <View style={[styles.searchContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Search size={18} color="#6B7280" />
            <TextInput
              style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Country List */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.iso2}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            renderItem={({ item, index }) => {
              const isSelected = selectedCountry?.iso2 === item.iso2;
              const countryName = getLocalizedCountryName(item, activeLang);
              const isMorocco = item.iso2 === 'MA';

              return (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    isSelected && styles.countryItemSelected,
                    isRTL && { flexDirection: 'row-reverse' },
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.flagNameRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.flagEmoji}>{item.flag}</Text>
                    <Text style={[
                      styles.countryNameText,
                      isSelected && styles.countryNameSelectedText,
                      isMorocco && styles.moroccoHighlightText,
                    ]}>
                      {countryName}
                    </Text>
                  </View>

                  <View style={[styles.dialCodeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.dialCodeText, isSelected && styles.dialCodeSelectedText]}>
                      {item.dialCode}
                    </Text>
                    {isSelected && <Check size={18} color="#683EE6" style={{ marginHorizontal: 4 }} />}
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    minHeight: SCREEN_HEIGHT * 0.65,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  countryItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryItemSelected: {
    backgroundColor: '#F3F0FF',
  },
  flagNameRow: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 22,
  },
  countryNameText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  countryNameSelectedText: {
    color: '#683EE6',
    fontWeight: '800',
  },
  moroccoHighlightText: {
    fontWeight: '800',
  },
  dialCodeRow: {
    alignItems: 'center',
    gap: 6,
  },
  dialCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  dialCodeSelectedText: {
    color: '#683EE6',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
