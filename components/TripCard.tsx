import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadow, radius, text as textStyle } from '@/constants/Styles';
// This component represents a card for a trip in the main trips list. It displays the trip name, destination, dates, number of activities, and current streak. The card is styled according to the app's theme and includes a colored accent bar at the top that matches the primary color. Tapping the card triggers the onPress function passed as a prop, allowing users to navigate to the trip details screen. The card also includes accessibility labels for better usability, ensuring that screen readers can interpret the content correctly.
// The component receives props for the trip details, including the name, destination, start and end dates, activity count, streak, and an onPress function to handle user interaction. It uses the app's theme for styling and ensures that all text and icons are displayed with appropriate colors based on the current theme. The layout includes a top section with the trip name and destination, a divider, and a footer that displays metadata such as the dates and activity count. The streak badge is conditionally rendered if there is an active streak, providing a visual indicator of the user's consistency in adding activities to their trips.
// Overall, this component is designed to be reusable and adaptable for displaying various trips within the app, contributing to a cohesive and engaging user experience.
// The formatDate function formats an ISO date string into a more readable format (e.g., "12 Mar"). The getDuration function calculates the duration of the trip in days based on the start and end dates. These helper functions are used to display the trip information in a user-friendly way on the card.
// The styles for the TripCard component define the layout and appearance of the card, including the accent bar, body, top row, destination row, streak badge, divider, footer, and count badge. The styles use the app's theme colors and constants for spacing, radius, and text styles to ensure consistency with the overall design of the app.
// The TripCard component is a key part of the user interface, providing a visually appealing and informative representation of each trip in the user's list. By including important details at a glance and supporting easy navigation to the trip details screen, it enhances the overall user experience and encourages engagement with the app's features.
type Props = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  activityCount: number;
  streak: number;
  onPress: () => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function getDuration(start: string, end: string): string {
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export default function TripCard({ name, destination, startDate, endDate, activityCount, streak, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, shadow.md]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Trip: ${name}, ${destination}`}
    >
      {/* Top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="airplane" size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[textStyle.h3, { color: theme.text }]} numberOfLines={1}>{name}</Text>
            <View style={styles.row}>
              <Ionicons name="location" size={12} color={theme.primary} />
              <Text style={[styles.dest, { color: theme.textSecondary }]}>{destination}</Text>
            </View>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {formatDate(startDate)} – {formatDate(endDate)}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{getDuration(startDate, endDate)}</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.countText, { color: theme.primary }]}>{activityCount} activities</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, marginBottom: 14, overflow: 'hidden' },
  accentBar: { height: 4 },
  body: { padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  dest: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  streakBadge: { backgroundColor: '#FEF3C7', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#92400E' },
  divider: { height: 1, marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
  countBadge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
});
