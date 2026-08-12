import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { X, Star, CheckCircle, Calendar, CreditCard, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../repositories/mockOrdersRepository';

const { height: SCREEN_H } = Dimensions.get('window');

interface PassengerProfileModalProps {
  order: MockOrder | null;
  visible: boolean;
  onClose: () => void;
}

export const PassengerProfileModal = memo(({
  order,
  visible,
  onClose,
}: PassengerProfileModalProps) => {
  if (!order || !visible) return null;

  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const { passengerDetail } = order;

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#20232B' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.containerBox,
                {
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: surfaceAltBg,
                    left: isRTL ? 16 : undefined,
                    right: isRTL ? undefined : 16,
                  },
                ]}
                onPress={onClose}
              >
                <X size={20} color={textSecondaryColor} />
              </TouchableOpacity>

              {/* Passenger Large Avatar & Verified Badge */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      passengerDetail?.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                  }}
                  style={styles.largeAvatar}
                />
                {passengerDetail?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={18} color="#FFFFFF" fill="#10B981" />
                  </View>
                )}
              </View>

              {/* Passenger Name & Rating */}
              <Text style={[styles.nameText, { color: textPrimaryColor }]}>
                {passengerDetail?.name || 'Alaeddin'}
              </Text>

              <View style={styles.ratingRow}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingValue, { color: textPrimaryColor }]}>
                  {(passengerDetail?.rating || 4.9).toFixed(1)}
                </Text>
                <Text style={[styles.tripsCountText, { color: textSecondaryColor }]}>
                  ({passengerDetail?.tripsCount || 60} {isRTL ? 'رحلة' : 'courses'})
                </Text>
              </View>

              {/* Details Cards Container */}
              <View style={[styles.detailsCard, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}>
                {/* Account Verification */}
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ShieldCheck size={18} color="#10B981" />
                  <Text style={[styles.infoText, { color: textPrimaryColor }]}>
                    {passengerDetail?.isVerified
                      ? (isRTL ? 'حساب محقق وموثق ✓' : 'Compte vérifié ✓')
                      : (isRTL ? 'حساب جديد' : 'Nouveau passager')}
                  </Text>
                </View>

                {/* Member Since */}
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Calendar size={18} color={primaryBrand} />
                  <Text style={[styles.infoText, { color: textPrimaryColor }]}>
                    {isRTL
                      ? `عضو منذ عام ${passengerDetail?.memberSince || '2023'}`
                      : `Membre depuis ${passengerDetail?.memberSince || '2023'}`}
                  </Text>
                </View>

                {/* Preferred Payment Method */}
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <CreditCard size={18} color="#10B981" />
                  <Text style={[styles.infoText, { color: textPrimaryColor }]}>
                    {passengerDetail?.paymentMethod || (isRTL ? 'دفع نقدي' : 'Paiement en espèces')}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
                onPress={onClose}
              >
                <Text style={[styles.confirmBtnText, { color: textPrimaryColor }]}>
                  {isRTL ? 'إغلاق' : 'Fermer'}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  containerBox: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 12,
  },
  largeAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#683EE6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  tripsCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
