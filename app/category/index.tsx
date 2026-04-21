import CategoryBadge from "@/components/CategoryBadge";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
// This screen allows users to view, add, edit, and delete categories for their activities. Each category is displayed as a row with its name, color, and icon, along with edit and delete buttons.
// Users can tap the edit button to modify the category or the delete button to remove it (with a confirmation prompt). The screen also includes a floating action button to add a new category.
// The screen uses useFocusEffect to load the categories from the database whenever the screen is focused, ensuring it always shows the latest data after adding/editing/deleting categories.
// If there are no categories, it shows an empty state prompting the user to create their first category.
// The screen is styled according to the app's theme and includes appropriate accessibility labels for better usability.
// The screen retrieves the list of categories from the database on mount and populates the category list.
// It also handles deleting categories with a confirmation alert, and it updates the local state to reflect changes without needing to reload the entire list from the database after each operation.
// When deleting a category, it also shows a warning that any activities using that category will lose their association, but it does not delete the activities themselves.
// The screen ensures that users can manage their categories effectively, which helps them organize their activities better when adding or editing them.
export default function CategoriesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [catList, setCatList] = useState<(typeof categories.$inferSelect)[]>(
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      db.select()
        .from(categories)
        .where(eq(categories.userId, user.id))
        .then(setCatList);
    }, [user]),
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Category",
      "Are you sure? Activities using this category will lose their association.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.delete(categories).where(eq(categories.id, id));
            setCatList((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={catList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <CategoryBadge
              name={item.name}
              color={item.color}
              icon={item.icon}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => router.push(`/category/${item.id}/edit` as any)}
                style={[
                  styles.iconBtn,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[
                  styles.iconBtn,
                  { backgroundColor: theme.danger + "20" },
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={theme.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="No categories"
            subtitle="Tap + to create one"
          />
        }
        contentContainerStyle={[
          styles.list,
          catList.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/category/add" as any)}
        accessibilityRole="button"
        accessibilityLabel="Add category"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
