import React, { memo } from 'react';
import { WalletButton } from './WalletButton';

interface RechargeButtonProps {
  label: string;
  onPress: () => void;
}

export const RechargeButton = memo(({ label, onPress }: RechargeButtonProps) => {
  return (
    <WalletButton
      label={label}
      onPress={onPress}
      variant="primary"
    />
  );
});
