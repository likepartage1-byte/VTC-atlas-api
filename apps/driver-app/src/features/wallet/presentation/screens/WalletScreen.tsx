import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../theme/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { WalletHeader } from '../components/WalletHeader';
import { WalletSkeleton } from '../components/WalletSkeleton';
import { WalletCard } from '../components/WalletCard';
import { WalletSection } from '../components/WalletSection';
import { getWalletColors } from '../theme/WalletColors';
import { WALLET_ROUTES } from '../../navigation/wallet.routes';
import { Transaction } from '../../domain/entities/wallet.types';
import {
  Wallet,
  CreditCard,
  PlusCircle,
  Banknote,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  TrendingUp,
  Percent,
  Award,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { key: 'income',       route: WALLET_ROUTES.INCOME,       icon: TrendingUp },
  { key: 'commission',   route: WALLET_ROUTES.COMMISSION,   icon: Percent },
  { key: 'bonus',        route: WALLET_ROUTES.BONUS,        icon: Award },
  { key: 'invoices',     route: WALLET_ROUTES.INVOICES,     icon: FileText },
] as const;

export const WalletScreen = () => {
  const { t, i18n } = useTranslation('wallet');
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const wColors = getWalletColors(colors);
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const isRTL = activeLang === 'ar';

  const { status, error, isRefreshing, balance, transactions, load, refresh } = useWallet();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  // Compute total commission deducted
  const totalCommissionDeducted = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter((tx) => tx.type === 'commission' || tx.type === 'service_fee' || tx.type === 'vat')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  // Sort transactions newest first
  const sortedTxns = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  const isPositiveBalance = (balance?.amount ?? 0) >= 0;

  const getTxTypeLabel = (tx: Transaction) => {
    if (tx.type === 'recharge') {
      return activeLang === 'fr' ? 'Rechargement' : activeLang === 'es' ? 'Recarga de saldo' : activeLang === 'en' ? 'Wallet Top-up' : 'شحن رصيد';
    }
    if (tx.type === 'commission' || tx.type === 'service_fee' || tx.type === 'vat') {
      return activeLang === 'fr' ? 'Déduction de commission' : activeLang === 'es' ? 'Deducción de comisión' : activeLang === 'en' ? 'Commission Deduction' : 'خصم عمولة رحلة';
    }
    if (tx.type === 'refund') {
      return activeLang === 'fr' ? 'Remboursement' : activeLang === 'es' ? 'Reembolso' : activeLang === 'en' ? 'Refund' : 'استرجاع رصيد';
    }
    return tx.label || tx.type;
  };

  const getTxTitle = (tx: Transaction) => {
    const typeLabel = getTxTypeLabel(tx);
    if (tx.rideId) {
      return `${typeLabel} (${tx.rideId})`;
    }
    return typeLabel;
  };

  if (status === 'error') {
    return (
      <View style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WalletHeader title={t('wallet', 'المحفظة والدفع')} />
        <View style={styles.centerBox}>
          <Text style={[styles.errorText, { color: wColors.debit }]}>
            {error || t('error_load', 'تعذّر تحميل المحفظة')}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            onPress={() => load()}
          >
            <Text style={[styles.retryLabel, { color: colors.textPrimary }]}>{t('retry', 'إعادة المحاولة')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <WalletHeader title={t('wallet', 'المحفظة والدفع')} />

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
          {/* ── 1. Top Balance & Account Status Card ───────────────────────── */}
          <View style={styles.sectionPadding}>
            <View style={[styles.heroCard, { backgroundColor: isDarkMode ? '#1E293B' : '#0F172A' }]}>

              {/* Status Badge Pill */}
              <View style={[styles.heroStatusRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[
                  styles.statusPill,
                  { backgroundColor: isPositiveBalance ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    borderColor: isPositiveBalance ? '#22C55E' : '#EF4444' }
                ]}>
                  <Text style={[styles.statusPillText, { color: isPositiveBalance ? '#4ADE80' : '#FCA5A5' }]}>
                    {isPositiveBalance
                      ? t('account_status_active', '🟢 الحساب نشط')
                      : t('account_status_restricted', '🔴 مقيّـد بسبب رصيد سالب')}
                  </Text>
                </View>

                {/* Currency Badge */}
                <Text style={styles.heroCurrencyTag}>{balance?.currency || 'MAD'}</Text>
              </View>

              {/* Main Balance Display */}
              <Text style={styles.heroBalanceLabel}>{t('current_balance', 'الرصيد الحالي')}</Text>
              <Text style={styles.heroBalanceValue}>
                {balance ? `${balance.amount.toFixed(2)} ${balance.currency}` : '0.00 MAD'}
              </Text>

              {/* Summary Stats Row */}
              <View style={[styles.heroStatsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>{t('total_commission_deducted', 'إجمالي العمولات المخصومة')}</Text>
                  <Text style={styles.statBoxValue}>-{totalCommissionDeducted.toFixed(2)} MAD</Text>
                </View>
              </View>

              {/* Top-up Balance Button */}
              <TouchableOpacity
                style={[styles.rechargeBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate(WALLET_ROUTES.RECHARGE)}
                activeOpacity={0.85}
              >
                <PlusCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.rechargeBtnText}>{t('recharge', 'شحن الرصيد')}</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* ── 2. Current Payment Method Section (طريقة الدفع الحالية) ───── */}
          <View style={styles.sectionPadding}>
            <View style={[styles.paymentNoticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              
              <View style={[styles.paymentHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.paymentIconBadge, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <Banknote size={20} color="#22C55E" />
                </View>
                <View style={[{ flex: 1, marginHorizontal: 10 }, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={[styles.paymentHeaderTitle, { color: colors.textSecondary }]}>
                    {t('current_payment_method', 'طريقة الدفع الحالية')}
                  </Text>
                  <Text style={styles.cashBadgeText}>
                    {t('cash_payment_val', '💵 نقدًا (Cash)')}
                  </Text>
                </View>
              </View>

              <View style={[styles.paymentNoticeBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Info size={18} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={[styles.paymentNoticeText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('cash_payment_notice', 'جميع الرحلات في الإصدار الحالي تُدفع نقدًا مباشرةً للسائق، ويتم خصم عمولة المنصة تلقائيًا من محفظة السائق بعد اكتمال الرحلة بنجاح.')}
                </Text>
              </View>

            </View>
          </View>

          {/* ── 3. Transaction History List (مرتبة من الأحدث للأقدم) ────── */}
          <View style={styles.sectionPadding}>
            <WalletSection title={t('recent_transactions', 'سجل العمليات المالية')}>
              <WalletCard variant="elevated" style={styles.cardContainer}>
                {sortedTxns.length === 0 ? (
                  <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                    {t('empty_subtitle', 'ستظهر معاملاتك هنا')}
                  </Text>
                ) : (
                  <>
                    {sortedTxns.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <TouchableOpacity
                          key={tx.id}
                          style={[styles.txItemRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
                          onPress={() => setSelectedTx(tx)}
                          activeOpacity={0.7}
                        >
                          {/* Icon */}
                          <View style={[
                            styles.txIconBox,
                            { backgroundColor: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)' }
                          ]}>
                            {isCredit ? (
                              <ArrowDownLeft size={18} color="#22C55E" />
                            ) : (
                              <ArrowUpRight size={18} color="#F97316" />
                            )}
                          </View>

                          {/* Content */}
                          <View style={[{ flex: 1, marginHorizontal: 12 }, isRTL && { alignItems: 'flex-end' }]}>
                            <Text style={[styles.txItemTitle, { color: colors.textPrimary }]}>
                              {getTxTitle(tx)}
                            </Text>
                            <Text style={[styles.txItemDate, { color: colors.textMuted }]}>
                              {new Date(tx.createdAt).toLocaleDateString(activeLang, {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </Text>
                          </View>

                          {/* Amount */}
                          <Text style={[styles.txItemAmount, { color: isCredit ? '#22C55E' : '#F97316' }]}>
                            {isCredit ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} {tx.currency}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Show All Link */}
                    <TouchableOpacity
                      style={styles.showAllRow}
                      onPress={() => navigation.navigate(WALLET_ROUTES.TRANSACTIONS)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.showAllText, { color: colors.primary }]}>
                        {t('show_all', 'عرض جميع المعاملات')}
                      </Text>
                      {isRTL ? <ChevronLeft size={16} color={colors.primary} /> : <ChevronRight size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  </>
                )}
              </WalletCard>
            </WalletSection>
          </View>

          {/* ── 4. Financial Options Grid ─────────────────────────────────── */}
          <View style={styles.sectionPadding}>
            <WalletSection title={t('financial_options', 'الخيارات المالية')}>
              {/* Row 1 */}
              <View style={styles.gridRow}>
                {QUICK_ACTIONS.slice(0, 2).map((action) => {
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
                        <Icon size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.gridLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                        {t(action.key)}
                      </Text>
                    </WalletCard>
                  );
                })}
              </View>
              {/* Row 2 */}
              <View style={[styles.gridRow, { marginTop: 12 }]}>
                {QUICK_ACTIONS.slice(2, 4).map((action) => {
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
                        <Icon size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.gridLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                        {t(action.key)}
                      </Text>
                    </WalletCard>
                  );
                })}
              </View>
            </WalletSection>
          </View>

        </ScrollView>
      )}

      {/* ── 5. Transaction Details Bottom Sheet Modal ────────────────────── */}
      <Modal
        visible={selectedTx !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                {t('transaction_details', 'تفاصيل العملية المالية')}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTx(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <ScrollView style={{ padding: 20 }}>
                {/* Amount Hero */}
                <View style={styles.modalAmountHero}>
                  <View style={[
                    styles.modalAmountIconBox,
                    { backgroundColor: selectedTx.amount > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)' }
                  ]}>
                    {selectedTx.amount > 0 ? (
                      <ArrowDownLeft size={28} color="#22C55E" />
                    ) : (
                      <ArrowUpRight size={28} color="#F97316" />
                    )}
                  </View>
                  <Text style={[styles.modalAmountValue, { color: selectedTx.amount > 0 ? '#22C55E' : '#F97316' }]}>
                    {selectedTx.amount > 0 ? `+${selectedTx.amount.toFixed(2)}` : selectedTx.amount.toFixed(2)} {selectedTx.currency}
                  </Text>
                  <Text style={[styles.modalTxLabel, { color: colors.textSecondary }]}>
                    {getTxTypeLabel(selectedTx)}
                  </Text>
                </View>

                {/* Details Table */}
                <View style={[styles.detailsTable, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>

                  {/* Ride ID if present */}
                  {selectedTx.rideId && (
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>{t('ride_number', 'رقم الرحلة')}</Text>
                      <Text style={[styles.detailRowValBold, { color: colors.primary }]}>{selectedTx.rideId}</Text>
                    </View>
                  )}

                  {/* Date & Time */}
                  <View style={[styles.detailRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>{t('date_and_time', 'التاريخ والوقت')}</Text>
                    <Text style={[styles.detailRowVal, { color: colors.textPrimary }]}>
                      {new Date(selectedTx.createdAt).toLocaleString(activeLang, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {/* Transaction Type */}
                  <View style={[styles.detailRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>{t('transaction_type', 'نوع العملية')}</Text>
                    <Text style={[styles.detailRowVal, { color: colors.textPrimary }]}>
                      {getTxTypeLabel(selectedTx)}
                    </Text>
                  </View>

                  {/* Balance Before */}
                  {selectedTx.balanceBefore !== undefined && (
                    <View style={[styles.detailRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>{t('balance_before', 'الرصيد قبل العملية')}</Text>
                      <Text style={[styles.detailRowVal, { color: colors.textPrimary }]}>
                        {selectedTx.balanceBefore.toFixed(2)} {selectedTx.currency}
                      </Text>
                    </View>
                  )}

                  {/* Balance After */}
                  {selectedTx.balanceAfter !== undefined && (
                    <View style={[styles.detailRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>{t('balance_after', 'الرصيد بعد العملية')}</Text>
                      <Text style={[styles.detailRowValBold, { color: colors.textPrimary }]}>
                        {selectedTx.balanceAfter.toFixed(2)} {selectedTx.currency}
                      </Text>
                    </View>
                  )}

                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setSelectedTx(null)}
                >
                  <Text style={styles.modalCloseBtnText}>{t('continue', 'متابعة')}</Text>
                </TouchableOpacity>

              </ScrollView>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 48 },
  sectionPadding: { paddingHorizontal: 16, marginTop: 16 },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
  },
  heroStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusPill: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  heroCurrencyTag: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  heroBalanceLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heroBalanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: 0.5, marginBottom: 16 },
  heroStatsRow: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  statBox: { flex: 1 },
  statBoxLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 2 },
  statBoxValue: { color: '#F97316', fontSize: 15, fontWeight: '700' },
  rechargeBtn: {
    height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  rechargeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Payment Notice Card
  paymentNoticeCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  paymentHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paymentIconBadge: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  paymentHeaderTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  cashBadgeText: { fontSize: 16, fontWeight: '800', color: '#22C55E' },
  paymentNoticeBox: {
    flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'flex-start',
  },
  paymentNoticeText: { fontSize: 12.5, lineHeight: 18, flex: 1 },

  // Transaction Items
  cardContainer: { paddingHorizontal: 16, paddingVertical: 4 },
  txItemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1,
  },
  txIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  txItemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  txItemDate: { fontSize: 11.5 },
  txItemAmount: { fontSize: 14, fontWeight: '800' },
  emptyHint: { paddingVertical: 24, textAlign: 'center', fontSize: 13 },
  showAllRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 4,
  },
  showAllText: { fontSize: 13, fontWeight: '700' },

  // Grid
  gridRow: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, alignItems: 'flex-start', gap: 10, paddingVertical: 22, paddingHorizontal: 16 },
  gridIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  gridLabel: { fontSize: 13.5, fontWeight: '600', lineHeight: 19 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, maxHeight: '85%' },
  modalHeader: {
    height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1,
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  modalAmountHero: { alignItems: 'center', marginVertical: 16 },
  modalAmountIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  modalAmountValue: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  modalTxLabel: { fontSize: 14, fontWeight: '600' },
  detailsTable: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  detailRowLabel: { fontSize: 13, fontWeight: '600' },
  detailRowVal: { fontSize: 13 },
  detailRowValBold: { fontSize: 13.5, fontWeight: '700' },
  modalCloseBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalCloseBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  errorText: { textAlign: 'center', fontSize: 15 },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1 },
  retryLabel: { fontSize: 14, fontWeight: '600' },
});

export default WalletScreen;
