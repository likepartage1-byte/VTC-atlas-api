import React, { memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { getWalletColors } from '../theme/WalletColors';
import { useTranslation } from 'react-i18next';

interface WalletHeaderProps {
  title: string;
  onClose: () => void;
}

export const WalletHeader = memo(({ title, onClose }: WalletHeaderProps) => {
  const { colors } = useTheme();
  const wColors = getWalletColors(colors);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: wColors.surface, borderBottomColor: wColors.separator }]}>
      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: colors.surfaceAlt }]} 
        onPress={onClose} 
        activeOpacity={0.7}
      >
        {isRTL ? (
          <ArrowRight size={22} color={colors.textPrimary} />
        ) : (
          <ArrowLeft size={22} color={colors.textPrimary} />
        )}
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

      {/* Spacer to keep title centered */}
      <View style={styles.spacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    height: 56,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  spacer: {
    width: 38,
  },
});
