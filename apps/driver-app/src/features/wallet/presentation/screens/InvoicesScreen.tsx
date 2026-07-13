import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text, Alert } from 'react-native';
import { FileText, Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletEmpty } from '../components/WalletEmpty';
import { formatCurrency } from '../utils/CurrencyFormatter';

const ICON_SIZE = 20;

export const InvoicesScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();

  // Mock Invoice data
  const invoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2026-07',
      period: 'July 2026',
      totalAmount: 180.50,
      currency: 'MAD',
      issuedAt: new Date('2026-07-01'),
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2026-06',
      period: 'June 2026',
      totalAmount: 432.10,
      currency: 'MAD',
      issuedAt: new Date('2026-06-01'),
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2026-05',
      period: 'May 2026',
      totalAmount: 320.00,
      currency: 'MAD',
      issuedAt: new Date('2026-05-01'),
    },
  ];

  const handleDownload = (invoiceNum: string) => {
    Alert.alert(
      t('download_invoice') || 'Download Invoice',
      t('invoice_download_success', { number: invoiceNum }) ||
        `Invoice ${invoiceNum} PDF has been downloaded successfully to files.`,
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('invoices') || 'Invoices'} />

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
            {t('monthly_statements_title') || 'Your periodic statements'}
          </Text>
        }
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_invoices') || 'No Invoices Available'}
            subtitle={t('invoices_empty_desc') || 'Monthly service bills will generate here.'}
          />
        }
        renderItem={({ item }) => {
          const dateStr = item.issuedAt.toLocaleDateString([], {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <WalletCard variant="elevated" onPress={() => handleDownload(item.invoiceNumber)} style={styles.cardItem}>
              <View style={styles.invoiceRow}>
                <View style={styles.invoiceLeft}>
                  <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <FileText size={ICON_SIZE} color={colors.primary} />
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.titleText, { color: colors.textPrimary }]}>
                      {item.period}
                    </Text>
                    <Text style={[styles.descText, { color: colors.textSecondary }]}>
                      {item.invoiceNumber} • {dateStr}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceRight}>
                  <Text style={[styles.amountText, { color: colors.textPrimary }]}>
                    {formatCurrency(item.totalAmount, item.currency)}
                  </Text>
                  <Download size={16} color={colors.primary} />
                </View>
              </View>
            </WalletCard>
          );
        }}
      />
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
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  invoiceLeft: {
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
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
