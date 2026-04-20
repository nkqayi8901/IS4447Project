import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { text, radius } from '@/constants/Styles';
// This component represents an empty state, which is displayed when there are no items to show in a list (e.g., no trips, no activities, no categories). It includes an icon, a title, and an optional subtitle to provide context to the user. The component is styled according to the app's theme and includes accessibility labels for better usability. It is designed to be reusable across different screens in the app where an empty state might be needed.
// The component receives props for the icon name (from Ionicons), the title text, and an optional subtitle text. It uses the app's theme to style the background of the icon and the colors of the text, ensuring that it fits seamlessly with the overall design of the app. The layout centers the content both vertically and horizontally, making it visually appealing and easy to read when displayed on screens with no data.
// The empty state is particularly useful for guiding users on what to do next when they encounter an empty list, such as prompting them to create their first trip or category. By providing a clear message and a visually distinct icon, it helps improve the user experience and encourages engagement with the app's features.
// The component is flexible and can be used in various contexts throughout the app, making it a valuable addition to the overall design system.
type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ icon = 'folder-open-outline', title, subtitle }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={title}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primary + '12' }]}>
        <Ionicons name={icon as any} size={48} color={theme.primary} />
      </View>
      <Text style={[text.h3, { color: theme.text, textAlign: 'center' }]}>{title}</Text>
      {subtitle ? (
        <Text style={[text.body, { color: theme.textSecondary, textAlign: 'center' }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
