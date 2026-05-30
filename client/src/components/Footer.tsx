/*
 * Design Philosophy: Dark Maritime Minimalism
 * Footer: Minimal, dark, with teal accent line at top
 */
import SPJLogo from "./SPJLogo";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.08_0.02_240)] border-t border-[oklch(0.20_0.03_240)] mt-24">
      {/* Teal accent line */}
      <div className="h-0.5 bg-gradient-to-r from-[oklch(0.65_0.15_190)] via-[oklch(0.65_0.15_190/0.5)] to-transparent" />

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SPJLogo size={42} />
              <span className="font-['Playfair_Display'] font-bold text-lg text-white">
                SPJ Fishing Blog
              </span>
            </div>
            <p className="text-sm text-[oklch(0.50_0.02_240)] leading-relaxed font-['Noto_Sans_JP']">
              スローピッチジャーク専門の釣りブログ。<br />
              深場の静寂と、ジグが翻る瞬間の興奮を。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-[oklch(0.65_0.15_190)] mb-4 font-['Space_Mono'] tracking-widest uppercase">
              Contents
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/#posts" className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP']">
                  最新の記事
                </a>
              </li>
              <li>
                <a href="/#tackle" className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP']">
                  タックル選びの基本
                </a>
              </li>
              <li>
                <a href="/#technique" className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP']">
                  SPJを深く知る
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-[oklch(0.65_0.15_190)] mb-4 font-['Space_Mono'] tracking-widest uppercase">
              Info
            </h4>
            <ul className="space-y-2 text-sm text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">
              <li>主なフィールド: 宮崎・鹿児島・種子島・屋久島・宇治群島・佐多岬 etc…</li>
              <li>対象魚種: カンパチ・マハタ・アカムツ etc…</li>
              <li>スタイル: スローピッチジャーク</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[oklch(0.18_0.02_240)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[oklch(0.40_0.02_240)] font-['Space_Mono']">
            © 2026 SPJ Fishing Blog. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/terms"
              className="text-xs text-[oklch(0.40_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP']"
            >
              利用規約
            </a>
            <span className="text-[oklch(0.30_0.02_240)] text-xs">|</span>
            <a
              href="/privacy"
              className="text-xs text-[oklch(0.40_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP']"
            >
              プライバシーポリシー
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
