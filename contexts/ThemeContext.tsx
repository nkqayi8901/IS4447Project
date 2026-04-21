import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { light, dark, AppTheme } from '@/constants/AppColors';
// This context manages the app's theme (light/dark mode) and provides a function to toggle between themes.
// It uses AsyncStorage to persist the user's theme preference across app launches. 
// The ThemeProvider component wraps the app and provides the theme context to all child components, allowing them to access the current theme and toggle function. 
// The useTheme hook allows components to easily access the theme context and apply consistent styling based on the current theme throughout the app.
// The ThemeContext enhances the user experience by allowing users to choose their preferred theme and ensuring that the app's appearance is consistent with their choice. It also simplifies the process of applying theming across different screens and components, contributing to a cohesive and visually appealing user interface.
type ThemeContextType = {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? dark : light, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
