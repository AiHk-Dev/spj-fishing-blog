/**
 * Tests for posts.uploadImage mutation
 * Verifies admin-only access and base64 validation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "posts/images/test.jpg", url: "/manus-storage/posts/images/test.jpg" }),
}));

// Mock db
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

function createCtx(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: "oid-1",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "manus" as const,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("posts.uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws Unauthorized when user is not admin", async () => {
    const caller = appRouter.createCaller(createCtx("user"));
    await expect(
      caller.posts.uploadImage({ base64: "data:image/jpeg;base64,abc", filename: "test.jpg" })
    ).rejects.toThrow("Unauthorized");
  });

  it("throws when base64 format is invalid", async () => {
    const caller = appRouter.createCaller(createCtx("admin"));
    await expect(
      caller.posts.uploadImage({ base64: "not-a-data-url", filename: "test.jpg" })
    ).rejects.toThrow("Invalid base64 image");
  });

  it("returns url when admin uploads valid base64 image", async () => {
    const caller = appRouter.createCaller(createCtx("admin"));
    // 1x1 transparent PNG in base64
    const base64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await caller.posts.uploadImage({ base64, filename: "test.png" });
    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
  });
});
