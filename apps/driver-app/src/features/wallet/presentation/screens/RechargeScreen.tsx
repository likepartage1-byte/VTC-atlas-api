import React, { useState } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';
import { useWallet } from '../hooks/useWallet';
import { WalletMockRepository } from '../../data/repository/WalletMockRepository';
import { CheckCircle2, AlertTriangle, CreditCard, Landmark } from 'lucide-react-native';

const ICON_SIZE = 20;
const QUICK_AMOUNTS = [50, 100, 200, 500];

type MethodType = 'card' | 'bank_transfer';

export const RechargeScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();
  const { refresh, balance } = useWallet();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<MethodType>('card');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currency = balance?.currency || 'MAD';

  const handleRecharge = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg(t('invalid_amount') || 'Please enter a valid positive amount.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const repo = new WalletMockRepository();
      // Cash/visa matches repo types
      const response = await repo.recharge(method === 'card' ? 'visa' : 'bank_transfer', val);

      if (response.success) {
        setSuccess(true);
        refresh(); // Refresh Zustand balance context
      } else {
        setErrorMsg(response.error || 'Err');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.successContainer}>
          <CheckCircle2 size={64} color={colors.online} />
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
            {t('recharge_success_title') || 'Recharge Successful'}
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            {t('recharge_success_desc', { amount: parseFloat(amount), currency }) ||
              `An amount of ${amount} ${currency} has been added to your balance.`}
          </Text>

          <WalletButton
            label={t('close') || 'Close'}
            onPress={() => setSuccess(false)}
            variant="primary"
            style={styles.closeBtn}
          />
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
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Amount input card */}
          <WalletCard variant="elevated" style={styles.inputCard}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('enter_amount') || 'Enter amount to recharge'}
            </Text>
            <View style={styles.amountInputRow}>
              <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>{currency}</Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setErrorMsg(null);
                }}
                style={[styles.numericInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Quick selectors */}
            <View style={styles.quickGrid}>
              {QUICK_AMOUNTS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickItem,
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    amount === val.toString() && { borderColor: colors.primary, borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    setAmount(val.toString());
                    setErrorMsg(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.quickText,
                      { color: amount === val.toString() ? colors.primary : colors.textPrimary },
                    ]}
                  >
                    +{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </WalletCard>

          {/* Payment Method Selector */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('payment_source') || 'Select payment method'}
          </Text>

          <View style={styles.methodsWrapper}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                method === 'card' && { borderColor: colors.primary, borderWidth: 1.5 },
              ]}
              onPress={() => setMethod('card')}
              activeOpacity={0.8}
            >
              <CreditCard size={ICON_SIZE} color={method === 'card' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.methodLabel, { color: colors.textPrimary }]}>
                {t('payment_card') || 'Credit / Debit Card'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                method === 'bank_transfer' && { borderColor: colors.primary, borderWidth: 1.5 },
              ]}
              onPress={() => setMethod('bank_transfer')}
              activeOpacity={0.8}
            >
              <Landmark size={ICON_SIZE} color={method === 'bank_transfer' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.methodLabel, { color: colors.textPrimary }]}>
                {t('bank_transfer') || 'Bank Transfer / virement'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback error msg */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <AlertTriangle size={18} color={colors.offline} />
              <Text style={[styles.errorText, { color: colors.offline }]}>{errorMsg}</Text>
            </View>
          )}

          {/* Submit */}
          <View style={styles.submitContainer}>
            <WalletButton
              label={t('confirm_recharge') || 'Confirm Recharge'}
              onPress={handleRecharge}
              loading={loading}
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
  },
  inputCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
  },
  numericInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    paddingVertical: 0,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickItem: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  methodsWrapper: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitContainer: {
    marginTop: 12,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  closeBtn: {
    width: '60%',
    marginTop: 24,
  },
});
