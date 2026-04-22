import FormField from "@/components/FormField";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/AppColors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
// This screen allows users to create a new category for their activities. It includes form fields for the category name, color selection, and icon selection.
// The sscreen validates the input and shows error messages for invalid fields. When the user saves the category, it inserts the new record into the database and navigates back to the previous screen.
// The color selection is displayed as a row of colored dots, and the icon selection is displayed as a grid of icons. Users can select one color and one icon for their category.
// The screen also handles loading states and uses the app's theme for styling. It is wrapped in a KeyboardAvoidingView to ensure the form is not obscured by the keyboard on mobile devices, and it uses a ScrollView to allow access to all fields on smaller screens.
// The screen retrieves the list of available colors and icons from constants and displays them for selection. It also ensures that the category name is not empty before allowing the user to save.
// If the user tries to save without entering a name, it shows an error message
// prompting them to enter a category name. Once the category is successfully saved, it navigates back to the previous screen where the new category will be
// available for selection when adding or editing activities.
export default function AddCategoryScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!user) return;
    setLoading(true);
    await db
      .insert(categories)
      .values({
        userId: user.id,
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
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
              accessibilityLabel={`Select color ${c}`}
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
              accessibilityLabel={`Select icon ${icon}`}
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
            <Text style={styles.btnText}>Save Category</Text>
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
