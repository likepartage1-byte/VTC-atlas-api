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
import { SectionHeader } from '../components/SectionHeader';
import { WalletSkeleton } from '../components/WalletSkeleton';
import { getWalletColors } from '../theme/WalletColors';
import { WalletSpacing } from '../theme/WalletSpacing';
import { WalletTypography } from '../theme/WalletTypography';
import { WALLET_ROUTES } from '../../navigation/wallet.routes';
import {
  Wallet,
  AlertTriangle,
  Clock,
  CreditCard,
  Percent,
  FileText,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';

export const WalletScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);

  const {
    status,
    error,
    isRefreshing,
    balance,
    transactions,
    load,
    refresh,
  } = useWallet();

  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');

  // Load data on mount
  useEffect(() => {
    load();
  }, [load]);

  // Set last updated time when balance is loaded
  useEffect(() => {
    if (status === 'loaded' && balance) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedText(t('last_updated_at', { time }));
    }
  }, [status, balance, t]);

  const isRTL = i18n.language === 'ar';

  // Preview only the last 3 transactions
  const previewTxns = useMemo(() => {
    if (!transactions) return [];
    return transactions.slice(0, 3);
  }, [transactions]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRecharge = () => {
    navigation.navigate(WALLET_ROUTES.RECHARGE);
  };

  const handlePendingPress = () => {
    navigation.navigate(WALLET_ROUTES.PENDING);
  };

  const handleShowAll = () => {
    navigation.navigate(WALLET_ROUTES.TRANSACTIONS);
  };

  // Financial Options (Footer list configuration)
  const options = [
    { key: 'recharge',        route: WALLET_ROUTES.RECHARGE,        icon: Wallet },
    { key: 'pending',         route: WALLET_ROUTES.PENDING,         icon: AlertTriangle },
    { key: 'transactions',    route: WALLET_ROUTES.TRANSACTIONS,    icon: Clock },
    { key: 'payment_methods', route: WALLET_ROUTES.PAYMENT_METHODS, icon: CreditCard },
    { key: 'commission',      route: WALLET_ROUTES.COMMISSION,      icon: Percent },
    { key: 'invoices',        route: WALLET_ROUTES.INVOICES,        icon: FileText },
    { key: 'bonus',           route: WALLET_ROUTES.BONUS,           icon: Award },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader
        title={t('wallet')}
        onClose={handleClose}
      />

      {status === 'loading' ? (
        <WalletSkeleton />
      ) : status === 'error' ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: wColors.debit }]}>{error || t('error_load')}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.surfaceAlt }]} onPress={() => load()}>
            <Text style={[styles.retryText, { color: colors.textPrimary }]}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.textPrimary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        >
          {/* ─── Balance Card & Recharge ─── */}
          {balance && (
            <View style={styles.mainInfoSection}>
              <BalanceCard
                amount={balance.amount}
                currency={balance.currency}
                lastUpdated={lastUpdatedText}
              />
              
              <PendingCard
                amount={balance.pending}
                currency={balance.currency}
                label={t('pending_desc')}
                onPress={handlePendingPress}
              />
              
              <RechargeButton label={t('recharge')} onPress={handleRecharge} />
            </View>
          )}

          {/* ─── Recent Transactions (Max 3) ─── */}
          <View style={styles.sectionContainer}>
            <SectionHeader title={t('recent_transactions')} />
            
            <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {previewTxns.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('empty_subtitle')}
                </Text>
              ) : (
                <View>
                  {previewTxns.map((tx, idx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      statusLabel={t(tx.status)}
                    />
                  ))}
                  
                  <TouchableOpacity style={styles.footerLink} onPress={handleShowAll} activeOpacity={0.7}>
                    <Text style={[styles.footerText, { color: colors.primary }]}>{t('show_all')}</Text>
                    {isRTL ? (
                      <ChevronLeft size={16} color={colors.primary} style={styles.chevronMargin} />
                    ) : (
                      <ChevronRight size={16} color={colors.primary} style={styles.chevronMargin} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ─── Financial Options (Footer Custom List) ─── */}
          <View style={styles.sectionContainer}>
            <SectionHeader title={t('financial_options')} />
            
            <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {options.map((opt, idx) => {
                const IconComponent = opt.icon;
                const isLast = idx === options.length - 1;
                
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                    onPress={() => navigation.navigate(opt.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.optionIconBg, { backgroundColor: colors.surfaceAlt }]}>
                        <IconComponent size={18} color={colors.primary} />
                      </View>
                      <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                        {t(opt.key)}
                      </Text>
                    </View>
                    <View>
                      {isRTL ? (
                        <ChevronLeft size={16} color={colors.textMuted} />
                      ) : (
                        <ChevronRight size={16} color={colors.textMuted} />
                      )}
                    </View>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: WalletSpacing.screen,
    paddingBottom: 40,
  },
  mainInfoSection: {
    paddingTop: 10,
  },
  sectionContainer: {
    marginTop: 20,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyText: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 13,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  footerText: {
    ...WalletTypography.label,
    fontSize: 13,
    fontWeight: '700',
  },
  chevronMargin: {
    marginLeft: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    ...WalletTypography.amount,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    ...WalletTypography.label,
  },
});

export default WalletScreen;
