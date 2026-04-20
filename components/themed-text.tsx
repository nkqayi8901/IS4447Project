import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
// This component is a themed text component that allows for easy styling of text elements based on the app's current theme (light or dark). It accepts props for light and dark colors, as well as a type prop to apply predefined text styles (e.g., title, subtitle, link). The component uses the useThemeColor hook to determine the appropriate color based on the current theme and applies it to the Text component. This allows for consistent text styling across the app while also supporting dynamic theming.
// The ThemedText component is designed to be reusable across different screens and components in the app, providing a centralized way to manage text styles and colors. By using this component instead of the standard Text component, developers can ensure that all text elements adhere to the app's design system and respond appropriately to theme changes. The type prop allows for easy application of common text styles, reducing the need for repetitive style definitions and improving code maintainability.
// The component receives props for the text content, optional light and dark colors, and a type that determines the predefined text style to apply. The useThemeColor hook is used to calculate the final color based on the current theme and the provided light/dark color overrides. The styles for different text types (default, title, subtitle, link) are defined in the StyleSheet and applied conditionally based on the type prop. This approach allows for flexible and consistent text styling throughout the app while maintaining support for dynamic theming.
// The ThemedText component enhances the overall user experience by ensuring that text elements are visually cohesive with the app's theme and design language, contributing to a polished and professional appearance.
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
