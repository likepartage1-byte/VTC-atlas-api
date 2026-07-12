import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export interface DriverVehicle {
  make:  string;
  model: string;
  plate: string;
  color: string;
}

export interface DriverProfile {
  name:          string;
  avatar:        string;
  rating:        number;
  city:          string;
  language:      string; // 'ar' | 'fr' | 'en'
  balanceMAD:    number;
  vehicle:       DriverVehicle;
}

interface ProfileState {
  profile: DriverProfile;
  setLanguage: (lang: string) => Promise<void>;
  updateBalance: (amount: number) => void;
  updateProfile: (updates: Partial<DriverProfile>) => void;
}

const DEFAULT_PROFILE: DriverProfile = {
  name: 'Hamza El Aourf',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  rating: 4.85,
  city: 'Marrakech',
  language: 'ar',
  balanceMAD: 250.00,
  vehicle: {
    make: 'Dacia',
    model: 'Logan',
    plate: '12-A-34567',
    color: 'Grey Metallic'
  }
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: DEFAULT_PROFILE,

  setLanguage: async (lang: string) => {
    await AsyncStorage.setItem('user_language', lang);
    await i18n.changeLanguage(lang);
    set((state) => ({
      profile: { ...state.profile, language: lang }
    }));
  },

  updateBalance: (amount: number) => 
    set((state) => ({
      profile: { ...state.profile, balanceMAD: state.profile.balanceMAD + amount }
    })),

  updateProfile: (updates: Partial<DriverProfile>) =>
    set((state) => ({
      profile: { ...state.profile, ...updates }
    })),
}));
