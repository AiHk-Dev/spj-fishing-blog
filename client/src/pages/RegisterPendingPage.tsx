import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function RegisterPendingPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState<string>("");
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // Try to recover email from sessionStorage if set by RegisterPage
    const stored = sessionStorage.getItem("pendingEmail");
    if (stored) setEmail(stored);
  }, []);

  const resendMutation = trpc.blogMembers.resendVerification.useMutation({
    onSuccess: () => {
      setResent(true);
      setResendError(null);
    },
    onError: (err) => {
      setResendError(err.message);
    },
  });

  const handleResend = () => {
    if (!email) return;
    setResent(false);
    setResendError(null);
    resendMutation.mutate({ email, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      <main className="container py-24 max-w-lg mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[oklch(0.15_0.03_240)] border border-[oklch(0.25_0.04_240)] flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M4 8h28a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"
                stroke="oklch(0.65 0.15 190)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 10l16 11L34 10"
                stroke="oklch(0.65 0.15 190)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
          <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
            Check Your Email
          </span>
          <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
        </div>

        <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-4">
          確認メールを送信しました
        </h1>

        <p className="text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] text-sm leading-relaxed mb-2">
          {email ? (
            <>
              <span className="text-white font-semibold">{email}</span> 宛に確認メールをお送りしました。
            </>
          ) : (
            "ご登録のメールアドレス宛に確認メールをお送りしました。"
          )}
        </p>
        <p className="text-[oklch(0.65_0.02_240)] font-['Noto_Sans_JP'] text-sm leading-relaxed mb-10">
          メール内のリンクをクリックして、会員登録を完了してください。<br />
          リンクの有効期限は<strong className="text-white">24時間</strong>です。
        </p>

        {/* Info box */}
        <div className="bg-[oklch(0.13_0.025_240)] border border-[oklch(0.22_0.04_240)] rounded-sm px-6 py-5 mb-8 text-left space-y-2">
          <p className="text-xs font-['Space_Mono'] tracking-widest uppercase text-[oklch(0.65_0.15_190)] mb-3">
            メールが届かない場合
          </p>
          <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
            • 迷惑メールフォルダをご確認ください
          </p>
          <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
            • 数分経っても届かない場合は、下の「再送する」ボタンをお試しください
          </p>
          <p className="text-sm text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">
            • メールアドレスを間違えた場合は、再度{" "}
            <a href="/register" className="text-[oklch(0.65_0.15_190)] hover:underline">
              会員登録
            </a>
            {" "}を行ってください
          </p>
        </div>

        {/* Resend */}
        {email && (
          <div className="mb-8">
            {resent ? (
              <p className="text-sm text-[oklch(0.65_0.15_190)] font-['Noto_Sans_JP']">
                ✓ 確認メールを再送しました
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-sm text-[oklch(0.65_0.15_190)] hover:underline font-['Noto_Sans_JP'] disabled:opacity-50"
              >
                {resendMutation.isPending ? "送信中..." : "確認メールを再送する"}
              </button>
            )}
            {resendError && (
              <p className="text-sm text-red-400 font-['Noto_Sans_JP'] mt-2">{resendError}</p>
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="text-sm text-[oklch(0.50_0.02_240)] hover:text-white font-['Noto_Sans_JP'] transition-colors"
        >
          ← ホームに戻る
        </button>
      </main>

      <Footer />
    </div>
  );
}
