import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Check, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';
import { PaymentService, PaymentRechargeConfig } from '../../services/payment.service';
import { WALLET_ROUTES } from '../../navigation/wallet.routes';

export const RechargeScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  // Config State
  const [config, setConfig] = useState<PaymentRechargeConfig | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Input states
  const [amount, setAmount] = useState<string>('');
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

  // Phase 4: Fetch configuration on mount from the Service API (localized)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError(null);
        const service = new PaymentService();
        // Pass dynamic active language code to localize API notices
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

  // Validation function
  const getValidationError = (): string | null => {
    if (!config) return null;
    if (!amount.trim()) return ''; // No error state initially

    const value = parseFloat(amount);
    if (isNaN(value)) return t('error_load'); 
    
    if (value < config.minAmount) {
      return t('min_error', { amount: config.minAmount });
    }
    if (value > config.maxAmount) {
      return t('max_error', { amount: config.maxAmount });
    }

    return null;
  };

  const handleQuickAmtSelect = (val: number) => {
    setSelectedQuick(val);
    setAmount(val.toString());
  };

  const handleCustomAmtInput = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
    
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && config?.quickAmounts.includes(parsed)) {
      setSelectedQuick(parsed);
    } else {
      setSelectedQuick(null);
    }
  };

  const handleContinue = () => {
    const valError = getValidationError();
    if (valError) return;

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    navigation.navigate(WALLET_ROUTES.PAYMENT_METHODS, { amount: parsedAmt });
  };

  const validationError = getValidationError();
  const isInputValid = amount.trim().length > 0 && validationError === null;

  // Show standard fullscreen loading indicator for API config fetch
  if (configLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('recharge')} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
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
        <WalletHeader title={t('recharge')} />
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
      <WalletHeader title={t('recharge')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <WalletCard variant="elevated" style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('choose_amount')}
            </Text>
            
            {/* Quick Amounts Grid */}
            <View style={styles.quickGrid}>
              {config.quickAmounts.map((val) => {
                const isActive = selectedQuick === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.quickCard,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                      isActive && [styles.quickCardActive, { borderColor: colors.primary }]
                    ]}
                    onPress={() => handleQuickAmtSelect(val)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickText, { color: colors.textPrimary }, isActive && { color: colors.primary, fontWeight: '800' }]}>
                      {val} MAD
                    </Text>
                    {isActive && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Check size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount input */}
            <Text style={[styles.subLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              {t('custom_amount_label')}
            </Text>
            
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={handleCustomAmtInput}
                style={[styles.inputField, { color: colors.textPrimary }]}
              />
              <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>MAD</Text>
            </View>

            {/* Info and Warning Messages */}
            {validationError ? (
              <View style={styles.errorBox}>
                <AlertTriangle size={16} color={colors.offline} />
                <Text style={[styles.errorText, { color: colors.offline }]}>
                  {validationError}
                </Text>
              </View>
            ) : (
              <View style={[styles.limitsBox, { borderColor: colors.border }]}>
                <Text style={[styles.limitItem, { color: colors.textSecondary }]}>
                  {t('min_limit_lbl', { amount: config.minAmount })}
                </Text>
                <Text style={[styles.limitItem, { color: colors.textSecondary }]}>
                  {t('max_limit_lbl', { amount: config.maxAmount })}
                </Text>
                <Text style={[styles.limitNote, { color: colors.textMuted }]}>
                  {t('larger_amount_note')}
                </Text>
              </View>
            )}
          </WalletCard>

          {/* Continue button */}
          <View style={styles.btnContainer}>
            <WalletButton
              label={t('continue')}
              onPress={handleContinue}
              disabled={!isInputValid}
              variant="primary"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  card: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  quickCardActive: {
    borderWidth: 2,
    backgroundColor: 'rgba(19, 115, 51, 0.05)',
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkCircle: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 0,
    textAlign: 'left',
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  limitsBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginTop: 8,
  },
  limitItem: {
    fontSize: 12,
    fontWeight: '700',
  },
  limitNote: {
    fontSize: 11,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#FAD2CF',
    borderRadius: 12,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  btnContainer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
