import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text, Alert, Modal, TextInput } from 'react-native';
import { CreditCard, Plus, HelpCircle, Check, Inbox } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletButton } from '../components/WalletButton';
import { WalletListItem } from '../components/WalletListItem';
import { WalletEmpty } from '../components/WalletEmpty';
import { useWalletStore } from '../store/useWalletStore';

const ICON_SIZE = 20;

export const PaymentMethodsScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();
  const { paymentMethods } = useWallet();
  const setPaymentMethods = useWalletStore((s) => s.setPaymentMethods);

  const [modalVisible, setModalVisible] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSetDefault = (id: string) => {
    if (!paymentMethods) return;
    const updated = paymentMethods.map((pm) => ({
      ...pm,
      isDefault: pm.id === id,
    }));
    setPaymentMethods(updated);
  };

  const handleAddCard = () => {
    if (!cardNumber.trim() || cardNumber.length < 12) {
      Alert.alert(t('error') || 'Error', t('invalid_card_details') || 'Please enter valid Visa/Mastercard info.');
      return;
    }

    const brand = cardNumber.startsWith('5') ? 'mastercard' : 'visa';
    const last4 = cardNumber.slice(-4);

    const newMethod = {
      id: `pm-${Date.now()}`,
      type: brand as any,
      label: brand === 'visa' ? 'Visa' : 'Mastercard',
      isDefault: false,
      last4,
    };

    setPaymentMethods([...(paymentMethods || []), newMethod]);
    setModalVisible(false);
    setCardHolder('');
    setCardNumber('');
    setExpiry('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('payment_methods') || 'Payment Methods'} />

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
            {t('saved_methods_title') || 'Your payment methods'}
          </Text>
        }
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_payment_methods') || 'No Payment Methods Saved'}
            subtitle={t('payment_methods_empty_desc') || 'Link a card to start recharging instantly.'}
          />
        }
        renderItem={({ item }) => {
          const desc = item.type === 'cash' 
            ? t('cash_payment_desc') || 'Default offline cash settlement'
            : `•••• •••• •••• ${item.last4}`;

          const isDefault = item.isDefault;

          return (
            <WalletCard variant="elevated" onPress={() => handleSetDefault(item.id)} style={styles.cardItem}>
              <View style={styles.methodRow}>
                <View style={styles.methodLeft}>
                  <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <CreditCard size={ICON_SIZE} color={colors.primary} />
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.titleText, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.descText, { color: colors.textSecondary }]}>
                      {desc}
                    </Text>
                  </View>
                </View>

                {isDefault && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primaryGlow }]}>
                    <Check size={14} color={colors.primary} />
                  </View>
                )}
              </View>
            </WalletCard>
          );
        }}
      />

      {/* Floating Add Button */}
      <View style={styles.bottomContainer}>
        <WalletButton
          label={t('add_payment_method') || 'Add Payment Method'}
          onPress={() => setModalVisible(true)}
          variant="primary"
          icon={Plus}
        />
      </View>

      {/* Add Card Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('new_card_title') || 'Add Credit / Debit Card'}
            </Text>

            <TextInput
              placeholder={t('card_holder') || 'Cardholder Name'}
              placeholderTextColor={colors.textMuted}
              value={cardHolder}
              onChangeText={setCardHolder}
              style={[styles.inputField, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            />

            <TextInput
              placeholder={t('card_number') || 'Card Number'}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={16}
              style={[styles.inputField, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            />

            <TextInput
              placeholder={t('card_expiry') || 'MM/YY'}
              placeholderTextColor={colors.textMuted}
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
              style={[styles.inputField, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            />

            <View style={styles.modalBtnsRow}>
              <WalletButton
                label={t('cancel') || 'Cancel'}
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={styles.halfBtn}
              />
              <WalletButton
                label={t('save') || 'Save Card'}
                onPress={handleAddCard}
                variant="primary"
                style={styles.halfBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardItem: {
    padding: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descText: {
    fontSize: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  inputField: {
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  halfBtn: {
    flex: 1,
  },
});
