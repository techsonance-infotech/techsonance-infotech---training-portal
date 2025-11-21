CREATE TABLE `appraisals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` text NOT NULL,
	`cycle_id` integer NOT NULL,
	`review_year` integer NOT NULL,
	`past_ctc` integer NOT NULL,
	`current_ctc` integer NOT NULL,
	`hike_percentage` real NOT NULL,
	`notes` text,
	`updated_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cycle_id`) REFERENCES `review_cycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
