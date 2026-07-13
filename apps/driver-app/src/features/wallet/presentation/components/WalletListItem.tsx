import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../theme/ThemeContext';

const ICON_SIZE = 20;

interface WalletListItemProps {
  title: string;
  description?: string;
  onPress?: () => void;
  icon?: React.ComponentType<{ size: number; color: string }>;
  rightValue?: string;
  rightValueColor?: string;
  showChevron?: boolean;
}

export const WalletListItem = memo(({
  title,
  description,
  onPress,
  icon: IconComponent,
  rightValue,
  rightValueColor,
  showChevron = true,
}: WalletListItemProps) => {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const containerStyles = [
    styles.container,
    { borderBottomColor: colors.border },
  ];

  const content = (
    <View style={styles.row}>
      <View style={styles.leftCol}>
        {IconComponent && (
          <View style={[styles.iconBg, { backgroundColor: colors.surfaceAlt }]}>
            <IconComponent size={ICON_SIZE} color={colors.primary} />
          </View>
        )}
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        {rightValue && (
          <Text style={[styles.rightValue, { color: rightValueColor || colors.textPrimary }]}>
            {rightValue}
          </Text>
        )}
        {showChevron && onPress && (
          isRTL
            ? <ChevronLeft size={ICON_SIZE} color={colors.textMuted} />
            : <ChevronRight size={ICON_SIZE} color={colors.textMuted} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles}>
      {content}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
