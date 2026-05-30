/*
 * Design Philosophy: Dark Maritime Minimalism
 * BlogCard: Glass morphism, teal accent on hover, minimal metadata display
 */
import { Link } from "wouter";
import type { Post } from "../../../drizzle/schema";

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  "釣果記録": "oklch(0.65 0.15 190)",
  "タックル": "oklch(0.75 0.12 55)",
  "テクニック": "oklch(0.70 0.10 160)",
  "フィールド": "oklch(0.65 0.12 280)",
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const accentColor = categoryColors[post.category] || "oklch(0.65 0.15 190)";
  const imageUrl = post.coverImage || "https://d2xsxph8kpxj0f.cloudfront.net/310519663635082086/JhN76xVh7UtC2SfC9qFaUM/fish-catch-TrPm3Bxij69JZjR2QLvCZR.webp";
  const linkTarget = `/article/${post.slug}`;

  if (featured) {
    return (
      <Link href={linkTarget}>
        <article className="group relative overflow-hidden rounded-lg cursor-pointer h-[480px] md:h-[560px]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_240/0.95)] via-[oklch(0.08_0.02_240/0.5)] to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            {/* Category badge */}
            <span
              className="inline-block text-xs font-['Space_Mono'] tracking-widest uppercase px-3 py-1 rounded-sm mb-4"
              style={{
                color: accentColor,
                border: `1px solid ${accentColor}`,
                background: `oklch(0.10 0.025 240 / 0.8)`,
              }}
            >
              {post.category}
            </span>

            <h2 className="font-['Playfair_Display'] font-bold text-2xl md:text-3xl text-white mb-3 leading-tight group-hover:text-[oklch(0.65_0.15_190)] transition-colors">
              {post.title}
            </h2>

            <p className="text-sm text-[oklch(0.70_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs font-['Space_Mono'] text-[oklch(0.55_0.02_240)]">
              <span>{formatDate(post.fishingDate || post.createdAt)}</span>
              {post.location && <span>📍 {post.location}</span>}
              {post.species && <span>🐟 {post.species}{post.maxWeight ? ` ${post.maxWeight}kg` : ""}</span>}
            </div>
          </div>

          {/* Teal accent line on hover */}
          <div
            className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
            style={{ background: accentColor }}
          />
        </article>
      </Link>
    );
  }

  return (
    <Link href={linkTarget}>
      <article className="group glass-card rounded-lg overflow-hidden cursor-pointer hover:border-[oklch(0.65_0.15_190/0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_oklch(0.65_0.15_190/0.15)]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.025_240/0.7)] to-transparent" />
          {/* Category badge */}
          <span
            className="absolute top-3 left-3 text-xs font-['Space_Mono'] tracking-widest uppercase px-2.5 py-1 rounded-sm"
            style={{
              color: accentColor,
              border: `1px solid ${accentColor}`,
              background: `oklch(0.10 0.025 240 / 0.85)`,
            }}
          >
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-['Playfair_Display'] font-bold text-lg text-white mb-2 leading-snug group-hover:text-[oklch(0.65_0.15_190)] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-sm text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[oklch(0.45_0.02_240)]">
            <span>{formatDate(post.fishingDate || post.createdAt)}</span>
            {post.species && (
              <span
                className="px-2 py-0.5 rounded-sm"
                style={{
                  color: accentColor,
                  background: `oklch(0.10 0.025 240 / 0.5)`,
                }}
              >
                {post.species}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
