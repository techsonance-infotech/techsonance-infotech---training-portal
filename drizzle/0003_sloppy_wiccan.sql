ALTER TABLE `topics` ADD `parent_topic_id` integer REFERENCES topics(id);--> statement-breakpoint
ALTER TABLE `topics` ADD `order_number` integer NOT NULL;