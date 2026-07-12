export const WALLET_ROUTES = {
  HOME:            'WalletHome',
  RECHARGE:        'Recharge',
  PENDING:         'Pending',
  TRANSACTIONS:    'Transactions',
  PAYMENT_METHODS: 'PaymentMethods',
  COMMISSION:      'Commission',
  BONUS:           'Bonus',
  INVOICES:        'Invoices',
} as const;

export type WalletRouteName = typeof WALLET_ROUTES[keyof typeof WALLET_ROUTES];
