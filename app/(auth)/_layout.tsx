import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

// This layout handles the authentication flow.
//  If the user is logged in, it redirects to the main app.
//  If not, it shows the auth screens (login/signup).
// It also shows a loading state while checking auth 
// status on app launch.
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
