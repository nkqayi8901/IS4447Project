import { db } from "@/db/client";
import { users } from "@/db/schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { createContext, useContext, useEffect, useState } from "react";
// This context manages user authentication state and 
// provides functions for logging in, registering, logging out, and deleting the account. 
// It uses AsyncStorage to persist the user's login state across app launches and Drizzle ORM to interact with the SQLite database for user data. 
// The password is hashed using SHA-256 before being stored in the database for security. The context also provides a loading state while checking the user's authentication status on app launch.
// The AuthProvider component wraps the app and provides the authentication context to all child components.
// The useAuth hook allows components to easily access the authentication context and perform actions like logging in, registering, and logging out. 
// This centralized authentication management helps maintain a clean codebase and ensures that all components can easily access and modify the user's authentication state as needed.
const SALT = "TripPlannerSalt2024";

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    SALT + password,
  );
}

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  deleteAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("userId").then(async (id) => {
      if (id) {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(id)));
        if (rows[0])
          setUser({
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            createdAt: rows[0].createdAt,
          });
      }
      setLoading(false);
    });
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));
    if (rows.length === 0) return "No account found with that email.";
    const hash = await hashPassword(password);
    if (rows[0].passwordHash !== hash) return "Incorrect password.";
    await AsyncStorage.setItem("userId", String(rows[0].id));
    setUser({
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      createdAt: rows[0].createdAt,
    });
    return null;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<string | null> => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));
    if (existing.length > 0)
      return "An account with this email already exists.";
    const hash = await hashPassword(password);
    await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      });
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));
    await AsyncStorage.setItem("userId", String(rows[0].id));
    setUser({
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      createdAt: rows[0].createdAt,
    });
    return null;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userId");
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    // Delete all user data via raw sql to handle cascades
    const { db: rawDb } = await import("@/db/client");
    const { trips, categories, targets, activities } =
      await import("@/db/schema");
    const { eq: eqFn } = await import("drizzle-orm");
    const userTrips = await rawDb
      .select()
      .from(trips)
      .where(eqFn(trips.userId, user.id));
    for (const trip of userTrips) {
      await rawDb.delete(activities).where(eqFn(activities.tripId, trip.id));
    }
    await rawDb.delete(trips).where(eqFn(trips.userId, user.id));
    await rawDb.delete(categories).where(eqFn(categories.userId, user.id));
    await rawDb.delete(targets).where(eqFn(targets.userId, user.id));
    await rawDb.delete(users).where(eqFn(users.id, user.id));
    await AsyncStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
