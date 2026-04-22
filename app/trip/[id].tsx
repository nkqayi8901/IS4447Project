import ActivityCard from "@/components/ActivityCard";
import EmptyState from "@/components/EmptyState";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, categories, trips } from "@/db/schema";
import { exportActivitiesToCSV } from "@/utils/export";
import { fetchWeather, WeatherData } from "@/utils/weather";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type ActivityWithCategory = typeof activities.$inferSelect & {
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
};
type TripRow = typeof trips.$inferSelect;
type FilterPeriod = "all" | "today" | "week";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const [trip, setTrip] = useState<TripRow | null>(null);
  const [actList, setActList] = useState<ActivityWithCategory[]>([]);
  const [cats, setCats] = useState<(typeof categories.$inferSelect)[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [period, setPeriod] = useState<FilterPeriod>("all");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const tripRows = await db
          .select()
          .from(trips)
          .where(eq(trips.id, Number(id)));
        if (!tripRows[0]) return;
        setTrip(tripRows[0]);

        const catRows = await db.select().from(categories);
        setCats(catRows);

        const acts = await db
          .select()
          .from(activities)
          .where(eq(activities.tripId, Number(id)));
        const enriched = acts.map((a) => {
          const cat = catRows.find((c) => c.id === a.categoryId);
          return {
            ...a,
            categoryName: cat?.name ?? "Unknown",
            categoryColor: cat?.color ?? "#888",
            categoryIcon: cat?.icon ?? "compass",
          };
        });
        setActList(enriched.sort((a, b) => b.date.localeCompare(a.date)));

        const w = await fetchWeather(
          tripRows[0].destination.split(",")[0].trim(),
        );
        setWeather(w);
      };
      void load();
    }, [id]),
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "This will also delete all activities in this trip. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db
              .delete(activities)
              .where(eq(activities.tripId, Number(id)));
            await db.delete(trips).where(eq(trips.id, Number(id)));
            router.back();
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    if (!trip) return;
    await exportActivitiesToCSV(
      trip.name,
      actList.map((a) => ({
        name: a.name,
        date: a.date,
        durationMinutes: a.durationMinutes,
        count: a.count,
        notes: a.notes,
        category: a.categoryName,
      })),
    );
  };

  const filtered = actList.filter((a) => {
    const now = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0];
    if (period === "today" && a.date !== now) return false;
    if (period === "week" && a.date < weekAgo) return false;
    if (selectedCat !== null && a.categoryId !== selectedCat) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (!trip) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tripName, { color: theme.text }]}>
                {trip.name}
              </Text>
              <View style={styles.row}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={[styles.dest, { color: theme.textSecondary }]}>
                  {trip.destination}
                </Text>
              </View>
              <Text style={[styles.dates, { color: theme.textSecondary }]}>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => router.push(`/trip/${id}/edit` as any)}
                style={[
                  styles.iconBtn,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Ionicons
                  name="pencil-outline"
                  size={18}
                  color={theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExport}
                style={[
                  styles.iconBtn,
                  { backgroundColor: theme.success + "20" },
                ]}
              >
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={theme.success}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.iconBtn,
                  { backgroundColor: theme.danger + "20" },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
              </TouchableOpacity>
            </View>
          </View>
          {trip.notes ? (
            <Text style={[styles.notes, { color: theme.textSecondary }]}>
              {trip.notes}
            </Text>
          ) : null}
          {weather ? (
            <View style={[styles.weatherRow, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name={`${weather.icon}-outline` as any} size={18} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.weatherText, { color: theme.primary }]}>
                  {weather.city} · {weather.temp}°C · {weather.description}
                </Text>
                <Text style={[styles.weatherSub, { color: theme.textSecondary }]}>
                  Wind {weather.windspeed} km/h · via Open-Meteo
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Sticky search + filter */}
        <View style={[styles.filterBar, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.searchRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={theme.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search activities..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search activities"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chips}
          >
            {(["all", "today", "week"] as FilterPeriod[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  {
                    borderColor: period === p ? theme.primary : theme.border,
                    backgroundColor: period === p ? theme.primary : theme.card,
                  },
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: period === p ? "#fff" : theme.textSecondary },
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  borderColor:
                    selectedCat === null ? theme.border : theme.primary,
                  backgroundColor:
                    selectedCat === null ? theme.card : theme.primary,
                },
              ]}
              onPress={() => setSelectedCat(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: selectedCat === null ? theme.textSecondary : "#fff",
                  },
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {cats.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  {
                    borderColor: selectedCat === c.id ? c.color : theme.border,
                    backgroundColor:
                      selectedCat === c.id ? c.color : theme.card,
                  },
                ]}
                onPress={() =>
                  setSelectedCat(selectedCat === c.id ? null : c.id)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedCat === c.id ? "#fff" : theme.textSecondary,
                    },
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Activities */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="list-outline"
              title="No activities"
              subtitle="Tap + to add your first activity"
            />
          ) : (
            filtered.map((a) => (
              <ActivityCard
                key={a.id}
                name={a.name}
                date={a.date}
                durationMinutes={a.durationMinutes}
                count={a.count}
                notes={a.notes}
                categoryName={a.categoryName}
                categoryColor={a.categoryColor}
                categoryIcon={a.categoryIcon}
                onPress={() =>
                  router.push(`/activity/${a.id}/edit?tripId=${id}` as any)
                }
                onDelete={async () => {
                  await db.delete(activities).where(eq(activities.id, a.id));
                  setActList((prev) => prev.filter((x) => x.id !== a.id));
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push(`/activity/add?tripId=${id}` as any)}
        accessibilityRole="button"
        accessibilityLabel="Add activity"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tripName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  dest: { fontSize: 14 },
  dates: { fontSize: 13, marginTop: 4 },
  notes: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    borderRadius: 8,
    padding: 8,
  },
  weatherText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  weatherSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 1 },
  filterBar: { paddingTop: 12, paddingBottom: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chips: { paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  listContainer: { padding: 16, paddingBottom: 100, minHeight: 200 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
