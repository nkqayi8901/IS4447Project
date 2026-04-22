import EmptyState from "@/components/EmptyState";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, categories, targets, trips } from "@/db/schema";
import { sendTargetProgressNotification } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// This screen shows the user'ss targets and their progress towards them. Each target displays its name, period (weekly/monthly), metric (number of activities or total duration),
// and a progress bar indicating how close the user is to achieving the target.
// The screen loads the targets from the database and calculates the current progress based on the user's activities within the
// target's period. It also sends a local notification when a target is achieved.
// Users can tap on a target to edit it, or use the floating action button to add a new target.
// If there are no targets, it shows an empty state prompting the user to create their first target.
// The screen uses useFocusEffect to reload the targets and progress whenever the screen is focused, ensuring
// it always shows up-to-date information after adding/editing targets or activities.
type TargetWithProgress = {
  id: number;
  name: string;
  period: string;
  metric: string;
  targetValue: number;
  current: number;
  categoryName: string | null;
  categoryColor: string | null;
};

function getPeriodRange(period: string): { start: string; end: string } {
  const now = new Date();
  if (period === "weekly") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    const end = new Date(start.getTime() + 6 * 86400000);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { start, end };
}

export default function TargetsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [targetList, setTargetList] = useState<TargetWithProgress[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        const rows = await db
          .select()
          .from(targets)
          .where(eq(targets.userId, user.id));
        const cats = await db
          .select()
          .from(categories)
          .where(eq(categories.userId, user.id));
        const userTrips = await db
          .select()
          .from(trips)
          .where(eq(trips.userId, user.id));
        const tripIds = userTrips.map((t) => t.id);

        const enriched = await Promise.all(
          rows.map(async (t) => {
            const { start, end } = getPeriodRange(t.period);
            let allActs: (typeof activities.$inferSelect)[] = [];
            for (const tripId of tripIds) {
              const acts = await db
                .select()
                .from(activities)
                .where(eq(activities.tripId, tripId));
              allActs.push(
                ...acts.filter((a) => a.date >= start && a.date <= end),
              );
            }
            if (t.categoryId) {
              allActs = allActs.filter((a) => a.categoryId === t.categoryId);
            }
            const current =
              t.metric === "duration"
                ? allActs.reduce((s, a) => s + a.durationMinutes, 0)
                : allActs.length;
            const cat = cats.find((c) => c.id === t.categoryId);
            const pct = t.targetValue > 0 ? (current / t.targetValue) * 100 : 0;
            sendTargetProgressNotification(t.name, pct);
            return {
              id: t.id,
              name: t.name,
              period: t.period,
              metric: t.metric,
              targetValue: t.targetValue,
              current,
              categoryName: cat?.name ?? null,
              categoryColor: cat?.color ?? null,
            };
          }),
        );
        setTargetList(enriched);
      };
      void load();
    }, [user]),
  );

  const renderTarget = ({ item }: { item: TargetWithProgress }) => {
    const progress = item.targetValue > 0 ? item.current / item.targetValue : 0;
    const exceeded = progress >= 1;
    const unit = item.metric === 'duration' ? 'min' : 'activities';
    const label = `${item.current} / ${item.targetValue} ${unit}`;
    const remaining = Math.max(0, item.targetValue - item.current);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => router.push(`/target/${item.id}/edit` as any)}
        accessibilityRole="button"
        accessibilityLabel={`Target: ${item.name}`}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.targetName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {item.period.charAt(0).toUpperCase() + item.period.slice(1)} •{" "}
              {item.categoryName ?? "All categories"}
            </Text>
          </View>
          {exceeded ? (
            <View
              style={[styles.badge, { backgroundColor: theme.success + "20" }]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.success}
              />
              <Text style={[styles.badgeText, { color: theme.success }]}>
                Done!
              </Text>
            </View>
          ) : null}
        </View>
        <ProgressBar
          progress={progress}
          color={item.categoryColor ?? theme.primary}
        />
        <View style={styles.labelRow}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.remaining, { color: exceeded ? theme.success : theme.warning }]}>
            {exceeded ? 'Target met! 🎉' : `${remaining} ${unit} remaining`}
          </Text>
        </View>
        <View style={styles.labelRow}>
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}> </Text>
          <Text
            style={[
              styles.pctLabel,
              { color: exceeded ? theme.success : theme.primary },
            ]}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.infoBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
        <Text style={[styles.infoText, { color: theme.primary }]}>
          Targets count your activities automatically — just add activities to your trips and progress updates here.
        </Text>
      </View>
      <FlatList
        data={targetList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTarget}
        ListEmptyComponent={
          <EmptyState
            icon="trophy-outline"
            title="No targets set"
            subtitle="Tap + to create a goal"
          />
        }
        contentContainerStyle={[
          styles.list,
          targetList.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/target/add" as any)}
        accessibilityRole="button"
        accessibilityLabel="Add new target"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, margin: 16, marginBottom: 0, padding: 12, borderRadius: 10, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Poppins_400Regular' },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  targetName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  meta: { fontSize: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: { fontSize: 12 },
  pctLabel: { fontSize: 12, fontWeight: '700' },
  remaining: { fontSize: 12, fontWeight: '600' },
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
