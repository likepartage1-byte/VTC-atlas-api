import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../../theme/ThemeContext';
import { WalletStackParamList } from './types';
import { WALLET_ROUTES } from './wallet.routes';
import { WalletScreen } from '../presentation/screens/WalletScreen';

// ─── Dynamic Placeholder Screen ───────────────────────────────────────────────
const PlaceholderScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();

  return (
    <View style={[ph.container, { backgroundColor: colors.bg }]}>
      <Text style={[ph.title, { color: colors.textPrimary }]}>{route.name}</Text>
      <Text style={[ph.sub, { color: colors.textSecondary }]}>Coming in next phase</Text>
      <TouchableOpacity 
        style={[ph.btn, { backgroundColor: colors.primary }]} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={ph.btnText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const ph = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title:     { fontSize: 18, fontWeight: '800' },
  sub:       { fontSize: 13 },
  btn:       { marginTop: 16, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  btnText:   { color: '#fff', fontWeight: '700' },
});

// ─── Stack ────────────────────────────────────────────────────────────────────
const Stack = createStackNavigator<WalletStackParamList>();

export const WalletNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name={WALLET_ROUTES.HOME}            component={WalletScreen} />
      <Stack.Screen name={WALLET_ROUTES.RECHARGE}        component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.PENDING}         component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.TRANSACTIONS}    component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.PAYMENT_METHODS} component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.COMMISSION}      component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.BONUS}           component={PlaceholderScreen} />
      <Stack.Screen name={WALLET_ROUTES.INVOICES}        component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};
