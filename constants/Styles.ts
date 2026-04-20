import { Platform, StyleSheet } from 'react-native';

export const shadow = {
  sm: Platform.select({
    ios: { shadowColor: '#1C1917', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12 },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 20 },
    android: { elevation: 8 },
    default: {},
  }),
  fab: Platform.select({
    ios: { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20 },
    android: { elevation: 10 },
    default: {},
  }),
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, '2xl': 28, full: 999,
};

export const font = {
  regular: 'Poppins_400Regular',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
};

export const text = {
  h1: { fontFamily: 'Poppins_800ExtraBold', fontSize: 30, letterSpacing: -0.5 } as const,
  h2: { fontFamily: 'Poppins_700Bold', fontSize: 22, letterSpacing: -0.3 } as const,
  h3: { fontFamily: 'Poppins_700Bold', fontSize: 18 } as const,
  body: { fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 21 } as const,
  bodyMd: { fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 22 } as const,
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  caption: { fontFamily: 'Poppins_400Regular', fontSize: 12 } as const,
  btn: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 } as const,
};
