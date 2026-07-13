import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { initI18n } from './src/i18n';
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

// Theme
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTPVerify: { phoneNumber: string };
  Dashboard: undefined;
  Wallet: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { isDarkMode, colors } = useTheme();
  const { i18n } = useTranslation();

  // Apply RTL/LTR at the root level so the entire app changes direction
  const isRTL = i18n.language === 'ar';

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
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
