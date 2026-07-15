import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  Landmark,
  CreditCard,
  Store,
  ChevronRight,
  AlertTriangle,
  Check,
  Lock,
  Copy,
  CheckCircle,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';
import { useWallet } from '../hooks/useWallet';
import { PaymentService, PaymentRechargeConfig, BankConfig, AgencyConfig } from '../../services/payment.service';

const ICON_SIZE = 22;

type Step = 'CHOOSE_METHOD' | 'INFO_INPUT' | 'CONFIRMATION';
type Method = 'VIR' | 'CARD' | 'AGENCY';

export const PaymentMethodsScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const { colors } = useTheme();
  const route = useRoute<any>();
  const rechargeAmount = route.params?.amount || 100;

  // Bind wallet hook actions to avoid direct state mutation
  const { recharge } = useWallet();

  // API Config State for Phase 4 (no hardcoded data in UI)
  const [config, setConfig] = useState<PaymentRechargeConfig | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // User flow states
  const [currentStep, setCurrentStep] = useState<Step>('CHOOSE_METHOD');
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankConfig | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<AgencyConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // Tap animation scales
  const cardScaleBank = useRef(new Animated.Value(1)).current;
  const cardScaleCard = useRef(new Animated.Value(1)).current;
  const cardScaleAgency = useRef(new Animated.Value(1)).current;

  // Phase 4: Fetch configuration on mount from the Service API (localized)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError(null);
        const service = new PaymentService();
        // Pass dynamic active language coordinate
        const response = await service.fetchRechargeConfig(i18n.language);
        if (response.success) {
          setConfig(response.data);
        } else {
          setConfigError(response.error);
        }
      } catch (err: any) {
        setConfigError(err.message || 'Failed to load configuration');
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, [i18n.language]);

  // Helper for item press feedback animation
  const animatePress = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleSelectMethod = (method: Method) => {
    let anim = cardScaleBank;
    if (method === 'CARD') anim = cardScaleCard;
    if (method === 'AGENCY') anim = cardScaleAgency;
    animatePress(anim);

    setSelectedMethod(method);
    setCurrentStep('INFO_INPUT');
  };

  const handleBack = () => {
    if (currentStep === 'CONFIRMATION') {
      if (selectedMethod === 'CARD') {
        setCurrentStep('CHOOSE_METHOD');
      } else {
        setCurrentStep('INFO_INPUT');
      }
    } else if (currentStep === 'INFO_INPUT') {
      setCurrentStep('CHOOSE_METHOD');
      setSelectedBank(null);
      setSelectedAgency(null);
    }
  };

  const handleBankSelect = (bank: BankConfig) => {
    setSelectedBank(bank);
    setCurrentStep('CONFIRMATION');
  };

  const handleAgencySelect = (agency: AgencyConfig) => {
    setSelectedAgency(agency);
    setCurrentStep('CONFIRMATION');
  };

  const executeVirementCompleted = async () => {
    setLoading(true);
    try {
      const res = await recharge('bank_transfer', rechargeAmount);
      setLoading(false);
      if (res.success) {
        Alert.alert(
          t('received'),
          t('virement_submitted_msg'),
          [{ text: 'OK', onPress: () => resetStepper() }]
        );
      } else {
        Alert.alert('Erreur', res.error || 'Impossible de soumettre le virement');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    }
  };

  const executeAgencyCompleted = async () => {
    setLoading(true);
    try {
      const res = await recharge('cash', rechargeAmount);
      setLoading(false);
      if (res.success) {
        Alert.alert(
          t('received'),
          t('virement_submitted_msg'),
          [{ text: 'OK', onPress: () => resetStepper() }]
        );
      } else {
        Alert.alert('Erreur', res.error || 'Impossible de soumettre le dépôt');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    }
  };

  const executeCardPayment = async () => {
    if (!config) return;
    setLoading(true);
    try {
      // Simulate CMI confirmation. Triggers simulated local database updates
      const res = await recharge('visa', rechargeAmount);
      setLoading(false);
      if (res.success) {
        setRechargeSuccess(true);
      } else {
        Alert.alert('Erreur', res.error || 'Impossible de finaliser le paiement CMI');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    }
  };

  const resetStepper = () => {
    setCurrentStep('CHOOSE_METHOD');
    setSelectedMethod(null);
    setSelectedBank(null);
    setSelectedAgency(null);
    setRechargeSuccess(false);
  };

  // Get active step index for navigation header
  const getStepProgressIndex = () => {
    if (currentStep === 'CHOOSE_METHOD') return 1;
    if (currentStep === 'INFO_INPUT') return 2;
    return 3;
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    Alert.alert(t('copied_title'), t('copy_success_msg', { label }));
  };

  // Show standard fullscreen loading indicator for API config fetch
  if (configLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('payment_methods')} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingConfigText, { color: colors.textSecondary }]}>
            {t('load_configs')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show failure state
  if (configError || !config) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('payment_methods')} />
        <View style={styles.centerBox}>
          <AlertTriangle size={48} color={colors.offline} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            {t('conn_error')}
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            {t('conn_error_sub')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader
        title={t('payment_methods')}
        onBack={currentStep !== 'CHOOSE_METHOD' ? handleBack : undefined}
      />

      {/* 🟢 Secure Banner */}
      <View style={[styles.secureBanner, { backgroundColor: '#E6F4EA' }]}>
        <Lock size={14} color="#137333" />
        <Text style={styles.secureBannerText}>
          {t('sec_banner_note')}
        </Text>
      </View>

      {/* ⏳ Stepper Progress Bar */}
      <View style={[styles.stepperContainer, { borderColor: colors.border }]}>
        <View style={styles.stepperRow}>
          <View style={styles.stepPointItem}>
            <View style={[styles.stepCircle, getStepProgressIndex() >= 1 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }]}>
              {getStepProgressIndex() > 1 ? (
                <Check size={12} color="#fff" />
              ) : (
                <Text style={styles.stepPointNum}>1</Text>
              )}
            </View>
            <Text style={[styles.stepPointLabel, { color: getStepProgressIndex() >= 1 ? colors.textPrimary : colors.textMuted }]}>
              {t('step_method')}
            </Text>
          </View>

          <View style={[styles.stepLine, { backgroundColor: getStepProgressIndex() >= 2 ? colors.primary : colors.border }]} />

          <View style={styles.stepPointItem}>
            <View style={[styles.stepCircle, getStepProgressIndex() >= 2 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }]}>
              {getStepProgressIndex() > 2 ? (
                <Check size={12} color="#fff" />
              ) : (
                <Text style={styles.stepPointNum}>2</Text>
              )}
            </View>
            <Text style={[styles.stepPointLabel, { color: getStepProgressIndex() >= 2 ? colors.textPrimary : colors.textMuted }]}>
              {t('step_details')}
            </Text>
          </View>

          <View style={[styles.stepLine, { backgroundColor: getStepProgressIndex() >= 3 ? colors.primary : colors.border }]} />

          <View style={styles.stepPointItem}>
            <View style={[styles.stepCircle, getStepProgressIndex() >= 3 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }]}>
              <Text style={styles.stepPointNum}>3</Text>
            </View>
            <Text style={[styles.stepPointLabel, { color: getStepProgressIndex() >= 3 ? colors.textPrimary : colors.textMuted }]}>
              {t('step_confirm')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* STEP 1: CHOOSE METHOD */}
        {currentStep === 'CHOOSE_METHOD' && (
          <View style={styles.stepBox}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('payment_methods')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {t('choose_method_subtitle')}
            </Text>

            {/* Card 1: Bank Transfer */}
            <Animated.View style={{ transform: [{ scale: cardScaleBank }] }}>
              <TouchableOpacity
                onPress={() => handleSelectMethod('VIR')}
                activeOpacity={0.9}
                style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
                  <Landmark size={24} color="#1D4ED8" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    {t('bank_transfer_title')}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {t('bank_transfer_desc')}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>

            {/* Card 2: Card Payment (CMI) */}
            <Animated.View style={{ transform: [{ scale: cardScaleCard }] }}>
              <TouchableOpacity
                onPress={() => handleSelectMethod('CARD')}
                activeOpacity={0.9}
                style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
                  <CreditCard size={24} color="#10B981" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    {t('cmi_card_title')}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {t('cmi_card_desc')}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>

            {/* Card 3: Agency Deposit (Cash Plus / Wafacash) */}
            <Animated.View style={{ transform: [{ scale: cardScaleAgency }] }}>
              <TouchableOpacity
                onPress={() => handleSelectMethod('AGENCY')}
                activeOpacity={0.9}
                style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
                  <Store size={24} color="#EA580C" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    {t('agency_deposit_title')}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {t('agency_deposit_desc')}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* STEP 2: BANK SELECT LIST */}
        {currentStep === 'INFO_INPUT' && selectedMethod === 'VIR' && (
          <View style={styles.stepBox}>
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
              {t('choose_bank_title')}
            </Text>
            <View style={styles.banksGrid}>
              {config.banks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  onPress={() => handleBankSelect(bank)}
                  style={[styles.bankItemCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: bank.brandColor }]}
                >
                  <View style={[styles.bankSmallIconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <Landmark size={16} color={bank.brandColor} />
                  </View>
                  <Text style={[styles.bankItemText, { color: colors.textPrimary }]}>
                    {bank.name}
                  </Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: AGENCY SELECT LIST */}
        {currentStep === 'INFO_INPUT' && selectedMethod === 'AGENCY' && (
          <View style={styles.stepBox}>
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
              {t('choose_agency_title')}
            </Text>
            <View style={styles.banksGrid}>
              {config.agencies.map((agency) => (
                <TouchableOpacity
                  key={agency.id}
                  onPress={() => handleAgencySelect(agency)}
                  style={[styles.bankItemCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: agency.brandColor }]}
                >
                  <View style={[styles.bankSmallIconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <Store size={16} color={agency.brandColor} />
                  </View>
                  <Text style={[styles.bankItemText, { color: colors.textPrimary }]}>
                    {agency.name}
                  </Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2/3: CARD PORTAL DIRECTLY (No bank list since credit card does CMI) */}
        {currentStep === 'INFO_INPUT' && selectedMethod === 'CARD' && (
          <View style={styles.stepBox}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={[styles.secureStatusText, { color: colors.textPrimary, marginTop: 12 }]}>
                  {t('cmi_conn_loading')}
                </Text>
                <Text style={styles.securedSubText}>
                  {t('cmi_wait_validation')}
                </Text>
              </View>
            ) : rechargeSuccess ? (
              <View style={styles.successContainer}>
                <CheckCircle size={56} color="#10B981" />
                <Text style={[styles.successTitle, { color: colors.textPrimary, marginTop: 16 }]}>
                  {t('recharge_success_title')}
                </Text>
                <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                  {t('recharge_success_desc', { amount: rechargeAmount.toFixed(2) })}
                </Text>
                <WalletButton
                  label={t('back_to_home')}
                  onPress={resetStepper}
                  variant="primary"
                  style={styles.successBtn}
                />
              </View>
            ) : (
              <View style={styles.cardDetailBox}>
                {/* Visual Premium Black Card mockup */}
                <View style={styles.visualCardMock}>
                  <View style={styles.mockHeader}>
                    <Text style={styles.mockPremiumTitle}>YALLA VTC DRIVER</Text>
                    <View style={styles.greenGlowPad}>
                      <Lock size={12} color="#00ff66" />
                    </View>
                  </View>
                  <View style={styles.mockChip} />
                  <Text style={styles.mockNumber}>•••• •••• •••• 4528</Text>
                  <View style={styles.mockFooter}>
                    <Text style={styles.mockHolderName}>KHALID EL MARRAKCHI</Text>
                    <Text style={styles.mockExpiryLabel}>07 / 29</Text>
                  </View>
                </View>

                {/* SECURE SUB DETAILS */}
                <View style={[styles.cmiSecPanel, { borderColor: colors.border }]}>
                  <Text style={[styles.cmiBoldText, { color: colors.textPrimary }]}>
                    {t('cmi_secure_title')}
                  </Text>
                  <Text style={[styles.cmiDescText, { color: colors.textSecondary }]}>
                    {config.cmi.securedMessage}
                  </Text>
                </View>

                {/* Visa / Master / CMI Logos row */}
                <View style={styles.cmiLogosRow}>
                  <Text style={styles.logoBadgeText}>VISA</Text>
                  <Text style={styles.logoBadgeBorder}>|</Text>
                  <Text style={styles.logoBadgeText}>Mastercard</Text>
                  <Text style={styles.logoBadgeBorder}>|</Text>
                  <Text style={[styles.logoBadgeText, { color: '#00ff66', fontWeight: 'bold' }]}>CMI</Text>
                </View>

                <WalletButton
                  label={i18n.language === 'ar' ? 'ادفع الآن' : 'Payer maintenant'}
                  onPress={executeCardPayment}
                  variant="primary"
                  style={styles.payBtn}
                />
              </View>
            )}
          </View>
        )}

        {/* STEP 3: CONFIRMATION (BANK INFORMATION OR AGENCY TICKET) */}
        {currentStep === 'CONFIRMATION' && selectedMethod === 'VIR' && selectedBank && (
          <View style={styles.stepBox}>
            <Text style={[styles.confirmationTitle, { color: colors.textPrimary }]}>
              {t('bank_info_header', { bankName: selectedBank.name })}
            </Text>

            {/* Paper Invoice bank details */}
            <View style={[styles.invoiceInfoPaper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Row 0: Montant */}
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>{t('bank_virement_amount')}</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.primary, fontWeight: '800' }]}>
                    {rechargeAmount.toFixed(2)} MAD
                  </Text>
                </View>
              </View>

              <View style={styles.bankDetailDivider} />

              {/* Row 1: Beneficiary */}
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>{t('bank_beneficiary')}</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.textPrimary }]}>{selectedBank.beneficiary}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(selectedBank.beneficiary, t('bank_beneficiary'))}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailDivider} />

              {/* Row 2: IBAN */}
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>IBAN</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedBank.iban}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(selectedBank.iban, 'IBAN')}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailDivider} />

              {/* Row 3: RIB */}
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>RIB</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.textPrimary }]}>
                    {selectedBank.rib}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(selectedBank.rib, 'RIB')}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailDivider} />

              {/* Row 4: BIC */}
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>BIC/SWIFT</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.textPrimary }]}>{selectedBank.swift}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(selectedBank.swift, 'BIC/SWIFT')}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Warning yellow alert card */}
            <View style={styles.yellowWarningCard}>
              <AlertTriangle size={24} color="#EA580C" />
              <View style={styles.warningInfoCol}>
                <Text style={styles.warningTextHeader}>️{t('warning_title')}</Text>
                <Text style={styles.warningDesc}>
                  {config.warningNotice}
                </Text>
              </View>
            </View>

            <WalletButton
              label={t('virement_done_btn')}
              onPress={executeVirementCompleted}
              loading={loading}
              variant="primary"
              style={styles.confirmVirementBtn}
            />
          </View>
        )}

        {currentStep === 'CONFIRMATION' && selectedMethod === 'AGENCY' && selectedAgency && (
          <View style={styles.stepBox}>
            <Text style={[styles.confirmationTitle, { color: colors.textPrimary }]}>
              {t('agency_deposit_header', { agencyName: selectedAgency.name })}
            </Text>

            {/* Agency Receipt info card */}
            <View style={[styles.invoiceInfoPaper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>{t('bank_beneficiary')}</Text>
                <Text style={[styles.bankDetailValue, { color: colors.textPrimary }]}>
                  {selectedAgency.beneficiary}
                </Text>
              </View>

              <View style={styles.bankDetailDivider} />

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>{t('agency_client_num')}</Text>
                <View style={styles.bankDetailValueRow}>
                  <Text style={[styles.bankDetailValue, { color: colors.primary, fontWeight: '800' }]}>
                    {selectedAgency.clientNumber}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(selectedAgency.clientNumber, t('agency_client_num'))}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailDivider} />

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>{t('agency_montant')}</Text>
                <Text style={[styles.bankDetailValue, { color: colors.primary, fontWeight: '800' }]}>
                  {rechargeAmount.toFixed(2)} MAD
                </Text>
              </View>
            </View>

            {/* Hint Notice */}
            <View style={[styles.agencyNoticeBox, { backgroundColor: '#F8FAFC', borderColor: colors.border }]}>
              <Text style={styles.agencyNoticeText}>
                {config.agencyNotice}
              </Text>
            </View>

            <WalletButton
              label={t('btn_finish')}
              onPress={executeAgencyCompleted}
              loading={loading}
              variant="primary"
              style={styles.confirmVirementBtn}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secureBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#137333',
  },
  stepperContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepPointItem: {
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepPointNum: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  stepPointLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    alignSelf: 'center',
    marginTop: -14,
  },
  stepBox: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  banksGrid: {
    gap: 10,
  },
  bankItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  bankSmallIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankItemText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  confirmationTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  invoiceInfoPaper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  bankDetailRow: {
    gap: 4,
  },
  bankDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  bankDetailValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  bankDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  bankDetailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#CBD5E1',
  },
  yellowWarningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  warningInfoCol: {
    flex: 1,
    gap: 4,
  },
  warningTextHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  warningDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
  },
  confirmVirementBtn: {
    marginTop: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  loadingConfigText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  securedSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  successDesc: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  successBtn: {
    marginTop: 24,
    width: '100%',
  },
  cardDetailBox: {
    gap: 20,
  },
  visualCardMock: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    height: 180,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockPremiumTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  greenGlowPad: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  mockChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
  },
  mockNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  mockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockHolderName: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  mockExpiryLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  cmiSecPanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cmiBoldText: {
    fontSize: 13,
    fontWeight: '800',
  },
  cmiDescText: {
    fontSize: 12,
    lineHeight: 18,
  },
  cmiLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  logoBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  logoBadgeBorder: {
    color: '#CBD5E1',
  },
  payBtn: {
    backgroundColor: '#10B981',
  },
  agencyNoticeBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  agencyNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
});
