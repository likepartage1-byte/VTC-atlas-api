import { ThemeColorsType } from '../../../../theme/ThemeContext';

/**
 * Wallet-specific semantic color aliases.
 * All values resolve from the global theme — no hardcoded hex.
 */
export const getWalletColors = (themeColors: ThemeColorsType) => ({
  ...themeColors,
  // Transaction amounts
  debit:   themeColors.offline,   // red
  credit:  themeColors.online,    // green
  pending: themeColors.warning,   // amber
  // Structural
  separator: themeColors.border,
});

export type WalletColorsType = ReturnType<typeof getWalletColors>;
