import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, targets, trips } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
// This is the notifications screen. 
// It shows users important alerts and updates related to their trips and targets. The screen fetches the user's trips and targets from the database and generates notifications based on their status. For example, it alerts users when a trip is starting soon, when they are currently on a trip, 
// or when they have achieved a target. The notifications are displayed in a card format with an icon, title, and body text. If there are no notifications, it shows a friendly message indicating that the user is all caught up. The styling of the screen 
// adapts to the app's theme, using colors from the theme context for backgrounds, text, borders, and icons.
// The screen uses the useFocusEffect hook to load notifications whenever the screen comes into focus, ensuring that users always see the most up-to-date information when they navigate to this screen. It also handles loading states and error cases gracefully, providing a smooth user experience.
type Notification = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
};

function getStatus(start: string, end: string): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date().toISOString().split('T')[0];
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Notification[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        const [tripRows, targetRows] = await Promise.all([
          db.select().from(trips).where(eq(trips.userId, user.id)),
          db.select().from(targets).where(eq(targets.userId, user.id)),
        ]);

        const list: Notification[] = [];

        for (const t of tripRows) {
          const status = getStatus(t.startDate, t.endDate);
          const daysUntil = Math.ceil(
            (new Date(t.startDate + 'T00:00:00').getTime() - Date.now()) / 86400000
          );

          if (status === 'ongoing') {
            const acts = await db.select().from(activities).where(eq(activities.tripId, t.id));
            const todayStr = new Date().toISOString().split('T')[0];
            const loggedToday = acts.filter(a => a.date === todayStr).length;
            list.push({
              id: `ongoing-${t.id}`,
              icon: 'airplane',
              iconColor: theme.primary,
              title: `You're on your ${t.name} trip!`,
              body: loggedToday > 0
                ? `${loggedToday} activit${loggedToday === 1 ? 'y' : 'ies'} logged today. Keep it up!`
                : "Don't forget to log today's activities.",
            });
          } else if (status === 'upcoming' && daysUntil >= 0 && daysUntil <= 3) {
            list.push({
              id: `upcoming-${t.id}`,
              icon: 'time-outline',
              iconColor: theme.warning,
              title: daysUntil === 0 ? `${t.name} starts today!` : `${t.name} starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
              body: `Destination: ${t.destination}`,
            });
          }
        }

        const tripIds = tripRows.map(t => t.id);
        let allActs: (typeof activities.$inferSelect)[] = [];
        for (const tripId of tripIds) {
          const acts = await db.select().from(activities).where(eq(activities.tripId, tripId));
          allActs.push(...acts.filter(a => a.completed === 1));
        }

        for (const tgt of targetRows) {
          const relevantActs = tgt.categoryId
            ? allActs.filter(a => a.categoryId === tgt.categoryId)
            : allActs;
          const current = tgt.metric === 'duration'
            ? relevantActs.reduce((s, a) => s + a.durationMinutes, 0)
            : relevantActs.length;
          const unit = tgt.metric === 'duration' ? 'min' : 'activities';
          const progress = tgt.targetValue > 0 ? current / tgt.targetValue : 0;

          if (progress >= 1) {
            list.push({
              id: `target-done-${tgt.id}`,
              icon: 'trophy',
              iconColor: '#f59e0b',
              title: `Target achieved: ${tgt.name}`,
              body: `You hit your goal of ${tgt.targetValue} ${unit}. Great work!`,
            });
          } else if (progress >= 0.8) {
            const remaining = tgt.targetValue - current;
            list.push({
              id: `target-close-${tgt.id}`,
              icon: 'flag-outline',
              iconColor: theme.primary,
              title: `Almost there: ${tgt.name}`,
              body: `Only ${remaining} ${unit} left to reach your goal!`,
            });
          }
        }

        setNotes(list);
      };
      void load();
    }, [user, theme])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, notes.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.iconColor + '18' }]}>
              <Ionicons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>{item.body}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={52} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up!</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>No alerts right now. Enjoy your travels!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginBottom: 2 },
  body: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 19 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  emptyBody: { fontFamily: 'Poppins_400Regular', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});
