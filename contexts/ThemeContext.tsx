import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DarkColors, LightColors } from '@/constants/theme';

type ThemeMode = 'dark' | 'light';

export interface CustomAccentColors {
  primary: string;
  gold: string;
}

const PRESET_ACCENTS: { name: string; primary: string; gold: string; preview: string }[] = [
  { name: 'Forest', primary: '#1B5E20', gold: '#8B6914', preview: '🌿' },
  { name: 'Navy', primary: '#1E3A5F', gold: '#8B6914', preview: '⚓' },
  { name: 'Slate', primary: '#374151', gold: '#8B6914', preview: '🪨' },
  { name: 'Crimson', primary: '#991B1B', gold: '#8B6914', preview: '🔴' },
  { name: 'Teal', primary: '#0F4C75', gold: '#8B6914', preview: '💎' },
  { name: 'Charcoal', primary: '#1F2937', gold: '#8B6914', preview: '🖤' },
  { name: 'Royal', primary: '#312E81', gold: '#8B6914', preview: '👑' },
  { name: 'Olive', primary: '#3D4A1F', gold: '#8B6914', preview: '🫒' },
];

export { PRESET_ACCENTS };

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  Colors: typeof LightColors;
  accentPreset: number;
  setAccentPreset: (idx: number) => void;
  customAccent: CustomAccentColors;
  setCustomAccent: (c: CustomAccentColors) => void;
  presets: typeof PRESET_ACCENTS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accentPreset, setAccentPresetState] = useState(0);
  const [customAccent, setCustomAccentState] = useState<CustomAccentColors>({
    primary: '#1B5E20',
    gold: '#8B6914',
  });

  const toggleTheme = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (m: ThemeMode) => setMode(m);

  const setAccentPreset = (idx: number) => {
    setAccentPresetState(idx);
    const preset = PRESET_ACCENTS[idx];
    setCustomAccentState({ primary: preset.primary, gold: preset.gold });
  };

  const setCustomAccent = (c: CustomAccentColors) => {
    setCustomAccentState(c);
    setAccentPresetState(-1);
  };

  const baseColors = mode === 'dark' ? DarkColors : LightColors;
  const Colors = {
    ...baseColors,
    primary: customAccent.primary,
    primaryLight: customAccent.primary,
    primaryDark: customAccent.primary + 'CC',
    gold: customAccent.gold,
    goldLight: customAccent.gold,
    goldDark: customAccent.gold + 'CC',
  };

  return (
    <ThemeContext.Provider value={{
      mode, isDark: mode === 'dark', toggleTheme, setTheme, Colors,
      accentPreset, setAccentPreset,
      customAccent, setCustomAccent,
      presets: PRESET_ACCENTS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
