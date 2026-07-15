import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { InvoiceDetail } from '../../services/invoice.service';

interface InvoiceCardProps {
  invoice: InvoiceDetail;
}

export const InvoiceCard = ({ invoice }: InvoiceCardProps) => {
  const { t, i18n } = useTranslation('wallet');
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const rows = [
    { label: t('invoice_number') || 'Invoice Number', value: invoice.invoiceNumber },
    { label: t('trip_num') || 'Trip', value: `#${invoice.tripNumber}` },
    { label: t('date') || 'Date', value: invoice.issuedAt },
    { label: t('passenger') || 'Passenger', value: invoice.passengerName },
    { label: t('driver') || 'Driver', value: invoice.driverName },
  ];

  return (
    <View style={[styles.invoicePaper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Invoice Title */}
      <View style={styles.header}>
        <Text style={[styles.paperTitle, { color: colors.textPrimary }]}>
          {t('invoice') || 'INVOICE'}
        </Text>
        <Text style={[styles.paperSubtitle, { color: colors.textSecondary }]}>
          Atlas VTC Platform
        </Text>
      </View>

      {/* Dotted border separator */}
      <View style={[styles.dottedLine, { borderBottomColor: colors.border }]} />

      {/* Meta rows */}
      <View style={[styles.metaContainer, isRTL && styles.metaContainerRTL]}>
        {rows.map((row, idx) => (
          <View key={idx} style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {row.label}
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Dotted border separator */}
      <View style={[styles.dottedLine, { borderBottomColor: colors.border }]} />

      {/* Financial Items */}
      <View style={styles.finContainer}>
        {/* Row 1: Course value */}
        <View style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('trip_value') || 'Trip Amount'}
          </Text>
          <Text style={[styles.amountCell, { color: colors.textPrimary }]}>
            {formatCurrency(invoice.tripAmount, invoice.currency)}
          </Text>
        </View>

        {/* Row 2: Atlas Commission (negative/red color) */}
        <View style={[styles.infoRow, isRTL && styles.infoRowRTL, { marginTop: 8 }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('atlas_commission') || 'Atlas Commission'}
          </Text>
          <Text style={[styles.amountCell, { color: colors.warning }]}>
            -{formatCurrency(invoice.atlasCommission, invoice.currency)}
          </Text>
        </View>
      </View>

      {/* Double line before total */}
      <View style={[styles.totalLine, { borderBottomColor: colors.border }]} />

      {/* Total net earnings */}
      <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
        <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
          {t('net_earnings') || 'Net Earnings'}
        </Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>
          {formatCurrency(invoice.netEarnings, invoice.currency)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  invoicePaper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 2,
  },
  paperTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  paperSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  dottedLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 16,
    height: 0,
  },
  totalLine: {
    borderBottomWidth: 2,
    borderStyle: 'solid',
    marginVertical: 14,
  },
  metaContainer: {
    gap: 10,
  },
  metaContainerRTL: {
    alignItems: 'stretch',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoRowRTL: {
    flexDirection: 'row-reverse',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  finContainer: {
    paddingVertical: 4,
  },
  amountCell: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRowRTL: {
    flexDirection: 'row-reverse',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
});
