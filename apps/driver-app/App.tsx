import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './src/navigation/navigationRef';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

// Actual Screens
import { SplashScreen } from './src/features/auth/SplashScreen';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { OTPVerifyScreen } from './src/features/auth/OTPVerifyScreen';
import { OrdersListScreen } from './src/features/orders/screens/OrdersListScreen';
import { WalletNavigator } from './src/features/wallet/navigation/WalletNavigator';
import { ProfileScreen } from './src/features/profile/ProfileScreen';
import { PersonalInfoScreen } from './src/features/profile/PersonalInfoScreen';
import { VehicleInfoScreen } from './src/features/profile/VehicleInfoScreen';
import { DocumentsScreen } from './src/features/profile/DocumentsScreen';
import { DocumentDetailScreen } from './src/features/profile/DocumentDetailScreen';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import i18n, { initI18n } from './src/i18n';
import { I18nextProvider } from 'react-i18next';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTPVerify: { phoneNumber: string };
  Dashboard: undefined;
  Wallet: undefined;
  Profile: undefined;
  PersonalInfo: undefined;
  VehicleInfo: undefined;
  Documents: undefined;
  DocumentDetail: { type: string; uploadedDoc?: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isDarkMode, colors } = useTheme();
  const { i18n: currentI18n } = useTranslation();

  // Apply RTL/LTR at the root level so the entire app changes direction
  const isRTL = currentI18n.language === 'ar';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {/* Root direction wrapper: flips the whole app layout for RTL/LTR */}
      <View style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' } as any}>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="Splash"    component={SplashScreen} />
            <Stack.Screen name="Login"     component={LoginScreen} />
            <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
            <Stack.Screen name="Dashboard" component={OrdersListScreen} />
            <Stack.Screen name="Wallet"    component={WalletNavigator} />
            <Stack.Screen name="Profile"   component={ProfileScreen} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

const App = () => {
  useEffect(() => {
    initI18n();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
