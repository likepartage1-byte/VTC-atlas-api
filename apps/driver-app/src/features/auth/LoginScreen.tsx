import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { CustomButton } from '../../components/CustomButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

import { authService } from '../../services/auth.service';

export const LoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!phoneNumber) return;
    setIsLoading(true);
    try {
      await authService.requestOtp(phoneNumber);
      navigation.navigate('OTPVerify', { phoneNumber });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP';
      Alert.alert('Error', errorMsg);
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
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>Sign in to start your shift</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('phone_number')}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+212</Text>
          <TextInput
            style={styles.input}
            placeholder="600 000 000"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <CustomButton
          title={t('login')}
          onPress={handleRequestOTP}
          loading={isLoading}
          disabled={phoneNumber.length < 9}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 32,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  button: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
