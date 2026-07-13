// Atlas VTC Design Tokens
export const AtlasColors = {
  // Backgrounds
  bg:          '#0A0F1E',  // Deep navy
  surface:     '#111827',  // Card background
  surfaceAlt:  '#1C2438',  // Elevated surface
  border:      'rgba(255,255,255,0.08)', // Subtle divider
  overlay:     'rgba(10,15,30,0.85)',

  // Brand
  primary:     '#6366F1',  // Indigo
  primaryGlow: 'rgba(99,102,241,0.30)',
  accent:      '#818CF8',  // Light indigo

  // Status
  online:      '#22C55E',
  onlineGlow:  'rgba(34,197,94,0.25)',
  offline:     '#EF4444',
  warning:     '#F59E0B',
  neutral:     '#475569',

  // Text
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',

  // Map overlay elements
  mapOverlay:  'rgba(10,15,30,0.75)',
  white:       '#FFFFFF',
};

export const AtlasFont = {
  regular: '400',
  medium:  '500',
  semiBold:'600',
  bold:    '700',
  black:   '900',
} as const;
