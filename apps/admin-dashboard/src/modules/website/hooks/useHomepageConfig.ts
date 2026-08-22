import { useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_HOMEPAGE_CONFIG } from '../types/homepage-config.types';
import api from '../../../lib/api';
import type {
  HomepageConfig,
  SectionId,
  HeroConfig,
  OneAppConfig,
  ThemeConfig,
} from '../types/homepage-config.types';

const STORAGE_KEY = 'yalla_homepage_draft';
const MAX_HISTORY = 50;

function loadFromStorage(): HomepageConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_HOMEPAGE_CONFIG, ...JSON.parse(saved), isDraft: true };
  } catch {}
  return { ...DEFAULT_HOMEPAGE_CONFIG };
}

export interface UseHomepageConfigReturn {
  config: HomepageConfig;
  isDirty: boolean;
  isSyncing: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // Section management
  toggleSectionVisibility: (id: SectionId) => void;

  // Deep update helpers
  updateHero: (updater: (h: HeroConfig) => HeroConfig) => void;
  updateOneApp: (updater: (o: OneAppConfig) => OneAppConfig) => void;
  updateTheme: (updater: (t: ThemeConfig) => ThemeConfig) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Persistence
  saveDraft: () => Promise<{ success: boolean; isRemote: boolean }>;
  publish: () => Promise<{ success: boolean; isRemote: boolean; version: number }>;
  resetToDefault: () => void;
}

export function useHomepageConfig(): UseHomepageConfigReturn {
  const [config, setConfigState] = useState<HomepageConfig>(loadFromStorage);
  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Undo/Redo stacks
  const past = useRef<HomepageConfig[]>([]);
  const future = useRef<HomepageConfig[]>([]);

  // Sync with Backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchRemoteDraft() {
      try {
        const res = await api.get('/admin/homepage/config');
        if (isMounted && res.data && res.data.version !== undefined) {
          const remoteConfig = { ...DEFAULT_HOMEPAGE_CONFIG, ...res.data };
          setConfigState(remoteConfig);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConfig)); } catch {}
        }
      } catch (err) {
        console.warn('Backend API draft fetch failed; using local fallback state.', err);
      }
    }
    fetchRemoteDraft();
    return () => { isMounted = false; };
  }, []);

  const pushHistory = useCallback((prev: HomepageConfig) => {
    past.current = [...past.current.slice(-MAX_HISTORY + 1), prev];
    future.current = [];
  }, []);

  const setConfig = useCallback((updater: (c: HomepageConfig) => HomepageConfig) => {
    setConfigState(prev => {
      pushHistory(prev);
      const next = updater(prev);
      setIsDirty(true);
      return { ...next, isDraft: true, lastSavedAt: null };
    });
  }, [pushHistory]);

  const toggleSectionVisibility = useCallback((id: SectionId) => {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s),
    }));
  }, [setConfig]);

  const updateHero = useCallback((updater: (h: HeroConfig) => HeroConfig) => {
    setConfig(c => ({ ...c, hero: updater(c.hero) }));
  }, [setConfig]);

  const updateOneApp = useCallback((updater: (o: OneAppConfig) => OneAppConfig) => {
    setConfig(c => ({ ...c, oneApp: updater(c.oneApp) }));
  }, [setConfig]);

  const updateTheme = useCallback((updater: (t: ThemeConfig) => ThemeConfig) => {
    setConfig(c => ({ ...c, theme: updater(c.theme) }));
  }, [setConfig]);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    setConfigState(curr => {
      future.current = [curr, ...future.current];
      return prev;
    });
    setIsDirty(true);
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    setConfigState(curr => {
      past.current = [...past.current, curr];
      return next;
    });
    setIsDirty(true);
  }, []);

  const saveDraft = useCallback(async (): Promise<{ success: boolean; isRemote: boolean }> => {
    setIsSyncing(true);
    const next = { ...config, isDraft: true, lastSavedAt: new Date().toISOString() };
    let isRemote = false;
    try {
      await api.put('/admin/homepage/config', next);
      isRemote = true;
    } catch (err) {
      console.warn('API draft save failed; saved to local fallback.', err);
    } finally {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setConfigState(next);
      setIsDirty(false);
      setIsSyncing(false);
    }
    return { success: true, isRemote };
  }, [config]);

  const publish = useCallback(async (): Promise<{ success: boolean; isRemote: boolean; version: number }> => {
    setIsSyncing(true);
    let isRemote = false;
    let version = config.version + 1;
    try {
      const res = await api.post('/admin/homepage/publish');
      const publishedAt = res.data?.publishedAt || new Date().toISOString();
      version = res.data?.version || version;
      isRemote = true;
      const next = {
        ...config,
        isDraft: false,
        publishedAt,
        lastSavedAt: publishedAt,
        version,
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setConfigState(next);
    } catch (err) {
      console.warn('API publish failed; updating local fallback state.', err);
      const next = {
        ...config,
        isDraft: false,
        publishedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        version,
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setConfigState(next);
    } finally {
      setIsDirty(false);
      setIsSyncing(false);
    }
    return { success: true, isRemote, version };
  }, [config]);

  const resetToDefault = useCallback(() => {
    setConfig(() => ({ ...DEFAULT_HOMEPAGE_CONFIG }));
    localStorage.removeItem(STORAGE_KEY);
  }, [setConfig]);

  return {
    config,
    isDirty,
    isSyncing,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    toggleSectionVisibility,
    updateHero,
    updateOneApp,
    updateTheme,
    undo,
    redo,
    saveDraft,
    publish,
    resetToDefault,
  };
}
