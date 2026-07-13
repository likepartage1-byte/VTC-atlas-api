import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Text } from 'react-native';
import { AlertCircle, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletEmpty } from '../components/WalletEmpty';
import { formatCurrency } from '../utils/CurrencyFormatter';

const ICON_SIZE = 20;

export const PendingPaymentsScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();
  const { pendingPayments, balance } = useWallet();

  const totalPending = balance?.pending || 0;
  const currency = balance?.currency || 'MAD';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('pending') || 'Pending Payments'} />

      {/* Summary Amber Banner */}
      {totalPending > 0 ? (
        <View style={styles.bannerContainer}>
          <WalletCard style={[styles.banner, { borderColor: colors.warning }]}>
            <View style={styles.bannerRow}>
              <View style={[styles.bannerIconBg, { backgroundColor: colors.surfaceAlt }]}>
                <AlertCircle size={ICON_SIZE} color={colors.warning} />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={[styles.bannerAmount, { color: colors.textPrimary }]}>
                  {formatCurrency(totalPending, currency)}
                </Text>
                <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
                  {t('pending_total_desc') || 'These amounts are verification deposits held under review.'}
                </Text>
              </View>
            </View>
          </WalletCard>
        </View>
      ) : null}

      {/* List */}
      <FlatList
        data={pendingPayments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_pending') || 'No Pending Payments'}
            subtitle={t('pending_empty_subtitle') || 'Everything is settled and up to date.'}
          />
        }
        renderItem={({ item }) => {
          const etaTime = new Date(item.estimatedProcessingAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <WalletCard variant="elevated" style={styles.cardItem}>
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={[styles.timeIconBg, { backgroundColor: colors.surfaceAlt }]}>
                    <Clock size={ICON_SIZE} color={colors.textSecondary} />
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
                      {item.reason}
                    </Text>
                    <Text style={[styles.etaText, { color: colors.textMuted }]}>
                      {t('estimated_payout') || 'Release expected:'} {etaTime}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.amountText, { color: colors.warning }]}>
                  {formatCurrency(item.amount, item.currency)}
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
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  banner: {
    borderWidth: 1,
    padding: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
    gap: 2,
  },
  bannerAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  bannerDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  cardItem: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timeIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  etaText: {
    fontSize: 11,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
