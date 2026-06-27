// Cricket Academy Management System — Classic White & Grey Design Tokens

export const LightColors = {
  // Primary — deep forest green (cricket heritage)
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  primaryDark: '#0A3D0A',

  // Accent — muted gold, not flashy
  gold: '#8B6914',
  goldLight: '#A07820',
  goldDark: '#6B5010',

  // Backgrounds — pure white layered system
  bgDark: '#F7F8FA',       // page background — warm off-white
  bgCard: '#FFFFFF',        // card surface — pure white
  bgCardAlt: '#F0F2F5',    // alternate card
  bgSurface: '#ECEEF2',    // input, chip, tag backgrounds

  // Text — classic charcoal hierarchy
  textPrimary: '#111827',   // near-black for headings
  textSecondary: '#4B5563', // mid-grey for labels
  textMuted: '#9CA3AF',     // light grey for hints
  textInverse: '#FFFFFF',

  // Status — desaturated for elegance
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#2563EB',

  // Semantic attendance
  present: '#16A34A',
  absent: '#DC2626',
  late: '#CA8A04',

  // Borders — very subtle
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Level Colors — classic tones
  level1: '#9CA3AF',
  level2: '#2563EB',
  level3: '#16A34A',
  level4: '#8B6914',
  level5: '#B45309',

  // Chart Colors — muted palette
  chart1: '#2563EB',
  chart2: '#16A34A',
  chart3: '#8B6914',
  chart4: '#B45309',
  chart5: '#DC2626',

  // Overlay
  overlay: 'rgba(0,0,0,0.35)',
};

export const DarkColors = {
  // Keep dark as a secondary option
  primary: '#2E7D32',
  primaryLight: '#388E3C',
  primaryDark: '#1B5E20',

  gold: '#C8A600',
  goldLight: '#FFD700',
  goldDark: '#A07800',

  bgDark: '#0D1117',
  bgCard: '#161B22',
  bgCardAlt: '#1C2330',
  bgSurface: '#21262D',

  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#484F58',
  textInverse: '#0D1117',

  success: '#3FB950',
  warning: '#D29922',
  error: '#F85149',
  info: '#58A6FF',

  present: '#3FB950',
  absent: '#F85149',
  late: '#D29922',

  border: '#30363D',
  borderLight: '#21262D',

  level1: '#8B949E',
  level2: '#58A6FF',
  level3: '#3FB950',
  level4: '#FFD700',
  level5: '#FF7B00',

  chart1: '#58A6FF',
  chart2: '#3FB950',
  chart3: '#FFD700',
  chart4: '#FF7B00',
  chart5: '#DA3633',

  overlay: 'rgba(0,0,0,0.6)',
};

// Default export — light (classic white/grey)
export const Colors = LightColors;

export const Typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
};
