import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = new Animated.Value(0);
  const dispatch = useDispatch();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('driver_token');
      setTimeout(() => {
        if (token) {
          dispatch(setAuthenticated(token));
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    } catch (e) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.logo}>ATLAS</Text>
        <Text style={styles.tagline}>DRIVER PARTNER</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 10,
  },
  tagline: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
});
