/*
 * 利用規約ページ
 */
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "利用規約 | SPJ Fishing Blog";
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
            利用規約
          </h1>
          <p className="text-sm text-[oklch(0.50_0.02_240)] font-['Noto_Sans_JP']">
            最終更新日：2026年5月8日
          </p>
          <div className="h-px bg-gradient-to-r from-[oklch(0.65_0.15_190)] to-transparent mt-6" />
        </div>

        {/* Content */}
        <div className="space-y-10 text-[oklch(0.75_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed">

          {/* 第1条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第1条（はじめに）
            </h2>
            <p className="text-sm leading-7">
              本利用規約（以下「本規約」）は、SPJ Fishing Blog（以下「当ブログ」）が提供するウェブサイト（https://spj-fishing.com）およびその会員サービス（以下「本サービス」）の利用条件を定めるものです。会員登録を行った方（以下「会員」）は、本規約に同意したものとみなします。
            </p>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第2条（会員登録）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm leading-7">
              <li>本サービスへの会員登録は、本規約に同意のうえ、所定のフォームに必要事項を入力することで行えます。</li>
              <li>登録には有効なメールアドレスが必要です。</li>
              <li>虚偽の情報による登録は禁止します。</li>
              <li>1人につき1アカウントの登録とします。</li>
              <li>
                会員登録により、当ブログからの重要なお知らせ・新着記事情報・プロモーション・キャンペーン情報などのメールを受け取ることに同意したものとみなします。
                配信停止をご希望の場合は、プロフィールページまたはお問い合わせよりお申し出ください。
              </li>
            </ol>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第3条（会員の義務）
            </h2>
            <p className="text-sm leading-7 mb-3">会員は以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-7 pl-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>当ブログ・他の会員・第三者を誹謗中傷する行為</li>
              <li>当ブログのコンテンツを無断で転載・複製・商用利用する行為</li>
              <li>当ブログの運営を妨害する行為</li>
              <li>スパムコメントやフィッシング目的の投稿</li>
              <li>その他、当ブログ管理者が不適切と判断する行為</li>
            </ul>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第4条（コメント機能）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm leading-7">
              <li>会員はログイン後、記事へのコメントを投稿できます。</li>
              <li>コメントは管理者による承認制です。不適切と判断したコメントは削除することがあります。</li>
              <li>投稿されたコメントの著作権は投稿者に帰属しますが、当ブログでの掲載・編集・削除の権限を当ブログ管理者に許諾したものとします。</li>
            </ol>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第5条（会員限定コンテンツ）
            </h2>
            <p className="text-sm leading-7">
              一部の記事・コンテンツは会員限定です。会員登録・ログインすることで閲覧できます。
            </p>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第6条（アフィリエイト・広告）
            </h2>
            <p className="text-sm leading-7">
              当ブログはAmazonアソシエイト・楽天アフィリエイト等のアフィリエイトプログラムに参加しています。紹介リンクを通じた購入により、当ブログが報酬を受け取る場合があります。
            </p>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第7条（免責事項）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm leading-7">
              <li>当ブログに掲載する釣果・タックル情報・テクニック解説は、管理者の実釣経験に基づく個人的見解です。特定の成果を保証するものではありません。</li>
              <li>釣りは自然環境下での活動です。安全には十分ご注意ください。当ブログは釣行中の事故・損害について一切の責任を負いません。</li>
              <li>リンク先の外部サイトの内容について、当ブログは責任を負いません。</li>
            </ol>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第8条（退会・アカウント削除）
            </h2>
            <p className="text-sm leading-7">
              会員はいつでも退会できます。退会後は会員限定コンテンツへのアクセスおよびコメント投稿ができなくなります。
            </p>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第9条（規約の変更）
            </h2>
            <p className="text-sm leading-7">
              当ブログは必要に応じて本規約を変更できます。変更後は本ページに掲載し、掲載時点から効力を持ちます。
            </p>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 font-['Playfair_Display']">
              第10条（準拠法・管轄）
            </h2>
            <p className="text-sm leading-7">
              本規約は日本法に準拠し、鹿児島地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          {/* Divider */}
          <div className="h-px bg-[oklch(0.20_0.03_240)]" />

          {/* Link to Privacy */}
          <div className="text-center">
            <p className="text-sm text-[oklch(0.55_0.02_240)] mb-3">
              個人情報の取り扱いについては、プライバシーポリシーをご確認ください。
            </p>
            <a
              href="/privacy"
              className="inline-flex items-center gap-2 text-[oklch(0.65_0.15_190)] hover:text-[oklch(0.72_0.15_190)] text-sm font-['Space_Mono'] tracking-wide transition-colors"
            >
              プライバシーポリシーを読む →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
