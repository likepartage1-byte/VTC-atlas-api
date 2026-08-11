import React, { memo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { X, MapPin, Navigation, Edit2, Star, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder, MOCK_CONFIG } from '../repositories/mockOrdersRepository';

const { height: SCREEN_H } = Dimensions.get('window');
const COUNTDOWN_SECONDS = MOCK_CONFIG.NOTIFICATION_LIFETIME_SECONDS;
const MAX_PRICE_PERCENTAGE = MOCK_CONFIG.MAX_BID_PERCENTAGE;

interface PrivateRideAlertModalProps {
  order: MockOrder | null;
  onAccept: (orderId: string, finalPrice: number) => void;
  onIgnore: () => void;
  onClose: () => void;
}

export const PrivateRideAlertModal = memo(({
  order,
  onAccept,
  onIgnore,
  onClose,
}: PrivateRideAlertModalProps) => {
  if (!order) return null;

  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [selectedBidPrice, setSelectedBidPrice] = useState<number>(order.offeredPrice);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [showCustomPriceModal, setShowCustomPriceModal] = useState<boolean>(false);

  // 10-Second Countdown Animation (100% -> 0%)
  const progressAnim = useRef(new Animated.Value(1)).current;

  const maxAllowedPrice = Math.floor(order.offeredPrice * (1 + MAX_PRICE_PERCENTAGE));

  // Quick price proposal chips (+6% and +14% rounded)
  const chip1 = Math.min(Math.ceil(order.offeredPrice * 1.06), maxAllowedPrice);
  const chip2 = Math.min(Math.ceil(order.offeredPrice * 1.14), maxAllowedPrice);

  useEffect(() => {
    setSelectedBidPrice(order.offeredPrice);
    progressAnim.setValue(1);

    // Start 10-second lifetime countdown
    const animation = Animated.timing(progressAnim, {
      toValue: 0,
      duration: COUNTDOWN_SECONDS * 1000,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        // 10s expired -> auto close & return to orders list cleanly
        onIgnore();
      }
    });

    return () => {
      progressAnim.stopAnimation();
    };
  }, [order, progressAnim, onIgnore]);

  const handleCustomPriceSubmit = () => {
    const parsed = parseInt(customPriceInput.trim(), 10);
    if (isNaN(parsed) || parsed < order.offeredPrice) {
      Alert.alert(
        isRTL ? 'تنبيه السعر' : 'Avertissement de prix',
        isRTL ? `السعر الأدنى هو ${order.offeredPrice} د.م.` : `Le prix minimum est ${order.offeredPrice} MAD.`
      );
      return;
    }
    if (parsed > maxAllowedPrice) {
      Alert.alert(
        isRTL ? 'الحد الأقصى للسعر' : 'Plafond de prix',
        isRTL
          ? `الحد الأقصى المسموح به للاقتراح هو ${maxAllowedPrice} د.م. (+30%).`
          : `Le prix maximum autorisé est ${maxAllowedPrice} MAD (+30%).`
      );
      return;
    }
    setSelectedBidPrice(parsed);
    setShowCustomPriceModal(false);
  };

  const handleAcceptPress = () => {
    onAccept(order.id, selectedBidPrice);
  };

  // Theme Design Tokens
  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#20232B' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  const { passengerDetail } = order;

  // Progress Bar width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Semi-transparent Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Slide-Up Private Alert Card */}
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
          },
        ]}
      >
        {/* Drag Indicator */}
        <View style={[styles.dragHandle, { backgroundColor: borderColor }]} />

        {/* ── 1. Header Row ──────────────────────────────────────────────── */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.headerTitle, { color: textPrimaryColor }]}>
            {isRTL ? 'طلب رحلة جديدة' : rawLang.startsWith('es') ? 'Solicitud de viaje' : rawLang.startsWith('en') ? 'Ride Request' : 'Commande de course'}
          </Text>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: surfaceAltBg }]} onPress={onClose}>
            <X size={20} color={textSecondaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          {/* ── 2. Route Visual Preview (Points A & B) ────────────────────── */}
          <View style={[styles.routePreviewCard, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}>
            {/* Route Stats */}
            <View style={[styles.routeStatsBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{order.tripDistance || '5,4 km'}</Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#10B98118' }]}>
                <Text style={[styles.badgePillText, { color: '#10B981' }]}>
                  {order.pickupEta || '8 min'} · {order.distanceToPickup || '2,3 km'}
                </Text>
              </View>
            </View>

            {/* Address A (Pickup) */}
            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.pointBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.pointLetter}>A</Text>
              </View>
              <Text style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {order.pickupAddress}
              </Text>
            </View>

            {/* Connecting Vertical Line */}
            <View style={[styles.connectingLine, { left: isRTL ? undefined : 14, right: isRTL ? 14 : undefined, backgroundColor: borderColor }]} />

            {/* Address B (Dropoff) */}
            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.pointBadge, { backgroundColor: primaryBrand }]}>
                <Text style={styles.pointLetter}>B</Text>
              </View>
              <Text style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {order.dropoffAddress}
              </Text>
            </View>
          </View>

          {/* ── 3. Passenger Info Row ─────────────────────────────────────── */}
          <View style={[styles.passengerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Image
              source={{ uri: passengerDetail?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.priceHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.priceValue, { color: textPrimaryColor }]}>
                  {order.tripDistance || '5.4 km'}
                </Text>
              </View>

              <View style={[styles.mainPriceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.mainPriceText, { color: textPrimaryColor }]}>
                  {selectedBidPrice} MAD
                </Text>
                {order.isFairPrice && (
                  <View style={[styles.fairBadge, { backgroundColor: isDarkMode ? '#272042' : '#F3F0FF' }]}>
                    <Text style={[styles.fairBadgeText, { color: primaryBrand }]}>⊙ Prix juste</Text>
                  </View>
                )}
              </View>

              <View style={[styles.passengerMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.passengerNameText, { color: textSecondaryColor }]}>
                  {passengerDetail?.name || (isRTL ? 'راكب' : 'Passager')}
                </Text>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingText, { color: textSecondaryColor }]}>
                  {(passengerDetail?.rating || 5.0).toFixed(1)} ({passengerDetail?.tripsCount || 5})
                </Text>
                <Text style={[styles.timeElapsed, { color: textSecondaryColor }]}>33 sec.</Text>
              </View>
            </View>
          </View>

          {/* ── 4. 10-Second Countdown Lifetime Progress Bar ────────────────── */}
          <View style={[styles.countdownTrack, { backgroundColor: borderColor }]}>
            <Animated.View style={[styles.countdownFill, { width: progressWidth, backgroundColor: primaryBrand }]} />
          </View>

          {/* ── 5. Primary Accept Button ────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: '#10B981' }]}
            onPress={handleAcceptPress}
            activeOpacity={0.88}
          >
            <Text style={styles.acceptBtnText}>
              {isRTL ? `قبول مقابل ${selectedBidPrice} د.م.` : `Accepter pour ${selectedBidPrice} MAD`}
            </Text>
          </TouchableOpacity>

          {/* ── 6. Price Proposal Engine (Chips & Custom Price) ─────────────── */}
          <Text style={[styles.proposalLabel, { color: textSecondaryColor }]}>
            {isRTL ? 'اقترح سعراً أعلى (حتى +30%)' : 'Proposez votre prix'}
          </Text>

          <View style={[styles.chipsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {/* Quick Price Chip 1 */}
            <TouchableOpacity
              style={[
                styles.priceChip,
                {
                  backgroundColor: selectedBidPrice === chip1 ? primaryBrand : surfaceAltBg,
                  borderColor: selectedBidPrice === chip1 ? primaryBrand : borderColor,
                },
              ]}
              onPress={() => setSelectedBidPrice(chip1)}
            >
              <Text
                style={[
                  styles.priceChipText,
                  { color: selectedBidPrice === chip1 ? '#FFFFFF' : textPrimaryColor },
                ]}
              >
                {chip1} MAD
              </Text>
            </TouchableOpacity>

            {/* Quick Price Chip 2 */}
            <TouchableOpacity
              style={[
                styles.priceChip,
                {
                  backgroundColor: selectedBidPrice === chip2 ? primaryBrand : surfaceAltBg,
                  borderColor: selectedBidPrice === chip2 ? primaryBrand : borderColor,
                },
              ]}
              onPress={() => setSelectedBidPrice(chip2)}
            >
              <Text
                style={[
                  styles.priceChipText,
                  { color: selectedBidPrice === chip2 ? '#FFFFFF' : textPrimaryColor },
                ]}
              >
                {chip2} MAD
              </Text>
            </TouchableOpacity>

            {/* Custom Edit Chip (✎) */}
            <TouchableOpacity
              style={[styles.priceChip, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
              onPress={() => {
                setCustomPriceInput(selectedBidPrice.toString());
                setShowCustomPriceModal(true);
              }}
            >
              <Edit2 size={16} color={textPrimaryColor} />
            </TouchableOpacity>
          </View>

          {/* ── 7. Ignore Button ────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.ignoreBtn, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
            onPress={onIgnore}
            activeOpacity={0.8}
          >
            <Text style={[styles.ignoreBtnText, { color: textPrimaryColor }]}>
              {isRTL ? 'تجاهل' : rawLang.startsWith('es') ? 'Ignorar' : rawLang.startsWith('en') ? 'Ignore' : 'Ignorer'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Custom Price Modal ────────────────────────────────────────────── */}
      <Modal
        visible={showCustomPriceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomPriceModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCustomPriceModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.customPriceBox, { backgroundColor: cardBg, borderColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textPrimaryColor }]}>
                  {isRTL ? 'إدخال سعر مخصص' : 'Entrez votre prix'}
                </Text>
                <Text style={[styles.modalSub, { color: textSecondaryColor }]}>
                  {isRTL
                    ? `من ${order.offeredPrice} إلى ${maxAllowedPrice} د.م. كحد أقصى`
                    : `Entre ${order.offeredPrice} et ${maxAllowedPrice} MAD max`}
                </Text>

                <TextInput
                  style={[styles.priceInput, { color: textPrimaryColor, borderColor: primaryBrand }]}
                  keyboardType="numeric"
                  value={customPriceInput}
                  onChangeText={setCustomPriceInput}
                  placeholder={order.offeredPrice.toString()}
                  placeholderTextColor={textSecondaryColor}
                  autoFocus
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.modalBtnCancel, { backgroundColor: surfaceAltBg }]}
                    onPress={() => setShowCustomPriceModal(false)}
                  >
                    <Text style={{ color: textSecondaryColor, fontWeight: '700' }}>
                      {isRTL ? 'إلغاء' : 'Annuler'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtnConfirm, { backgroundColor: primaryBrand }]}
                    onPress={handleCustomPriceSubmit}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                      {isRTL ? 'تأكيد' : 'Valider'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.88,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
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
    paddingVertical: 10,
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
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  routePreviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    position: 'relative',
  },
  routeStatsBar: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badgePill: {
    backgroundColor: '#CCFF0033',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  addressRow: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  pointBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLetter: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  connectingLine: {
    position: 'absolute',
    top: 54,
    width: 2,
    height: 14,
  },
  passengerRow: {
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  priceHeader: {
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainPriceRow: {
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 2,
  },
  mainPriceText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  fairBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fairBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  passengerMeta: {
    alignItems: 'center',
    gap: 4,
  },
  passengerNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeElapsed: {
    fontSize: 11,
    marginLeft: 6,
  },
  countdownTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  countdownFill: {
    height: '100%',
    borderRadius: 2,
  },
  acceptBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 3,
  },
  acceptBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  proposalLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  chipsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  priceChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  ignoreBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ignoreBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  customPriceBox: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  priceInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnConfirm: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
