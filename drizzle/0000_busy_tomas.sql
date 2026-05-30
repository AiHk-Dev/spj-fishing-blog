CREATE TYPE "public"."category" AS ENUM('釣果記録', 'タックル', 'テクニック', 'フィールド', 'その他');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('男性', '女性', 'その他', '回答しない');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "blogMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(320) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"homeArea" varchar(50),
	"age" integer,
	"gender" "gender",
	"targetFish" text,
	"sessionToken" varchar(255),
	"isVerified" boolean DEFAULT false NOT NULL,
	"emailVerifiedToken" varchar(255),
	"tokenExpiresAt" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogMembers_username_unique" UNIQUE("username"),
	CONSTRAINT "blogMembers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"authorName" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"isVerifiedMember" boolean DEFAULT false NOT NULL,
	"blogMemberId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" "category" DEFAULT '釣果記録' NOT NULL,
	"coverImage" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"membersOnly" boolean DEFAULT false NOT NULL,
	"authorId" integer,
	"fishingDate" timestamp,
	"location" varchar(255),
	"depth" integer,
	"maxWeight" real,
	"species" varchar(255),
	"tags" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tackles" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"imageUrl" varchar(512),
	"amazonUrl" varchar(1024),
	"rakutenUrl" varchar(1024),
	"yahooUrl" varchar(1024),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
