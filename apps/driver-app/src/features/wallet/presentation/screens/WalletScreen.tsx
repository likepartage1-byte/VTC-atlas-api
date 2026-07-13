import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { BalanceCard } from '../components/BalanceCard';
import { PendingCard } from '../components/PendingCard';
import { RechargeButton } from '../components/RechargeButton';
import { TransactionItem } from '../components/TransactionItem';
import { WalletSkeleton } from '../components/WalletSkeleton';
import { getWalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';
import { WALLET_ROUTES } from '../../navigation/wallet.routes';
import {
  CreditCard,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  Percent,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';

// Unified icon size
const ICON_SIZE = 20;

// ─── Quick Actions Grid Config ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { key: 'payment_methods', route: WALLET_ROUTES.PAYMENT_METHODS, icon: CreditCard },
  { key: 'pending',         route: WALLET_ROUTES.PENDING,         icon: AlertTriangle },
  { key: 'bonus',           route: WALLET_ROUTES.BONUS,           icon: Award },
  { key: 'invoices',        route: WALLET_ROUTES.INVOICES,        icon: FileText },
  { key: 'commission',      route: WALLET_ROUTES.COMMISSION,      icon: Percent },
  { key: 'transactions',    route: WALLET_ROUTES.TRANSACTIONS,    icon: Clock },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────
export const WalletScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);
  const isRTL = i18n.language === 'ar';

  const { status, error, isRefreshing, balance, transactions, load, refresh } = useWallet();

  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Record fetch time once data arrives
  useEffect(() => {
    if (status === 'loaded' && balance) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedText(t('last_updated_at', { time }));
    }
  }, [status, balance, t]);

  // Preview: last 3 transactions only
  const previewTxns = useMemo(
    () => (transactions ? transactions.slice(0, 3) : []),
    [transactions],
  );

  // ─── Error state ────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('wallet')} />
        <View style={styles.centerBox}>
          <Text style={[styles.errorText, { color: wColors.debit }]}>
            {error || t('error_load')}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            onPress={() => load()}
          >
            <Text style={[styles.retryLabel, { color: colors.textPrimary }]}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('wallet')} />

      {status === 'loading' ? (
        <WalletSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.textSecondary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        >
          {/* ── Balance + Pending + Recharge ─────────────────────────── */}
          {balance ? (
            <View style={styles.heroSection}>
              <BalanceCard
                amount={balance.amount}
                currency={balance.currency}
                lastUpdated={lastUpdatedText}
              />
              <PendingCard
                amount={balance.pending}
                currency={balance.currency}
                onPress={() => navigation.navigate(WALLET_ROUTES.PENDING)}
              />
              <RechargeButton
                label={t('recharge')}
                onPress={() => navigation.navigate(WALLET_ROUTES.RECHARGE)}
              />
            </View>
          ) : null}

          {/* ── Divider ──────────────────────────────────────────────── */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ── Recent Transactions (max 3) ───────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t('recent_transactions')}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {previewTxns.length === 0 ? (
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                  {t('empty_subtitle')}
                </Text>
              ) : (
                <>
                  {previewTxns.map((tx, idx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      statusLabel={t(tx.status)}
                    />
                  ))}

                  {/* Show all link */}
                  <TouchableOpacity
                    style={styles.showAllRow}
                    onPress={() => navigation.navigate(WALLET_ROUTES.TRANSACTIONS)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.showAllText, { color: colors.primary }]}>
                      {t('show_all')}
                    </Text>
                    {isRTL
                      ? <ChevronLeft size={ICON_SIZE} color={colors.primary} />
                      : <ChevronRight size={ICON_SIZE} color={colors.primary} />
                    }
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ── Quick Actions Grid ───────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t('financial_options')}
              </Text>
            </View>

            <View style={styles.grid}>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <TouchableOpacity
                    key={action.key}
                    style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => navigation.navigate(action.route)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.gridIconBg, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon size={ICON_SIZE} color={colors.primary} />
                    </View>
                    <Text style={[styles.gridLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                      {t(action.key)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 48,
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 24,
    marginHorizontal: 20,
  },

  // Generic section
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Card container (transactions)
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyHint: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 13,
  },

  // Show all
  showAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  showAllText: {
    ...WalletTypography.label,
    fontSize: 13,
    fontWeight: '700',
  },

  // Quick Actions Grid (2 columns)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Error
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    ...WalletTypography.amount,
    textAlign: 'center',
    fontSize: 15,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
  },
  retryLabel: {
    ...WalletTypography.label,
  },
});

export default WalletScreen;
