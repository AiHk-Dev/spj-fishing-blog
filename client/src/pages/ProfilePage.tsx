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

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { member, isLoggedIn, isLoading, sessionToken, logout, refetch } = useBlogAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    homeArea: "",
    age: "",
    gender: "" as "" | "男性" | "女性" | "その他" | "回答しない",
    targetFish: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (member) {
      setForm({
        username: member.username,
        homeArea: member.homeArea ?? "",
        age: member.age ? String(member.age) : "",
        gender: (member.gender as any) ?? "",
        targetFish: member.targetFish ?? "",
      });
    }
  }, [member]);

  const updateMutation = trpc.blogMembers.updateProfile.useMutation({
    onSuccess: () => {
      setEditing(false);
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    setError(null);
    updateMutation.mutate({
      sessionToken,
      username: form.username || undefined,
      homeArea: form.homeArea || undefined,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      targetFish: form.targetFish || undefined,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.10_0.025_240)] flex items-center justify-center">
        <div className="text-[oklch(0.65_0.15_190)] font-['Space_Mono'] text-sm">Loading...</div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.025_240)]">
      <Navbar />

      <main className="container py-16 max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px w-8 bg-[oklch(0.65_0.15_190)]" />
              <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
                Member Profile
              </span>
            </div>
            <h1 className="font-['Playfair_Display'] font-bold text-3xl text-white">
              {member.username}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-[oklch(0.65_0.15_190/0.15)] border border-[oklch(0.65_0.15_190/0.4)] text-[oklch(0.65_0.15_190)] text-xs font-['Space_Mono'] px-2 py-0.5 rounded-sm">
                ✓ 会員
              </span>
              <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP']">
                登録日: {new Date(member.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[oklch(0.50_0.02_240)] hover:text-red-400 font-['Noto_Sans_JP'] transition-colors"
          >
            ログアウト
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 bg-[oklch(0.65_0.15_190/0.15)] border border-[oklch(0.65_0.15_190/0.4)] rounded-sm px-4 py-3 text-[oklch(0.65_0.15_190)] text-sm font-['Noto_Sans_JP']">
            プロフィールを更新しました
          </div>
        )}

        {/* Profile display / edit form */}
        {!editing ? (
          <div className="glass-card rounded-lg p-6 space-y-5">
            <ProfileRow label="メールアドレス" value={member.email} />
            <ProfileRow label="ホームエリア" value={member.homeArea ?? "未設定"} />
            <ProfileRow label="年齢" value={member.age ? `${member.age}歳` : "未設定"} />
            <ProfileRow label="性別" value={member.gender ?? "未設定"} />
            <ProfileRow label="挑戦したい魚種" value={member.targetFish ?? "未設定"} />

            <button
              onClick={() => setEditing(true)}
              className="mt-4 w-full border border-[oklch(0.65_0.15_190)] text-[oklch(0.65_0.15_190)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.65_0.15_190/0.1)] transition-colors"
            >
              プロフィールを編集
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="glass-card rounded-lg p-6 space-y-5">
            {/* Username */}
            <FormField label="ユーザーネーム">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
                className="w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
              />
            </FormField>

            {/* Home Area */}
            <FormField label="ホームエリア">
              <select
                name="homeArea"
                value={form.homeArea}
                onChange={handleChange}
                className="w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>

            {/* Age */}
            <FormField label="年齢">
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={1}
                max={120}
                placeholder="例: 35"
                className="w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
              />
            </FormField>

            {/* Gender */}
            <FormField label="性別">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
              >
                <option value="">選択してください</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
                <option value="回答しない">回答しない</option>
              </select>
            </FormField>

            {/* Target Fish */}
            <FormField label="挑戦したい魚種">
              <textarea
                name="targetFish"
                value={form.targetFish}
                onChange={handleChange}
                rows={3}
                placeholder="例: ヒラマサ、カンパチ..."
                className="w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.04_240)] rounded-sm px-4 py-3 text-white font-['Noto_Sans_JP'] text-sm focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors resize-none"
              />
            </FormField>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-sm px-4 py-3 text-red-300 text-sm font-['Noto_Sans_JP']">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? "保存中..." : "保存する"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(null); }}
                className="flex-1 border border-[oklch(0.30_0.04_240)] text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP'] text-sm px-6 py-3 rounded-sm hover:border-[oklch(0.50_0.04_240)] transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[oklch(0.20_0.03_240)] last:border-0">
      <span className="text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.50_0.02_240)] uppercase shrink-0">
        {label}
      </span>
      <span className="text-sm text-white font-['Noto_Sans_JP'] text-right">
        {value}
      </span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-['Space_Mono'] tracking-widest text-[oklch(0.65_0.15_190)] mb-2 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
