import { formatNumber } from './NumberFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const formattedAmount = formatNumber(amount);
  
  // Format based on standard Moroccan and European standards
  switch (currency) {
    case 'MAD':
      // Return with non-breaking double space (\u00A0) to guarantee a visual gap in RTL and LTR
      return `${formattedAmount}\u00A0\u00A0MAD`;
    case 'EUR':
      return `${formattedAmount}\u00A0\u00A0€`;
    case 'USD':
      return `$ ${formattedAmount}`;
    case 'SAR':
      return `${formattedAmount}\u00A0\u00A0SAR`;
    default:
      return `${formattedAmount}\u00A0\u00A0${currency}`;
  }
};
