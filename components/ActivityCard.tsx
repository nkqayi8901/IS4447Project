import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadow, radius } from '@/constants/Styles';
import CategoryBadge from './CategoryBadge';
// This component represents a card for an activity in the trip details screen. It displays the activity name, date, duration, count, notes, and category information. The card is styled according to the app's theme and includes a colored left bar that matches the category color. Tapping the card triggers the onPress function passed as a prop, allowing users to view or edit the activity details.
// The card also includes accessibility labels for better usability, and it handles cases where certain information (like notes or duration) may not be present, ensuring a clean and consistent layout regardless of the activity data.
// The component receives props for the activity details, including the name, date, duration in minutes, count (for repeated activities), notes, category name, category color, category icon, and an onPress function to handle user interaction. It uses the app's theme for styling and ensures that all text and icons are displayed with appropriate colors based on the current theme.
// The card layout includes a top section with the activity name and category badge, a notes section that is conditionally rendered if notes are present, and a footer that displays metadata such as the date, duration, and count of the activity. The left bar provides a visual cue for the category, making it easy for users to quickly identify the type of activity at a glance. Overall, this component is designed to be reusable and adaptable for displaying various activities within the app.
type Props = {
  name: string;
  date: string;
  durationMinutes: number;
  count: number;
  notes: string | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  onPress: () => void;
  onDelete?: () => void;
};

export default function ActivityCard({
  name, date, durationMinutes, count, notes,
  categoryName, categoryColor, categoryIcon, onPress, onDelete,
}: Props) {
  const { theme } = useTheme();

  const confirmDelete = () => {
    Alert.alert('Delete Activity', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, shadow.sm]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Activity: ${name}`}
    >
      <View style={[styles.leftBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{name}</Text>
          <View style={styles.topRight}>
            <CategoryBadge name={categoryName} color={categoryColor} icon={categoryIcon} small />
            {onDelete && (
              <TouchableOpacity onPress={confirmDelete} hitSlop={8} accessibilityLabel="Delete activity">
                <Ionicons name="trash-outline" size={15} color={theme.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {notes ? <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>{notes}</Text> : null}
        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{date}</Text>
          </View>
          {durationMinutes > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{durationMinutes} min</Text>
            </View>
          )}
          {count > 1 && (
            <View style={styles.metaItem}>
              <Ionicons name="repeat-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>×{count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: radius.lg, marginBottom: 10, overflow: 'hidden' },
  leftBar: { width: 4 },
  content: { flex: 1, padding: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, flex: 1 },
  notes: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17, marginBottom: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footer: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 11 },
});
