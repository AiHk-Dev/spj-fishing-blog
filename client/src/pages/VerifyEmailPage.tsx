import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useBlogAuth } from "@/hooks/useBlogAuth";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const { login } = useBlogAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const verifyMutation = trpc.blogMembers.verifyEmail.useMutation({
    onSuccess: (data) => {
      login(data.sessionToken);
      setUsername(data.username);
      setStatus("success");
    },
    onError: (err) => {
      setErrorMessage(err.message);
      setStatus("error");
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setErrorMessage("認証トークンが見つかりません");
      setStatus("error");
      return;
    }
    verifyMutation.mutate({ token });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      <main className="container py-24 max-w-lg mx-auto text-center">
        {status === "verifying" && (
          <>
            {/* Spinner */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-[oklch(0.25_0.04_240)] border-t-[oklch(0.65_0.15_190)] animate-spin" />
            </div>
            <h1 className="font-['Playfair_Display'] font-bold text-2xl text-white mb-3">
              メールアドレスを確認中...
            </h1>
            <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
              しばらくお待ちください
            </p>
          </>
        )}

        {status === "success" && (
          <>
            {/* Success icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.65_0.15_190/0.4)] flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="16" stroke="oklch(0.65 0.15 190)" strokeWidth="1.5" />
                  <path
                    d="M11 18.5l5 5 9-10"
                    stroke="oklch(0.65 0.15 190)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
              <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
                Verified
              </span>
              <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
            </div>

            <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-4">
              会員登録が完了しました
            </h1>
            <p className="text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] text-sm leading-relaxed mb-10">
              {username && (
                <>
                  <span className="text-white font-semibold">{username}</span> さん、ようこそ！<br />
                </>
              )}
              メールアドレスの確認が完了しました。<br />
              会員限定コンテンツをお楽しみください。
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-8 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors"
            >
              ホームへ
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {status === "error" && (
          <>
            {/* Error icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[oklch(0.15_0.03_240)] border border-red-500/40 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="16" stroke="rgb(239,68,68)" strokeWidth="1.5" />
                  <path d="M12 12l12 12M24 12l-12 12" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-8 bg-red-500" />
              <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-red-400">
                Error
              </span>
              <div className="h-px w-8 bg-red-500" />
            </div>

            <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-4">
              認証に失敗しました
            </h1>
            <p className="text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] text-sm leading-relaxed mb-8">
              {errorMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors"
              >
                再度会員登録する
              </a>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center text-sm text-[oklch(0.55_0.02_240)] hover:text-white font-['Noto_Sans_JP'] transition-colors px-6 py-3"
              >
                ホームへ戻る
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
