import { formatNumber } from './NumberFormatter';
import { CurrencyCode } from '../../domain/entities/wallet.types';

export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const formattedAmount = formatNumber(amount);
  
  // Format based on standard Moroccan and European standards
  switch (currency) {
    case 'MAD':
      return `${formattedAmount} MAD`;
    case 'EUR':
      return `${formattedAmount} €`;
    case 'USD':
      return `$ ${formattedAmount}`;
    case 'SAR':
      return `${formattedAmount} SAR`;
    default:
      return `${formattedAmount} ${currency}`;
  }
};
