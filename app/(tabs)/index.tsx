import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { trips, activities } from '@/db/schema';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { seedIfEmpty } from '@/db/seed';
import TripCard from '@/components/TripCard';
import EmptyState from '@/components/EmptyState';
import { calculateStreak } from '@/utils/streaks';
import { text, shadow, radius, spacing } from '@/constants/Styles';

// This is the main screen for the Trips tab. It displays a list of the user's planned trips, along with a search bar to filter by destination.
// Each trip card shows the trip name, destination, dates, number of activities, and current streak. Tapping a trip navigates to the trip details screen.
// The screen also includes a 
// floating action button to add a new trip. 
// If there are no trips, it shows an empty state 
// with a prompt to add the first trip.
// The screen uses useFocusEffect to 
// load the trips from the database whenever the screen is focused, 
// ensuring it always shows the latest data after adding/editing trips or activities.
type TripWithMeta = {
  id: number; name: string; destination: string;
  startDate: string; endDate: string; notes: string | null;
  activityCount: number; streak: number;
};

export default function TripsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [tripList, setTripList] = useState<TripWithMeta[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        await seedIfEmpty(user.id);
        const rows = await db.select().from(trips).where(eq(trips.userId, user.id));
        const enriched = await Promise.all(
          rows.map(async t => {
            const acts = await db.select().from(activities).where(eq(activities.tripId, t.id));
            return { ...t, activityCount: acts.length, streak: calculateStreak(acts) };
          })
        );
        setTripList(enriched.sort((a, b) => b.startDate.localeCompare(a.startDate)));
      };
      void load();
    }, [user])
  );

  const filtered = tripList.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.headerArea, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[text.h2, { color: theme.text }]}>My Trips</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {tripList.length} trip{tripList.length !== 1 ? 's' : ''} planned
          </Text>
        </View>
        <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search destinations..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search trips"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
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
            subtitle="Tap the + button to plan your first adventure"
          />
        }
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }, shadow.fab]}
        onPress={() => router.push('/trip/add' as any)}
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
  headerArea: { padding: spacing.xl, paddingTop: spacing.lg, gap: 12 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.lg, borderWidth: 1.5,
  },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
});
