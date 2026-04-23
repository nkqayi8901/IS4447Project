import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';
import { seedIfEmpty } from '@/db/seed';

// This layouts handles the main app flow after authentication.
// If the user is not logged in, it redirects to the login screen.
// If the user is logged in, it shows the main tab navigator with Trips, Insights, Targets, and Settings tabs.
// It also shows a loading state while 
// checking auth status on app launch.
// Each tab has its own screen component 
// defined in the respective files (index.tsx for Trips, insights.tsx for Insights, etc.).
// The useAuth hook provides the current user and loading state.
// The useTheme hook allows the layout to adapt its styling based on the current theme (light/dark mode) for a consistent user experience across the app. 
// The Tabs component from Expo Router is used to define the bottom tab navigation structure, with icons and labels for each tab. 
// The layout ensures that users are directed to the appropriate screens based on their authentication status, providing a seamless experience as they navigate through the app's main features.
export default function TabLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  useEffect(() => {
    if (user) void seedIfEmpty(user.id);
  }, [user]);

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, size }) => <Ionicons name="airplane" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Targets',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
