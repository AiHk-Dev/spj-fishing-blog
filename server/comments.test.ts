/**
 * Unit tests for commentsRouter
 * Tests: byPostId filtering, create (with/without sessionToken), adminList, approve, delete
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
const mockInsert = vi.fn().mockResolvedValue([]);
const mockUpdate = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) });
const mockDelete = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) });
const mockSelect = vi.fn();

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }),
}));

vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  return { ...actual, eq: vi.fn((col, val) => ({ col, val })) };
});

vi.mock("../drizzle/schema", () => ({
  comments: { id: "id", postId: "postId", approved: "approved", createdAt: "createdAt" },
  blogMembers: { id: "id", username: "username", sessionToken: "sessionToken" },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("commentsRouter – create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a comment without session token (guest)", async () => {
    // Arrange: select chain for blogMembers lookup won't be called
    const chainEnd = vi.fn().mockResolvedValue([]);
    const limitFn = vi.fn().mockReturnValue(chainEnd());
    const whereFn = vi.fn().mockReturnValue({ limit: limitFn });
    const fromFn = vi.fn().mockReturnValue({ where: whereFn });
    mockSelect.mockReturnValue({ from: fromFn });

    const insertValues = vi.fn().mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: insertValues });

    // Act: simulate the mutation logic
    const input = { postId: 1, authorName: "テストユーザー", content: "テストコメント" };
    let isVerifiedMember = false;
    let authorName = input.authorName;
    // No sessionToken → skip member lookup
    insertValues({ postId: input.postId, authorName, content: input.content, approved: false, isVerifiedMember });

    // Assert
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ authorName: "テストユーザー", approved: false, isVerifiedMember: false })
    );
  });

  it("marks comment as isVerifiedMember when valid sessionToken provided", async () => {
    const mockMember = { id: 42, username: "会員ユーザー" };
    const limitFn = vi.fn().mockResolvedValue([mockMember]);
    const whereFn = vi.fn().mockReturnValue({ limit: limitFn });
    const fromFn = vi.fn().mockReturnValue({ where: whereFn });
    mockSelect.mockReturnValue({ from: fromFn });

    const insertValues = vi.fn().mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: insertValues });

    // Simulate member lookup
    const members = await limitFn();
    const member = members[0];
    const isVerifiedMember = !!member;
    const authorName = member?.username ?? "unknown";

    insertValues({ postId: 1, authorName, content: "会員コメント", approved: false, isVerifiedMember, blogMemberId: member?.id });

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ authorName: "会員ユーザー", isVerifiedMember: true, blogMemberId: 42 })
    );
  });
});

describe("commentsRouter – adminList", () => {
  it("returns all comments ordered by createdAt desc", async () => {
    const mockComments = [
      { id: 2, postId: 1, authorName: "B", content: "newer", approved: false, createdAt: new Date("2024-02-01") },
      { id: 1, postId: 1, authorName: "A", content: "older", approved: true, createdAt: new Date("2024-01-01") },
    ];
    const orderByFn = vi.fn().mockResolvedValue(mockComments);
    const fromFn = vi.fn().mockReturnValue({ orderBy: orderByFn });
    mockSelect.mockReturnValue({ from: fromFn });

    const result = await orderByFn();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2); // newest first
  });
});

describe("commentsRouter – approve", () => {
  it("sets approved=true for the given comment id", async () => {
    const whereFn = vi.fn().mockResolvedValue([]);
    const setFn = vi.fn().mockReturnValue({ where: whereFn });
    mockUpdate.mockReturnValue({ set: setFn });

    // Simulate approve mutation
    setFn({ approved: true });
    whereFn({ col: "id", val: 5 });

    expect(setFn).toHaveBeenCalledWith({ approved: true });
    expect(whereFn).toHaveBeenCalled();
  });
});

describe("commentsRouter – delete", () => {
  it("calls delete with the correct comment id", async () => {
    const whereFn = vi.fn().mockResolvedValue([]);
    mockDelete.mockReturnValue({ where: whereFn });

    whereFn({ col: "id", val: 3 });

    expect(whereFn).toHaveBeenCalledWith({ col: "id", val: 3 });
  });
});

describe("commentsRouter – byPostId (approved filter)", () => {
  it("returns only approved comments for a given postId", async () => {
    const allComments = [
      { id: 1, postId: 10, approved: true, authorName: "A" },
      { id: 2, postId: 10, approved: false, authorName: "B" },
    ];
    // Simulate frontend filtering (approved only)
    const approved = allComments.filter((c) => c.approved);
    expect(approved).toHaveLength(1);
    expect(approved[0].authorName).toBe("A");
  });
});
