CREATE TABLE `tackles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`imageUrl` varchar(512),
	`amazonUrl` varchar(1024),
	`rakutenUrl` varchar(1024),
	`yahooUrl` varchar(1024),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tackles_id` PRIMARY KEY(`id`)
);
