import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { tackles, InsertTackle } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const tackleInput = z.object({
  postId: z.number().int(),
  name: z.string().min(1).max(255),
  imageUrl: z.string().url().optional().or(z.literal("")),
  amazonUrl: z.string().url().optional().or(z.literal("")),
  rakutenUrl: z.string().url().optional().or(z.literal("")),
  yahooUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const tacklesRouter = router({
  // Public: get tackles for a post
  byPostId: publicProcedure
    .input(z.object({ postId: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(tackles)
        .where(eq(tackles.postId, input.postId))
        .orderBy(asc(tackles.sortOrder), asc(tackles.createdAt));
    }),

  // Admin: create tackle
  create: protectedProcedure
    .input(tackleInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const data: InsertTackle = {
        ...input,
        imageUrl: input.imageUrl || null,
        amazonUrl: input.amazonUrl || null,
        rakutenUrl: input.rakutenUrl || null,
        yahooUrl: input.yahooUrl || null,
      };
      await db.insert(tackles).values(data);
      const [created] = await db
        .select()
        .from(tackles)
        .where(eq(tackles.postId, input.postId))
        .orderBy(asc(tackles.sortOrder));
      return created;
    }),

  // Admin: update tackle
  update: protectedProcedure
    .input(z.object({ id: z.number().int(), data: tackleInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const updateData: Partial<InsertTackle> = {
        ...input.data,
        imageUrl: input.data.imageUrl === "" ? null : input.data.imageUrl,
        amazonUrl: input.data.amazonUrl === "" ? null : input.data.amazonUrl,
        rakutenUrl: input.data.rakutenUrl === "" ? null : input.data.rakutenUrl,
        yahooUrl: input.data.yahooUrl === "" ? null : input.data.yahooUrl,
      };
      await db.update(tackles).set(updateData).where(eq(tackles.id, input.id));
      const [updated] = await db
        .select()
        .from(tackles)
        .where(eq(tackles.id, input.id))
        .limit(1);
      return updated;
    }),

  // Admin: delete tackle
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(tackles).where(eq(tackles.id, input.id));
      return { success: true };
    }),

  // Admin: delete all tackles for a post (used when deleting a post)
  deleteByPostId: protectedProcedure
    .input(z.object({ postId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(tackles).where(eq(tackles.postId, input.postId));
      return { success: true };
    }),
});
