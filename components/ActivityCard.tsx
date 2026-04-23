import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadow, radius } from '@/constants/Styles';
import CategoryBadge from './CategoryBadge';

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
