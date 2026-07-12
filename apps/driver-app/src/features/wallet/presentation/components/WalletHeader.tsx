import React, { memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { X, Globe } from 'lucide-react-native';
import { WalletColors } from '../theme/WalletColors';
import { WalletTypography } from '../theme/WalletTypography';

interface WalletHeaderProps {
  title: string;
  onClose: () => void;
  onLanguagePress?: () => void;
}

export const WalletHeader = memo(({ title, onClose, onLanguagePress }: WalletHeaderProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.7}>
        <X size={22} color={WalletColors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.btn} onPress={onLanguagePress} activeOpacity={0.7}>
        <Globe size={20} color={WalletColors.textPrimary} />
      </TouchableOpacity>
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
    borderBottomColor: WalletColors.separator,
    backgroundColor: WalletColors.bg,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: WalletColors.textPrimary,
  },
});
