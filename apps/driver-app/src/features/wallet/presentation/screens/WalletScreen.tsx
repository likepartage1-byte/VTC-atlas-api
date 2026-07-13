import React, { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { BalanceCard } from '../components/BalanceCard';
import { PendingCard } from '../components/PendingCard';
import { RechargeButton } from '../components/RechargeButton';
import { TransactionItem } from '../components/TransactionItem';
import { SectionHeader } from '../components/SectionHeader';
import { WalletSkeleton } from '../components/WalletSkeleton';
import { EmptyWallet } from '../components/EmptyWallet';
import { WalletColors } from '../theme/WalletColors';
import { WalletSpacing } from '../theme/WalletSpacing';
import { WalletTypography } from '../theme/WalletTypography';
import { WALLET_ROUTES } from '../../navigation/wallet.routes';
import { Transaction } from '../../domain/entities/wallet.types';

export const WalletScreen = () => {
  const { t } = useTranslation('wallet');
  const navigation = useNavigation<any>();
  const {
    status,
    error,
    isRefreshing,
    balance,
    transactions,
    load,
    refresh,
  } = useWallet();

  console.log('[DEBUG WalletScreen] status:', status, 'error:', error, 'balance:', balance, 'transactions count:', transactions?.length);

  // Load data on focus or mount
  useEffect(() => {
    console.log('[DEBUG WalletScreen] Triggering load()');
    load();
  }, [load]);

  // Group transactions (Today, Yesterday, Older)
  const groupedData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayItems: Transaction[] = [];
    const yesterdayItems: Transaction[] = [];
    const olderItems: Transaction[] = [];

    transactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      const compareDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

      if (compareDate.getTime() === today.getTime()) {
        todayItems.push(tx);
      } else if (compareDate.getTime() === yesterday.getTime()) {
        yesterdayItems.push(tx);
      } else {
        olderItems.push(tx);
      }
    });

    const list: Array<{ type: 'header' | 'item' | 'footer'; title?: string; item?: Transaction }> = [];

    list.push({ type: 'header', title: t('transactions') });

    if (todayItems.length > 0) {
      list.push({ type: 'header', title: t('today') });
      todayItems.forEach((item) => list.push({ type: 'item', item }));
    }

    if (yesterdayItems.length > 0) {
      list.push({ type: 'header', title: t('yesterday') });
      yesterdayItems.forEach((item) => list.push({ type: 'item', item }));
    }

    if (olderItems.length > 0) {
      list.push({ type: 'header', title: t('older') });
      olderItems.forEach((item) => list.push({ type: 'item', item }));
    }

    // Add footer for "Tout afficher" if we have items
    list.push({ type: 'footer' });

    return list;
  }, [transactions, t]);

  const handleClose = () => {
    // Navigate back to Main Orders List Screen
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

  // Rendering individual flatlist row
  const renderRow = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return <SectionHeader title={item.title} />;
    }
    if (item.type === 'item') {
      return (
        <TransactionItem
          transaction={item.item}
          statusLabel={t(item.item.status)}
        />
      );
    }
    if (item.type === 'footer') {
      return (
        <TouchableOpacity style={styles.footerLink} onPress={handleShowAll} activeOpacity={0.7}>
          <Text style={styles.footerText}>{t('show_all')} ›</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Universal header component */}
      <WalletHeader
        title={t('wallet')}
        onClose={handleClose}
      />

      {status === 'loading' ? (
        <WalletSkeleton />
      ) : status === 'error' ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || t('error_load')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={renderRow}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={WalletColors.textPrimary}
              colors={[WalletColors.textPrimary]}
              progressBackgroundColor={WalletColors.surfaceLight}
            />
          }
          ListHeaderComponent={
            balance ? (
              <View style={styles.headerSection}>
                <BalanceCard amount={balance.amount} currency={balance.currency} />
                <PendingCard
                  amount={balance.pending}
                  currency={balance.currency}
                  label={t('pending_amount')}
                  onPress={handlePendingPress}
                />
                <RechargeButton label={t('recharge')} onPress={handleRecharge} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyWallet
              title={t('empty_title')}
              subtitle={t('empty_subtitle')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WalletColors.bg,
  },
  scroll: {
    paddingHorizontal: WalletSpacing.screen,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 16,
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
    color: WalletColors.debit,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: WalletColors.surfaceLight,
  },
  retryText: {
    ...WalletTypography.label,
    color: WalletColors.textPrimary,
  },
  footerLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    ...WalletTypography.label,
    color: WalletColors.textSecondary,
  },
});
export default WalletScreen;
