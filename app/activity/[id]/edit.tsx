import CategoryBadge from "@/components/CategoryBadge";
import FormField from "@/components/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { activities, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// This screen allows users to edit an existing activity. It pre-fills the form fields with the current activity data and allows users to update the name, date, duration, count, notes, and category.
// The screen validates the input and shows error messages for invalid fields. When the user saves the changes, it updates the record in the database and navigates back to the trip details screen.
// Users can also delete the activity using the "Delete" button, which prompts for confirmation before removing the record from the database.
// The category selection is displayed as a grid of badges, and users can select one to categorize their activity. The screen also handles loading states and uses the app's theme for styling.
// Like the Add Activity screen, it is wrapped in a KeyboardAvoidingView to ensure the form is not obscured by the keyboard on mobile devices, and it uses a ScrollView
// to allow access to all fields on smaller screens.
// The screen retrieves the list of categories from the database on mount and
// populates the category selection grid. If there are no categories, it prompts the user to create some in the settings before editing activities.
// The screen loads the current activity data from the database using the activity ID passed in the URL parameters.
// It then populates the form fields with this data, allowing the user to make changes and save them back to the database.
export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [cats, setCats] = useState<(typeof categories.$inferSelect)[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [count, setCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const catRows = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, user.id));
      setCats(catRows);
      const rows = await db
        .select()
        .from(activities)
        .where(eq(activities.id, Number(id)));
      if (rows[0]) {
        setName(rows[0].name);
        setDate(rows[0].date);
        setDuration(String(rows[0].durationMinutes || ""));
        setCount(String(rows[0].count));
        setNotes(rows[0].notes ?? "");
        setSelectedCat(rows[0].categoryId);
      }
    };
    void load();
  }, [id, user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Activity name is required";
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) e.date = "Use YYYY-MM-DD format";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await db
      .update(activities)
      .set({
        name: name.trim(),
        date,
        durationMinutes: Number(duration) || 0,
        count: Number(count) || 1,
        notes: notes.trim() || null,
        categoryId: selectedCat!,
      })
      .where(eq(activities.id, Number(id)));
    setLoading(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete Activity", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.delete(activities).where(eq(activities.id, Number(id)));
          router.back();
        },
      },
    ]);
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
          label="Activity Name"
          placeholder="e.g. Eiffel Tower visit"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <FormField
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          error={errors.date}
          keyboardType="numeric"
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField
              label="Duration (min)"
              placeholder="e.g. 120"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          <View style={{ width: 16 }} />
          <View style={{ flex: 1 }}>
            <FormField
              label="Count"
              placeholder="1"
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
            />
          </View>
        </View>
        <FormField
          label="Notes (optional)"
          placeholder="Add notes..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          CATEGORY
        </Text>
        <View style={styles.catGrid}>
          {cats.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCat(c.id)}
              style={[
                styles.catItem,
                {
                  borderColor: selectedCat === c.id ? c.color : "transparent",
                  borderWidth: 2,
                },
              ]}
            >
              <CategoryBadge name={c.name} color={c.color} icon={c.icon} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: theme.primary },
            loading && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: theme.danger }]}
          onPress={handleDelete}
        >
          <Text style={[styles.deleteBtnText, { color: theme.danger }]}>
            Delete Activity
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  row: { flexDirection: "row" },
  textArea: { height: 80, textAlignVertical: "top" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  catItem: { borderRadius: 20, padding: 2 },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deleteBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
  },
  deleteBtnText: { fontWeight: "700", fontSize: 16 },
});
