import EmptyState from "@/components/EmptyState";
import TripCard from "@/components/TripCard";
import { radius, shadow, spacing, text } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, trips } from "@/db/schema";
import { calculateStreak } from "@/utils/streaks";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// This is the main screen that shows the user's trips. It displays a greeting with the user's name, a summary of their trip stats, and a search bar to filter trips by name or destination.
//  The screen fetches the user's trips from the database and calculates additional metadata like activity count and streaks for each trip. It also handles navigation to the trip details screen when a trip card is pressed, and provides a floating action button to add a new trip. The styling of the screen adapts to the app's theme, using colors from the 
// theme context for backgrounds, text, borders, and buttons. It also includes accessibility labels for better screen reader support.
//  The useAuth hook is used to get the current user and loading state, while the useTheme hook allows the screen to adapt its 
// styling based on the current theme (light/dark mode) for a consistent user experience across the app. The useFocusEffect hook is used to load the trips whenever the screen comes into focus, ensuring that users always see the most up-to-date information when they navigate to this screen. The screen also handles loading states and empty states gracefully,
//  providing a smooth user experience.
// The TripWithMeta type defines the structure of a trip object that includes additional metadata like activity count and streaks, which are calculated based on the activities associated with each trip. The getGreeting function returns a greeting message based on the current time of day, and the getStatus function determines whether a trip is upcoming, ongoing, or past based on its start and end dates. The TripsScreen component uses these functions and types to render the list of trips and their associated information in a user-friendly format.
type TripWithMeta = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  activityCount: number;
  streak: number;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatus(start: string, end: string): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date().toISOString().split('T')[0];
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

export default function TripsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [tripList, setTripList] = useState<TripWithMeta[]>([]);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        const rows = await db.select().from(trips).where(eq(trips.userId, user.id));
        const enriched = await Promise.all(
          rows.map(async (t) => {
            const acts = await db.select().from(activities).where(eq(activities.tripId, t.id));
            return { ...t, activityCount: acts.length, streak: calculateStreak(acts) };
          }),
        );
        setTripList(enriched.sort((a, b) => b.startDate.localeCompare(a.startDate)));
      };
      void load();
    }, [user]),
  );

  const filtered = tripList.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActivities = tripList.reduce((s, t) => s + t.activityCount, 0);
  const upcomingCount = tripList.filter(t => getStatus(t.startDate, t.endDate) === 'upcoming').length;
  const ongoingCount = tripList.filter(t => getStatus(t.startDate, t.endDate) === 'ongoing').length;

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.headerArea, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[text.h2, { color: theme.text }]}>{firstName} ✈️</Text>
          </View>
          <TouchableOpacity
            style={[styles.bellBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/notifications' as any)}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
            {(ongoingCount > 0 || tripList.some(t => { const d = Math.ceil((new Date(t.startDate + 'T00:00:00').getTime() - new Date().getTime()) / 86400000); return d >= 0 && d <= 3; })) && (
              <View style={[styles.bellDot, { backgroundColor: theme.primary }]} />
            )}
          </TouchableOpacity>
        </View>

        {tripList.length > 0 && (
          <View style={styles.statsRow}>
            {[
              { icon: 'map-outline', value: tripList.length, label: 'trips', color: theme.primary },
              { icon: 'list-outline', value: totalActivities, label: 'activities', color: theme.primary },
              { icon: 'time-outline', value: upcomingCount, label: 'upcoming', color: theme.warning },
            ].map((s) => (
              <View key={s.label} style={[styles.statChip, { backgroundColor: s.color + '12', borderColor: s.color + '25' }]}>
                <Ionicons name={s.icon as any} size={13} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search trips or destinations..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search trips"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TripCard
            name={item.name}
            destination={item.destination}
            startDate={item.startDate}
            endDate={item.endDate}
            activityCount={item.activityCount}
            streak={item.streak}
            onPress={() => router.push(`/trip/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="airplane-outline"
            title="No trips yet"
            subtitle="Tap + to plan your first adventure"
          />
        }
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }, shadow.fab]}
        onPress={() => router.push("/trip/add" as any)}
        accessibilityRole="button"
        accessibilityLabel="Add new trip"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: 12, borderBottomWidth: 1 },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  ongoingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, marginTop: 4 },
  ongoingDot: { width: 7, height: 7, borderRadius: 4 },
  ongoingText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 10, borderRadius: radius.md, borderWidth: 1 },
  statValue: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1.5 },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
