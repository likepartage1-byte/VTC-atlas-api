import { Platform, NativeModules, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@yalla_driver_app_settings';

// Global state tracking whether the driver is currently online or in an active trip
let globalIsOnline = false;
let globalHasActiveTrip = false;

export const setGlobalDriverWorkStatus = (isOnline: boolean, hasActiveTrip: boolean = false) => {
  globalIsOnline = isOnline;
  globalHasActiveTrip = hasActiveTrip;
};

/**
 * Smart, context-aware Keep Screen On controller for Yalla VTC (Uber/Bolt standard).
 * @param isWorkScreen - true for Orders/Dashboard/Map, false for Profile/Settings/Help/Docs.
 */
export const syncKeepScreenOnNativeSetting = async (isWorkScreen: boolean = false) => {
  if (Platform.OS !== 'android' || !NativeModules.SoundModule?.setKeepScreenOn) return;

  try {
    const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    let keepOnPreference = true; // default setting

    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.keepScreenOn === 'boolean') {
        keepOnPreference = parsed.keepScreenOn;
      }
    }

    // Keep screen on ONLY if user enabled preference AND (on a Work Screen OR Online OR Active Trip)
    const shouldKeepOn = keepOnPreference && (isWorkScreen || globalIsOnline || globalHasActiveTrip);

    await NativeModules.SoundModule.setKeepScreenOn(shouldKeepOn);
    console.log(`[KEEP AWAKE SERVICE] Context-aware FLAG_KEEP_SCREEN_ON set to: ${shouldKeepOn} (pref: ${keepOnPreference}, workScreen: ${isWorkScreen}, online: ${globalIsOnline}, trip: ${globalHasActiveTrip})`);
  } catch (err) {
    console.error('[KEEP AWAKE SERVICE] Error applying native flag:', err);
  }
};

/**
 * Native Orientation Controller for Yalla VTC.
 * Mode 'portrait': Locks screen to Portrait Only (ignores device auto-rotate).
 * Mode 'auto': Unlocks screen to rotate dynamically with device sensor.
 */
export const syncOrientationNativeSetting = async (forceMode?: 'portrait' | 'auto') => {
  if (Platform.OS !== 'android' || !NativeModules.SoundModule?.setRequestedOrientation) return;

  try {
    let modeToApply = forceMode;
    if (!modeToApply) {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      modeToApply = 'portrait'; // default to Portrait Only
      if (stored) {
        const parsed = JSON.parse(stored);
        const savedMode = parsed.orientationMode || parsed.screenOrientation;
        if (savedMode === 'auto') {
          modeToApply = 'auto';
        } else if (savedMode === 'portrait') {
          modeToApply = 'portrait';
        }
      }
    }

    await NativeModules.SoundModule.setRequestedOrientation(modeToApply);
    console.log(`[ORIENTATION SERVICE] Requested orientation set natively to: ${modeToApply}`);
  } catch (err) {
    console.error('[ORIENTATION SERVICE] Error setting requested orientation:', err);
  }
};

/**
 * Native GPS Hardware Provider Check.
 * Returns true if Android System GPS Provider or Network Provider is enabled.
 */
export const checkNativeGpsEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    if (NativeModules.SoundModule?.isGpsLocationEnabled) {
      const enabled = await NativeModules.SoundModule.isGpsLocationEnabled();
      return !!enabled;
    }
  } catch (e) {
    console.error('[GPS SERVICE] Error checking native GPS state:', e);
  }
  return true;
};

/**
 * Launch Native Android Location Source Settings intent (android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS).
 */
export const openNativeGpsSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    if (NativeModules.SoundModule?.openLocationSettings) {
      await NativeModules.SoundModule.openLocationSettings();
      return;
    }
  } catch (e) {
    console.error('[GPS SERVICE] Error opening native Location settings:', e);
  }
};

/**
 * Launch Native Android App Notification Settings intent.
 */
export const openNativeNotifSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    if (NativeModules.SoundModule?.openNotificationSettings) {
      await NativeModules.SoundModule.openNotificationSettings();
      return;
    }
  } catch (e) {
    console.error('[NOTIF SERVICE] Error opening native Notification settings:', e);
  }
};

/**
 * Native Notification Permission & Settings Check.
 * Returns true if notifications are fully enabled on Android for Yalla VTC.
 */
export const checkNativeNotifEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    if (NativeModules.SoundModule?.isNotificationPermissionGranted) {
      const enabled = await NativeModules.SoundModule.isNotificationPermissionGranted();
      return !!enabled;
    }
  } catch (e) {
    console.error('[NOTIF SERVICE] Error checking native Notification state:', e);
  }
  return true;
};

// Auto-sync on app resume
AppState.addEventListener('change', (nextState) => {
  if (nextState === 'active') {
    syncKeepScreenOnNativeSetting(false);
    syncOrientationNativeSetting();
  }
});
