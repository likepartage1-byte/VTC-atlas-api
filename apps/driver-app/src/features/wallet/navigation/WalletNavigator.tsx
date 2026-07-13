import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { WalletStackParamList } from './types';
import { WALLET_ROUTES } from './wallet.routes';
import { WalletScreen } from '../presentation/screens/WalletScreen';
import { RechargeScreen } from '../presentation/screens/RechargeScreen';
import { PendingPaymentsScreen } from '../presentation/screens/PendingPaymentsScreen';
import { TransactionsScreen } from '../presentation/screens/TransactionsScreen';
import { PaymentMethodsScreen } from '../presentation/screens/PaymentMethodsScreen';
import { CommissionScreen } from '../presentation/screens/CommissionScreen';
import { BonusScreen } from '../presentation/screens/BonusScreen';
import { InvoicesScreen } from '../presentation/screens/InvoicesScreen';

const Stack = createStackNavigator<WalletStackParamList>();

export const WalletNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name={WALLET_ROUTES.HOME}            component={WalletScreen} />
      <Stack.Screen name={WALLET_ROUTES.RECHARGE}        component={RechargeScreen} />
      <Stack.Screen name={WALLET_ROUTES.PENDING}         component={PendingPaymentsScreen} />
      <Stack.Screen name={WALLET_ROUTES.TRANSACTIONS}    component={TransactionsScreen} />
      <Stack.Screen name={WALLET_ROUTES.PAYMENT_METHODS} component={PaymentMethodsScreen} />
      <Stack.Screen name={WALLET_ROUTES.COMMISSION}      component={CommissionScreen} />
      <Stack.Screen name={WALLET_ROUTES.BONUS}           component={BonusScreen} />
      <Stack.Screen name={WALLET_ROUTES.INVOICES}        component={InvoicesScreen} />
    </Stack.Navigator>
  );
};
export default WalletNavigator;
