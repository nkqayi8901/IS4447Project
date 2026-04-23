import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// This component is a custom date picker field that can be used in forms. It displays a label and the currently selected date (or a placeholder if no date is selected). When the user taps on the field, it opens a date picker. On iOS, the date picker is displayed in a modal with a "Done" button to confirm the selection. On Android, it uses the native date picker dialog.
// The component handles date formatting and parsing to ensure that the value is stored in a consistent format (YYYY-MM-DD) while displaying it in a more user-friendly format. It also shows error messages if there are validation issues with the selected date.
// The styling of the component adapts to the app's theme, using colors from the theme context for text, background, borders, and error states.
//  It also includes accessibility labels for better screen reader support.
// The component accepts the following propss:
// - label: The label to display above the date field.
// - value: The currently selected date in YYYY-MM-DD format.
// - onChange: A callback function that is called when the user selects a new date, passing the new date in YYYY-MM-DD format.
// - error: An optional error message to display if there is a validation issue with the selected date.
type Props = {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
};

const toDate = (val: string) => {
  const d = new Date(val + 'T00:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
};

const toDisplay = (val: string) => {
  if (!val) return 'Select date';
  const d = new Date(val + 'T00:00:00');
  if (isNaN(d.getTime())) return 'Select date';
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DatePickerField({ label, value, onChange, error }: Props) {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }, error && { color: theme.danger }]}>
        {label.toUpperCase()}
        {error ? <Text style={{ color: theme.danger }}> – {error}</Text> : null}
      </Text>
      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: theme.card, borderColor: error ? theme.danger : theme.border },
        ]}
        onPress={() => setShow(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
      >
        <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.value, { color: value ? theme.text : theme.textSecondary }]}>
          {toDisplay(value)}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' && show && (
        <Modal transparent animationType="slide">
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShow(false)} />
          <View style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={[styles.done, { color: theme.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={toDate(value)}
              mode="date"
              display="spinner"
              onChange={handleChange}
              style={{ backgroundColor: theme.card }}
            />
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  value: { flex: 1, fontSize: 14, fontFamily: 'Poppins_400Regular' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  done: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
});
