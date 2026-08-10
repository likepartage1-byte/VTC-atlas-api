import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtlasColors } from './atlas';
import { LightColors } from './colors';

// Extended Light theme matching Atlas design system structure
export const AtlasLightColors = {
  bg:            '#F8FAFC',  // Clean light gray
  surface:       '#FFFFFF',  // Clean white card
  surfaceAlt:    '#F1F5F9',  // Elevated light surface
  border:        'rgba(0,0,0,0.08)',    // Subtle divider
  overlay:       'rgba(248,250,252,0.85)',
  
  // Brand
  primary:     '#4F46E5',  // Solid Indigo
  primaryGlow: 'rgba(79,70,229,0.15)',
  accent:      '#6366F1',  // Indigo accent
  
  // Status
  online:      '#16A34A',
  onlineGlow:  'rgba(22,163,74,0.15)',
  offline:     '#DC2626',
  warning:     '#CA8A04',
  neutral:     '#64748B',
  
  // Text
  textPrimary:   '#0F172A',  // Dark slate text
  textSecondary: '#475569',  // Slate gray text
  textMuted:     '#94A3B8',  // Light gray muted text
  
  // Custom
  mapOverlay:  'rgba(245,247,250,0.80)',
  white:       '#FFFFFF',
};

// Unified type — both dark and light satisfy this via AtlasColors (strictest superset)
export type ThemeColorsType = typeof AtlasColors;

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColorsType;
  toggleTheme: () => void;
  setMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // default clean light mode

  useEffect(() => {
    // Load persisted preference
    const loadTheme = async () => {
      try {
        const value = await AsyncStorage.getItem('theme_preference');
        if (value !== null) {
          setIsDarkMode(value === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const targetMode = !isDarkMode;
      setIsDarkMode(targetMode);
      await AsyncStorage.setItem('theme_preference', targetMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const setMode = async (isDark: boolean) => {
    try {
      setIsDarkMode(isDark);
      await AsyncStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to set theme preference', e);
    }
  };

  const colors = isDarkMode ? AtlasColors : AtlasLightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
