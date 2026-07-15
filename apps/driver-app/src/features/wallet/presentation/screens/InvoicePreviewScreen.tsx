import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Download, Share2, AlertCircle } from 'lucide-react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { InvoiceCard } from '../components/InvoiceCard';
import { WalletButton } from '../components/WalletButton';
import { useInvoice } from '../hooks/useInvoice';
import { WalletStackParamList } from '../../navigation/types';

type InvoicePreviewScreenRouteProp = RouteProp<WalletStackParamList, 'InvoicePreview'>;

export const InvoicePreviewScreen = () => {
  const route = useRoute<InvoicePreviewScreenRouteProp>();
  const { invoiceId } = route.params;
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  const {
    loading,
    downloading,
    error,
    invoice,
    refresh,
    download,
    share,
  } = useInvoice(invoiceId);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('invoice_preview') || 'Invoice Preview'} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.infoMsg, { color: colors.textSecondary, marginTop: 12 }]}>
            {t('loading_invoice') || 'Retrieving invoice details...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !invoice) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('invoice_preview') || 'Invoice Preview'} />
        <View style={styles.centered}>
          <AlertCircle size={48} color={colors.offline || 'red'} />
          <Text style={[styles.errorMsg, { color: colors.textPrimary }]}>
            {error || 'Failed to fetch invoice.'}
          </Text>
          <WalletButton
            label={t('retry') || 'Retry'}
            onPress={refresh}
            variant="secondary"
            style={styles.retryBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('invoice_preview') || 'Invoice Preview'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Invoice paper representation */}
        <InvoiceCard invoice={invoice} />

        {/* Action Button Grid */}
        <View style={styles.actionsContainer}>
          <View style={styles.rowButtons}>
            {/* Download PDF button */}
            <WalletButton
              label={t('download') || 'Download'}
              onPress={download}
              variant="secondary"
              loading={downloading}
              icon={Download}
              style={styles.halfBtn}
            />

            {/* Share button */}
            <WalletButton
              label={t('share') || 'Share'}
              onPress={share}
              variant="secondary"
              icon={Share2}
              style={styles.halfBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  infoMsg: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorMsg: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 28,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  halfBtn: {
    flex: 1,
  },
});
