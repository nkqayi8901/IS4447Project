import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shadow, radius, text as textStyle } from '@/constants/Styles';

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

function getDuration(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function getStatus(start: string, end: string): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date().toISOString().split('T')[0];
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

function getStatusLabel(start: string, end: string): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (today < start) {
    const days = Math.ceil((new Date(start + 'T00:00:00').getTime() - now.getTime()) / 86400000);
    if (days <= 1) return 'Tomorrow';
    return `In ${days} days`;
  }
  if (today > end) {
    const days = Math.ceil((now.getTime() - new Date(end + 'T00:00:00').getTime()) / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  const daysLeft = Math.ceil((new Date(end + 'T00:00:00').getTime() - now.getTime()) / 86400000);
  return daysLeft <= 0 ? 'Last day!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
}

export default function TripCard({ name, destination, startDate, endDate, activityCount, streak, onPress }: Props) {
  const { theme } = useTheme();
  const status = getStatus(startDate, endDate);
  const duration = getDuration(startDate, endDate);

  const statusColor = status === 'ongoing' ? theme.success : status === 'upcoming' ? theme.primary : theme.textSecondary;
  const statusBg = statusColor + '18';
  const statusIcon = status === 'ongoing' ? 'airplane' : status === 'upcoming' ? 'time-outline' : 'checkmark-circle-outline';
  const statusLabel = getStatusLabel(startDate, endDate);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, shadow.md]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Trip: ${name}, ${destination}`}
    >
      <View style={[styles.accentBar, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: statusBg }]}>
            <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[textStyle.h3, { color: theme.text }]} numberOfLines={1}>{name}</Text>
            <View style={styles.row}>
              <Ionicons name="location" size={12} color={theme.primary} />
              <Text style={[styles.dest, { color: theme.textSecondary }]} numberOfLines={1}>{destination}</Text>
            </View>
          </View>
          <View style={styles.rightCol}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
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
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{duration} day{duration !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="list-outline" size={11} color={theme.primary} />
              <Text style={[styles.countText, { color: theme.primary }]}>{activityCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, marginBottom: 14, overflow: 'hidden' },
  accentBar: { height: 3 },
  body: { padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  dest: { fontFamily: 'Poppins_400Regular', fontSize: 13, flex: 1 },
  rightCol: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  streakBadge: { backgroundColor: '#FEF3C7', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  streakText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#92400E' },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  divider: { height: 1, marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
});
