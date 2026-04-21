CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`duration_minutes` integer DEFAULT 0 NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);

CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text DEFAULT 'compass' NOT NULL
);

CREATE TABLE `targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`category_id` integer,
	`name` text NOT NULL,
	`period` text NOT NULL,
	`metric` text NOT NULL,
	`target_value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);

CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);