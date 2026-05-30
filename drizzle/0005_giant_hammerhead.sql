CREATE TABLE `blogMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`homeArea` varchar(50),
	`age` int,
	`gender` enum('男性','女性','その他','回答しない'),
	`targetFish` text,
	`sessionToken` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogMembers_username_unique` UNIQUE(`username`),
	CONSTRAINT `blogMembers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD `blogMemberId` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `membersOnly` boolean DEFAULT false NOT NULL;