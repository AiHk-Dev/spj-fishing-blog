import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useBlogAuth } from "@/hooks/useBlogAuth";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useBlogAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.blogMembers.login.useMutation({
    onSuccess: (data) => {
      login(data.sessionToken);
      navigate("/");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email: form.email, password: form.password });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      <main className="container py-16 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
            <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
              Member Login
            </span>
          </div>
          <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-2">
            ログイン
          </h1>
          <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
            会員限定記事の閲覧やコメント投稿が可能になります。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
              メールアドレス
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
              パスワード
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="パスワードを入力"
              className="w-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
            />
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
            disabled={loginMutation.isPending}
            className="w-full bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "ログイン中..." : "ログイン"}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">
            まだ会員でない方は{" "}
            <a href="/register" className="text-[oklch(0.65_0.15_190)] hover:underline">
              会員登録
            </a>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
