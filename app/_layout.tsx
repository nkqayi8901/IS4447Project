import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { requestNotificationPermissions } from '@/utils/notifications';
// This is the root layout of the app. It sets up the main navigation stack and wraps the app in the AuthProvider and ThemeProvider contexts.
// It also handles loading custom fonts and showing the splash screen until the fonts are ready. The layout defines the main screens of the app, including authentication screens, the main tab navigator, and modals for adding/editing trips, activities, categories, and targets.
// The StatusBar is configured to match the current theme (light or dark) for better visual consistency across the app. 
// The RootContent component is responsible for rendering the Stack navigator with all the defined screens and their respective options.
// The app uses Expo Router for navigation, which allows for a file-based routing system. The Stack navigator defines the main flow of the app, while the Tabs navigator (defined in the (tabs) layout) handles the bottom tab navigation between Trips, Insights, Targets, and Settings screens.
// The app also requests notification permissions on launch to enable features like daily reminders and target achievement notifications. The useEffect hook ensures that the splash screen is hidden once the fonts are loaded and the app is ready to be displayed to the user.
// The app's theme is managed through the ThemeContext, allowing for easy toggling between light and dark modes, and ensuring that all screens and components use consistent styling based on the current theme.
SplashScreen.preventAutoHideAsync();

function RootContent() {
  const { isDark, theme } = useTheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
    requestNotificationPermissions();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.primary,
          headerTitleStyle: { fontFamily: 'Poppins_700Bold', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip/add" options={{ title: 'New Trip', presentation: 'modal', headerStyle: { backgroundColor: theme.surface }, headerTitleStyle: { fontFamily: 'Poppins_700Bold', fontSize: 17 }, headerTintColor: theme.primary }} />
        <Stack.Screen name="trip/[id]" options={{ headerTransparent: true, title: '', headerTintColor: '#fff' }} />
        <Stack.Screen name="trip/[id]/edit" options={{ title: 'Edit Trip', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="activity/add" options={{ title: 'Add Activity', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="activity/[id]/edit" options={{ title: 'Edit Activity', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="category/index" options={{ title: 'Categories', headerTintColor: theme.primary }} />
        <Stack.Screen name="category/add" options={{ title: 'New Category', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="category/[id]/edit" options={{ title: 'Edit Category', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="target/add" options={{ title: 'New Target', presentation: 'modal', headerTintColor: theme.primary }} />
        <Stack.Screen name="target/[id]/edit" options={{ title: 'Edit Target', presentation: 'modal', headerTintColor: theme.primary }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
