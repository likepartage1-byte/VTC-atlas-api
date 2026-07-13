import { ThemeColorsType } from '../../../../theme/ThemeContext';

export const getWalletColors = (themeColors: ThemeColorsType) => ({
  ...themeColors,
  balanceText:  themeColors.textPrimary,
  pending:      '#F59E0B',
  debit:        '#EF4444',
  credit:       '#10B981',
  rechargeBtn:  themeColors.primary,
  cardBg:       themeColors.surfaceAlt,
  separator:    themeColors.bg === '#0A0F1E' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
  surfaceLight: themeColors.surfaceAlt,
});
export type WalletColorsType = ReturnType<typeof getWalletColors>;
