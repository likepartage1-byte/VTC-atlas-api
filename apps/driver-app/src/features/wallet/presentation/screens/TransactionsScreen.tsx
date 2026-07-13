import React, { useState, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { TransactionItem } from '../components/TransactionItem';
import { WalletCard } from '../components/WalletCard';
import { WalletEmpty } from '../components/WalletEmpty';
import { Search } from 'lucide-react-native';

const ICON_SIZE = 20;

type FilterTab = 'all' | 'income' | 'expense' | 'pending';

export const TransactionsScreen = () => {
  const { t } = useTranslation('wallet');
  const { colors } = useTheme();
  const { transactions } = useWallet();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredTxns = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx) => {
      // 1. Tab Filter
      if (activeTab === 'income' && tx.amount <= 0) return false;
      if (activeTab === 'expense' && tx.amount >= 0) return false;
      if (activeTab === 'pending' && tx.status !== 'pending') return false;

      // 2. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = tx.label?.toLowerCase().includes(query);
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        return matchesLabel || matchesDesc;
      }

      return true;
    });
  }, [transactions, activeTab, searchQuery]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('all') || 'All' },
    { key: 'income', label: t('income') || 'Income' },
    { key: 'expense', label: t('expense') || 'Expenses' },
    { key: 'pending', label: t('pending') || 'Pending' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('transactions')} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Search size={ICON_SIZE} color={colors.textSecondary} />
          <TextInput
            placeholder={t('search_transactions') || 'Search transactions...'}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTxns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_transactions') || 'No Transactions Found'}
            subtitle={t('search_empty_subtitle') || 'Try adjusting your search query or filters.'}
          />
        }
        renderItem={({ item }) => (
          <WalletCard variant="outline" style={styles.cardItem}>
            <TransactionItem
              transaction={item}
              statusLabel={t(item.status)}
            />
          </WalletCard>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cardItem: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
});
