import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ArrowDownLeft, Percent, Wallet, ArrowUpRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { Transaction } from '../../domain/entities/wallet.types';
import { WalletTypography } from '../theme/WalletTypography';
import { formatCurrency } from '../utils/CurrencyFormatter';

const ICON_SIZE = 20;

interface TransactionItemProps {
  transaction: Transaction;
  statusLabel: string;
}

export const TransactionItem = memo(({ transaction, statusLabel }: TransactionItemProps) => {
  const { t, i18n } = useTranslation('wallet');
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);
  const isRTL = i18n.language === 'ar';

  const isCredit = transaction.amount > 0;
  const amountColor = isCredit ? wColors.credit : colors.textPrimary;
  const prefix = isCredit ? '+' : '';
  const timeString = new Date(transaction.createdAt).toLocaleTimeString(
    i18n.language === 'ar' ? 'ar-u-nu-latn' : (i18n.language || 'en'),
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const renderIcon = () => {
    switch (transaction.type) {
      case 'vat':
        return <Percent size={ICON_SIZE} color={colors.textSecondary} />;
      case 'recharge':
        return <ArrowUpRight size={ICON_SIZE} color={wColors.credit} />;
      default:
        return <ArrowDownLeft size={ICON_SIZE} color={colors.textSecondary} />;
    }
  };

  const getTransLabel = () => {
    switch (transaction.type) {
      case 'vat':
        return t('vat');
      case 'service_fee':
        return t('service_payment');
      case 'recharge':
        return t('wallet_topup');
      case 'commission':
        return t('commission');
      case 'bonus':
        return t('bonus');
      default:
        return transaction.label;
    }
  };

  const getTransDesc = () => {
    if (transaction.status === 'pending') {
      return statusLabel;
    }
    const desc = transaction.description;
    if (isRTL) {
      if (desc.includes('Taxe sur la valeur ajoutée')) return 'ضريبة القيمة المضافة';
      if (desc.includes('Frais de service Atlas')) return 'رسوم الخدمة أطلس';
      if (desc.includes('Ville de Marrakech')) return 'مدينة مراكش';
      if (desc.includes('Course Ménara')) return 'رحلة المنارة ← النخيل';
      if (desc.includes('Visa se terminant par')) return desc.replace('Visa se terminant par', 'بطاقة Visa تنتهي بـ');
      if (desc.includes('Commission Atlas')) return desc.replace('Commission Atlas', 'عمولة أطلس');
      if (desc.includes('Demande de validation')) return 'طلب مراجعة التحويل البنكي';
      if (desc.includes('Versement')) return 'إيداع نقدي بالوكالة';
      if (desc.includes('Paiement simulé')) return 'إيداع إلكتروني عبر CMI';
    }
    return desc;
  };

  return (
    <View style={[styles.container, isRTL && styles.rtlRow, { borderBottomColor: wColors.separator }]}>
      <View style={[styles.leftRow, isRTL && styles.rtlRow]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
          {renderIcon()}
        </View>
        <View style={[styles.infoCol, isRTL ? styles.rtlAlignRight : styles.ltrAlignLeft]}>
          <Text style={[styles.label, { color: colors.textPrimary }]} numberOfLines={1}>
            {getTransLabel()}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {getTransDesc()}
          </Text>
        </View>
      </View>

      <View style={[styles.rightCol, isRTL ? styles.rtlAlignLeft : styles.ltrAlignRight]}>
        <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
          {prefix}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>{timeString}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1.6, // Give more room to prevent text squashing and overlaps
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...WalletTypography.amount,
    fontSize: 14,
  },
  sub: {
    ...WalletTypography.caption,
    marginTop: 1,
  },
  rightCol: {
    flex: 1,
    gap: 2,
  },
  amount: {
    ...WalletTypography.amount,
    fontSize: 14,
  },
  time: {
    ...WalletTypography.caption,
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
  rtlAlignLeft: {
    alignItems: 'flex-start',
  },
  ltrAlignRight: {
    alignItems: 'flex-end',
  },
});
