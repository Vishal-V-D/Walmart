// hooks/useTheme.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorSchemeName;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors; // Using typeof lightColors ensures type safety for colors
}

const lightColors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  onPrimary: '#FFFFFF', // Text color on primary background
  primaryContainer: '#DBEAFE', // A lighter shade for containers related to primary
  onPrimaryContainer: '#1E40AF', // Text color on primaryContainer background

  secondary: '#059669',
  secondaryLight: '#10B981',
  secondaryDark: '#047857',
  onSecondary: '#FFFFFF', // Text color on secondary background

  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  onAccent: '#FFFFFF', // Text color on accent background

  tertiary: '#000000', // Example tertiary color (from MapView.tsx)
  onTertiary: '#FFFFFF', // Text color on tertiary background

  background: '#FFFFFF',
  surface: '#F8FAFC',
  onSurface: '#1F2937', // Text color on surface background (typically text)
  surfaceVariant: '#F1F5F9',
  card: '#FDFDFD',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  outline: '#D1D5DB', // General outline color

  success: '#059669',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  onPrimary: '#FFFFFF', // Text color on primary background
  primaryContainer: '#1E3A8A', // A darker shade for containers related to primary
  onPrimaryContainer: '#BFDBFE', // Text color on primaryContainer background

  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  onSecondary: '#FFFFFF', // Text color on secondary background

  accent: '#FBBF24',
  accentLight: '#FCD34D',
  accentDark: '#F59E0B',
  onAccent: '#1F2937', // Text color on accent background (can be dark text on light accent)

  tertiary: '#FFFFFF', // Example tertiary color for dark theme
  onTertiary: '#000000', // Text color on tertiary background

  background: '#111827',
  surface: '#1F2937',
  onSurface: '#F9FAFB', // Text color on surface background (typically light text)
  surfaceVariant: '#374151',
  card: '#2A3644',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  border: '#374151',
  borderLight: '#4B5563',
  outline: '#4B5563', // General outline color

  success: '#10B981',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeProvider() {
  const [theme, setTheme] = useState<Theme>('system');
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const actualColorScheme = theme === 'system' ? colorScheme : theme;
  const colors = actualColorScheme === 'dark' ? darkColors : lightColors;

  return {
    theme,
    colorScheme: actualColorScheme,
    setTheme,
    colors,
  };
}

export { ThemeContext };