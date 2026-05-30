import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useBlogAuth } from "@/hooks/useBlogAuth";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { login } = useBlogAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    homeArea: "",
    age: "",
    gender: "" as "" | "男性" | "女性" | "その他" | "回答しない",
    targetFish: "",
  });
  const [error, setError] = useState<string | null>(null);

  const registerMutation = trpc.blogMembers.register.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("pendingEmail", data.email);
      navigate("/register-pending");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (form.password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    registerMutation.mutate({
      username: form.username,
      email: form.email,
      password: form.password,
      homeArea: form.homeArea || undefined,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      targetFish: form.targetFish || undefined,
      origin: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      <main className="container py-16 max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
            <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
              Member Registration
            </span>
          </div>
          <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-2">
            会員登録
          </h1>
          <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
            会員登録すると、会員限定記事の閲覧やコメント時に「会員」バッジが付きます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              ユーザーネーム <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="例: spj_angler"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              メールアドレス <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              パスワード <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="8文字以上"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
          </div>

          {/* Password Confirm */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              パスワード（確認） <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="もう一度入力"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[oklch(0.20_0.03_240)] pt-4">
            <p className="text-xs text-[oklch(0.50_0.02_240)] font-['Noto_Sans_JP'] mb-4">
              以下はオプションです（後から変更可能）
            </p>
          </div>

          {/* Home Area */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              ホームエリア（都道府県）
            </label>
            <select
              name="homeArea"
              value={form.homeArea}
              onChange={handleChange}
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              年齢
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              min={1}
              max={120}
              placeholder="例: 35"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              性別
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="回答しない">回答しない</option>
            </select>
          </div>

          {/* Target Fish */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              今後挑戦したい魚種
            </label>
            <textarea
              name="targetFish"
              value={form.targetFish}
              onChange={handleChange}
              rows={3}
              placeholder="例: ヒラマサ、カンパチ、マハタ..."
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors resize-none"
            />
          </div>

          {/* Terms Notice */}
          <div className="border-t border-[oklch(0.20_0.03_240)] pt-5">
            <p className="text-sm text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed text-center">
              会員登録には、{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[oklch(0.65_0.15_190)] hover:underline"
              >
                利用規約
              </a>
              {" "}と{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[oklch(0.65_0.15_190)] hover:underline"
              >
                プライバシーポリシー
              </a>
              {" "}への同意が必要です。
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-sm px-4 py-3 text-red-300 text-sm font-['Noto_Sans_JP']">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? "登録中..." : "同意して登録"}
          </button>

          {/* Login link */}
          <p className="text-center text-sm text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">
            すでに会員の方は{" "}
            <a href="/login" className="text-[oklch(0.65_0.15_190)] hover:underline">
              ログイン
            </a>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
