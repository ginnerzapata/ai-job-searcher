CREATE TABLE `match_criteria` (
	`id` integer PRIMARY KEY NOT NULL,
	`job_searcher_profile_id` integer NOT NULL,
	`name` text NOT NULL,
	`is_default` integer NOT NULL,
	`target_titles` text NOT NULL,
	`locations` text NOT NULL,
	`remote_policy` text NOT NULL,
	`seniorities` text NOT NULL,
	`employment_types` text NOT NULL,
	`excluded_keywords` text NOT NULL,
	`minimum_compensation` integer,
	`compensation_currency` text,
	`minimum_fit_grade` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_searcher_profile_id`) REFERENCES `job_searcher_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
