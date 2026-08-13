import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ShieldAlert, Car, FileText, Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { DriverVerificationState } from '../../../services/driverVerificationGuard.service';

interface Props {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  state: DriverVerificationState;
}

export const VerificationRequiredModal: React.FC<Props> = ({
  visible,
  onClose,
  onContinue,
  state,
}) => {
  const { i18n } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAlt = isDarkMode ? '#22252D' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = '#683EE6';
  const textPrimary = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondary = isDarkMode ? '#A1A1AA' : '#6B7280';

  const titleText = isRTL
    ? 'أكمل تسجيل مركبتك أولاً'
    : rawLang.startsWith('es')
    ? 'Completa primero el registro de tu vehículo'
    : rawLang.startsWith('en')
    ? 'Complete your vehicle registration first'
    : "Complétez d'abord l'enregistrement de votre véhicule";

  const messageText = isRTL
    ? 'للوصول إلى تفاصيل الطلبات والبدء في استقبال الرحلات، يجب عليك إكمال معلومات المركبة والوثائق الرسمية وانتظار مراجعتها.'
    : rawLang.startsWith('es')
    ? 'Para acceder a los detalles de los viajes y empezar a recibir solicitudes, debes completar la información de tu vehículo y tus documentos oficiales y esperar la verificación.'
    : rawLang.startsWith('en')
    ? 'To access ride details and start receiving requests, you must complete your vehicle information and official documents and wait for verification.'
    : 'Pour accéder aux détails des courses et commencer à recevoir des demandes, vous devez compléter les informations de votre véhicule et vos documents officiels, puis attendre leur validation.';

  const continueBtnText = isRTL
    ? 'متابعة ➔'
    : rawLang.startsWith('es')
    ? 'Continuar ➔'
    : rawLang.startsWith('en')
    ? 'Continue ➔'
    : 'Continuer ➔';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {/* Header Icon */}
          <View style={[styles.iconBadge, { backgroundColor: '#F59E0B1A' }]}>
            <ShieldAlert size={36} color="#F59E0B" />
          </View>

          {/* Title & Description */}
          <Text style={[styles.title, { color: textPrimary }]}>{titleText}</Text>
          <Text style={[styles.message, { color: textSecondary }]}>{messageText}</Text>

          {/* Progress Indicators Matrix */}
          <View style={[styles.progressContainer, { backgroundColor: surfaceAlt, borderColor }]}>
            {/* 1. Vehicle Info Verification */}
            <View style={styles.progressRow}>
              <View style={styles.rowLeft}>
                <Car size={20} color={state.vehicleVerificationPercentage === 100 ? '#10B981' : primaryBrand} />
                <Text style={[styles.rowLabel, { color: textPrimary }]}>
                  {isRTL ? 'معلومات المركبة' : 'Informations du véhicule'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: state.vehicleVerificationPercentage === 100 ? '#10B98118' : '#F59E0B18' }]}>
                <Text style={[styles.badgeText, { color: state.vehicleVerificationPercentage === 100 ? '#10B981' : '#F59E0B' }]}>
                  {state.vehicleVerificationPercentage}%
                </Text>
              </View>
            </View>

            {/* 2. Official Documents Verification */}
            <View style={styles.progressRow}>
              <View style={styles.rowLeft}>
                <FileText size={20} color={state.documentVerificationPercentage === 100 ? '#10B981' : primaryBrand} />
                <Text style={[styles.rowLabel, { color: textPrimary }]}>
                  {isRTL ? 'الوثائق الرسمية' : 'Documents officiels'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: state.documentVerificationPercentage === 100 ? '#10B98118' : '#F59E0B18' }]}>
                <Text style={[styles.badgeText, { color: state.documentVerificationPercentage === 100 ? '#10B981' : '#F59E0B' }]}>
                  {state.documentVerificationPercentage}%
                </Text>
              </View>
            </View>

            {/* 3. Review Status */}
            <View style={[styles.progressRow, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <Clock size={20} color={state.verificationStatus === 'PENDING_REVIEW' ? '#3B82F6' : textSecondary} />
                <Text style={[styles.rowLabel, { color: textPrimary }]}>
                  {isRTL ? 'حالة المراجعة' : 'Statut de vérification'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: state.verificationStatus === 'PENDING_REVIEW' ? '#3B82F618' : surfaceAlt }]}>
                <Text style={[styles.badgeText, { color: state.verificationStatus === 'PENDING_REVIEW' ? '#3B82F6' : textSecondary }]}>
                  {state.verificationStatus === 'PENDING_REVIEW'
                    ? (isRTL ? 'قيد المراجعة' : 'En cours')
                    : (isRTL ? 'لم تكتمل' : 'Incomplet')}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: primaryBrand }]}
            onPress={onContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>{continueBtnText}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelBtnText, { color: textSecondary }]}>
              {isRTL ? 'إلغاء' : 'Annuler'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
