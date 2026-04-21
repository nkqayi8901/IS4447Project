import { radius, shadow, spacing, text } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { loadDemoData } from "@/db/seed";
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// This is the Settings screen. It allows users to view their profile information, toggle dark mode and daily reminders, and manage their account (log out or delete account).
// The screen is divided into sections for Appearance, Data, and Account. Each section contains relevant settings and actions.
// The "Load Demo Data" action adds sample trips and activities to the user's account for testing purposes.
// The screen uses the app's theme for styling and
// includes appropriate accessibility labels for better usability.
// It also shows a loading state when performing actions like loading demo data or toggling notifications.
// The screen is wrapped in a ScrollView to ensure all content is accessible on smaller screens, and it uses
// TouchableOpacity for interactive rows with appropriate feedback on press.
export default function SettingsScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) await scheduleDailyReminder();
    else await cancelDailyReminder();
  };

  const handleLoadDemo = () => {
    Alert.alert(
      "Load Demo Data",
      "This will add 2 sample trips (Paris & Tokyo) with activities and targets. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load",
          onPress: async () => {
            if (!user) return;
            setLoadingDemo(true);
            await loadDemoData(user.id);
            setLoadingDemo(false);
            Alert.alert("Done!", "Demo data loaded. Check the Trips tab.");
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account and all trip data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteAccount },
      ],
    );
  };

  type RowProps = {
    icon: string;
    iconColor?: string;
    label: string;
    onPress?: () => void;
    right?: React.ReactNode;
    destructive?: boolean;
  };

  const Row = ({
    icon,
    iconColor,
    label,
    onPress,
    right,
    destructive,
  }: RowProps) => {
    const color = destructive ? theme.danger : (iconColor ?? theme.primary);
    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: theme.border }]}
        onPress={onPress}
        disabled={!onPress && !right}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.7}
      >
        <View style={[styles.rowIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text
          style={[
            styles.rowLabel,
            { color: destructive ? theme.danger : theme.text },
          ]}
        >
          {label}
        </Text>
        {right ??
          (onPress ? (
            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.textSecondary}
            />
          ) : null)}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View
        style={[styles.profileCard, { backgroundColor: theme.card }, shadow.md]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[text.h3, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* App section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        Appearance
      </Text>
      <View
        style={[styles.section, { backgroundColor: theme.card }, shadow.sm]}
      >
        <Row
          icon="moon"
          label="Dark Mode"
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor="#fff"
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          }
        />
        <Row
          icon="notifications"
          label="Daily Reminders"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              thumbColor="#fff"
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          }
        />
      </View>

      {/* Data section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        Data
      </Text>
      <View
        style={[styles.section, { backgroundColor: theme.card }, shadow.sm]}
      >
        <Row
          icon="albums"
          label="Categories"
          onPress={() => router.push("/category/index" as any)}
        />
        <Row
          icon="sparkles"
          iconColor="#F59E0B"
          label={loadingDemo ? "Loading demo data..." : "Load Demo Data"}
          onPress={loadingDemo ? undefined : handleLoadDemo}
          right={
            loadingDemo ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : undefined
          }
        />
      </View>

      {/* Account section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        Account
      </Text>
      <View
        style={[styles.section, { backgroundColor: theme.card }, shadow.sm]}
      >
        <Row icon="log-out-outline" label="Log Out" onPress={handleLogout} />
        <Row
          icon="trash-outline"
          label="Delete Account"
          onPress={handleDeleteAccount}
          destructive
        />
      </View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Spectacular Solomon's Trip Planner v1.0 · IS4447
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    margin: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 24,
  },
  email: { fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2 },
  sectionTitle: {
    ...text.label,
    marginLeft: spacing.lg,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14 },
  footer: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    marginVertical: 28,
  },
});
