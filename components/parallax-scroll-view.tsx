import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
// This component is a custom ScrollView that implements a parallax effect on the header image. The header image moves at a different speed than the scroll content, creating a visually appealing effect as the user scrolls through the content. The component takes in a header image and background color for the header, and it uses the app's theme to style the background of the scroll view. The parallax effect is achieved using the useAnimatedStyle hook from react-native-reanimated, which allows for smooth animations based on the scroll offset.
// The ParallaxScrollView component is designed to be reusable across different screens in the app where a parallax header is desired. It provides a flexible way to display a header image with a dynamic background color that adapts to the current theme (light or dark). The scroll content is wrapped in a ThemedView to ensure that it also adheres to the app's theme styling. Overall, this component enhances the visual appeal of the app while maintaining consistency with the app's design system.
// The component receives props for the header image, which is a React element that can be any image or custom component, and the header background color, which is an object containing colors for both dark and light themes. The scroll content is passed as children to the ParallaxScrollView, allowing for flexible content rendering while maintaining the parallax effect on the header. The use of react-native-reanimated ensures that the animations are smooth and performant, even on lower-end devices, providing a high-quality user experience throughout the app.
// The HEADER_HEIGHT constant defines the height of the header image, which is used to calculate the parallax effect. The scroll offset is used to determine how much the header image should translate and scale as the user scrolls. The interpolate function is used to create a smooth transition for both the translateY and scale transformations based on the scroll offset, creating a dynamic and engaging visual effect as the user interacts with the scroll view.
const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
