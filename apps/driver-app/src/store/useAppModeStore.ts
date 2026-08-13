import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'PASSENGER' | 'DRIVER';

export interface RegisteredUser {
  fullName: string;
  email: string;
  city: string;
  phone: string;
}

interface AppModeState {
  activeMode: AppMode;
  isDriverEligible: boolean;
  registeredUser: RegisteredUser;
  setRegisteredUser: (data: Partial<RegisteredUser>) => Promise<void>;
  setActiveMode: (mode: AppMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  setDriverEligible: (eligible: boolean) => void;
  initMode: () => Promise<void>;
}

const ASYNC_MODE_KEY = '@yalla_active_app_mode';

export const useAppModeStore = create<AppModeState>((set, get) => {
  // Auto-init mode from AsyncStorage immediately upon store instantiation
  setTimeout(() => {
    get().initMode();
  }, 0);

  return {
    activeMode: 'PASSENGER',
    isDriverEligible: false,
    registeredUser: {
      fullName: '',
      email: '',
      city: '',
      phone: '',
    },

    setRegisteredUser: async (data: Partial<RegisteredUser>) => {
      const current = get().registeredUser;
      const updated = {
        fullName: data.fullName !== undefined ? data.fullName : current.fullName,
        email: data.email !== undefined ? data.email : current.email,
        city: data.city !== undefined ? data.city : current.city,
        phone: data.phone !== undefined ? data.phone : current.phone,
      };
      set({ registeredUser: updated });

      try {
        if (data.fullName?.trim()) {
          await AsyncStorage.setItem('registered_full_name', data.fullName.trim());
          await AsyncStorage.setItem('user_full_name', data.fullName.trim());
          await AsyncStorage.setItem('@user_full_name', data.fullName.trim());
        }
        if (data.email?.trim()) {
          await AsyncStorage.setItem('registered_email', data.email.trim());
          await AsyncStorage.setItem('user_email', data.email.trim());
          await AsyncStorage.setItem('@user_email', data.email.trim());
        }
        if (data.city?.trim()) {
          await AsyncStorage.setItem('registered_city', data.city.trim());
          await AsyncStorage.setItem('user_city', data.city.trim());
          await AsyncStorage.setItem('@user_city', data.city.trim());
        }
        if (data.phone?.trim()) {
          await AsyncStorage.setItem('user_phone', data.phone.trim());
          await AsyncStorage.setItem('registered_phone', data.phone.trim());
          await AsyncStorage.setItem('@user_phone', data.phone.trim());
        }
      } catch (_) {}
    },

    initMode: async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@user_active_role');
        const savedMode = await AsyncStorage.getItem(ASYNC_MODE_KEY);
        const fullName  = (await AsyncStorage.getItem('registered_full_name')) || (await AsyncStorage.getItem('user_full_name')) || (await AsyncStorage.getItem('@user_full_name')) || '';
        const email     = (await AsyncStorage.getItem('registered_email')) || (await AsyncStorage.getItem('user_email')) || (await AsyncStorage.getItem('@user_email')) || '';
        const city      = (await AsyncStorage.getItem('registered_city')) || (await AsyncStorage.getItem('user_city')) || (await AsyncStorage.getItem('@user_city')) || '';
        const phone     = (await AsyncStorage.getItem('user_phone')) || (await AsyncStorage.getItem('registered_phone')) || (await AsyncStorage.getItem('@user_phone')) || '';

        const effective: AppMode = savedMode === 'DRIVER' || savedRole === 'DRIVER' ? 'DRIVER' : 'PASSENGER';
        const hasDriverCache = !!(await AsyncStorage.getItem('@vehicle_info_local_cache')) || !!(await AsyncStorage.getItem('@driver_verification_status'));

        set({
          registeredUser: { fullName, email, city, phone },
          activeMode: effective,
          isDriverEligible: effective === 'DRIVER' || hasDriverCache,
        });
      } catch (_) {}
    },

    setActiveMode: async (mode: AppMode) => {
      try {
        await AsyncStorage.setItem(ASYNC_MODE_KEY, mode);
        await AsyncStorage.setItem('@user_active_role', mode);
      } catch (_) {}
      set({ activeMode: mode });
    },

    toggleMode: async () => {
      const { activeMode, isDriverEligible } = get();
      if (!isDriverEligible && activeMode === 'PASSENGER') {
        return; // Passenger-only account cannot switch to Driver mode
      }
      const nextMode: AppMode = activeMode === 'DRIVER' ? 'PASSENGER' : 'DRIVER';
      await get().setActiveMode(nextMode);
    },

    setDriverEligible: (eligible: boolean) => {
      set((state) => ({
        isDriverEligible: eligible,
        // If user is not driver eligible, force activeMode to PASSENGER
        activeMode: eligible ? state.activeMode : 'PASSENGER',
      }));
    },
  };
});
