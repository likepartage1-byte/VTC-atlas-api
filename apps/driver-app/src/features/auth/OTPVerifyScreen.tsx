import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Colors } from '../../theme/colors';
import { CustomButton } from '../../components/CustomButton';
import { setAuthenticated } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';

type OTPVerifyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerify'>;
type OTPVerifyScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerify'>;

interface Props {
  navigation: OTPVerifyScreenNavigationProp;
  route: OTPVerifyScreenRouteProp;
}

import { authService } from '../../services/auth.service';

export const OTPVerifyScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { phoneNumber } = route.params;
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length < 6) return;
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(phoneNumber, code);
      const { accessToken, refreshToken } = response.data as any;
      
      await AsyncStorage.setItem('driver_access_token', accessToken);
      await AsyncStorage.setItem('driver_refresh_token', refreshToken);
      
      dispatch(setAuthenticated(accessToken));
      
      navigation.replace('Dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP';
      Alert.alert('Verification Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Sent to +212 {phoneNumber}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>6-Digit Code</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          autoFocus
        />

        <View style={styles.timerRow}>
          <Text style={styles.timerText}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
          </Text>
        </View>

        <CustomButton
          title="Confirm & Login"
          onPress={handleVerify}
          loading={isLoading}
          disabled={code.length < 6}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  header: {
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    height: 70,
    fontSize: 32,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 8,
    marginBottom: 20,
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
