import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadow, radius } from '@/constants/Styles';
import CategoryBadge from './CategoryBadge';
// The ActivityCard component is a reusable UI component that displays information about a specific activity in a card format. It shows the activity name, date, duration, category, and any notes associated with the activity. The card also includes a colored bar on the left side that indicates the category color or a success color if the activity is marked as completed.
// The component accepts props for the activity details, as well as callback functions for when the card is pressed, when the activity is deleted, and 
// when the completion status is toggled. It also uses the app's theme to adapt its styling based on light or dark mode. 
// The card includes accessibility labels for better screen reader support, and it handles user interactions such as marking an activity as complete or deleting it with confirmation alerts to prevent accidental deletions.
// The ActivityCard component can be used in various parts of the app where activities are displayed, such as in the Trip Details screen or in lists of activities.
//  It provides a consistent and visually appealing way to present activity information while also allowing users to interact with their activities directly from the card.
// The component's styling includes a left bar that changes color based on the activity's category or completion status, a checkbox for marking the activity as complete, and a badge that shows the category name and icon. The footer of the card displays metadata such as the date, duration, and repeat count, along with a "Done" badge if the activity is completed. The component also handles edge cases such as long activity names or notes by truncating them and providing a clean layout.
type Props = {
  name: string;
  date: string;
  durationMinutes: number;
  count: number;
  notes: string | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  completed: boolean;
  onPress: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
};

export default function ActivityCard({
  name, date, durationMinutes, count, notes,
  categoryName, categoryColor, categoryIcon,
  completed, onPress, onDelete, onToggleComplete,
}: Props) {
  const { theme } = useTheme();

  const confirmDelete = () => {
    Alert.alert('Delete Activity', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const barColor = completed ? theme.success : categoryColor;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, shadow.sm, completed && { opacity: 0.75 }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Activity: ${name}`}
    >
      <View style={[styles.leftBar, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          {onToggleComplete && (
            <TouchableOpacity
              onPress={onToggleComplete}
              hitSlop={8}
              accessibilityLabel={completed ? 'Mark incomplete' : 'Mark complete'}
              style={[styles.checkbox, { borderColor: completed ? theme.success : theme.border, backgroundColor: completed ? theme.success : 'transparent' }]}
            >
              {completed && <Ionicons name="checkmark" size={12} color="#fff" />}
            </TouchableOpacity>
          )}
          <Text
            style={[styles.name, { color: completed ? theme.textSecondary : theme.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
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
          {completed && (
            <View style={[styles.doneBadge, { backgroundColor: theme.success + '20' }]}>
              <Text style={[styles.doneText, { color: theme.success }]}>Done</Text>
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
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, flex: 1 },
  notes: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17, marginBottom: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 11 },
  doneBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 'auto' },
  doneText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
});
