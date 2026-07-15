import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Check, X, Info, Award } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';

const LIME_GREEN = '#8BE034';

interface ServiceRate {
  key: string;
  titleKey: string;
  titleDefault: string;
  serviceFee: string;
  serviceFeeNum: number;
  tva: string;
  tvaNum: number;
  total: string;
}

export const CommissionScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const isRTL = i18n.language === 'ar';

  const [selectedService, setSelectedService] = useState<ServiceRate | null>(null);

  // Theme-aware color parameters mapping
  const screenBgColor = isDarkMode ? '#121319' : colors.bg;
  const cardBgColor = isDarkMode ? '#1E202B' : colors.surfaceAlt || '#F3F4F6';
  const cardBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.border;
  const mainTitleColor = isDarkMode ? '#ffffff' : colors.textPrimary;
  const subTextColor = isDarkMode ? '#A0A3B5' : colors.textSecondary;
  const closeBtnBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const closeIconColor = isDarkMode ? '#ffffff' : colors.textPrimary;

  const checkCircleBg = isDarkMode ? '#ffffff' : colors.primary || '#000000';
  const checkMarkColor = isDarkMode ? '#000000' : '#ffffff';

  // Details Modal variables mapping
  const modalSheetBg = isDarkMode ? '#1E202B' : colors.surface;
  const detailsBoxBg = isDarkMode ? 'rgba(0, 0, 0, 0.2)' : colors.surfaceAlt || '#F9FAFB';
  const detailsBoxBorder = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : colors.border;
  const detailsLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : colors.border;
  const gotItBtnBg = isDarkMode ? '#ffffff' : colors.primary;
  const gotItBtnText = isDarkMode ? '#000000' : '#ffffff';

  const services: ServiceRate[] = [
    {
      key: 'course',
      titleKey: 'course_title',
      titleDefault: 'Course',
      serviceFee: '8.4%',
      serviceFeeNum: 8.4,
      tva: '1.48%',
      tvaNum: 1.48,
      total: '9.88%',
    },
    {
      key: 'coursier_voiture',
      titleKey: 'coursier_voiture_title',
      titleDefault: 'Coursier en voiture',
      serviceFee: '7.99%',
      serviceFeeNum: 7.99,
      tva: '0.5%',
      tvaNum: 0.5,
      total: '8.49%',
    },
    {
      key: 'coursier_moto',
      titleKey: 'coursier_moto_title',
      titleDefault: 'Coursier en moto',
      serviceFee: '7.99%',
      serviceFeeNum: 7.99,
      tva: '0.5%',
      tvaNum: 0.5,
      total: '8.49%',
    },
    {
      key: 'livreur',
      titleKey: 'livreur_title',
      titleDefault: 'Livreur',
      serviceFee: '7.99%',
      serviceFeeNum: 7.99,
      tva: '0.5%',
      tvaNum: 0.5,
      total: '8.49%',
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBgColor }]}>
      {/* Custom Header */}
      <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
        <Text style={[styles.screenTitle, { color: mainTitleColor }]}>
          {isRTL ? 'رسوم الخدمة والضرائب' : 'Frais de service et taxes'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeHeaderBtn, { backgroundColor: closeBtnBg }]}
          activeOpacity={0.8}
        >
          <X size={22} color={closeIconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Checkpoints */}
        <View style={styles.checkpointsBlock}>
          {/* Item 1 */}
          <View style={[styles.checkpointRow, isRTL && styles.rtlRow]}>
            <View style={[styles.checkCircleBg, { backgroundColor: checkCircleBg }]}>
              <Check size={11} color={checkMarkColor} strokeWidth={3} />
            </View>
            <Text style={[styles.checkpointText, { color: subTextColor }, isRTL && styles.rtlText]}>
              {t('fair_service_payments') || 'Paiements de services équitables'}
            </Text>
          </View>

          {/* Item 2 */}
          <View style={[styles.checkpointRow, isRTL && styles.rtlRow]}>
            <View style={[styles.checkCircleBg, { backgroundColor: checkCircleBg }]}>
              <Check size={11} color={checkMarkColor} strokeWidth={3} />
            </View>
            <Text style={[styles.checkpointText, { color: subTextColor }, isRTL && styles.rtlText]}>
              {t('no_hidden_fees') || 'Pas de frais cachés'}
            </Text>
          </View>
        </View>

        {/* Services Cards List */}
        <View style={styles.cardsContainer}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.serviceCard, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}
              onPress={() => setSelectedService(item)}
              activeOpacity={0.85}
            >
              {/* Type Title */}
              <Text style={[styles.cardTitle, { color: mainTitleColor }, isRTL && styles.rtlText]}>
                {t(item.titleKey) || item.titleDefault}
              </Text>

              {/* Fee Row */}
              <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
                <Text style={[styles.rateLabel, { color: subTextColor }]}>
                  {t('service_fee_title') || 'Paiement de service'}
                </Text>
                <Text style={[styles.rateVal, { color: LIME_GREEN }]}>
                  {item.serviceFee}
                </Text>
              </View>

              {/* TVA Row */}
              <View style={[styles.rateRow, isRTL && styles.rtlRow]}>
                <Text style={[styles.rateLabel, { color: subTextColor }]}>
                  {t('tva_title') || 'TVA'}
                </Text>
                <Text style={[styles.rateValGrey, { color: mainTitleColor }]}>
                  {item.tva}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Interactive detail popup modal sheet */}
      <Modal
        visible={selectedService !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedService(null)}
      >
        {selectedService && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: modalSheetBg, borderColor: cardBorderColor }]}>
              {/* Title Header */}
              <View style={[styles.modalHeader, isRTL && styles.rtlRow]}>
                <Text style={[styles.modalTitle, { color: mainTitleColor }]}>
                  {t('rate_details') || 'Taux de service & taxes'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.closeBtn}>
                  <X size={20} color={mainTitleColor} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                {/* Visual Label */}
                <View style={styles.serviceHeaderBadge}>
                  <Award size={20} color={LIME_GREEN} />
                  <Text style={styles.badgeLabel}>
                    {t(selectedService.titleKey) || selectedService.titleDefault}
                  </Text>
                </View>

                {/* Details box */}
                <View style={[styles.detailsContentBox, { backgroundColor: detailsBoxBg, borderColor: detailsBoxBorder }]}>
                  {/* Service fee */}
                  <View style={[styles.detailsRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.detailsLabel, { color: subTextColor }]}>
                      {t('service_fee_title') || 'Paiement de service'}
                    </Text>
                    <Text style={[styles.detailsVal, { color: LIME_GREEN }]}>
                      {selectedService.serviceFee}
                    </Text>
                  </View>
                  <View style={[styles.detailsLine, { backgroundColor: detailsLineColor }]} />

                  {/* TVA */}
                  <View style={[styles.detailsRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.detailsLabel, { color: subTextColor }]}>
                      {t('tva_title') || 'TVA'}
                    </Text>
                    <Text style={[styles.detailsValGrey, { color: mainTitleColor }]}>
                      {selectedService.tva}
                    </Text>
                  </View>
                  <View style={[styles.detailsLine, { backgroundColor: detailsLineColor }]} />

                  {/* Total rate */}
                  <View style={[styles.detailsRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.detailsLabelBold, { color: mainTitleColor }]}>
                      {t('total_rate') || 'Taux total'}
                    </Text>
                    <Text style={styles.detailsValBold}>
                      {selectedService.total}
                    </Text>
                  </View>
                </View>

                {/* Information hint text */}
                <View style={[styles.infoHintRow, isRTL && styles.rtlRow]}>
                  <Info size={16} color={LIME_GREEN} />
                  <Text style={[styles.infoHintText, { color: subTextColor }, isRTL && styles.rtlText]}>
                    {isRTL
                      ? 'هذه هي النسب الرسمية المعتمدة بعد الخصومات لشركات وشركاء أطلس.'
                      : 'Ce sont les taux officiels approuvés après remises pour les partenaires Atlas.'}
                  </Text>
                </View>
              </View>

              {/* Got it Button */}
              <TouchableOpacity
                onPress={() => setSelectedService(null)}
                style={[styles.gotItBtn, { backgroundColor: gotItBtnBg }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.gotItText, { color: gotItBtnText }]}>
                  {t('got_it') || 'D’accord'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  checkpointsBlock: {
    marginBottom: 24,
    gap: 12,
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircleBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  rateValGrey: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Modal Styles ──────────────────────────────────────────────────────────
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
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '850',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    gap: 18,
  },
  serviceHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 224, 52, 0.08)',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: LIME_GREEN,
  },
  detailsContentBox: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailsValGrey: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailsLine: {
    height: 1,
  },
  detailsLabelBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  detailsValBold: {
    fontSize: 16,
    color: LIME_GREEN,
    fontWeight: '900',
  },
  infoHintRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  infoHintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  gotItBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  gotItText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
