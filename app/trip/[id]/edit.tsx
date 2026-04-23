import DatePickerField from "@/components/DatePickerField";
import DestinationField from "@/components/DestinationField";
import FormField from "@/components/FormField";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.select()
      .from(trips)
      .where(eq(trips.id, Number(id)))
      .then((rows) => {
        if (rows[0]) {
          setName(rows[0].name);
          setDestination(rows[0].destination);
          setStartDate(rows[0].startDate);
          setEndDate(rows[0].endDate);
          setNotes(rows[0].notes ?? "");
        }
      });
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Trip name is required";
    if (!destination.trim()) e.destination = "Destination is required";
    if (!startDate) e.startDate = "Please select a start date";
    if (!endDate) e.endDate = "Please select an end date";
    if (startDate && endDate && endDate < startDate)
      e.endDate = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await db
      .update(trips)
      .set({
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        notes: notes.trim() || null,
      })
      .where(eq(trips.id, Number(id)));
    setLoading(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <FormField
          label="Trip Name"
          placeholder="e.g. Paris Adventure"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <DestinationField
          label="Destination"
          value={destination}
          onChange={setDestination}
          error={errors.destination}
        />
        <DatePickerField
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          error={errors.startDate}
        />
        <DatePickerField
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          error={errors.endDate}
        />
        <FormField
          label="Notes (optional)"
          placeholder="Any notes about the trip"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: theme.primary },
            loading && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  textArea: { height: 80, textAlignVertical: "top" },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
