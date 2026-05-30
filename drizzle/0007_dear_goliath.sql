ALTER TABLE `blogMembers` ADD `isVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `blogMembers` ADD `emailVerifiedToken` varchar(255);--> statement-breakpoint
ALTER TABLE `blogMembers` ADD `tokenExpiresAt` int;