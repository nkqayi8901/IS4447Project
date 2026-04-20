import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
// This component is a custom tab bar button that adds haptic feedback when the user presses down on the tab. It uses the PlatformPressable component from React Navigation to handle the press events and triggers a light haptic feedback on iOS devices. This enhances the user experience by providing tactile feedback when navigating between tabs in the app. The component can be used in the tabBarButton option of the screen options in the Tabs navigator to apply this behavior to all tabs.
// The HapticTab component receives the standard BottomTabBarButtonProps and spreads them onto the PlatformPressable. It overrides the onPressIn event to trigger the haptic feedback before calling the original onPressIn handler. This ensures that the feedback is provided immediately when the user presses down on the tab, creating a more responsive and engaging navigation experience.
// The use of haptic feedback is a subtle but effective way to enhance the user interface, making interactions feel more natural and satisfying. By providing this feedback on tab presses, it can help users feel more connected to the app and improve overall usability, especially on devices that support haptic feedback. This component is a simple yet impactful addition to the app's navigation system, contributing to a polished and user-friendly experience.
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
