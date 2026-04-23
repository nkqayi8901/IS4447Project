import CategoryBadge from "@/components/CategoryBadge";
import FormField from "@/components/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { categories, targets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// This screen allows users to create a new target for their activities. It includes form fields for the target name, color selection, and icon selection.
// The screen validates the input and shows error messages for invalid fields. When the user saves the target, it inserts the new record into the database and navigates back to the previous screen.
// The color selection is displayed as a row of colored dots, and the icon selection is displayed as a grid of icons. Users can select one color and one icon for their category.
// The screen also handles loading states and uses the app's theme for styling. It is wrapped in a KeyboardAvoidingView to ensure the form is not obscured by the keyboard on mobile devices, and it uses a ScrollView to allow access to all fields on smaller screens.
// The screens retrieves the list of available colors and icons from constants and displays them for selection. It also ensures that the target name is not empty before allowing the user to save.
// If the user tries to save without entering a name, it shows an error message
// prompting them to enter a target name. Once the target is successfully saved, it navig
type Period = "weekly" | "monthly";
type Metric = "count" | "duration";

export default function AddTargetScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [cats, setCats] = useState<(typeof categories.$inferSelect)[]>([]);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<Period>("weekly");
  const [metric, setMetric] = useState<Metric>("count");
  const [targetValue, setTargetValue] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    db.select()
      .from(categories)
      .where(eq(categories.userId, user.id))
      .then(setCats);
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Target name is required";
    if (!targetValue || Number(targetValue) <= 0)
      e.value = "Enter a valid goal value";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    await db.insert(targets).values({
      userId: user.id,
      categoryId: selectedCat,
      name: name.trim(),
      period,
      metric,
      targetValue: Number(targetValue),
    });
    setLoading(false);
    router.back();
  };

  type ChipGroupProps = {
    label: string;
    options: { key: string; label: string }[];
    value: string;
    onChange: (v: any) => void;
  };
  const ChipGroup = ({ label, options, value, onChange }: ChipGroupProps) => (
    <View style={styles.chipSection}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.chipRow}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[
              styles.chip,
              {
                borderColor: value === o.key ? theme.primary : theme.border,
                backgroundColor: value === o.key ? theme.primary : theme.card,
              },
            ]}
            onPress={() => onChange(o.key)}
          >
            <Text
              style={[
                styles.chipText,
                { color: value === o.key ? "#fff" : theme.textSecondary },
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          label="Target Name"
          placeholder="e.g. Weekly Activity Goal"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <FormField
          label={`Goal Value (${metric === "duration" ? "minutes" : "activities"})`}
          placeholder="e.g. 300"
          value={targetValue}
          onChangeText={setTargetValue}
          keyboardType="numeric"
          error={errors.value}
        />

        <ChipGroup
          label="PERIOD"
          options={[
            { key: "weekly", label: "Weekly" },
            { key: "monthly", label: "Monthly" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <ChipGroup
          label="MEASURE BY"
          options={[
            { key: "count", label: "Activity count" },
            { key: "duration", label: "Total minutes" },
          ]}
          value={metric}
          onChange={setMetric}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          CATEGORY (OPTIONAL)
        </Text>
        <View style={styles.catGrid}>
          <TouchableOpacity
            style={[
              styles.catItem,
              {
                borderColor:
                  selectedCat === null ? theme.primary : theme.border,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedCat(null)}
          >
            <Text
              style={{
                color:
                  selectedCat === null ? theme.primary : theme.textSecondary,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              All Categories
            </Text>
          </TouchableOpacity>
          {cats.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.catItem,
                {
                  borderColor: selectedCat === c.id ? c.color : "transparent",
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedCat(c.id)}
            >
              <CategoryBadge
                name={c.name}
                color={c.color}
                icon={c.icon}
                small
              />
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
            <Text style={styles.btnText}>Create Target</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipSection: { marginBottom: 16 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontWeight: "600", fontSize: 13 },
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
});
