import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

// Thiss layout handles the authentication flow.
//  If the user is logged in, it redirects to the main app.
//  If not, it shows the auth screens (login/signup).
// It also shows a loading state while checking auth 
// status on app launch.
// The useAuth hook provides the current user and loading state.
// The useTheme hook allows the layout to adapt its styling based on the current theme (light/dark mode) for a consistent user experience across the app. 
// The Stack component from Expo Router is used to define the navigation structure for the authentication screens, which are rendered when there is no authenticated user. 
// The layout ensures that users are directed to the appropriate screens based on their authentication status, providing a seamless entry point into the app's main features once they log in or sign up.
export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }} />
  );
}
