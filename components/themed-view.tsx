import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
// This component is a themed view that applies the appropriate background color based on the current theme (light or dark). It accepts props for light and dark colors, allowing for customization while still providing a fallback to the theme's default background color. The ThemedView component is designed to be reusable across different screens and components in the app, ensuring consistent theming and styling throughout the user interface.
// The component receives props for the view content, optional light and dark colors, and any other standard ViewProps. It uses the useThemeColor hook to determine the final background color based on the current theme and the provided color overrides. The style prop is combined with the background color to allow for additional styling when needed. By using this component instead of a standard View, developers can ensure that all views in the app adhere to the app's design system and respond appropriately to theme changes, contributing to a cohesive and visually appealing user experience.
// The ThemedView component enhances the overall user experience by ensuring that the app's background colors are consistent with the selected theme, creating a polished and professional appearance. It also simplifies the process of applying theming to views throughout the app, reducing the need for repetitive code and making it easier to maintain a consistent design language.
// The component is particularly useful in screens that require a background color that adapts to the theme, such as the main screen, trip details screen, and other content screens. By centralizing the logic for determining the background color in this component, it helps maintain a clean codebase and makes it easier to manage theming across the app.
// The ThemedView component is a fundamental building block for the app's user interface, providing a simple and effective way to ensure that all views are styled according to the current theme. It contributes to a cohesive and engaging user experience by maintaining visual consistency and supporting dynamic theming throughout the app.
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
