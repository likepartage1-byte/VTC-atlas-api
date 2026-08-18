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
import { RegisterScreen } from './src/features/auth/RegisterScreen';
import { PhoneAuthScreen } from './src/features/auth/PhoneAuthScreen';
import { OTPVerifyScreen } from './src/features/auth/OTPVerifyScreen';
import { OrdersListScreen } from './src/features/orders/screens/OrdersListScreen';
import { WalletNavigator } from './src/features/wallet/navigation/WalletNavigator';
import { ProfileScreen } from './src/features/profile/ProfileScreen';
import { PersonalInfoScreen } from './src/features/profile/PersonalInfoScreen';
import { VehicleInfoScreen } from './src/features/profile/VehicleInfoScreen';
import { MotorcycleInfoScreen } from './src/features/profile/MotorcycleInfoScreen';
import { DocumentsScreen } from './src/features/profile/DocumentsScreen';
import { DocumentDetailScreen } from './src/features/profile/DocumentDetailScreen';
import { IdentityCardScreen } from './src/features/profile/IdentityCardScreen';
import { DriverLicenseScreen } from './src/features/profile/DriverLicenseScreen';
import { TripHistoryScreen } from './src/features/orders/screens/TripHistoryScreen';
import { TripDetailScreen } from './src/features/orders/screens/TripDetailScreen';
import { AchievementsScreen } from './src/features/profile/AchievementsScreen';
import { DriverLevelScreen } from './src/features/profile/DriverLevelScreen';
import { HelpCenterScreen } from './src/features/support/HelpCenterScreen';
import { SupportChatScreen } from './src/features/support/SupportChatScreen';
import { TermsOfServiceScreen } from './src/features/legal/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from './src/features/legal/PrivacyPolicyScreen';
import { SettingsScreen } from './src/features/settings/SettingsScreen';
import { IntercityTripsScreen } from './src/features/intercity/IntercityTripsScreen';
import { FreightCargoScreen } from './src/features/freight/FreightCargoScreen';
import { FreightSettingsScreen } from './src/features/freight/FreightSettingsScreen';
import { SelectVehicleTypeScreen } from './src/features/onboarding/screens/SelectVehicleTypeScreen';
import { PassengerHomeScreen } from './src/features/passenger/screens/PassengerHomeScreen';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import i18n, { initI18n } from './src/i18n';
import { I18nextProvider } from 'react-i18next';

export type RootStackParamList = {
  Splash: undefined;
  Register: undefined;
  SelectVehicleType: undefined;
  PhoneAuth: undefined;
  OTPVerify: { phoneNumber: string; isRegistration?: boolean; fullName?: string; email?: string; city?: string; role?: 'DRIVER' | 'PASSENGER' };
  Dashboard: undefined;
  PassengerHome: undefined;
  Wallet: undefined;
  Profile: undefined;
  PersonalInfo: undefined;
  VehicleInfo: undefined;
  MotorcycleInfo: undefined;
  Documents: undefined;
  DocumentDetail: { type: string; uploadedDoc?: any };
  IdentityCard: { type?: string; uploadedDoc?: any };
  DriverLicense: { uploadedDoc?: any };
  TripHistory: undefined;
  TripDetail: { trip: any };
  Achievements: undefined;
  DriverLevel: undefined;
  HelpCenter: undefined;
  SupportChat: { conversationId?: string; category?: string } | undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  Settings: undefined;
  IntercityTrips: undefined;
  FreightCargo: undefined;
  FreightSettings: undefined;
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
            <Stack.Screen name="Splash"            component={SplashScreen} />
            <Stack.Screen name="PhoneAuth"   component={PhoneAuthScreen} />
            <Stack.Screen name="Register"          component={RegisterScreen} />
            <Stack.Screen name="SelectVehicleType" component={SelectVehicleTypeScreen} />
            <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
            <Stack.Screen name="Dashboard" component={OrdersListScreen} />
            <Stack.Screen name="PassengerHome" component={PassengerHomeScreen} />
            <Stack.Screen name="Wallet"    component={WalletNavigator} />
            <Stack.Screen name="Profile"   component={ProfileScreen} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
            <Stack.Screen name="MotorcycleInfo" component={MotorcycleInfoScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
            <Stack.Screen name="IdentityCard" component={IdentityCardScreen} />
            <Stack.Screen name="DriverLicense" component={DriverLicenseScreen} />
            <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
            <Stack.Screen name="TripDetail"  component={TripDetailScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="DriverLevel"  component={DriverLevelScreen} />
            <Stack.Screen name="HelpCenter"   component={HelpCenterScreen} />
            <Stack.Screen name="SupportChat"  component={SupportChatScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="PrivacyPolicy"  component={PrivacyPolicyScreen} />
            <Stack.Screen name="Settings"       component={SettingsScreen} />
            <Stack.Screen name="IntercityTrips"  component={IntercityTripsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FreightCargo"   component={FreightCargoScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FreightSettings" component={FreightSettingsScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

import { syncKeepScreenOnNativeSetting, syncOrientationNativeSetting } from './src/services/keepAwake.service';

const App = () => {
  useEffect(() => {
    initI18n();
    syncKeepScreenOnNativeSetting();
    syncOrientationNativeSetting();
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
