import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, categories, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
// This screen shows insights and statistics about the user's trips and activities. It includes:
// - A segmented control to switch between weekly, monthly, and all-time views.
// - Summary stats at the top showing total trips, activities, and hours spent.
// - A bar chart showing the number of activities per day for the last 7 days (or relevant period).
// - A pie chart breaking down activities by category (e.g. sightseeing, dining, etc.).
// The screen uses useFocusEffect
// to load the relevant data from the database whenever the screen is focused, ensuring it
// always shows up-to-date insights after adding/editing trips or activities.
// The charts are implemented using react-native-chart-kit, and the screen is styled to match the app's theme.
// If theres are no activities, it shows an empty state prompting the user to add some activities to see insights here.
const SCREEN_WIDTH = Dimensions.get("window").width;

type PeriodKey = "weekly" | "monthly" | "all";

export default function InsightsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<PeriodKey>("weekly");
  const [barData, setBarData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  } | null>(null);
  const [pieData, setPieData] = useState<
    {
      name: string;
      count: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }[]
  >([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalDuration: 0,
    totalTrips: 0,
    totalCategories: 0,
  });

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        const userTrips = await db
          .select()
          .from(trips)
          .where(eq(trips.userId, user.id));
        const tripIds = userTrips.map((t) => t.id);
        if (tripIds.length === 0) return;

        let allActs = await Promise.all(
          tripIds.map((id) =>
            db.select().from(activities).where(eq(activities.tripId, id)),
          ),
        );
        let flatActs = allActs.flat();

        const now = new Date();
        if (period === "weekly") {
          const weekAgo = new Date(now.getTime() - 7 * 86400000)
            .toISOString()
            .split("T")[0];
          flatActs = flatActs.filter((a) => a.date >= weekAgo);
        } else if (period === "monthly") {
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
          )
            .toISOString()
            .split("T")[0];
          flatActs = flatActs.filter((a) => a.date >= monthAgo);
        }

        const usedCatIds = new Set(flatActs.map((a) => a.categoryId));
        setStats({
          totalActivities: flatActs.length,
          totalDuration: flatActs.reduce((s, a) => s + a.durationMinutes, 0),
          totalTrips: userTrips.length,
          totalCategories: usedCatIds.size,
        });

        // Bar chart: activities per day (last 7 days)
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getTime() - (6 - i) * 86400000);
          return d.toISOString().split("T")[0];
        });
        const dayCount = last7.map(
          (d) => flatActs.filter((a) => a.date === d).length,
        );
        const dayLabels = last7.map((d) => d.slice(5).replace("-", "/"));
        setBarData({ labels: dayLabels, datasets: [{ data: dayCount }] });

        // Pie chart: by category
        const cats = await db
          .select()
          .from(categories)
          .where(eq(categories.userId, user.id));
        const byCategory = cats
          .map((cat) => {
            const count = flatActs.filter(
              (a) => a.categoryId === cat.id,
            ).length;
            return {
              name: cat.name,
              count,
              color: cat.color,
              legendFontColor: theme.text,
              legendFontSize: 12,
            };
          })
          .filter((c) => c.count > 0);
        setPieData(byCategory);
      };
      void load();
    }, [user, period, theme]),
  );

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: () => theme.primary,
    labelColor: () => theme.textSecondary,
    style: { borderRadius: 12 },
  };

  const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "weekly", label: "Week" },
    { key: "monthly", label: "Month" },
    { key: "all", label: "All" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.segmented,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.segment,
                period === p.key && { backgroundColor: theme.primary },
              ]}
              onPress={() => setPeriod(p.key)}
              accessibilityRole="button"
              accessibilityLabel={`View ${p.label} insights`}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: period === p.key ? "#fff" : theme.textSecondary },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Trips", value: stats.totalTrips, icon: "✈️" },
          { label: "Activities", value: stats.totalActivities, icon: "📍" },
          {
            label: "Hours",
            value: Math.round(stats.totalDuration / 60),
            icon: "⏱️",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {stats.totalActivities > 0 && (
        <Text style={[styles.summary, { color: theme.textSecondary }]}>
          {period === 'weekly' ? 'This week' : period === 'monthly' ? 'This month' : 'Overall'},{' '}
          you completed <Text style={{ color: theme.text, fontWeight: '700' }}>{stats.totalActivities} {stats.totalActivities === 1 ? 'activity' : 'activities'}</Text>
          {stats.totalCategories > 0 ? ` across ${stats.totalCategories} ${stats.totalCategories === 1 ? 'category' : 'categories'}` : ''}
          {stats.totalDuration > 0 ? `, totalling ${Math.round(stats.totalDuration / 60)} ${Math.round(stats.totalDuration / 60) === 1 ? 'hour' : 'hours'}.` : '.'}
        </Text>
      )}

      {barData && barData.datasets[0].data.some((v) => v > 0) ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Daily Activity (last 7 days)
          </Text>
          <BarChart
            data={barData}
            width={SCREEN_WIDTH - 56}
            height={180}
            chartConfig={chartConfig}
            showValuesOnTopOfBars
            withInnerLines={false}
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
        </View>
      ) : null}

      {pieData.length > 0 ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Activities by Category
          </Text>
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH - 56}
            height={180}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="10"
            style={styles.chart}
          />
        </View>
      ) : (
        <EmptyState
          icon="bar-chart-outline"
          title="No data yet"
          subtitle="Add activities to see insights here"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  segment: { flex: 1, paddingVertical: 8, alignItems: "center" },
  segmentText: { fontWeight: "600", fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  chartTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  chart: { borderRadius: 10 },
  summary: { fontSize: 13, lineHeight: 20, marginHorizontal: 16, marginBottom: 16 },
});
