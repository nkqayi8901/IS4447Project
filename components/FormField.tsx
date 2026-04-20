import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { text as textStyle, radius, spacing, shadow } from '@/constants/Styles';
// This component represents a form field with a label, an input, and an optional error message. It is used in various forms throughout the app, such as the login, registration, and settings screens. The component is styled according to the app's theme and includes accessibility labels for better usability. It also handles displaying error messages when validation fails, making it easier for users to understand what went wrong and how to fix it.
// The component receives props for the label text, an optional error message, and all standard TextInput props. It uses the app's theme to style the input field and error message, ensuring that it fits seamlessly with the overall design of the app. The input field has a border that changes color when there is an error, providing a visual cue to users that something needs their attention. The error message is displayed below the input field in a smaller font size and a color that indicates an error (usually red) to further emphasize the issue.
// The component is designed to be reusable across different forms in the app, allowing for consistent styling and behavior when collecting user input. By centralizing the form field logic in this component, it helps maintain a clean codebase and makes it easier to manage form validation and error handling across the app.
type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function FormField({ label, error, style, ...props }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]} accessibilityRole="text">
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          shadow.sm,
          {
            backgroundColor: theme.inputBg,
            color: theme.text,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={label}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    ...textStyle.label,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  error: { fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 4 },
});
