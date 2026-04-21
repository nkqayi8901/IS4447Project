import FormField from "@/components/FormField";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/AppColors";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
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
  View,
} from "react-native";

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .then((rows) => {
        if (rows[0]) {
          setName(rows[0].name);
          setSelectedColor(rows[0].color);
          setSelectedIcon(rows[0].icon);
        }
      });
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setLoading(true);
    await db
      .update(categories)
      .set({ name: name.trim(), color: selectedColor, icon: selectedIcon })
      .where(eq(categories.id, Number(id)));
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
          label="Category Name"
          placeholder="e.g. Sightseeing"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError("");
          }}
          error={error}
        />
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          COLOUR
        </Text>
        <View style={styles.colorRow}>
          {CATEGORY_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                selectedColor === c && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>ICON</Text>
        <View style={styles.iconGrid}>
          {CATEGORY_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconItem,
                {
                  borderColor:
                    selectedIcon === icon ? selectedColor : theme.border,
                  backgroundColor:
                    selectedIcon === icon ? selectedColor + "20" : theme.card,
                },
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons
                name={icon as any}
                size={22}
                color={
                  selectedIcon === icon ? selectedColor : theme.textSecondary
                }
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  iconItem: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
