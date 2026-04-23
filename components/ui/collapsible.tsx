import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
// The Collapsible component is a reusable UI component that allows you to create collapsible sections in your app. It takes a title and children as props, and it manages its own open/closed state. When the heading is pressed, it toggles the visibility of the content. The component also adapts its styling based on the current theme (light/dark mode) using the useColorScheme hook.
// The heading displays an icon that rotates when the section is open, and the title is displayed next to it. The content is indented and
//  only shown when the section is open. This component can be used in various parts of the app where you want to group related information or settings in a collapsible format, improving the organization and user experience of the app.
// The Collapsible component is designed to be flexible and can be used in different contexts, such as in the Settings screen to group related settings together, or in the Trip Details screen to show/hide additional information about a trip. It enhances the user experience by allowing users to control the visibility of content and keeping the interface clean and organized. The use of theming ensures that it fits seamlessly with the overall design of the app, providing a consistent look and feel across different screens and components.
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
