import { boolean, float, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow (Manus OAuth).
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Blog members table — independent email+password auth for blog readers.
 */
export const blogMembers = mysqlTable("blogMembers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  homeArea: varchar("homeArea", { length: 50 }),
  age: int("age"),
  gender: mysqlEnum("gender", ["男性", "女性", "その他", "回答しない"]),
  targetFish: text("targetFish"),
  sessionToken: varchar("sessionToken", { length: 255 }),
  // Email verification
  isVerified: boolean("isVerified").default(false).notNull(),
  emailVerifiedToken: varchar("emailVerifiedToken", { length: 255 }),
  tokenExpiresAt: int("tokenExpiresAt"),  // Unix timestamp (seconds)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogMember = typeof blogMembers.$inferSelect;
export type InsertBlogMember = typeof blogMembers.$inferInsert;

/**
 * Blog posts table — stores all fishing blog articles.
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["釣果記録", "タックル", "テクニック", "フィールド", "その他"]).notNull().default("釣果記録"),
  coverImage: varchar("coverImage", { length: 512 }),
  published: boolean("published").default(false).notNull(),
  membersOnly: boolean("membersOnly").default(false).notNull(),
  authorId: int("authorId"),
  // Fishing-specific metadata
  fishingDate: timestamp("fishingDate"),
  location: varchar("location", { length: 255 }),
  depth: int("depth"),
  maxWeight: float("maxWeight"),
  species: varchar("species", { length: 255 }),
  tags: varchar("tags", { length: 512 }),  // comma-separated tags e.g. "ロッド,リール"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Tackles table — stores affiliate product links for each post.
 */
export const tackles = mysqlTable("tackles", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  amazonUrl: varchar("amazonUrl", { length: 1024 }),
  rakutenUrl: varchar("rakutenUrl", { length: 1024 }),
  yahooUrl: varchar("yahooUrl", { length: 1024 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tackle = typeof tackles.$inferSelect;
export type InsertTackle = typeof tackles.$inferInsert;

/**
 * Comments table — stores reader comments for each post.
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorName: varchar("authorName", { length: 100 }).notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").default(false).notNull(),
  isVerifiedMember: boolean("isVerifiedMember").default(false).notNull(),
  blogMemberId: int("blogMemberId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
