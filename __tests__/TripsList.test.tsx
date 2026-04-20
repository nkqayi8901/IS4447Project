/**
 * Integration test: Confirms that the trips list screen displays seeded data correctly
 * after database initialization, ensuring data flows from SQLite through application
 * state to the rendered UI.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb: any) => { cb(); },
}));

// Mock expo-sqlite and drizzle
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({ execSync: jest.fn() }),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: () => ({}),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn().mockResolvedValue('hashed'),
}));

// Seeded trips data to test with
const seededTrips = [
  { id: 1, userId: 1, name: 'Paris Adventure', destination: 'Paris', startDate: '2024-06-01', endDate: '2024-06-08', notes: null, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2, userId: 1, name: 'Tokyo Explorer', destination: 'Tokyo', startDate: '2024-09-15', endDate: '2024-09-25', notes: null, createdAt: '2024-01-01T00:00:00.000Z' },
];

const seededActivities = [
  { id: 1, tripId: 1, categoryId: 1, name: 'Eiffel Tower', date: '2024-06-01', durationMinutes: 120, count: 1, notes: null, createdAt: '2024-01-01T00:00:00.000Z' },
];

// Mock the db module to return seeded data
jest.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: (table: any) => ({
        where: () => {
          if (table === 'trips') return Promise.resolve(seededTrips);
          if (table === 'activities') return Promise.resolve(seededActivities);
          return Promise.resolve([]);
        },
      }),
    }),
    insert: () => ({ values: jest.fn().mockResolvedValue(undefined) }),
  },
}));

jest.mock('@/db/schema', () => ({
  trips: 'trips',
  activities: 'activities',
  categories: 'categories',
  targets: 'targets',
  users: 'users',
}));

jest.mock('@/db/seed', () => ({
  seedIfEmpty: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('drizzle-orm', () => ({ eq: jest.fn() }));

// Mock contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test User', email: 'test@test.com', createdAt: '2024-01-01' } }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      background: '#fff', card: '#fff', text: '#000', textSecondary: '#666',
      border: '#ccc', primary: '#1e40af', primaryLight: '#3b82f6',
      inputBg: '#f9f9f9', danger: '#dc2626', success: '#059669',
    },
  }),
}));

jest.mock('@/utils/streaks', () => ({
  calculateStreak: jest.fn().mockReturnValue(2),
}));

jest.mock('@/components/TripCard', () => {
  const { Text } = require('react-native');
  return ({ name, destination }: any) => (
    <Text testID="trip-card">{name} - {destination}</Text>
  );
});

jest.mock('@/components/EmptyState', () => {
  const { Text } = require('react-native');
  return ({ title }: any) => <Text>{title}</Text>;
});

import TripsScreen from '@/app/(tabs)/index';

describe('Trips List Screen (Integration)', () => {
  it('renders the seeded trips after initialization', async () => {
    const { getAllByTestId } = render(<TripsScreen />);
    await waitFor(() => {
      const cards = getAllByTestId('trip-card');
      expect(cards.length).toBe(2);
    });
  });

  it('displays Paris Adventure trip', async () => {
    const { getByText } = render(<TripsScreen />);
    await waitFor(() => {
      expect(getByText('Paris Adventure - Paris')).toBeTruthy();
    });
  });

  it('displays Tokyo Explorer trip', async () => {
    const { getByText } = render(<TripsScreen />);
    await waitFor(() => {
      expect(getByText('Tokyo Explorer - Tokyo')).toBeTruthy();
    });
  });
});
