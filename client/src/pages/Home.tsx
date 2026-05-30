/*
 * Design Philosophy: Midnight Ocean — brighter, more vivid maritime
 * Home: Full-screen hero, asymmetric layout, magazine-style blog grid
 * Colors: Midnight navy bg, vivid cyan-teal accents, bright gold highlights
 * Fonts: Bebas Neue (eyebrow), Playfair Display (headings), Noto Sans JP (body), Space Mono (data)
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { HERO_IMAGE, JIG_IMAGE } from "@/lib/blogData";
import { trpc } from "@/lib/trpc";

const DB_CATEGORIES = ["すべて", "釣果記録", "タックル", "テクニック", "フィールド"] as const;

// Tackle sub-categories that link to filtered article lists
const TACKLE_ITEMS = [
  {
    image: "/manus-storage/rod-logical60_0586e1ab.jpg",
    title: "ロッド",
    tag: "ロッド",
    desc: "SPJ専用スローテーパーロッドの選び方。水深・ターゲットに合わせたパワー選択を解説。",
    detail: "",
    color: "oklch(0.72 0.18 195)",
  },
  {
    image: "/manus-storage/reel-tss-blue-single_ee9f3059.jpg",
    title: "リール",
    tag: "リール",
    desc: "リール選びで捕れる魚が決まる\n大型魚にも対応できるドラグ性能の見極め方",
    detail: "",
    color: "oklch(0.80 0.14 60)",
  },
  {
    image: "/manus-storage/jig-deepliner_789bce15.jpg",
    title: "ジグ",
    tag: "ジグ",
    desc: "水深、対象魚で変わるジグの形状、カラーの選び方",
    detail: "",
    color: "oklch(0.72 0.18 195)",
  },
  {
    image: "/manus-storage/line-amazer-spj_5e79a8a3.jpg",
    title: "ラインシステム",
    tag: "ライン",
    desc: "PEラインの号数選択からリーダーの結び方まで。深場攻略に欠かせないシステム構築。",
    detail: "",
    color: "oklch(0.80 0.14 60)",
  },
  {
    image: "/manus-storage/hook-assist_a6f8fa80.jpg",
    title: "アシストフック",
    tag: "フック",
    desc: "フックサイズ・セッティングの最適解。フロント・リアの使い分けと自作のコツ。",
    detail: "",
    color: "oklch(0.72 0.18 195)",
  },
];

// Technique knowledge categories that link to articles
const KNOWLEDGE_ITEMS = [
  {
    num: "01",
    title: "基礎知識",
    subtitle: "SPJの原理と道具を知る",
    desc: "なぜスローピッチで釣れるのか。ジグのフォール姿勢・水流との関係を理解することが上達の第一歩。",
    tag: "テクニック",
    color: "oklch(0.72 0.18 195)",
  },
  {
    num: "02",
    title: "誘いの技術",
    subtitle: "ジャーク・フォール・ステイの極意",
    desc: "ワンピッチ・ツーピッチ・ハーフピッチ。潮流・水深・魚の活性に合わせたリズム変化の実践。",
    tag: "テクニック",
    color: "oklch(0.80 0.14 60)",
  },
  {
    num: "03",
    title: "フィールド攻略",
    subtitle: "潮読み・ポイント選定・水深対応",
    desc: "潮の流れ・底質・ベイトフィッシュの動向を読み、釣れる場所と時間帯を見極める実践的思考法。",
    tag: "フィールド",
    color: "oklch(0.72 0.12 160)",
  },
  {
    num: "04",
    title: "応用テクニック",
    subtitle: "状況別・魚種別の対応力",
    desc: "ヒラマサ・カンパチ・マハタ・タラ——ターゲットごとに変わるアプローチとドラグ設定の最適解。",
    tag: "テクニック",
    color: "oklch(0.80 0.14 60)",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

   const { data: allPosts = [], isLoading, isError } = trpc.posts.list.useQuery(undefined);
  const { data: dbStats } = trpc.posts.stats.useQuery();
  const visiblePosts = useMemo(
    () =>
      selectedCategory === "すべて"
        ? allPosts
        : allPosts.filter((p) => p.category === selectedCategory),
    [allPosts, selectedCategory]
  );
  const featuredPost = allPosts[0];
  // Stats from dedicated DB endpoint
  const stats = {
    tripCount: dbStats?.fishingCount ?? 0,
    maxWeight: dbStats && dbStats.maxWeight > 0 ? String(dbStats.maxWeight) : "—",
    maxDepth: dbStats && dbStats.maxDepth > 0 ? String(dbStats.maxDepth) : "—",
    speciesCount: dbStats && dbStats.speciesCount > 0 ? dbStats.speciesCount : "—",
  };

  useEffect(() => {
    document.title = 'SPJ Fishing Blog | スローピッチジャーク専門ブログ｜釣果・タックル・テクニック';
    // Update meta description dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'スローピッチジャーク（SPJ）専門の釣りブログ。年間 50 回超の実釣データに基づく釣果記録、タックルレビュー、ジギングテクニック解説を発信。初心者からベテランまで役立つ最新情報をお届けします。');
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Accent colors (updated palette)
  const C = {
    bg: "oklch(0.13 0.030 235)",
    teal: "oklch(0.72 0.18 195)",
    tealDark: "oklch(0.13 0.030 235)",
    gold: "oklch(0.80 0.14 60)",
    text: "oklch(0.95 0.008 240)",
    muted: "oklch(0.62 0.02 240)",
    border: "oklch(0.28 0.035 235)",
    cardBg: "oklch(0.17 0.030 235 / 0.85)",
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        {/* Hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
            transition: "transform 8s ease-out",
            transform: heroLoaded ? "scale(1)" : "scale(1.05)",
          }}
        />
        {/* Gradient overlay — lighter than before */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, oklch(0.10 0.030 235 / 0.88) 0%, oklch(0.10 0.030 235 / 0.55) 55%, transparent 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, oklch(0.13 0.030 235 / 0.85) 0%, transparent 60%)`,
          }}
        />

        {/* Vivid teal accent stripe on left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(to bottom, transparent, ${C.teal}, transparent)` }}
        />

        {/* Hero content */}
        <div className="relative h-full flex items-end pb-24 md:pb-36">
          <div className="container">
            <div className="max-w-3xl">
              {/* Eyebrow — Bebas Neue */}
              <div
                className={`flex items-center gap-4 mb-5 transition-all duration-700 ${heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "0.1s" }}
              >
                <div className="h-px w-14" style={{ background: C.teal }} />
                <span
                  className="tracking-[0.4em] uppercase text-sm"
                  style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: C.teal, letterSpacing: "0.35em" }}
                >
                  SLOW PITCH JERK JIGGING
                </span>
              </div>

              {/* Main heading */}
              <h1
                className={`font-black leading-tight mb-5 transition-all duration-700 ${heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 3.8rem)",
                  color: C.text,
                  transitionDelay: "0.2s",
                }}
              >
                最新の知識と情報で<br />
                <span style={{ fontStyle: "italic", color: C.teal, whiteSpace: "nowrap" }}>あなたのスローピッチジャークは変わる</span>
              </h1>

              {/* CTA */}
              <div
                className={`flex items-center gap-4 transition-all duration-700 ${heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.5s" }}
              >
                <a
                  href="#posts"
                  className="inline-flex items-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: C.teal,
                    color: C.tealDark,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    boxShadow: `0 4px 20px oklch(0.72 0.18 195 / 0.35)`,
                  }}
                >
                  記事を読む
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a
                  href="#about"
                  className="text-sm transition-colors"
                  style={{ color: "oklch(0.70 0.02 240)", fontFamily: "'Noto Sans JP', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.70 0.02 240)")}
                >
                  このブログについて →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, ${C.teal}, transparent)` }} />
        </div>
      </section>

      {/* ===== STATS SECTION (DB-driven) ===== */}
      <section
        ref={statsRef}
        className="py-14"
        style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "釣行回数", value: String(stats.tripCount || "—"), unit: stats.tripCount ? "回" : "" },
              { label: "最大魚体", value: stats.maxWeight, unit: stats.maxWeight !== "—" ? "kg" : "" },
              { label: "最深記録", value: stats.maxDepth, unit: stats.maxDepth !== "—" ? "m" : "" },
              { label: "確認魚種数", value: String(stats.speciesCount), unit: stats.speciesCount !== "—" ? "種" : "" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div
                  className={`font-bold text-3xl md:text-4xl transition-all duration-700 ${statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: C.teal,
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  {stat.value}
                  <span
                    className="text-lg ml-1"
                    style={{ fontFamily: "'Space Mono', monospace", color: C.muted }}
                  >
                    {stat.unit}
                  </span>
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p
            className="text-center text-xs mt-6"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "oklch(0.42 0.02 240)" }}
          >
            ※ 釣果記録カテゴリの記事データから自動集計
          </p>
        </div>
      </section>

      {/* ===== FEATURED POST ===== */}
      {featuredPost && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-8" style={{ background: C.teal }} />
              <span
                className="text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: C.teal, letterSpacing: "0.3em" }}
              >
                Featured
              </span>
            </div>
            <BlogCard post={featuredPost} featured />
          </div>
        </section>
      )}

      {/* ===== BLOG POSTS SECTION ===== */}
      <section id="posts" className="py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-8" style={{ background: C.teal }} />
                <span
                  className="text-xs tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: C.teal }}
                >
                  Latest Posts
                </span>
              </div>
              <h2
                className="font-bold text-3xl md:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif", color: C.text }}
              >
                最新の記事
              </h2>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {DB_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="text-xs px-4 py-2 rounded-sm border transition-all duration-200"
                  style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    background: selectedCategory === cat ? C.teal : "transparent",
                    borderColor: selectedCategory === cat ? C.teal : C.border,
                    color: selectedCategory === cat ? C.tealDark : C.muted,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.teal} transparent transparent transparent` }} />
            </div>
          ) : isError ? (
            <div className="text-center py-20" style={{ color: C.muted, fontFamily: "'Noto Sans JP', sans-serif" }}>
              記事の読み込みに失敗しました。ページを再読み込みしてください。
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              {visiblePosts.length === 0 && (
                <div className="text-center py-20" style={{ color: C.muted, fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {allPosts.length === 0
                    ? "まだ記事がありません。管理ページから記事を投稿してください。"
                    : "このカテゴリの記事はまだありません。"}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ===== TACKLE GUIDE SECTION ===== */}
      <section
        id="tackle"
        className="py-20 relative overflow-hidden"
        style={{ background: `oklch(0.11 0.030 235)` }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${JIG_IMAGE})` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, oklch(0.11 0.030 235 / 0.95) 0%, oklch(0.11 0.030 235 / 0.80) 100%)` }}
        />

        <div className="relative container">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-8" style={{ background: C.gold }} />
            <span
              className="text-xs tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: C.gold }}
            >
              Tackle Guide
            </span>
          </div>
          <h2
            className="font-bold text-3xl md:text-4xl mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: C.text }}
          >
            釣果を決めるSPJのタックル
          </h2>
          <p
            className="max-w-xl mb-10 leading-relaxed text-sm"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
          >
            各カテゴリをクリックすると、関連記事の一覧にジャンプします。
            ロッド・リール・ジグ・ラインシステム・アシストフックの選び方を体系的に解説。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TACKLE_ITEMS.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  setSelectedCategory("タックル");
                  document.getElementById("posts")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="relative overflow-hidden rounded-lg text-left group cursor-pointer"
                style={{
                  height: "260px",
                  border: `1px solid ${item.color}30`,
                  boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)",
                }}
              >
                {/* Photo layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.06 0.025 240 / 0.92) 0%, oklch(0.06 0.025 240 / 0.40) 55%, transparent 100%)" }} />
                {/* Color accent overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: item.color }}
                />
                {/* Content — slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3
                    className="font-bold text-lg text-white mb-1"
                    style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
                  >
                    {item.title}
                  </h3>
                  {/* desc fades in on hover */}
                  <p
                    className="text-xs leading-relaxed mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-pre-line"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "oklch(0.85 0.01 240)" }}
                  >
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    {item.detail && (
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'Space Mono', monospace", color: item.color }}
                      >
                        {item.detail}
                      </span>
                    )}
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto"
                      style={{ color: item.color }}
                    >
                      記事を見る →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KNOWLEDGE / TECHNIQUE SECTION ===== */}
      <section id="technique" className="py-20">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-8" style={{ background: "oklch(0.72 0.12 160)" }} />
                <span
                  className="text-xs tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: "oklch(0.72 0.12 160)" }}
                >
                  Knowledge Base
                </span>
              </div>
              <h2
                className="font-bold text-3xl md:text-4xl mb-3"
                style={{ fontFamily: "'Playfair Display', serif", color: C.text }}
              >
                SPJを深く知る
              </h2>
              <p
                className="max-w-xl text-sm leading-relaxed"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
              >
                基礎知識から応用テクニック、フィールド攻略まで。
              </p>
            </div>

          </div>

          {/* 2×2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KNOWLEDGE_ITEMS.map((item) => (
              <button
                key={item.num}
                onClick={() => {
                  setSelectedCategory(item.tag as any);
                  document.getElementById("posts")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass-card rounded-lg p-6 text-left transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start gap-5">
                  {/* Number */}
                  <span
                    className="text-5xl font-black leading-none shrink-0 mt-1 opacity-25 group-hover:opacity-40 transition-opacity"
                    style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: item.color }}
                  >
                    {item.num}
                  </span>
                  <div className="flex-1">
                    <div
                      className="text-xs mb-1"
                      style={{ fontFamily: "'Space Mono', monospace", color: item.color }}
                    >
                      {item.subtitle}
                    </div>
                    <h3
                      className="font-bold text-xl mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", color: C.text }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
                    >
                      {item.desc}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-px flex-1" style={{ background: `${item.color}40` }} />
                      <span className="text-xs" style={{ color: item.color, fontFamily: "'Space Mono', monospace" }}>
                        関連記事を読む →
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section
        id="about"
        className="py-20"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-8" style={{ background: C.teal }} />
              <span
                className="text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: C.teal }}
              >
                About
              </span>
              <div className="h-px w-8" style={{ background: C.teal }} />
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: C.text }}
            >
              このブログについて
            </h2>
            <p
              className="leading-relaxed mb-4 text-sm md:text-base"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
            >
              スローピッチジャーク（SPJ）に魅了されて数年。鹿児島・宮崎、そして種子島・屋久島・宇治群島・佐多岸などの離島を中心に、
              年锆50回超の釣行を重ねています。
            </p>
            <p
              className="leading-relaxed text-sm md:text-base"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", color: C.muted }}
            >
              このブログでは釣果記録だけでなく、タックルの使用感やテクニックの考察など、
              SPJをより楽しむための情報を発信していきます。
              同じくSPJを愛するアングラーの皆さんと、情報を共有できれば幸いです。
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
