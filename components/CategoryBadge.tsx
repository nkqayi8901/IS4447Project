import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '@/constants/Styles';
// This component represents a badge for a category, which is used in various parts of the app to visually indicate the category of an activity or target. The badge displays the category name, an optional icon, and is styled with a background color that corresponds to the category color. The badge can also be rendered in a smaller size when the "small" prop is set to true, which adjusts the padding and font size accordingly.
// The component receives props for the category name, color, optional icon, and a boolean to indicate if it should be rendered in a smaller size. It uses the Ionicons library to display the icon, and it applies styles based on the provided color and size. The badge also includes an accessibility label for better usability, indicating the category name to screen readers.
// The badge is designed to be reusable across the app, allowing for consistent styling of category indicators in activity cards, target cards, and category lists. It ensures that the category information is visually distinct and easily recognizable by users, enhancing the overall user experience when browsing through activities and targets.
// The badge's background color is a lighter version of the category color (using opacity), and it has a border that is a slightly darker version of the category color. This design choice helps the badge stand out while maintaining a cohesive look with the category's color scheme. The text and icon are colored with the main category color to ensure good contrast and readability against the lighter background. The small variant of the badge is useful for displaying category information in more compact spaces, such as within activity cards or target cards, without overwhelming the layout.
// The badge'ss layout is a horizontal row with the icon on the left and the category name on the right. The padding and font size are adjusted based on whether the "small" prop is true or false, allowing for flexibility in how the badge is displayed in different contexts throughout the app.
type Props = {
  name: string;
  color: string;
  icon?: string;
  small?: boolean;
};

export default function CategoryBadge({ name, color, icon = 'compass', small = false }: Props) {
  return (
    <View
      style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '45' }, small && styles.small]}
      accessibilityLabel={`Category: ${name}`}
    >
      <Ionicons name={icon as any} size={small ? 10 : 12} color={color} />
      <Text style={[styles.text, { color, fontSize: small ? 10 : 12 }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1, alignSelf: 'flex-start',
  },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  text: { fontFamily: 'Poppins_600SemiBold' },
});
