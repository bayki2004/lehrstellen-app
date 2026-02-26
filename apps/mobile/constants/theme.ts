export const colors = {
  // Primary palette (Gen Z Blues/Teals)
  primary: '#00C2FF',
  primaryLight: '#66D9FF',
  primaryDark: '#008AB8',
  secondary: '#00E5FF',
  secondaryLight: '#66EFFF',
  secondaryDark: '#00A3B8',
  accent: '#B026FF',

  // Status
  success: '#34C759',
  successLight: '#81C784',
  warning: '#FF9500',
  warningLight: '#FFD54F',
  error: '#FF3B30',
  errorLight: '#FF6961',

  // Surfaces
  background: '#F2F2F7',
  secondaryBackground: '#E5E5EA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  text: '#1C1C1E',
  textSecondary: '#636366',
  textTertiary: '#AEAEB2',

  // Borders
  border: '#D1D1D6',
  borderLight: '#E5E5EA',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Constants
  white: '#FFFFFF',
  black: '#000000',

  // Swipe actions
  swipeRight: '#34C759',
  swipeLeft: '#FF3B30',
  superLike: '#5A78F2',
  matchGold: '#FBBA02',

  // Quiz gamification
  quizXP: '#FBBA02',
  quizBadge: '#AF52DE',

  // Bewerbung status
  statusSent: '#5A78F2',
  statusViewed: '#FF9500',
  statusInterview: '#34C759',
  statusRejected: '#FF3B30',
  statusSchnupperlehre: '#AF52DE',
  statusOffer: '#FBBA02',
  statusAccepted: '#34C759',
  statusWithdrawn: '#AEAEB2',

  // Radar chart
  radarUser: '#5A78F2',
  radarBeruf: '#F24535',
  radarGrid: 'rgba(174, 174, 178, 0.3)',
  radarAxis: 'rgba(174, 174, 178, 0.2)',

  // Compatibility badge
  compatibilityHigh: '#34C759',
  compatibilityMedium: '#FF9500',
  compatibilityLow: '#FF3B30',
};

export const typography = {
  hero: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    shadowColor: '#008AB8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#008AB8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 16,
  },
  // Aliases for backward compatibility
  md: {
    shadowColor: '#008AB8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  lg: {
    shadowColor: '#008AB8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 16,
  },
};

export const animations = {
  spring: {
    swipe: { damping: 14, stiffness: 200, mass: 0.8 },
    selection: { damping: 18, stiffness: 300 },
    sheet: { damping: 20, stiffness: 200 },
    celebration: { damping: 12, stiffness: 150 },
  },
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  scale: {
    pressed: 0.97,
    selected: 1.05,
    nextCard: 0.95,
  },
  opacity: {
    nextCard: 0.8,
  },
};

export const cardDimensions = {
  height: 520,
  actionButtonLarge: 54,
  actionButtonSmall: 44,
};
