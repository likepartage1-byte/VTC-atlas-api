import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { initI18n } from './src/i18n';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './src/navigation/navigationRef';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Actual Screens
import { SplashScreen } from './src/features/auth/SplashScreen';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { OTPVerifyScreen } from './src/features/auth/OTPVerifyScreen';
import { DashboardScreen } from './src/features/dashboard/DashboardScreen';
import { OrdersListScreen } from './src/features/orders/screens/OrdersListScreen';
import { WalletNavigator } from './src/features/wallet/navigation/WalletNavigator';

// Navigation Types
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

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
          <Stack.Screen name="Dashboard" component={OrdersListScreen} />
          <Stack.Screen name="Wallet"    component={WalletNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
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
