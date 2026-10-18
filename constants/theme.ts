import { Platform } from 'react-native';

export const THEMES = {
  blue: {
    primary: '#0B2545',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    accentText: '#92400E',
    surface: '#F4F3F0',
    card: '#FFFFFF',
    text: '#0B2545',
    muted: '#6B7280',
    tabActive: '#F59E0B',
    gradient: ['#0B2545', '#1A3A6C'] as readonly [string, string, ...string[]],
    dark: false,
  },
  dark: {
    primary: '#C9A84C',
    accent: '#C9A84C',
    accentLight: 'rgba(201,168,76,0.15)',
    accentText: '#C9A84C',
    surface: '#0A0A12',
    card: '#15151F',
    text: '#F0EDE6',
    muted: '#6B6B80',
    tabActive: '#C9A84C',
    gradient: ['#0A0A12', '#1A1A2E'] as readonly [string, string, ...string[]],
    dark: true,
  },
  green: {
    primary: '#065F46',
    accent: '#FF6B00',
    accentLight: '#FFF0E6',
    accentText: '#C2410C',
    surface: '#F0F7F4',
    card: '#FFFFFF',
    text: '#065F46',
    muted: '#6B7280',
    tabActive: '#FF6B00',
    gradient: ['#065F46', '#0A8A5C'] as readonly [string, string, ...string[]],
    dark: false,
  },
};

export const Fonts = {
  sans: 'Sora_400Regular',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  extraBold: 'Sora_800ExtraBold',
  rounded: 'Sora_600SemiBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const Colors = {
  light: {
    text: THEMES.blue.text,
    background: THEMES.blue.surface,
    tint: THEMES.blue.primary,
    icon: THEMES.blue.muted,
    tabIconDefault: THEMES.blue.muted,
    tabIconSelected: THEMES.blue.primary,
  },
  dark: {
    text: THEMES.dark.text,
    background: THEMES.dark.surface,
    tint: THEMES.dark.primary,
    icon: THEMES.dark.muted,
    tabIconDefault: THEMES.dark.muted,
    tabIconSelected: THEMES.dark.primary,
  },
};

