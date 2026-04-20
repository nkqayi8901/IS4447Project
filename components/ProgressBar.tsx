import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
// This component represents a progress bar that can be used to visually indicate the completion status of a task or goal. It receives a progress value between 0 and 1, and it renders a filled bar that corresponds to the progress percentage. The color of the filled bar can be customized, and it defaults to the primary color from the theme. The height of the progress bar can also be adjusted through props. The component includes accessibility features to ensure that screen readers can interpret the progress correctly.
// The ProgressBar component consists of a track (the background) and a fill (the colored bar that indicates progress). The width of the fill is determined by the progress prop, which is clamped between 0 and 1 to prevent overflow. If the progress reaches or exceeds 100%, the color of the fill changes to indicate success. The component is designed to be reusable across different screens in the app where progress indication is needed, such as in activity completion, target achievement, or loading states.
// The use of the app's theme ensures that the progress bar integrates seamlessly with the overall design of the app, maintaining visual consistency. The component is simple yet effective in providing users with a clear visual representation of their progress towards a goal, enhancing motivation and engagement within the app.
// The component receives three props: progress (a number between 0 and 1), color (an optional string to customize the fill color), and height (an optional number to adjust the height of the progress bar). It uses the useTheme hook to access the current theme colors and applies styles accordingly. The accessibilityValue prop is set to provide screen readers with information about the current progress percentage, improving accessibility for users with visual impairments.
// The styles for the ProgressBar component define the track and fill. The track is a full-width container with a background color that serves as the base of the progress bar, while the fill is a colored bar that grows in width based on the progress value. Both the track and fill have rounded corners to create a smooth and visually appealing design.
type Props = {
  progress: number;
  color?: string;
  height?: number;
};

export default function ProgressBar({ progress, color, height = 8 }: Props) {
  const { theme } = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const barColor = progress >= 1 ? theme.success : (color ?? theme.primary);

  return (
    <View
      style={[styles.track, { backgroundColor: theme.border, height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: barColor, height, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: {},
});
