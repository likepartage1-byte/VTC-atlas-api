import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Share2,
  Download,
  Calendar,
  Clock,
  Info,
  DollarSign,
  TrendingDown,
  Percent,
} from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { WalletCard } from '../components/WalletCard';
import { WalletEmpty } from '../components/WalletEmpty';
import { WalletButton } from '../components/WalletButton';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { Transaction, TransactionType } from '../../domain/entities/wallet.types';

const ICON_SIZE = 22;

type FilterChip = 'all' | 'recharge' | 'trips' | 'withdrawal' | 'pending' | 'completed' | 'cancelled';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

export const TransactionsScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const { colors } = useTheme();
  const { transactions, balance } = useWallet();
  const isRTL = i18n.language === 'ar';

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  
  // Detail Modal State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Active quick filter lists
  const filterChips: { key: FilterChip; label: string }[] = [
    { key: 'all', label: isRTL ? 'الكل' : i18n.language === 'fr' ? 'Tout' : 'All' },
    { key: 'recharge', label: isRTL ? 'شحن الرصيد' : i18n.language === 'fr' ? 'Rechargement' : 'Top-up' },
    { key: 'trips', label: isRTL ? 'الرحلات' : i18n.language === 'fr' ? 'Courses' : 'Trips' },
    { key: 'withdrawal', label: isRTL ? 'السحب' : i18n.language === 'fr' ? 'Retraits' : 'Withdrawals' },
    { key: 'pending', label: isRTL ? 'المعلقة' : i18n.language === 'fr' ? 'En attente' : 'Pending' },
    { key: 'completed', label: isRTL ? 'المكتملة' : i18n.language === 'fr' ? 'Terminées' : 'Completed' },
    { key: 'cancelled', label: isRTL ? 'الملغاة' : i18n.language === 'fr' ? 'Annulées' : 'Cancelled' },
  ];

  // ─── Filter & Search & Sort Logic ──────────────────────────────────────────
  const processedTxns = useMemo(() => {
    if (!transactions) return [];

    let result = [...transactions];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((tx) => {
        const matchesLabel = tx.label?.toLowerCase().includes(query);
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        const matchesId = tx.id?.toLowerCase().includes(query);
        return matchesLabel || matchesDesc || matchesId;
      });
    }

    // 2. Quick Filter Chip
    result = result.filter((tx) => {
      switch (activeFilter) {
        case 'recharge':
          return tx.type === 'recharge';
        case 'trips':
          return tx.type === 'service_fee' || tx.type === 'vat' || tx.type === 'commission';
        case 'withdrawal':
          return tx.type === 'refund'; // mapped as withdrawal
        case 'pending':
          return tx.status === 'pending';
        case 'completed':
          return tx.status === 'completed';
        case 'cancelled':
          return tx.status === 'cancelled' || tx.status === 'failed';
        case 'all':
        default:
          return true;
      }
    });

    // 3. Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      
      switch (sortOrder) {
        case 'oldest':
          return timeA - timeB;
        case 'highest':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'lowest':
          return Math.abs(a.amount) - Math.abs(b.amount);
        case 'newest':
        default:
          return timeB - timeA;
      }
    });

    return result;
  }, [transactions, searchQuery, activeFilter, sortOrder]);

  // ─── Stats Board Calculations ─────────────────────────────────────────────
  const totalAmount = balance?.amount || 0;
  const pendingAmount = balance?.pending || 0;
  const currency = balance?.currency || 'MAD';

  // Toggle sorting handler
  const handleSortToggle = () => {
    const orders: SortOrder[] = ['newest', 'oldest', 'highest', 'lowest'];
    const nextIdx = (orders.indexOf(sortOrder) + 1) % orders.length;
    setSortOrder(orders[nextIdx]);
  };

  // ─── Actions Handlers ──────────────────────────────────────────────────────
  const handleShare = async (tx: Transaction) => {
    try {
      const shareMsg = isRTL
        ? `تفاصيل العملية المالية أطلس:\nالرقم: ${tx.id}\nالنوع: ${getTransactionTypeLabel(tx.type)}\nالمبلغ: ${formatCurrency(tx.amount, tx.currency)}\nالحالة: ${getStatusText(tx.status)}`
        : `Atlas Transaction details:\nID: ${tx.id}\nType: ${getTransactionTypeLabel(tx.type)}\nAmount: ${formatCurrency(tx.amount, tx.currency)}\nStatus: ${getStatusText(tx.status)}`;
      
      await Share.share({
        message: shareMsg,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDownloadInvoice = (tx: Transaction) => {
    Alert.alert(
      t('download_invoice'),
      t('invoice_download_success') || 'PDF has been downloaded successfully.'
    );
  };

  // Helper translations for statuses mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('completed_status');
      case 'pending':
        return t('pending_review');
      case 'failed':
      case 'cancelled':
        return t('rejected_status');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'pending':
        return { bg: '#FEF7E0', text: '#B06000', border: '#FEEFC3' };
      case 'failed':
      case 'cancelled':
      default:
        return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
    }
  };

  // Helper translations mapping for transaction types
  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'recharge':
        return t('wallet_topup');
      case 'service_fee':
        return isRTL ? 'أرباح الرحلات (رسوم)' : t('trip_earnings');
      case 'vat':
        return isRTL ? 'أرباح الرحلات (ضريبة)' : t('trip_earnings');
      case 'commission':
        return isRTL ? 'أرباح الرحلات (عمولة)' : t('trip_earnings');
      case 'bonus':
        return isRTL ? 'مكافآت الحساب' : 'Bonus';
      case 'refund':
        return t('withdrawal');
      default:
        return type;
    }
  };

  // Helper mappings for transaction icons
  const getTransactionIcon = (type: TransactionType, isCredit: boolean) => {
    if (type === 'recharge') {
      return <ArrowUpRight size={18} color="#137333" />;
    }
    if (type === 'refund') {
      return <ArrowDownLeft size={18} color="#C5221F" />;
    }
    if (type === 'vat') {
      return <Percent size={18} color="#70757A" />;
    }
    return <ArrowDownLeft size={18} color={isCredit ? '#137333' : '#70757A'} />;
  };

  // Helper mapping for payment methods
  const getPaymentMethodLabel = (tx: Transaction) => {
    const desc = tx.description.toLowerCase();
    
    if (desc.includes('cmi')) return 'CMI Gateway';
    if (desc.includes('visa')) return 'Visa';
    if (desc.includes('master')) return 'Mastercard';
    if (desc.includes('virement') || desc.includes('transfer')) return isRTL ? 'تحويل بنكي' : 'Virement Bancaire';
    if (desc.includes('espèces') || desc.includes('cash') || desc.includes('agence')) return isRTL ? 'إيداع نقدي بالوكالة' : 'Dépôt Cash';
    
    return isRTL ? 'محفظة السائق' : 'Solde Portefeuille';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('all_transactions')} />

      {/* ─── 1. Stats Board Container (CIH Style card) ──────────────────── */}
      <View style={styles.statsContainer}>
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Col 1: Available Balance */}
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('total_balance')}
            </Text>
            <Text style={[styles.statVal, { color: colors.textPrimary }]}>
              {formatCurrency(totalAmount, currency)}
            </Text>
          </View>
          
          {/* Separator */}
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          {/* Col 2: Pending Balance */}
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('pending_balance')}
            </Text>
            <Text style={[styles.statVal, { color: '#D97706' }]}>
              {formatCurrency(pendingAmount, currency)}
            </Text>
          </View>
          
          {/* Separator */}
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          {/* Col 3: Count */}
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('operations_count')}
            </Text>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              {processedTxns.length}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── 2. Search & Sort Actions Bar ─────────────────────────────── */}
      <View style={[styles.actionsBar, isRTL && styles.rtlRow]}>
        <View style={[styles.searchWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder={isRTL ? 'ابحث برقم العملية أو وصفها...' : t('search')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Cycle Button */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={handleSortToggle}
          activeOpacity={0.8}
        >
          <ArrowUpDown size={18} color={colors.textPrimary} />
          <Text style={[styles.iconBtnText, { color: colors.textPrimary }]}>
            {sortOrder === 'newest'
              ? (isRTL ? 'الأحدث' : 'Newest')
              : sortOrder === 'oldest'
              ? (isRTL ? 'الأقدم' : 'Oldest')
              : sortOrder === 'highest'
              ? (isRTL ? 'الأعلى' : 'Highest')
              : (isRTL ? 'الأدنى' : 'Lowest')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── 3. Horizontal Scroll Filter Chips ──────────────────────── */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsScroll, isRTL && styles.rtlScroll]}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setActiveFilter(chip.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    isActive && { color: '#ffffff', fontWeight: '800' },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── 4. Premium Transactions Cards List ──────────────────────── */}
      <FlatList
        data={processedTxns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <WalletEmpty
            title={t('no_transactions')}
            subtitle={isRTL ? 'لا توجد عمليات تطابق معايير البحث والفلترة المدخلة حالياً.' : 'Try adjusting your search query or chips filter.'}
          />
        }
        renderItem={({ item }) => {
          const isCredit = item.amount > 0;
          const statusColors = getStatusColor(item.status);
          const locale = i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en');
          const formattedDate = new Date(item.createdAt).toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
          });
          const formattedTime = new Date(item.createdAt).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              onPress={() => setSelectedTx(item)}
              activeOpacity={0.85}
              style={[styles.txnCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.txnCardContent, isRTL && styles.rtlRow]}>
                
                {/* Visual Icon Bg Circle */}
                <View style={[styles.iconCircleBg, { backgroundColor: colors.surfaceAlt }]}>
                  {getTransactionIcon(item.type, isCredit)}
                </View>

                {/* Main Middle section */}
                <View style={[styles.txnDetailsCol, isRTL ? styles.rtlAlignRight : styles.ltrAlignLeft]}>
                  <Text style={[styles.txnLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                    {getTransactionTypeLabel(item.type)}
                  </Text>
                  
                  {/* Date & Time Row */}
                  <View style={[styles.dateTimeRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.dateTimeText, { color: colors.textMuted }]}>
                      {formattedDate}
                    </Text>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.textMuted }]} />
                    <Text style={[styles.dateTimeText, { color: colors.textMuted }]}>
                      {formattedTime}
                    </Text>
                  </View>
                </View>

                {/* Right side status & values */}
                <View style={styles.txnAmountCol}>
                  <Text
                    style={[
                      styles.txnValue,
                      { color: isCredit ? '#137333' : colors.textPrimary },
                      isCredit ? { fontWeight: '800' } : { fontWeight: '700' }
                    ]}
                  >
                    {isCredit ? '+' : ''}{formatCurrency(item.amount, item.currency)}
                  </Text>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusColors.bg,
                        borderColor: statusColors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>

                </View>

              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ─── 5. Beautiful slide-up Transaction detail modal ───────────────── */}
      <Modal
        visible={selectedTx !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTx(null)}
      >
        {selectedTx && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
              {/* Header */}
              <View style={[styles.modalHeader, isRTL && styles.rtlRow]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t('transaction_details')}
                </Text>
                <TouchableOpacity onPress={() => setSelectedTx(null)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Big Amount Badge */}
                <View style={styles.bigAmountContainer}>
                  <Text
                    style={[
                      styles.bigAmountVal,
                      { color: selectedTx.amount > 0 ? '#137333' : colors.textPrimary },
                    ]}
                  >
                    {selectedTx.amount > 0 ? '+' : ''}
                    {formatCurrency(selectedTx.amount, selectedTx.currency)}
                  </Text>
                  
                  <View
                    style={[
                      styles.statusBadgeBig,
                      {
                        backgroundColor: getStatusColor(selectedTx.status).bg,
                        borderColor: getStatusColor(selectedTx.status).border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeBigText, { color: getStatusColor(selectedTx.status).text }]}>
                      {getStatusText(selectedTx.status)}
                    </Text>
                  </View>
                </View>

                {/* Details list fields */}
                <View style={[styles.detailsBox, { borderColor: colors.border }]}>
                  
                  {/* Field 1: Transaction ID */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('transaction_id')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                      {selectedTx.id}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 2: Transaction Type */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('transaction_type')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {getTransactionTypeLabel(selectedTx.type)}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 3: Payment Method */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('payment_method')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                      {getPaymentMethodLabel(selectedTx)}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 4: Amount */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {isRTL ? 'المبلغ الإجمالي' : 'Gross Amount'}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                      {formatCurrency(Math.abs(selectedTx.amount), selectedTx.currency)}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 5: Fees */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('fees')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                      {formatCurrency(0.00, selectedTx.currency)}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 6: Net */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('net_amount')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.primary, fontWeight: '800' }]}>
                      {formatCurrency(Math.abs(selectedTx.amount), selectedTx.currency)}
                    </Text>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 7: Date */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('date')}
                    </Text>
                    <View style={[styles.fieldIconRow, isRTL && styles.rtlRow]}>
                      <Calendar size={14} color={colors.textMuted} />
                      <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                        {new Date(selectedTx.createdAt).toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en'),
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 8: Time */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('time')}
                    </Text>
                    <View style={[styles.fieldIconRow, isRTL && styles.rtlRow]}>
                      <Clock size={14} color={colors.textMuted} />
                      <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>
                        {new Date(selectedTx.createdAt).toLocaleTimeString(
                          i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en'),
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />

                  {/* Field 9: Notes */}
                  <View style={[styles.detailFieldRow, isRTL && styles.rtlRow]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {t('admin_notes')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: colors.textSecondary, fontStyle: 'italic', maxWidth: '60%' }]}>
                      {selectedTx.description}
                    </Text>
                  </View>

                </View>
              </ScrollView>

              {/* Action Buttons Footer block */}
              <View style={styles.modalFooter}>
                <View style={[styles.actionBtnRow, isRTL && styles.rtlRow]}>
                  {/* Share button */}
                  <TouchableOpacity
                    style={[styles.footerActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    onPress={() => handleShare(selectedTx)}
                    activeOpacity={0.8}
                  >
                    <Share2 size={16} color={colors.primary} />
                    <Text style={[styles.footerActionText, { color: colors.primary }]}>
                      {t('share')}
                    </Text>
                  </TouchableOpacity>

                  {/* Download invoice button if recharges or trips */}
                  <TouchableOpacity
                    style={[styles.footerActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    onPress={() => handleDownloadInvoice(selectedTx)}
                    activeOpacity={0.8}
                  >
                    <Download size={16} color={colors.primary} />
                    <Text style={[styles.footerActionText, { color: colors.primary }]}>
                      {t('download_invoice')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <WalletButton
                  label={t('back')}
                  onPress={() => setSelectedTx(null)}
                  variant="outline"
                  style={styles.closeBtnFooter}
                />
              </View>
            </View>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  actionsBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 14,
    gap: 6,
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsContainer: {
    paddingBottom: 10,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  rtlScroll: {
    flexDirection: 'row-reverse',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
    flexGrow: 1,
  },
  txnCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  txnCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnDetailsCol: {
    flex: 1,
    gap: 4,
  },
  txnLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  dateTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  txnAmountCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  txnValue: {
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // ─── Modal Sheet Styles ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '850',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    marginBottom: 16,
  },
  bigAmountContainer: {
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  bigAmountVal: {
    fontSize: 32,
    fontWeight: '900',
  },
  statusBadgeBig: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusBadgeBigText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  detailFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  fieldIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalFooter: {
    gap: 12,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtnFooter: {
    height: 48,
    borderRadius: 12,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlAlignRight: {
    alignItems: 'flex-end',
  },
  ltrAlignLeft: {
    alignItems: 'flex-start',
  },
});
