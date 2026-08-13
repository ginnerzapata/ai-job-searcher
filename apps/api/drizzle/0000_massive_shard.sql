CREATE TABLE `job_searcher_profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`headline` text NOT NULL,
	`summary` text NOT NULL,
	`skills` text NOT NULL,
	`experience` text NOT NULL,
	`education` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
