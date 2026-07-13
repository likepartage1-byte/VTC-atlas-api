import React, { memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';

// Icon size unified to 20px
const ICON_SIZE = 20;

interface WalletHeaderProps {
  title: string;
}

/**
 * WalletHeader — navigation.goBack() is self-contained.
 * No onClose/onBack prop needed — standard nav pattern.
 */
export const WalletHeader = memo(({ title }: WalletHeaderProps) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isRTL
          ? <ArrowRight size={ICON_SIZE} color={colors.textPrimary} />
          : <ArrowLeft size={ICON_SIZE} color={colors.textPrimary} />
        }
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

      {/* Spacer keeps title visually centred */}
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
    height: 56,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  spacer: {
    width: 38,
  },
});
