export type WalletStackParamList = {
  WalletHome:        undefined;
  Recharge:          undefined;
  Pending:           undefined;
  Transactions:      undefined;
  PaymentMethods:    { amount: number } | undefined;
  Commission:        undefined;
  Bonus:             undefined;
  Invoices:          undefined;
  InvoicePreview:    { invoiceId: string };
  Income:            undefined;
};
