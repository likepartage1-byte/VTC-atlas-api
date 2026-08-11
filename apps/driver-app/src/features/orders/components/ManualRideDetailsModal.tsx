import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { X, MapPin, Navigation, Edit2, Star, Check, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { LeafletMapView } from '../../../components/LeafletMapView';
import { MockOrder, MOCK_CONFIG } from '../repositories/mockOrdersRepository';

const { height: SCREEN_H } = Dimensions.get('window');

interface ManualRideDetailsModalProps {
  order: MockOrder | null;
  onAccept: (orderId: string, finalPrice: number) => void;
  onClose: () => void;
}

export const ManualRideDetailsModal = memo(({
  order,
  onAccept,
  onClose,
}: ManualRideDetailsModalProps) => {
  if (!order) return null;

  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [selectedBidPrice, setSelectedBidPrice] = useState<number>(order.offeredPrice);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [showCustomPriceModal, setShowCustomPriceModal] = useState<boolean>(false);

  // Maximum +30% Price Ceiling
  const maxAllowedPrice = Math.floor(order.offeredPrice * (1 + MOCK_CONFIG.MAX_BID_PERCENTAGE));

  // Dynamic Quick Proposal Chips (+6%, +12%, +18% rounded)
  const chip1 = Math.min(Math.ceil(order.offeredPrice * 1.06), maxAllowedPrice);
  const chip2 = Math.min(Math.ceil(order.offeredPrice * 1.12), maxAllowedPrice);
  const chip3 = Math.min(Math.ceil(order.offeredPrice * 1.18), maxAllowedPrice);

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
      const errorMsg = isRTL
        ? 'لا يمكن أن يتجاوز السعر المقترح 30٪ من السعر الأصلي.'
        : rawLang.startsWith('es')
        ? 'El precio propuesto no puede superar el 30 % del precio original.'
        : rawLang.startsWith('en')
        ? 'The proposed price cannot exceed 30% of the original price.'
        : 'Le prix proposé ne peut pas dépasser 30 % du prix initial.';

      Alert.alert(
        isRTL ? 'سقف السعر' : 'Plafond de prix',
        `${errorMsg} (${isRTL ? 'الحد الأقصى:' : 'Max:'} ${maxAllowedPrice} MAD)`
      );
      return;
    }
    setSelectedBidPrice(parsed);
    setShowCustomPriceModal(false);
  };

  const handleAcceptPress = () => {
    onAccept(order.id, selectedBidPrice);
  };

  // Theme Design Tokens (YALLA VTC Identity)
  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#20232B' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = isDarkMode ? '#8B6CF6' : '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  const { passengerDetail } = order;

  // Header Title
  const getHeaderTitle = () => {
    if (isRTL) return 'طلب رحلة';
    if (rawLang.startsWith('es')) return 'Solicitud de viaje';
    if (rawLang.startsWith('en')) return 'Ride Request';
    return 'Commande de course';
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Semi-transparent Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Slide-Up Ride Details Sheet Container (NO TIMER / NO AUTO CLOSE) */}
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
          },
        ]}
      >
        {/* Drag Handle Bar */}
        <View style={[styles.dragHandle, { backgroundColor: borderColor }]} />

        {/* ── 1. HEADER (Title & Close button respecting RTL/LTR) ────────────── */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.headerTitle, { color: textPrimaryColor }]}>
            {getHeaderTitle()}
          </Text>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: surfaceAltBg }]} onPress={onClose}>
            <X size={20} color={textSecondaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          {/* ── 2. MAP / ROUTE PREVIEW (Upper Map with 2 Distance Badges) ──────── */}
          <View style={[styles.mapContainer, { borderColor: borderColor }]}>
            <LeafletMapView
              height={190}
              isDarkMode={isDarkMode}
              pickup={{ lat: order.pickupLat || 31.6258, lng: order.pickupLng || -7.9891, title: order.pickupAddress }}
              destination={{ lat: order.dropoffLat || 31.6425, lng: order.dropoffLng || -8.0125, title: order.dropoffAddress }}
            />

            {/* Distance Badge 1: Driver -> Passenger Pickup A */}
            <View style={[styles.mapDistanceBadgeDriver, { left: isRTL ? undefined : 12, right: isRTL ? 12 : undefined }]}>
              <Text style={styles.mapBadgeTextDriver}>
                {order.distanceToPickup?.startsWith('~') ? order.distanceToPickup : `~${order.distanceToPickup || '1.5 km'}`}
              </Text>
            </View>

            {/* Distance Badge 2: Passenger Trip A -> B */}
            <View style={[styles.mapDistanceBadgeTrip, { right: isRTL ? undefined : 12, left: isRTL ? 12 : undefined }]}>
              <Text style={styles.mapBadgeTextTrip}>
                {order.tripDuration || '14 min'} • {order.tripDistance || '8.8 km'}
              </Text>
            </View>
          </View>

          {/* ── 3. PASSENGER INFORMATION CARD ─────────────────────────────────── */}
          <View style={[styles.passengerCard, { backgroundColor: surfaceAltBg, borderColor: borderColor, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Image
              source={{ uri: passengerDetail?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.driverDistanceLabel, { color: textSecondaryColor }]}>
                ~{order.distanceToPickup || '1.5 km'}
              </Text>

              <View style={[styles.priceHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.mainPriceText, { color: textPrimaryColor }]}>
                  {selectedBidPrice} MAD
                </Text>
                {order.isFairPrice && (
                  <View style={[styles.fairBadge, { backgroundColor: primaryLightBg }]}>
                    <Text style={[styles.fairBadgeText, { color: primaryBrand }]}>⊙ Prix juste</Text>
                  </View>
                )}
              </View>

              <View style={[styles.passengerMetaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.passengerName, { color: textPrimaryColor }]}>
                  {passengerDetail?.name || 'Alaeddin'}
                </Text>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.passengerRatingText, { color: textSecondaryColor }]}>
                  {(passengerDetail?.rating || 4.35).toFixed(2)} ({passengerDetail?.tripsCount || 137})
                </Text>
                <Text style={[styles.etaText, { color: textSecondaryColor }]}>
                  {order.pickupEta || '2 min.'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 4. PICKUP (A) & DESTINATION (B) ADDRESS CARDS ─────────────────── */}
          <View style={[styles.addressSectionCard, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}>
            {/* Pickup A */}
            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.pointBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.pointLetter}>A</Text>
              </View>
              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.addressTitleBold, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]}>
                  {order.pickupAddress}
                </Text>
              </View>
            </View>

            {/* Connecting Vertical Dotted Line */}
            <View style={[styles.connectingLine, { left: isRTL ? undefined : 14, right: isRTL ? 14 : undefined, backgroundColor: borderColor }]} />

            {/* Destination B */}
            <View style={[styles.addressRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.pointBadge, { backgroundColor: primaryBrand }]}>
                <Text style={styles.pointLetter}>B</Text>
              </View>
              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.addressTitleBold, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]}>
                  {order.dropoffAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* ── 5. PRIMARY ACCEPT BUTTON ─────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: '#10B981' }]}
            onPress={handleAcceptPress}
            activeOpacity={0.88}
          >
            <Text style={styles.acceptBtnText}>
              {isRTL ? `قبول مقابل ${selectedBidPrice} د.م.` : `Accepter pour ${selectedBidPrice} MAD`}
            </Text>
          </TouchableOpacity>

          {/* ── 6. PRICE PROPOSALS (+30% MAX CEILING) ────────────────────────── */}
          <Text style={[styles.proposalHeaderLabel, { color: textSecondaryColor }]}>
            {isRTL ? 'اقترح سعرك' : rawLang.startsWith('es') ? 'Propón tu precio' : rawLang.startsWith('en') ? 'Propose your price' : 'Proposez votre prix'}
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
              <Text style={[styles.priceChipText, { color: selectedBidPrice === chip1 ? '#FFFFFF' : textPrimaryColor }]}>
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
              <Text style={[styles.priceChipText, { color: selectedBidPrice === chip2 ? '#FFFFFF' : textPrimaryColor }]}>
                {chip2} MAD
              </Text>
            </TouchableOpacity>

            {/* Quick Price Chip 3 */}
            <TouchableOpacity
              style={[
                styles.priceChip,
                {
                  backgroundColor: selectedBidPrice === chip3 ? primaryBrand : surfaceAltBg,
                  borderColor: selectedBidPrice === chip3 ? primaryBrand : borderColor,
                },
              ]}
              onPress={() => setSelectedBidPrice(chip3)}
            >
              <Text style={[styles.priceChipText, { color: selectedBidPrice === chip3 ? '#FFFFFF' : textPrimaryColor }]}>
                {chip3} MAD
              </Text>
            </TouchableOpacity>

            {/* Custom Price Input Chip (✎) */}
            <TouchableOpacity
              style={[styles.priceChipIcon, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
              onPress={() => {
                setCustomPriceInput(selectedBidPrice.toString());
                setShowCustomPriceModal(true);
              }}
            >
              <Edit2 size={16} color={textPrimaryColor} />
            </TouchableOpacity>
          </View>

          {/* ── 7. CLOSE BUTTON (Fermer / إغلاق) ────────────────────────────── */}
          <TouchableOpacity
            style={[styles.closeBottomBtn, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.closeBottomBtnText, { color: textPrimaryColor }]}>
              {isRTL ? 'إغلاق' : rawLang.startsWith('es') ? 'Cerrar' : rawLang.startsWith('en') ? 'Close' : 'Fermer'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Custom Price Input Modal ────────────────────────────────────────── */}
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
                    ? `من ${order.offeredPrice} إلى ${maxAllowedPrice} د.م. كحد أقصى (+30%)`
                    : `Entre ${order.offeredPrice} et ${maxAllowedPrice} MAD max (+30%)`}
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
    maxHeight: SCREEN_H * 0.90,
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
  mapContainer: {
    height: 190,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  mapDistanceBadgeDriver: {
    position: 'absolute',
    top: 10,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 3,
  },
  mapBadgeTextDriver: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapDistanceBadgeTrip: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#CCFF00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 3,
  },
  mapBadgeTextTrip: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  passengerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  driverDistanceLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceHeaderRow: {
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 2,
  },
  mainPriceText: {
    fontSize: 24,
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
  passengerMetaRow: {
    alignItems: 'center',
    gap: 4,
  },
  passengerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  passengerRatingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  etaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  addressSectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    position: 'relative',
  },
  addressRow: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 3,
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
  addressTitleBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  connectingLine: {
    position: 'absolute',
    top: 36,
    width: 2,
    height: 14,
  },
  acceptBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 3,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  proposalHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  chipsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  priceChip: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChipIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  closeBottomBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBottomBtnText: {
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
