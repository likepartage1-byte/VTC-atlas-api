import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { YallaSplashAnimation } from '../../components/YallaSplashAnimation';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleAnimationComplete = async () => {
    try {
      const token = await AsyncStorage.getItem('driver_access_token');
      const activeRole = (await AsyncStorage.getItem('@user_active_role')) || 'PASSENGER';

      if (token) {
        dispatch(setAuthenticated(token));
        if (activeRole.toUpperCase() === 'PASSENGER') {
          navigation.replace('PassengerHome');
        } else {
          navigation.replace('Dashboard');
        }
      } else {
        navigation.replace('PhoneAuth');
      }
    } catch (e) {
      navigation.replace('PhoneAuth');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1117" translucent />
      <YallaSplashAnimation
        duration={2500}
        onAnimationComplete={handleAnimationComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
