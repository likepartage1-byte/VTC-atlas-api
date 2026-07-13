import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text } from 'react-native';
import { Percent, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletEmpty } from '../components/WalletEmpty';
import { formatCurrency } from '../utils/CurrencyFormatter';

const ICON_SIZE = 20;

export const CommissionScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();
  const { transactions, balance } = useWallet();

  const currency = balance?.currency || 'MAD';

  // Filter only commissions and vat
  const commissionTxns = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(
      (tx) => tx.type === 'commission' || tx.type === 'vat',
    );
  }, [transactions]);

  // Calculate sum
  const totalDeducted = useMemo(() => {
    return commissionTxns.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [commissionTxns]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('commission') || 'Commission & Taxes'} />

      {/* Summary Rates Card */}
      <View style={styles.summaryContainer}>
        <WalletCard variant="elevated" style={styles.summaryCard}>
          <View style={styles.headerInfo}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
              <Percent size={ICON_SIZE} color={colors.primary} />
            </View>
            <View style={styles.metricsCol}>
              <Text style={[styles.rateTitle, { color: colors.textSecondary }]}>
                {t('atlas_commission_rate') || 'Current Atlas Service Rate'}
              </Text>
              <Text style={[styles.rateValue, { color: colors.textPrimary }]}>10.4%</Text>
            </View>
          </View>

          <View style={[styles.detailsDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricsRow}>
            <View style={styles.metricsItem}>
              <Text style={[styles.metricsLabel, { color: colors.textMuted }]}>
                {t('deducted_this_month') || 'Deducted this month'}
              </Text>
              <Text style={[styles.metricsAmount, { color: colors.textPrimary }]}>
                {formatCurrency(totalDeducted, currency)}
              </Text>
            </View>
          </View>
        </WalletCard>
      </View>

      {/* List title */}
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('deductions_history') || 'Deductions History'}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={commissionTxns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_deductions') || 'No Deductions Logged'}
            subtitle={t('deductions_empty_desc') || 'No taxes or service commissions deducted yet.'}
          />
        }
        renderItem={({ item }) => {
          const dateStr = new Date(item.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <WalletCard variant="outline" style={styles.listItem}>
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                    {dateStr} • {item.description}
                  </Text>
                </View>

                <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                  {formatCurrency(Math.abs(item.amount), item.currency)}
                </Text>
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
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    padding: 20,
    gap: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsCol: {
    gap: 2,
  },
  rateTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  detailsDivider: {
    height: StyleSheet.hairlineWidth,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricsItem: {
    flex: 1,
    gap: 4,
  },
  metricsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  listHeader: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 12,
  },
  listItem: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 11,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
