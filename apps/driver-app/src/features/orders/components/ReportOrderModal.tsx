import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { X, ShieldAlert, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../repositories/mockOrdersRepository';

const { height: SCREEN_H } = Dimensions.get('window');

interface ReportOrderModalProps {
  order: MockOrder | null;
  visible: boolean;
  onClose: () => void;
  onSubmitReport: (orderId: string, reason: string, details: string) => void;
}

const PREDEFINED_REASONS = [
  { id: 'sexual', fr: 'Contenu sexuel', ar: 'محتوى جنسي', en: 'Sexual content', es: 'Contenido sexual' },
  { id: 'ad', fr: 'Publicité', ar: 'إعلان', en: 'Advertising', es: 'Publicidad' },
  { id: 'drugs', fr: 'Médicaments', ar: 'أدوية', en: 'Drugs/Medication', es: 'Medicamentos' },
  { id: 'suspicious', fr: 'Activité suspecte', ar: 'نشاط مشبوه', en: 'Suspicious activity', es: 'Actividad sospechosa' },
  { id: 'price_low', fr: 'Prix trop bas', ar: 'السعر منخفض جداً', en: 'Price too low', es: 'Precio demasiado bajo' },
  { id: 'distance_long', fr: 'Distance trop longue', ar: 'المسافة طويلة جداً', en: 'Distance too long', es: 'Distancia demasiado larga' },
  { id: 'other', fr: 'Autre', ar: 'أخرى', en: 'Other', es: 'Otro' },
];

export const ReportOrderModal = memo(({
  order,
  visible,
  onClose,
  onSubmitReport,
}: ReportOrderModalProps) => {
  if (!order || !visible) return null;

  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [selectedReasonId, setSelectedReasonId] = useState<string>('suspicious');
  const [detailsText, setDetailsText] = useState<string>('');

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#20232B' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  const getReasonLabel = (item: typeof PREDEFINED_REASONS[0]) => {
    if (isRTL) return item.ar;
    if (rawLang.startsWith('es')) return item.es;
    if (rawLang.startsWith('en')) return item.en;
    return item.fr;
  };

  const handleSubmit = () => {
    const selectedItem = PREDEFINED_REASONS.find(r => r.id === selectedReasonId);
    const reasonLabel = selectedItem ? getReasonLabel(selectedItem) : selectedReasonId;
    
    onSubmitReport(order.id, reasonLabel, detailsText.trim());
    
    Alert.alert(
      isRTL ? 'تم إرسال البلاغ' : 'Signalement envoyé',
      isRTL
        ? 'نشكرك على إبلاغنا. سيقوم فريق السلامة بمراجعة هذا الطلب.'
        : 'Merci de votre signalement. Notre équipe sécurité examinera ce rapport.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={[styles.dragHandle, { backgroundColor: borderColor }]} />

              {/* ── 1. Header (Demande de rapport) ───────────────────────────── */}
              <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.headerTitle, { color: textPrimaryColor }]}>
                  {isRTL ? 'طلب إبلاغ' : rawLang.startsWith('es') ? 'Solicitud de informe' : rawLang.startsWith('en') ? 'Report Request' : 'Demande de rapport'}
                </Text>
                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: surfaceAltBg }]} onPress={onClose}>
                  <X size={20} color={textSecondaryColor} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                {/* ── 2. Subtitle ────────────────────────────────────────────── */}
                <Text style={[styles.subtitleText, { color: textSecondaryColor, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL
                    ? 'يرجى وصف المشكلة بالتفصيل التي تتعلق بهذا الطلب:'
                    : rawLang.startsWith('es')
                    ? 'Por favor describe en detalle qué está mal con este pedido:'
                    : rawLang.startsWith('en')
                    ? 'Please describe in detail what is wrong with this request:'
                    : 'Veuillez décrire en détail ce qui ne va pas avec cette demande'}
                </Text>

                {/* ── 3. Predefined Reason Chips ─────────────────────────────── */}
                <View style={[styles.chipsWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {PREDEFINED_REASONS.map((item) => {
                    const isSelected = selectedReasonId === item.id;
                    const label = getReasonLabel(item);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.chipPill,
                          {
                            backgroundColor: isSelected ? primaryBrand : surfaceAltBg,
                            borderColor: isSelected ? primaryBrand : borderColor,
                          },
                        ]}
                        onPress={() => setSelectedReasonId(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : textPrimaryColor },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* ── 4. What happened Input Box ─────────────────────────────── */}
                <Text style={[styles.inputLabel, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? 'ماذا حدث؟' : rawLang.startsWith('es') ? '¿Qué pasó?' : rawLang.startsWith('en') ? 'What happened?' : "Que s'est-il passé ?"}
                </Text>

                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: textPrimaryColor,
                      borderColor: borderColor,
                      backgroundColor: surfaceAltBg,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  multiline
                  numberOfLines={4}
                  placeholder={
                    isRTL
                      ? 'اكتب التفاصيل هنا...'
                      : 'Écrivez les détails ici...'
                  }
                  placeholderTextColor={textSecondaryColor}
                  value={detailsText}
                  onChangeText={setDetailsText}
                />

                {/* ── 5. Submit Button ────────────────────────────────────────── */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: '#CCFF00' }]}
                  onPress={handleSubmit}
                  activeOpacity={0.88}
                >
                  <Text style={styles.submitBtnText}>
                    {isRTL ? 'إرسال البلاغ' : rawLang.startsWith('es') ? 'Enviar informe' : rawLang.startsWith('en') ? 'Send Report' : 'Envoyer un signalement'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: SCREEN_H * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justify.content: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 18,
  },
  chipsWrap: {
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chipPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  textArea: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
});
