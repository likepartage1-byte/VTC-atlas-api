import React, { memo } from 'react';
import { WalletEmpty } from './WalletEmpty';

interface EmptyWalletProps {
  title: string;
  subtitle: string;
}

export const EmptyWallet = memo(({ title, subtitle }: EmptyWalletProps) => {
  return (
    <WalletEmpty
      title={title}
      subtitle={subtitle}
    />
  );
});
