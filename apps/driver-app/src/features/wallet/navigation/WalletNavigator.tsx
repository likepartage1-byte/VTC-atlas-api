import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { WalletStackParamList } from './types';
import { WALLET_ROUTES } from './wallet.routes';
import { AtlasColors } from '../../../theme/atlas';

// ─── Placeholder for screens not yet built ───────────────────────────────────
const PlaceholderScreen = ({ route, navigation }: any) => (
  <View style={ph.container}>
    <Text style={ph.title}>{route.name}</Text>
    <Text style={ph.sub}>Coming in next phase</Text>
    <TouchableOpacity style={ph.btn} onPress={() => navigation.goBack()}>
      <Text style={ph.btnText}>← Retour</Text>
    </TouchableOpacity>
  </View>
);

const ph = StyleSheet.create({
  container: { flex: 1, backgroundColor: AtlasColors.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title:     { fontSize: 20, fontWeight: '800', color: AtlasColors.textPrimary },
  sub:       { fontSize: 13, color: AtlasColors.textSecondary },
  btn:       { marginTop: 16, backgroundColor: AtlasColors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  btnText:   { color: '#fff', fontWeight: '700' },
});

// ─── Stack ────────────────────────────────────────────────────────────────────
const Stack = createStackNavigator<WalletStackParamList>();

import { WalletScreen } from '../presentation/screens/WalletScreen';

export const WalletNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: AtlasColors.bg } }}>
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
