/*
 * Design Philosophy: Dark Maritime Minimalism
 * ArticlePage: Full article view with rich typography and metadata sidebar
 * Now fetches from DB via tRPC (bySlug)
 */
import { useParams, Link } from "wouter";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import type { Tackle } from "../../../drizzle/schema";
import { useBlogAuth } from "@/hooks/useBlogAuth";

// ─── Tackle Card Component ───────────────────────────────────────────────────
function TackleCard({ tackle }: { tackle: Tackle }) {
  return (
    <div className="glass-card rounded-lg overflow-hidden flex flex-col sm:flex-row gap-0">
      {/* Product image */}
      <div className="sm:w-32 sm:shrink-0 bg-[oklch(0.12_0.025_240)]">
        {tackle.imageUrl ? (
          <img
            src={tackle.imageUrl}
            alt={tackle.name}
            className="w-full h-32 sm:h-full object-cover"
          />
        ) : (
          <div className="w-full h-32 sm:h-full flex items-center justify-center">
            <span className="text-3xl">🪝</span>
          </div>
        )}
      </div>
      {/* Product info */}
      <div className="flex-1 p-4">
        <h4 className="text-white font-['Noto_Sans_JP'] font-bold text-sm mb-3">{tackle.name}</h4>
        <div className="flex flex-wrap gap-2">
          {tackle.amazonUrl && (
            <a
              href={tackle.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-['Space_Mono'] font-bold bg-[oklch(0.55_0.15_55)] text-white hover:bg-[oklch(0.60_0.15_55)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.872-1.236-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.816-1.776-.816-1.207 0-2.284.619-2.548 1.903-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.516 2.088 8.219.5 11.19.5c1.518 0 3.504.404 4.703 1.553 1.518 1.437 1.373 3.354 1.373 5.443v4.926c0 1.481.614 2.131 1.192 2.932.204.287.249.631-.01.847l-1.304 1.594zm3.56 3.199C18.448 23.148 14.978 24 12.004 24 8.016 24 4.45 22.597 1.748 20.215c-.23-.203-.025-.48.251-.322 2.908 1.694 6.501 2.713 10.216 2.713 2.504 0 5.258-.519 7.792-1.596.383-.163.704.251.337.584zm.966-1.096c-.314-.404-2.079-.191-2.872-.096-.241.029-.278-.181-.061-.333 1.406-.988 3.713-.703 3.982-.372.271.334-.074 2.637-1.391 3.737-.203.17-.396.079-.306-.143.297-.745.964-2.41.648-2.793z"/></svg>
              Amazon
            </a>
          )}
          {tackle.rakutenUrl && (
            <a
              href={tackle.rakutenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-['Space_Mono'] font-bold bg-[oklch(0.45_0.20_25)] text-white hover:bg-[oklch(0.50_0.20_25)] transition-colors"
            >
              <span>🛒</span>
              楽天
            </a>
          )}
          {tackle.yahooUrl && (
            <a
              href={tackle.yahooUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-['Space_Mono'] font-bold bg-[oklch(0.40_0.15_280)] text-white hover:bg-[oklch(0.45_0.15_280)] transition-colors"
            >
              <span>🛒</span>
              Yahoo!
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Members-Only Wall Component ─────────────────────────────────────────────
function MembersOnlyWall() {
  return (
    <div className="relative mt-8">
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-[oklch(0.10_0.025_240)] to-transparent z-10 pointer-events-none" />
      <div className="glass-card rounded-xl p-8 text-center border border-[oklch(0.65_0.15_190/0.4)] relative z-20">
        <div className="text-3xl mb-3">🔒</div>
        <h3 className="font-['Playfair_Display'] font-bold text-xl text-white mb-2">
          会員限定コンテンツ
        </h3>
        <p className="text-sm text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] mb-6 leading-relaxed">
          この記事の続きは会員限定です。<br />
          無料会員登録で全記事が読み放題になります。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors"
          >
            無料会員登録
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-[oklch(0.35_0.04_240)] text-[oklch(0.70_0.02_240)] font-['Noto_Sans_JP'] text-sm px-6 py-3 rounded-sm hover:border-[oklch(0.65_0.15_190)] hover:text-[oklch(0.65_0.15_190)] transition-colors"
          >
            ログイン
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Comments Section Component ──────────────────────────────────────────────
function CommentsSection({ postId }: { postId: number }) {
  const { member, sessionToken } = useBlogAuth();
  const [authorName, setAuthorName] = useState(member?.username ?? "");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { data: comments = [], refetch, isLoading: commentsLoading, isError: commentsError } = trpc.comments.byPostId.useQuery(
    { postId },
    { enabled: !!postId }
  );
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setContent("");
      setAuthorName(member?.username ?? "");
      refetch();
    },
    onError: (e: any) => setError(e.message),
  });

  const approvedComments = (comments as any[]).filter((c) => c.approved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!authorName.trim() || !content.trim()) {
      setError("お名前とコメントを入力してください。");
      return;
    }
    createComment.mutate({
      postId,
      authorName: authorName.trim(),
      content: content.trim(),
      sessionToken: sessionToken ?? undefined,
    });
  };

  return (
    <div className="mt-16 pt-12 border-t border-[oklch(0.20_0.03_240)]">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
        <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
          Comments
        </span>
        {approvedComments.length > 0 && (
          <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Space_Mono']">
            ({approvedComments.length})
          </span>
        )}
      </div>

      {commentsLoading ? (
        <div className="flex items-center gap-3 text-[oklch(0.50_0.02_240)] font-['Noto_Sans_JP'] text-sm mb-8">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
          コメントを読み込み中…
        </div>
      ) : commentsError ? (
        <p className="text-xs text-red-400 font-['Noto_Sans_JP'] mb-8">⚠️ コメントの取得に失敗しました。</p>
      ) : approvedComments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {approvedComments.map((c: any) => (
            <div key={c.id} className="glass-card rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-white font-['Noto_Sans_JP']">
                  {c.authorName}
                </span>
                {c.isVerifiedMember && (
                  <span className="text-[10px] bg-[oklch(0.65_0.15_190/0.2)] text-[oklch(0.65_0.15_190)] border border-[oklch(0.65_0.15_190/0.4)] px-2 py-0.5 rounded-full font-['Space_Mono']">
                    会員
                  </span>
                )}
                <span className="text-xs text-[oklch(0.40_0.02_240)] font-['Space_Mono'] ml-auto">
                  {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className="text-sm text-[oklch(0.70_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[oklch(0.40_0.02_240)] font-['Noto_Sans_JP'] mb-8">
          まだコメントはありません。最初のコメントを投稿してみましょう。
        </p>
      )}

      {submitted ? (
        <div className="glass-card rounded-lg p-6 text-center">
          <p className="text-sm text-[oklch(0.65_0.15_190)] font-['Noto_Sans_JP']">
            ✓ コメントを受け付けました。承認後に公開されます。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-lg p-6 space-y-4">
          <h4 className="text-sm font-['Space_Mono'] tracking-widest uppercase text-[oklch(0.55_0.02_240)]">
            コメントを投稿
          </h4>
          {!member && (
            <div>
              <label className="block text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] mb-1">
                お名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="ニックネームでも可"
                className="w-full bg-[oklch(0.15_0.025_240)] border border-[oklch(0.25_0.03_240)] rounded px-3 py-2 text-sm text-white font-['Noto_Sans_JP'] focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
              />
            </div>
          )}
          {member && (
            <p className="text-xs text-[oklch(0.65_0.15_190)] font-['Noto_Sans_JP']">
              会員として投稿: <strong>{member.username}</strong>
            </p>
          )}
          <div>
            <label className="block text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] mb-1">
              コメント <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="記事の感想や質問をどうぞ..."
              className="w-full bg-[oklch(0.15_0.025_240)] border border-[oklch(0.25_0.03_240)] rounded px-3 py-2 text-sm text-white font-['Noto_Sans_JP'] focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors resize-none"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 font-['Noto_Sans_JP']">{error}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[oklch(0.40_0.02_240)] font-['Noto_Sans_JP']">
              ※ コメントは承認後に公開されます
            </p>
            <button
              type="submit"
              disabled={createComment.isPending}
              className="inline-flex items-center gap-2 bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-5 py-2 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors disabled:opacity-50"
            >
              {createComment.isPending ? "送信中..." : "投稿する"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticlePage() {
  const { id: slug } = useParams<{ id: string }>();

  const { data: post, isLoading } = trpc.posts.bySlug.useQuery({ slug: slug ?? "" }, {
    enabled: !!slug,
  });

  const { data: allPosts = [] } = trpc.posts.list.useQuery(undefined);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const { data: tackles = [] } = trpc.tackles.byPostId.useQuery(
    { postId: post?.id ?? 0 },
    { enabled: !!post?.id }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.10_0.025_240)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.65_0.15_190)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[oklch(0.10_0.025_240)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[oklch(0.50_0.02_240)] font-['Noto_Sans_JP'] mb-4">
            記事が見つかりませんでした
          </p>
          <Link href="/">
            <span className="text-[oklch(0.65_0.15_190)] hover:underline font-['Noto_Sans_JP'] cursor-pointer">
              ← ホームへ戻る
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    "釣果記録": "oklch(0.65 0.15 190)",
    "タックル": "oklch(0.75 0.12 55)",
    "テクニック": "oklch(0.70 0.10 160)",
    "フィールド": "oklch(0.65 0.12 280)",
  };
  const accentColor = categoryColors[post.category] || "oklch(0.65 0.15 190)";
  const imageUrl = post.coverImage || "https://d2xsxph8kpxj0f.cloudfront.net/310519663635082086/JhN76xVh7UtC2SfC9qFaUM/fish-catch-TrPm3Bxij69JZjR2QLvCZR.webp";

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.025_240)] via-[oklch(0.08_0.02_240/0.6)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.08_0.02_240/0.5)] to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-20 left-0 right-0">
          <div className="container">
            <div className="flex items-center gap-2 text-xs font-['Space_Mono'] text-[oklch(0.55_0.02_240)]">
              <Link href="/">
                <span className="hover:text-[oklch(0.65_0.15_190)] transition-colors cursor-pointer">
                  Home
                </span>
              </Link>
              <span>/</span>
              <span style={{ color: accentColor }}>{post.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main content */}
          <article>
            {/* Category + Date */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-xs font-['Space_Mono'] tracking-widest uppercase px-3 py-1 rounded-sm"
                style={{
                  color: accentColor,
                  border: `1px solid ${accentColor}`,
                  background: `oklch(0.10 0.025 240 / 0.8)`,
                }}
              >
                {post.category}
              </span>
              <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Space_Mono']">
                {formatDate(post.fishingDate || post.createdAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-['Playfair_Display'] font-black text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed mb-8 border-l-2 pl-4" style={{ borderColor: accentColor }}>
                {post.excerpt}
              </p>
            )}

            {/* Article content */}
            <div className="article-content max-w-none">
              <Streamdown>{post.content}</Streamdown>
            </div>
            {/* Members-only content wall */}
            {(post as any).isPreview && <MembersOnlyWall />}

            {/* Tackle & Affiliate Section */}
            {tackles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[oklch(0.20_0.03_240)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-8 bg-[oklch(0.75_0.12_55)]" />
                  <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.75_0.12_55)]">
                    使用タックル
                  </span>
                </div>
                <p className="text-xs text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP'] mb-4">
                  ※ 本記事にはアフィリエイトリンクが含まれています。
                </p>
                <div className="space-y-3">
                  {tackles.map((t) => (
                    <TackleCard key={t.id} tackle={t} />
                  ))}
                </div>
              </div>
            )}
            {/* Comments Section */}
            <CommentsSection postId={post.id} />
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Fishing data card */}
            {post.category === "釣果記録" && (
              <div className="glass-card rounded-lg p-6">
                <h3
                  className="text-xs font-['Space_Mono'] tracking-widest uppercase mb-5"
                  style={{ color: accentColor }}
                >
                  釣行データ
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "日付", value: formatDate(post.fishingDate) },
                    { label: "場所", value: post.location },
                    { label: "水深", value: post.depth != null ? `${post.depth}m` : null },
                    { label: "魚種", value: post.species },
                    { label: "重量", value: post.maxWeight != null ? `${post.maxWeight}kg` : null },
                  ].filter((item) => item.value).map((item) => (
                    <div key={item.label} className="flex justify-between items-start gap-2 text-sm">
                      <span className="text-[oklch(0.45_0.02_240)] font-['Space_Mono'] shrink-0">
                        {item.label}
                      </span>
                      <span className="text-[oklch(0.80_0.02_240)] font-['Noto_Sans_JP'] text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back link */}
            <Link href="/">
              <div className="flex items-center gap-2 text-sm text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors cursor-pointer font-['Noto_Sans_JP']">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                記事一覧へ戻る
              </div>
            </Link>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[oklch(0.20_0.03_240)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
              <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
                Related Posts
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
