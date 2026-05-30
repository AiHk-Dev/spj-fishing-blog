import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { blogMembers } from "../drizzle/schema";
import { sendVerificationEmail } from "./mailer";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/** 24 hours in seconds */
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

export const blogMembersRouter = router({
  /**
   * Register a new blog member.
   * Creates an unverified account and sends a confirmation email.
   */
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        homeArea: z.string().optional(),
        age: z.number().int().min(1).max(120).optional(),
        gender: z.enum(["男性", "女性", "その他", "回答しない"]).optional(),
        targetFish: z.string().max(500).optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      // Check for duplicate email
      const existingEmail = await db
        .select({ id: blogMembers.id })
        .from(blogMembers)
        .where(eq(blogMembers.email, input.email))
        .limit(1);
      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "このメールアドレスはすでに登録されています",
        });
      }

      // Check for duplicate username
      const existingUsername = await db
        .select({ id: blogMembers.id })
        .from(blogMembers)
        .where(eq(blogMembers.username, input.username))
        .limit(1);
      if (existingUsername.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "このユーザーネームはすでに使用されています",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const emailVerifiedToken = generateToken();
      const tokenExpiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;

      await db.insert(blogMembers).values({
        username: input.username,
        email: input.email,
        passwordHash,
        homeArea: input.homeArea,
        age: input.age,
        gender: input.gender,
        targetFish: input.targetFish,
        isVerified: false,
        emailVerifiedToken,
        tokenExpiresAt,
      });

      // Send verification email (non-blocking — don't fail registration if mail fails)
      try {
        await sendVerificationEmail({
          to: input.email,
          username: input.username,
          token: emailVerifiedToken,
          origin: input.origin,
        });
      } catch (err) {
        console.error("[mailer] Failed to send verification email:", err);
      }

      return { success: true, email: input.email };
    }),

  /**
   * Verify email with token from the confirmation link.
   * On success, marks the member as verified and returns a session token.
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      const [member] = await db
        .select()
        .from(blogMembers)
        .where(eq(blogMembers.emailVerifiedToken, input.token))
        .limit(1);

      if (!member) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "無効な認証リンクです",
        });
      }

      const now = Math.floor(Date.now() / 1000);
      if (member.tokenExpiresAt && member.tokenExpiresAt < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "認証リンクの有効期限が切れています。再度会員登録を行ってください。",
        });
      }

      if (member.isVerified) {
        // Already verified — just issue a session
        const sessionToken = generateToken();
        await db
          .update(blogMembers)
          .set({ sessionToken })
          .where(eq(blogMembers.id, member.id));
        return {
          success: true,
          alreadyVerified: true,
          sessionToken,
          username: member.username,
        };
      }

      const sessionToken = generateToken();
      await db
        .update(blogMembers)
        .set({
          isVerified: true,
          emailVerifiedToken: null,
          tokenExpiresAt: null,
          sessionToken,
        })
        .where(eq(blogMembers.id, member.id));

      return {
        success: true,
        alreadyVerified: false,
        sessionToken,
        username: member.username,
      };
    }),

  /**
   * Resend verification email.
   */
  resendVerification: publicProcedure
    .input(z.object({ email: z.string().email(), origin: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      const [member] = await db
        .select()
        .from(blogMembers)
        .where(eq(blogMembers.email, input.email))
        .limit(1);

      if (!member) {
        // Don't reveal whether email exists
        return { success: true };
      }

      if (member.isVerified) {
        return { success: true };
      }

      const emailVerifiedToken = generateToken();
      const tokenExpiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;

      await db
        .update(blogMembers)
        .set({ emailVerifiedToken, tokenExpiresAt })
        .where(eq(blogMembers.id, member.id));

      try {
        await sendVerificationEmail({
          to: member.email,
          username: member.username,
          token: emailVerifiedToken,
          origin: input.origin,
        });
      } catch (err) {
        console.error("[mailer] Failed to resend verification email:", err);
      }

      return { success: true };
    }),

  /**
   * Login with email + password.
   * Requires email to be verified.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      const [member] = await db
        .select()
        .from(blogMembers)
        .where(eq(blogMembers.email, input.email))
        .limit(1);

      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "メールアドレスまたはパスワードが正しくありません",
        });
      }

      const valid = await bcrypt.compare(input.password, member.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "メールアドレスまたはパスワードが正しくありません",
        });
      }

      if (!member.isVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "メールアドレスの確認が完了していません。届いた確認メールのリンクをクリックしてください。",
        });
      }

      const sessionToken = generateToken();
      await db
        .update(blogMembers)
        .set({ sessionToken })
        .where(eq(blogMembers.id, member.id));

      return {
        member: {
          id: member.id,
          username: member.username,
          email: member.email,
          homeArea: member.homeArea,
          age: member.age,
          gender: member.gender,
          targetFish: member.targetFish,
          createdAt: member.createdAt,
        },
        sessionToken,
      };
    }),

  /**
   * Logout — invalidate session token.
   */
  logout: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });
      await db
        .update(blogMembers)
        .set({ sessionToken: null })
        .where(eq(blogMembers.sessionToken, input.sessionToken));
      return { success: true };
    }),

  /**
   * Get current member info by session token.
   */
  me: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [member] = await db
        .select({
          id: blogMembers.id,
          username: blogMembers.username,
          email: blogMembers.email,
          homeArea: blogMembers.homeArea,
          age: blogMembers.age,
          gender: blogMembers.gender,
          targetFish: blogMembers.targetFish,
          isVerified: blogMembers.isVerified,
          createdAt: blogMembers.createdAt,
        })
        .from(blogMembers)
        .where(eq(blogMembers.sessionToken, input.sessionToken))
        .limit(1);

      if (!member) return null;
      return member;
    }),

  /**
   * Update profile.
   */
  updateProfile: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        username: z.string().min(2).max(50).optional(),
        homeArea: z.string().optional(),
        age: z.number().int().min(1).max(120).optional(),
        gender: z.enum(["男性", "女性", "その他", "回答しない"]).optional(),
        targetFish: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });

      const [member] = await db
        .select({ id: blogMembers.id })
        .from(blogMembers)
        .where(eq(blogMembers.sessionToken, input.sessionToken))
        .limit(1);

      if (!member) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      if (input.username) {
        const existing = await db
          .select({ id: blogMembers.id })
          .from(blogMembers)
          .where(eq(blogMembers.username, input.username))
          .limit(1);
        if (existing.length > 0 && existing[0].id !== member.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "このユーザーネームはすでに使用されています",
          });
        }
      }

      const updateData: Partial<typeof blogMembers.$inferInsert> = {};
      if (input.username !== undefined) updateData.username = input.username;
      if (input.homeArea !== undefined) updateData.homeArea = input.homeArea;
      if (input.age !== undefined) updateData.age = input.age;
      if (input.gender !== undefined) updateData.gender = input.gender;
      if (input.targetFish !== undefined) updateData.targetFish = input.targetFish;

      await db
        .update(blogMembers)
        .set(updateData)
        .where(eq(blogMembers.id, member.id));

      const [updated] = await db
        .select({
          id: blogMembers.id,
          username: blogMembers.username,
          email: blogMembers.email,
          homeArea: blogMembers.homeArea,
          age: blogMembers.age,
          gender: blogMembers.gender,
          targetFish: blogMembers.targetFish,
          createdAt: blogMembers.createdAt,
        })
        .from(blogMembers)
        .where(eq(blogMembers.id, member.id))
        .limit(1);

      return updated;
    }),

  /**
   * Admin: list all blog members.
   */
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベース接続エラー" });
    const members = await db
      .select({
        id: blogMembers.id,
        username: blogMembers.username,
        email: blogMembers.email,
        homeArea: blogMembers.homeArea,
        age: blogMembers.age,
        gender: blogMembers.gender,
        targetFish: blogMembers.targetFish,
        isVerified: blogMembers.isVerified,
        createdAt: blogMembers.createdAt,
      })
      .from(blogMembers)
      .orderBy(blogMembers.createdAt);
    return members;
  }),

  /**
   * Public list of prefectures for the registration form.
   */
  prefectures: publicProcedure.query(() => {
    return PREFECTURES;
  }),
});
