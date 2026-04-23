import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull().default('compass'),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  categoryId: integer('category_id').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  count: integer('count').notNull().default(1),
  notes: text('notes'),
  completed: integer('completed').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id'),
  name: text('name').notNull(),
  period: text('period').notNull(), // 'weekly' | 'monthly'
  metric: text('metric').notNull(), // 'duration' | 'count'
  targetValue: integer('target_value').notNull(),
});
