import CategoryBadge from "@/components/CategoryBadge";
import FormField from "@/components/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { categories, targets } from "@/db/schema";
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

type Period = "weekly" | "monthly";
type Metric = "count" | "duration";

export default function EditTargetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [cats, setCats] = useState<(typeof categories.$inferSelect)[]>([]);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<Period>("weekly");
  const [metric, setMetric] = useState<Metric>("count");
  const [targetValue, setTargetValue] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
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
        .from(targets)
        .where(eq(targets.id, Number(id)));
      if (rows[0]) {
        setName(rows[0].name);
        setPeriod(rows[0].period as Period);
        setMetric(rows[0].metric as Metric);
        setTargetValue(String(rows[0].targetValue));
        setSelectedCat(rows[0].categoryId ?? null);
      }
    };
    void load();
  }, [id, user]);

  const handleSave = async () => {
    if (!name.trim() || !targetValue) return;
    setLoading(true);
    await db
      .update(targets)
      .set({
        name: name.trim(),
        period,
        metric,
        targetValue: Number(targetValue),
        categoryId: selectedCat,
      })
      .where(eq(targets.id, Number(id)));
    setLoading(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete Target", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.delete(targets).where(eq(targets.id, Number(id)));
          router.back();
        },
      },
    ]);
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
          value={name}
          onChangeText={setName}
          placeholder="e.g. Weekly Activity Goal"
        />
        <FormField
          label={`Goal Value (${metric === "duration" ? "minutes" : "activities"})`}
          value={targetValue}
          onChangeText={setTargetValue}
          keyboardType="numeric"
          placeholder="e.g. 300"
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
            <Text style={styles.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: theme.danger }]}
          onPress={handleDelete}
        >
          <Text style={[styles.deleteBtnText, { color: theme.danger }]}>
            Delete Target
          </Text>
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
  deleteBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
  },
  deleteBtnText: { fontWeight: "700", fontSize: 16 },
});
