import { db } from './client';
import { trips, categories, activities, targets } from './schema';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

const SALT = 'TripPlannerSalt2024';

export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, SALT + password);
}

// Auto-runs on first login — seeds only categories so the app is usable
export async function seedCategoriesIfEmpty(userId: number): Promise<void> {
  const existing = await db.select().from(categories).where(eq(categories.userId, userId));
  if (existing.length > 0) return;

  await db.insert(categories).values([
    { userId, name: 'Sightseeing', color: '#6366F1', icon: 'eye' },
    { userId, name: 'Outdoor',     color: '#10B981', icon: 'leaf' },
    { userId, name: 'Food & Dining', color: '#FF6B35', icon: 'restaurant' },
    { userId, name: 'Culture',     color: '#8B5CF6', icon: 'book' },
    { userId, name: 'Relaxation',  color: '#EC4899', icon: 'happy' },
    { userId, name: 'Transport',   color: '#78716C', icon: 'car' },
  ]);
}

// Alias kept for consistency with lecturer's naming convention
export async function seedIfEmpty(userId: number): Promise<void> {
  await seedCategoriesIfEmpty(userId);
}

// Called manually from Settings → "Load Demo Data"
export async function loadDemoData(userId: number): Promise<void> {
  await seedCategoriesIfEmpty(userId);

  const cats = await db.select().from(categories).where(eq(categories.userId, userId));
  const sightseeing = cats.find(c => c.name === 'Sightseeing')!;
  const outdoor     = cats.find(c => c.name === 'Outdoor')!;
  const food        = cats.find(c => c.name === 'Food & Dining')!;
  const culture     = cats.find(c => c.name === 'Culture')!;
  const relax       = cats.find(c => c.name === 'Relaxation')!;
  const transport   = cats.find(c => c.name === 'Transport')!;

  await db.insert(trips).values([
    { userId, name: 'Paris Adventure', destination: 'Paris',  startDate: '2024-06-01', endDate: '2024-06-08', notes: 'City of lights ✨', createdAt: new Date().toISOString() },
    { userId, name: 'Tokyo Explorer',  destination: 'Tokyo',  startDate: '2024-09-15', endDate: '2024-09-25', notes: 'Cherry blossoms & sushi', createdAt: new Date().toISOString() },
  ]);

  const allTrips = await db.select().from(trips).where(eq(trips.userId, userId));
  const paris = allTrips.find(t => t.name === 'Paris Adventure')!;
  const tokyo = allTrips.find(t => t.name === 'Tokyo Explorer')!;

  await db.insert(activities).values([
    { tripId: paris.id, categoryId: sightseeing.id, name: 'Eiffel Tower',       date: '2024-06-01', durationMinutes: 120, count: 1, notes: 'Stunning views at sunset',        createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: food.id,        name: 'Café de Flore',      date: '2024-06-02', durationMinutes:  90, count: 1, notes: 'Classic French breakfast',        createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: culture.id,     name: 'Louvre Museum',      date: '2024-06-03', durationMinutes: 240, count: 1, notes: 'Saw the Mona Lisa',              createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: outdoor.id,     name: 'Luxembourg Gardens', date: '2024-06-04', durationMinutes:  60, count: 1, notes: 'Beautiful park stroll',          createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: sightseeing.id, name: 'Notre-Dame',         date: '2024-06-05', durationMinutes:  90, count: 1, notes: 'Architectural masterpiece',      createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: food.id,        name: 'Seine River Dinner', date: '2024-06-06', durationMinutes: 150, count: 1, notes: 'Romantic boat dinner',           createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: relax.id,       name: 'Spa Day',            date: '2024-06-07', durationMinutes: 180, count: 1, notes: 'Well deserved relaxation',       createdAt: new Date().toISOString() },
    { tripId: paris.id, categoryId: transport.id,   name: 'Metro Pass',         date: '2024-06-01', durationMinutes:  30, count: 7, notes: 'Weekly metro card',              createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: sightseeing.id, name: 'Senso-ji Temple',    date: '2024-09-15', durationMinutes:  90, count: 1, notes: 'Ancient Buddhist temple',        createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: food.id,        name: 'Tsukiji Market',     date: '2024-09-16', durationMinutes: 120, count: 1, notes: 'Best sushi breakfast',           createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: outdoor.id,     name: 'Mount Fuji Hike',    date: '2024-09-17', durationMinutes: 480, count: 1, notes: 'Incredible views from the top', createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: culture.id,     name: 'Ghibli Museum',      date: '2024-09-18', durationMinutes: 180, count: 1, notes: 'Magical animation world',        createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: sightseeing.id, name: 'Tokyo Tower',        date: '2024-09-19', durationMinutes: 120, count: 1, notes: 'City panorama',                  createdAt: new Date().toISOString() },
    { tripId: tokyo.id, categoryId: food.id,        name: 'Ramen Tasting',      date: '2024-09-20', durationMinutes:  90, count: 3, notes: 'Tried 3 different ramen shops',  createdAt: new Date().toISOString() },
  ]);

  await db.insert(targets).values([
    { userId, categoryId: null,            name: 'Weekly Activity Goal',      period: 'weekly',  metric: 'count',    targetValue:   5 },
    { userId, categoryId: sightseeing.id,  name: 'Sightseeing Hours',         period: 'weekly',  metric: 'duration', targetValue: 300 },
    { userId, categoryId: food.id,         name: 'Monthly Dining Experiences', period: 'monthly', metric: 'count',    targetValue:  10 },
  ]);
}
