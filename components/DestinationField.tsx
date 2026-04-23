import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// This component is a custom destination field that can be used in forms. It displays a label and an input field where users can type a location. As the user types, it fetches matching locations from the Open-Meteo Geocoding API and displays them in a dropdown list. Users can select a location from the dropdown, which will populate the input field with the selected location's name.
// The component handles debouncing of the API requests to avoid excessive calls as the user types. It also shows a loading indicator while fetching results and displays error messages if there are validation issues with the input.
// The styling of the component adapts to the app's theme, using colors from the theme context for text, background, borders, and error states. It also includes accessibility labels for better screen reader support.
// The component accepts the following props:
// - label: The label to display above the input field.
// - value: The currently selected location as a string.
// - onChange: A callback function that is called when the user types or selects a location, passing the new location string.
// - error: An optional error message to displays if there is a validation issue with the input.
type GeoResult = { id: number; name: string; country: string; admin1?: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function DestinationField({ label, value, onChange, error }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (text: string) => {
    setQuery(text);
    onChange(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.length < 2) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=6&language=en&format=json`
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item: GeoResult) => {
    const formatted = item.admin1
      ? `${item.name}, ${item.admin1}, ${item.country}`
      : `${item.name}, ${item.country}`;
    setQuery(formatted);
    onChange(formatted);
    setResults([]);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: error ? theme.danger : theme.textSecondary }]}>
        {label.toUpperCase()}
        {error ? <Text style={{ color: theme.danger }}> – {error}</Text> : null}
      </Text>
      <View style={[styles.row, { backgroundColor: theme.card, borderColor: error ? theme.danger : theme.border }]}>
        <Ionicons name="location-outline" size={16} color={theme.primary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={query}
          onChangeText={handleChange}
          placeholder="Search city or country..."
          placeholderTextColor={theme.textSecondary}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {open && results.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {results.map((item, idx) => {
            const display = item.admin1
              ? `${item.name}, ${item.admin1}, ${item.country}`
              : `${item.name}, ${item.country}`;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, { borderTopColor: theme.border, borderTopWidth: idx === 0 ? 0 : 1 }]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location-outline" size={13} color={theme.primary} />
                <Text style={[styles.itemText, { color: theme.text }]} numberOfLines={1}>{display}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16, zIndex: 10 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Poppins_400Regular' },
  dropdown: { position: 'absolute', top: 78, left: 0, right: 0, borderRadius: 12, borderWidth: 1, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  itemText: { flex: 1, fontSize: 14, fontFamily: 'Poppins_400Regular' },
});
