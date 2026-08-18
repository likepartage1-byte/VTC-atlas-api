/**
 * useVehicleMode — Central hook for Motorcycle / Vehicle Mode detection (Yalla VTC).
 *
 * All screens/components should use this hook instead of duplicating
 * the vehicleType logic. Fetches once from /driver/profile and caches
 * the result in module scope for the session.
 *
 * VehicleType values (mirror backend Driver.vehicleInfo.type):
 *   'CAR' | 'MOTORCYCLE' | 'TAXI' | 'TRUCK'
 *
 * For Motorcycle Mode: isMotorcycleMode === true
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '../api/axios.instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TAXI' | 'TRUCK';

const CACHE_KEY = '@vehicle_type_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Module-level cache so all hook instances share the same value
let _cachedType: VehicleType | null = null;
let _cachedAt: number = 0;

export interface VehicleModeState {
  vehicleType: VehicleType;
  isMotorcycleMode: boolean;
  isCarMode: boolean;
  isTaxiMode: boolean;
  isTruckMode: boolean;
  isReady: boolean;
  refresh: () => Promise<void>;
}

export function useVehicleMode(): VehicleModeState {
  const [vehicleType, setVehicleType] = useState<VehicleType>(_cachedType ?? 'CAR');
  const [isReady, setIsReady] = useState<boolean>(_cachedType !== null);
  const isMounted = useRef(true);

  const applyType = (type: VehicleType) => {
    _cachedType = type;
    _cachedAt = Date.now();
    if (isMounted.current) {
      setVehicleType(type);
      setIsReady(true);
    }
  };

  const fetchFromAPI = async (): Promise<VehicleType> => {
    try {
      let raw = '';
      try {
        const res = await api.get('/driver/profile');
        raw =
          res.data?.driver?.vehicleType ||
          res.data?.driver?.vehicle_type ||
          res.data?.driver?.vehicle?.type ||
          res.data?.driver?.vehicleInfo?.type ||
          res.data?.driver?.accountType ||
          res.data?.vehicleType ||
          res.data?.vehicle?.type ||
          res.data?.vehicleInfo?.type ||
          '';
      } catch (_) {}

      if (!raw) {
        try {
          const vRes = await api.get('/driver/profile/vehicle');
          raw = vRes.data?.type || vRes.data?.vehicleType || vRes.data?.vehicle_type || '';
        } catch (_) {}
      }

      if (!raw) {
        const storedLocal = await AsyncStorage.getItem('registered_vehicle_type');
        if (storedLocal) raw = storedLocal;
      }

      const vt = (raw ? raw.toUpperCase() : (_cachedType ?? 'CAR')) as VehicleType;
      
      // Persist to AsyncStorage for cold-start
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ type: vt, at: Date.now() }),
      );
      return vt;
    } catch {
      return _cachedType ?? 'CAR';
    }
  };

  const refresh = async () => {
    const vt = await fetchFromAPI();
    applyType(vt);
  };

  useEffect(() => {
    isMounted.current = true;
    let active = true;

    const load = async () => {
      // 1. Check module-level in-memory cache (TTL)
      if (_cachedType && Date.now() - _cachedAt < CACHE_TTL_MS) {
        applyType(_cachedType);
        return;
      }

      // 2. Cold-start: try registered_vehicle_type or AsyncStorage cache
      try {
        const localReg = await AsyncStorage.getItem('registered_vehicle_type');
        if (localReg && (localReg === 'MOTORCYCLE' || localReg === 'CAR' || localReg === 'TAXI' || localReg === 'TRUCK')) {
          if (active) applyType(localReg as VehicleType);
        }

        const stored = await AsyncStorage.getItem(CACHE_KEY);
        if (stored) {
          const { type, at } = JSON.parse(stored);
          if (Date.now() - at < CACHE_TTL_MS) {
            if (active) applyType(type as VehicleType);
            fetchFromAPI().then((vt) => { if (active) applyType(vt); });
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3. Fetch fresh from API
      const vt = await fetchFromAPI();
      if (active) applyType(vt);
    };

    load();

    return () => {
      active = false;
      isMounted.current = false;
    };
  }, []);

  return {
    vehicleType,
    isMotorcycleMode: vehicleType === 'MOTORCYCLE',
    isCarMode: vehicleType === 'CAR',
    isTaxiMode: vehicleType === 'TAXI',
    isTruckMode: vehicleType === 'TRUCK',
    isReady,
    refresh,
  };
}

/** Synchronously update vehicle mode cache across app */
export function setVehicleModeCache(type: VehicleType) {
  _cachedType = type;
  _cachedAt = Date.now();
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ type, at: Date.now() })).catch(() => {});
  AsyncStorage.setItem('registered_vehicle_type', type).catch(() => {});
}

/** Reset module cache (useful for logout) */
export function clearVehicleModeCache() {
  _cachedType = null;
  _cachedAt = 0;
  AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  AsyncStorage.removeItem('registered_vehicle_type').catch(() => {});
}
