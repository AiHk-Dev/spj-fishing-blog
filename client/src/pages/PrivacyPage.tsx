/*
 * プライバシーポリシーページ
 */
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "プライバシーポリシー | SPJ Fishing Blog";
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />
      <main className="container py-16 max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)] mb-3">
            Legal
          </p>
          <h1 className="font-['Playfair_Display'] font-bold text-3xl md:text-4xl text-white mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-[oklch(0.50_0.02_240)] font-['Noto_Sans_JP']">
            最終更新日：2026年5月8日
          </p>
          <div className="h-px bg-gradient-to-r from-[oklch(0.65_0.15_190)] to-transparent mt-6" />
        </div>

        {/* Content */}
        <div className="space-y-10 text-[oklch(0.75_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              1. 収集する情報
            </h2>
            <p className="text-sm leading-7 mb-3">
              会員登録時に以下の情報を収集します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-7 pl-2">
              <li>メールアドレス（必須）</li>
              <li>ニックネーム（必須）</li>
              <li>ホームエリア（都道府県）、年齢、性別、挑戦したい魚種（任意）</li>
            </ul>
            <p className="text-sm leading-7 mt-3">
              また、サービス利用時にアクセスログ（IPアドレス、ブラウザ情報、閲覧ページ）を自動収集する場合があります。
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              2. 情報の利用目的
            </h2>
            <p className="text-sm leading-7 mb-3">収集した情報は以下の目的で利用します。</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-7 pl-2">
              <li>会員サービスの提供・管理（ログイン認証、プロフィール表示）</li>
              <li>コメント機能の提供</li>
              <li>会員限定コンテンツの提供</li>
              <li>サービス改善のための統計分析（個人を特定しない形で利用）</li>
              <li>重要なお知らせ・サービス更新情報のメール送信</li>
              <li>新着記事・釣果情報・タックル情報などのお知らせメール送信</li>
              <li>プロモーション・キャンペーン情報のメール送信</li>
            </ul>
            <p className="text-sm leading-7 mt-3 text-[oklch(0.60_0.02_240)]">
              ※ メール配信の停止をご希望の場合は、プロフィールページまたはお問い合わせよりお申し出ください。
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              3. 第三者への提供
            </h2>
            <p className="text-sm leading-7">
              法令に基づく場合を除き、収集した個人情報を第三者に提供・販売・貸与することはありません。
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              4. アフィリエイト・外部サービス
            </h2>
            <p className="text-sm leading-7">
              当ブログはAmazonアソシエイト・楽天アフィリエイト等のアフィリエイトプログラムを利用しています。これらのサービスは独自のプライバシーポリシーに基づき情報を収集する場合があります。また、アクセス解析のためにウェブ解析ツールを使用する場合があります。
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              5. Cookieの使用
            </h2>
            <p className="text-sm leading-7">
              当ブログはログイン状態の維持のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              6. 情報の管理・セキュリティ
            </h2>
            <p className="text-sm leading-7">
              収集した個人情報は適切なセキュリティ対策を講じて管理します。パスワードはハッシュ化して保存し、平文では保存しません。
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              7. 情報の開示・訂正・削除
            </h2>
            <p className="text-sm leading-7">
              会員は自身の登録情報をプロフィールページから確認・変更できます。アカウントの削除（退会）をご希望の場合は、管理者までお問い合わせください。
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              8. お問い合わせ
            </h2>
            <p className="text-sm leading-7">
              プライバシーに関するお問い合わせは、当ブログのお問い合わせフォームまたは{" "}
              <a
                href="mailto:noreply@spj-fishing.com"
                className="text-[oklch(0.65_0.15_190)] hover:underline"
              >
                noreply@spj-fishing.com
              </a>{" "}
              までご連絡ください。
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              9. ポリシーの変更
            </h2>
            <p className="text-sm leading-7">
              本ポリシーは必要に応じて変更することがあります。変更後は本ページに掲載します。
            </p>
          </section>

          {/* Divider */}
          <div className="h-px bg-[oklch(0.20_0.03_240)]" />

          {/* Link to Terms */}
          <div className="text-center">
            <p className="text-sm text-[oklch(0.55_0.02_240)] mb-3">
              サービスのご利用条件については、利用規約をご確認ください。
            </p>
            <a
              href="/terms"
              className="inline-flex items-center gap-2 text-[oklch(0.65_0.15_190)] hover:text-[oklch(0.72_0.15_190)] text-sm font-['Space_Mono'] tracking-wide transition-colors"
            >
              利用規約を読む →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
