export interface MarketConfig {
  id: string;
  countryCode: string;
  flag: string;
  name: Record<string, string>;
  currency: {
    code: string;
    symbol: string;
    name: Record<string, string>;
  };
  driverIncentives: {
    trialAmount?: string;
    rewardAmount?: string;
    hasConfirmedValues: boolean;
  };
}

export const MarketsConfig: Record<string, MarketConfig> = {
  MA: {
    id: 'MA',
    countryCode: 'MA',
    flag: '🇲🇦',
    name: {
      AR: 'المغرب',
      FR: 'Maroc',
      EN: 'Morocco',
      ES: 'Marruecos',
    },
    currency: {
      code: 'MAD',
      symbol: 'MAD (د.م.)',
      name: { AR: 'درهم مغربي', FR: 'Dirham marocain', EN: 'Moroccan Dirham', ES: 'Dírhams' },
    },
    driverIncentives: {
      trialAmount: '10 MAD',
      rewardAmount: '600 MAD',
      hasConfirmedValues: true,
    },
  },
  EG: {
    id: 'EG',
    countryCode: 'EG',
    flag: '🇪🇬',
    name: {
      AR: 'مصر',
      FR: 'Égypte',
      EN: 'Egypt',
      ES: 'Egipto',
    },
    currency: {
      code: 'EGP',
      symbol: 'EGP (ج.م.)',
      name: { AR: 'جنيه مصري', FR: 'Livre égyptienne', EN: 'Egyptian Pound', ES: 'Libras' },
    },
    driverIncentives: {
      hasConfirmedValues: false,
    },
  },
  SA: {
    id: 'SA',
    countryCode: 'SA',
    flag: '🇸🇦',
    name: {
      AR: 'السعودية',
      FR: 'Arabie Saoudite',
      EN: 'Saudi Arabia',
      ES: 'Arabia Saudita',
    },
    currency: {
      code: 'SAR',
      symbol: 'SAR (ر.س.)',
      name: { AR: 'ريال سعودي', FR: 'Riyal saoudien', EN: 'Saudi Riyal', ES: 'Riyales' },
    },
    driverIncentives: {
      hasConfirmedValues: false,
    },
  },
};
