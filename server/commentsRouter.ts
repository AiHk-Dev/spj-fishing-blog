import { eq, asc, desc, and } from "drizzle-orm";
import { z } from "zod";
import { comments, blogMembers } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

export const commentsRouter = router({
  // Public: get approved comments for a post
  byPostId: publicProcedure
    .input(z.object({ postId: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(comments)
        .where(and(eq(comments.postId, input.postId), eq(comments.approved, true)))
        .orderBy(asc(comments.createdAt));
    }),

  // Public: post a new comment (pending approval)
  create: publicProcedure
    .input(
      z.object({
        postId: z.number().int(),
        authorName: z.string().min(1).max(100),
        content: z.string().min(1).max(2000),
        sessionToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      let isVerifiedMember = false;
      let blogMemberId: number | undefined;
      let authorName = input.authorName;

      // If session token provided, look up member
      if (input.sessionToken) {
        const [member] = await db
          .select({ id: blogMembers.id, username: blogMembers.username })
          .from(blogMembers)
          .where(eq(blogMembers.sessionToken, input.sessionToken))
          .limit(1);

        if (member) {
          isVerifiedMember = true;
          blogMemberId = member.id;
          authorName = member.username;
        }
      }

      await db.insert(comments).values({
        postId: input.postId,
        authorName,
        content: input.content,
        approved: false,
        isVerifiedMember,
        blogMemberId,
      });
      return { success: true };
    }),

  // Admin: get all comments (including pending)
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt));
  }),

  // Admin: approve a comment
  approve: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db
        .update(comments)
        .set({ approved: true })
        .where(eq(comments.id, input.id));
      return { success: true };
    }),

  // Admin: delete a comment
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),
});
