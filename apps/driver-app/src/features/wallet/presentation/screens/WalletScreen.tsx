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
import { WalletCard } from '../components/WalletCard';
import { WalletSection } from '../components/WalletSection';
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
  TrendingUp,
} from 'lucide-react-native';

const ICON_SIZE = 20;

// ─── Quick Actions Config ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { key: 'income',          route: WALLET_ROUTES.INCOME,          icon: TrendingUp },
  { key: 'pending',         route: WALLET_ROUTES.PENDING,         icon: AlertTriangle },
  { key: 'bonus',           route: WALLET_ROUTES.BONUS,           icon: Award },
  { key: 'invoices',        route: WALLET_ROUTES.INVOICES,        icon: FileText },
  { key: 'commission',      route: WALLET_ROUTES.COMMISSION,      icon: Percent },
  { key: 'transactions',    route: WALLET_ROUTES.TRANSACTIONS,    icon: Clock },
] as const;

export const WalletScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);
  const isRTL = i18n.language === 'ar';

  const { status, error, isRefreshing, balance, transactions, load, refresh } = useWallet();

  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');

  // ── PERF PROBE ────────────────────────────────────────────────────────────
  console.log(`[WALLET PERF] [3] WalletScreen first render — t=+${Date.now() - ((global as any).walletNavStartTime || Date.now())}ms`);
  // ─────────────────────────────────────────────────────────────────────────
  
  const onLayout = React.useCallback(() => {
    console.log(`[WALLET PERF] [8] First frame displayed — t=+${Date.now() - ((global as any).walletNavStartTime || Date.now())}ms`);
  }, []);

  useEffect(() => {
    // ── PERF PROBE ──────────────────────────────────────────────────────────
    console.log(`[WALLET PERF] [4] useEffect start — t=+${Date.now() - ((global as any).walletNavStartTime || Date.now())}ms`);
    // ────────────────────────────────────────────────────────────────────────
    load();
  }, [load]);

  useEffect(() => {
    if (status === 'loaded' && balance) {
      const time = new Date().toLocaleTimeString(
        i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en'),
        { hour: '2-digit', minute: '2-digit' }
      );
      setLastUpdatedText(t('last_updated_at', { time }));
    }
  }, [status, balance, t]);

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
    <SafeAreaView onLayout={onLayout} style={[styles.safe, { backgroundColor: colors.bg }]}>
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
                pendingAmount={balance.pending}
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
          <WalletSection title={t('recent_transactions')}>
            <WalletCard variant="elevated" style={styles.cardContainer}>
              {previewTxns.length === 0 ? (
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                  {t('empty_subtitle')}
                </Text>
              ) : (
                <>
                  {previewTxns.map((tx) => (
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
                      ? <ChevronLeft size={16} color={colors.primary} />
                      : <ChevronRight size={16} color={colors.primary} />
                    }
                  </TouchableOpacity>
                </>
              )}
            </WalletCard>
          </WalletSection>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ── Quick Actions Grid ───────────────────────────────────── */}
          <WalletSection title={t('financial_options')}>
            <View style={styles.grid}>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <WalletCard
                    key={action.key}
                    variant="elevated"
                    interactive
                    onPress={() => navigation.navigate(action.route)}
                    style={styles.gridItem}
                  >
                    <View style={[styles.gridIconBg, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon size={ICON_SIZE} color={colors.primary} />
                    </View>
                    <Text style={[styles.gridLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                      {t(action.key)}
                    </Text>
                  </WalletCard>
                );
              })}
            </View>
          </WalletSection>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 48,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 24,
    marginHorizontal: 20,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  emptyHint: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 13,
  },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
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
