import React, { memo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Clock, MapPin, CheckCircle, Navigation, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme/ThemeContext';
import { MockOrder } from '../repositories/mockOrdersRepository';

const { height: SCREEN_H } = Dimensions.get('window');

interface WaitingPassengerConfirmationModalProps {
  order: MockOrder | null;
  finalPrice: number;
  visible: boolean;
  onPassengerConfirmed: (order: MockOrder, price: number) => void;
  onTimeout: () => void;
  onCancel: () => void;
}

export const WaitingPassengerConfirmationModal = memo(({
  order,
  finalPrice,
  visible,
  onPassengerConfirmed,
  onTimeout,
  onCancel,
}: WaitingPassengerConfirmationModalProps) => {
  if (!order || !visible) return null;

  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const rawLang = (i18n.language || 'fr').toLowerCase();
  const isRTL = rawLang.startsWith('ar');

  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const isHandledRef = useRef<boolean>(false);
  const autoSimulateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { passengerDetail } = order;

  const cardBg = isDarkMode ? '#181A20' : '#FFFFFF';
  const surfaceAltBg = isDarkMode ? '#22252D' : '#F8F7FC';
  const borderColor = isDarkMode ? '#2D3038' : '#E5E7EB';
  const primaryBrand = '#683EE6';
  const primaryLightBg = isDarkMode ? '#272042' : '#F3F0FF';
  const textPrimaryColor = isDarkMode ? '#F9FAFB' : '#111827';
  const textSecondaryColor = isDarkMode ? '#A1A1AA' : '#6B7280';

  useEffect(() => {
    isHandledRef.current = false;
    setSecondsLeft(15);
    progressAnim.setValue(1);

    // Animate 15s linear progress bar
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 15000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 1-second interval timer
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!isHandledRef.current) {
            isHandledRef.current = true;
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-simulate passenger confirmation after 3.5s for seamless testing (TEST 1 scenario)
    autoSimulateTimerRef.current = setTimeout(() => {
      if (!isHandledRef.current) {
        isHandledRef.current = true;
        clearInterval(interval);
        onPassengerConfirmed(order, finalPrice);
      }
    }, 3500);

    return () => {
      clearInterval(interval);
      if (autoSimulateTimerRef.current) clearTimeout(autoSimulateTimerRef.current);
    };
  }, [order, finalPrice, onPassengerConfirmed, onTimeout, progressAnim]);

  const handleManualConfirmSimulator = () => {
    if (!isHandledRef.current) {
      isHandledRef.current = true;
      if (autoSimulateTimerRef.current) clearTimeout(autoSimulateTimerRef.current);
      onPassengerConfirmed(order, finalPrice);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
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
              {/* Drag Indicator */}
              <View style={[styles.dragHandle, { backgroundColor: borderColor }]} />

              {/* ── 1. Header (En attente de confirmation du passager) ──────── */}
              <View style={styles.headerBox}>
                <View style={[styles.pulseIconBg, { backgroundColor: primaryLightBg }]}>
                  <Clock size={28} color={primaryBrand} />
                </View>

                <Text style={[styles.titleText, { color: textPrimaryColor }]}>
                  {isRTL
                    ? 'في انتظار تأكيد الزبون'
                    : rawLang.startsWith('es')
                    ? 'Esperando confirmación del pasajero'
                    : rawLang.startsWith('en')
                    ? 'Waiting for passenger confirmation'
                    : 'En attente de confirmation du passager'}
                </Text>

                {/* 15s Countdown Badge */}
                <View style={[styles.countdownBadge, { backgroundColor: primaryBrand }]}>
                  <Text style={styles.countdownText}>{secondsLeft} s</Text>
                </View>
              </View>

              {/* ── 2. Progress Bar Indicator ────────────────────────────────── */}
              <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressWidth,
                      backgroundColor: primaryBrand,
                    },
                  ]}
                />
              </View>

              {/* ── 3. Trip & Price Details Card ─────────────────────────────── */}
              <View style={[styles.summaryCard, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}>
                {/* Price Row */}
                <View style={[styles.priceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.priceLabel, { color: textSecondaryColor }]}>
                    {isRTL ? 'السعر المتفق عليه' : 'Tarif convenu'}
                  </Text>
                  <Text style={[styles.priceValue, { color: primaryBrand }]}>
                    {finalPrice} MAD
                  </Text>
                </View>

                {/* Passenger Row */}
                <View style={[styles.passengerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Image
                    source={{
                      uri:
                        passengerDetail?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    }}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={[styles.passengerName, { color: textPrimaryColor }]}>
                      {passengerDetail?.name || 'Passager'}
                    </Text>
                    <Text style={[styles.passengerMeta, { color: textSecondaryColor }]}>
                      ⭐ {(passengerDetail?.rating || 4.9).toFixed(1)} · {order.tripDistance || '3.2 km'}
                    </Text>
                  </View>
                </View>

                {/* Pickup & Dropoff Addresses */}
                <View style={[styles.addressItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.pointMarker, { backgroundColor: '#16A34A' }]}>
                    <Text style={styles.pointLetter}>A</Text>
                  </View>
                  <Text
                    style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]}
                    numberOfLines={1}
                  >
                    {order.pickupAddress}
                  </Text>
                </View>

                <View style={[styles.addressItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.pointMarker, { backgroundColor: primaryBrand }]}>
                    <Text style={styles.pointLetter}>B</Text>
                  </View>
                  <Text
                    style={[styles.addressText, { color: textPrimaryColor, textAlign: isRTL ? 'right' : 'left' }]}
                    numberOfLines={1}
                  >
                    {order.dropoffAddress}
                  </Text>
                </View>
              </View>

              {/* ── 4. Dev Simulator Button for Instant Manual Testing ────────── */}
              <TouchableOpacity
                style={[styles.simulatedConfirmBtn, { backgroundColor: primaryLightBg, borderColor: primaryBrand }]}
                onPress={handleManualConfirmSimulator}
                activeOpacity={0.8}
              >
                <Sparkles size={16} color={primaryBrand} />
                <Text style={[styles.simulatedConfirmText, { color: primaryBrand }]}>
                  {isRTL ? 'محاكاة: الزبون أكد الرحلة فوراً ⚡' : 'Simulateur: Le passager confirme⚡'}
                </Text>
              </TouchableOpacity>

              {/* ── 5. Cancel Button ─────────────────────────────────────────── */}
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: surfaceAltBg, borderColor: borderColor }]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelBtnText, { color: textSecondaryColor }]}>
                  {isRTL ? 'إلغاء الانتظار' : 'Annuler'}
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
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  countdownBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  priceRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB33',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  passengerRow: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  passengerMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  addressItem: {
    alignItems: 'center',
    gap: 10,
  },
  pointMarker: {
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
    fontWeight: '600',
    flex: 1,
  },
  simulatedConfirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  simulatedConfirmText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justify.content: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
