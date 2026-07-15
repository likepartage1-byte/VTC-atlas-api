import React, { memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, I18nManager } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';

// Icon size unified to 20px
const ICON_SIZE = 20;

interface WalletHeaderProps {
  title: string;
  onBack?: () => void;
}

/**
 * WalletHeader — navigation.goBack() is self-contained.
 * Optionally accepts custom onBack for multi-step flows.
 */
export const WalletHeader = memo(({ title, onBack }: WalletHeaderProps) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {I18nManager.isRTL
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
