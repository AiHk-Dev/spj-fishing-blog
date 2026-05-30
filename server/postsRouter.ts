import { eq, desc, count, max, sql } from "drizzle-orm";
import { z } from "zod";
import { posts, blogMembers } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import type { InsertPost } from "../drizzle/schema";

// Truncate content to first ~500 chars for members-only preview
function truncateForPreview(content: string): string {
  const paragraphs = content.split(/\n\n+/);
  let preview = "";
  for (const p of paragraphs) {
    if ((preview + p).length > 500) break;
    preview += (preview ? "\n\n" : "") + p;
  }
  return preview || content.slice(0, 500);
}

const postInput = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  category: z.enum(["釣果記録", "タックル", "テクニック", "フィールド", "その他"]),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  membersOnly: z.boolean().default(false),
  fishingDate: z.string().optional(), // ISO string
  location: z.string().optional(),
  depth: z.number().int().optional(),
  maxWeight: z.number().optional(),
  species: z.string().optional(),
  tags: z.string().optional(),  // comma-separated e.g. "ロッド,リール"
});

export const postsRouter = router({
  // Public: list published posts
  list: publicProcedure
    .input(z.object({ category: z.string().optional(), tag: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.published, true))
        .orderBy(desc(posts.fishingDate));
      let filtered = rows;
      if (input?.category && input.category !== "すべて") {
        filtered = filtered.filter((p) => p.category === input.category);
      }
      if (input?.tag) {
        filtered = filtered.filter((p) => {
          if (!p.tags) return false;
          const tagList = p.tags.split(",").map((t) => t.trim());
          return tagList.includes(input.tag!);
        });
      }
      return filtered;
    }),

  // Public: get single post by slug (with optional member session token)
  bySlug: publicProcedure
    .input(z.object({ slug: z.string(), sessionToken: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      if (!post) return null;

      // If members-only, check if viewer is a logged-in member
      if (post.membersOnly) {
        let isMember = false;
        if (input.sessionToken) {
          const [member] = await db
            .select({ id: blogMembers.id })
            .from(blogMembers)
            .where(eq(blogMembers.sessionToken, input.sessionToken))
            .limit(1);
          isMember = !!member;
        }
        if (!isMember) {
          // Return truncated content for non-members
          return {
            ...post,
            content: truncateForPreview(post.content),
            isPreview: true,
          };
        }
      }

      return { ...post, isPreview: false };
    }),

  // Admin: list all posts (including drafts)
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return [];
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }),

  // Admin: create post
  create: protectedProcedure
    .input(postInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const data: InsertPost = {
        ...input,
        authorId: ctx.user.id,
        fishingDate: input.fishingDate ? new Date(input.fishingDate) : undefined,
      };
      await db.insert(posts).values(data);
      const [created] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      return created;
    }),

  // Admin: update post
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: postInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const updateData: Partial<InsertPost> = {
        ...input.data,
        fishingDate: input.data.fishingDate
          ? new Date(input.data.fishingDate)
          : undefined,
      };
      await db.update(posts).set(updateData).where(eq(posts.id, input.id));
      const [updated] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      return updated;
    }),

  // Admin: delete post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),

  // Admin: upload image (cover or inline) — accepts base64 data URL
  uploadImage: protectedProcedure
    .input(
      z.object({
        base64: z.string(), // data:image/xxx;base64,<data>
        filename: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const { storagePut } = await import("./storage");
      // Strip data URL prefix
      const match = input.base64.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new Error("Invalid base64 image");
      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      const ext = contentType.split("/")[1] ?? "jpg";
      const key = `posts/images/${Date.now()}-${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}.${ext}`;
      const { url } = await storagePut(key, buffer, contentType);
      return { url };
    }),

  // Public: fishing stats aggregated from published posts
  stats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { fishingCount: 0, maxWeight: 0, maxDepth: 0, speciesCount: 0 };
    const publishedPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.published, true));
    const fishingPosts = publishedPosts.filter((p) => p.category === "釣果記録");
    const fishingCount = fishingPosts.length;
    const maxWeight = fishingPosts.reduce((acc, p) => Math.max(acc, p.maxWeight ?? 0), 0);
    const maxDepth = publishedPosts.reduce((acc, p) => Math.max(acc, p.depth ?? 0), 0);
    // Count unique species
    const allSpecies = new Set<string>();
    publishedPosts.forEach((p) => {
      if (p.species) {
        p.species.split(/[・・,、]+/).forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) allSpecies.add(trimmed);
        });
      }
    });
    return {
      fishingCount,
      maxWeight: Math.round(maxWeight * 10) / 10,
      maxDepth,
      speciesCount: allSpecies.size,
    };
  }),
});
