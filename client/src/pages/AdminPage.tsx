/*
 * Admin Page — CMS for SPJ Fishing Blog
 * Accessible at /admin (owner/admin only)
 * Features: list all posts, create, edit, delete, toggle publish
 *           + tackle management with affiliate links per post
 *           + image upload (cover + inline), preview, category "その他"
 */
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import SPJLogo from "@/components/SPJLogo";
import { Streamdown } from "streamdown";

const CATEGORIES = ["釣果記録", "タックル", "テクニック", "フィールド", "その他"] as const;
type Category = (typeof CATEGORIES)[number];

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category;
  coverImage: string;
  published: boolean;
  fishingDate: string;
  location: string;
  depth: string;
  maxWeight: string;
  species: string;
  tags: string;
  membersOnly: boolean;
}

interface TackleForm {
  name: string;
  imageUrl: string;
  amazonUrl: string;
  rakutenUrl: string;
  yahooUrl: string;
  sortOrder: string;
}

const emptyForm: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "釣果記録",
  coverImage: "",
  published: false,
  fishingDate: "",
  location: "",
  depth: "",
  maxWeight: "",
  species: "",
  tags: "",
  membersOnly: false,
};

const emptyTackleForm: TackleForm = {
  name: "",
  imageUrl: "",
  amazonUrl: "",
  rakutenUrl: "",
  yahooUrl: "",
  sortOrder: "0",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

// ─── Image Upload Button ─────────────────────────────────────────────────────
function ImageUploadButton({
  label,
  onUploaded,
  accept = "image/*",
}: {
  label: string;
  onUploaded: (url: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.posts.uploadImage.useMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("画像ファイルを選択してください");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("ファイルサイズは10MB以下にしてください");
        return;
      }
      setUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const result = await uploadMutation.mutateAsync({
            base64,
            filename: file.name,
          });
          onUploaded(result.url);
        } catch (err: any) {
          setUploadError(err.message ?? "アップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [uploadMutation, onUploaded]
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 border border-[oklch(0.65_0.15_190/0.6)] text-[oklch(0.65_0.15_190)] rounded text-xs font-['Space_Mono'] hover:bg-[oklch(0.65_0.15_190/0.1)] disabled:opacity-50 transition-colors flex items-center gap-1.5"
      >
        {uploading ? (
          <>
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            アップロード中...
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v10M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
          </>
        )}
      </button>
      {uploadError && (
        <p className="text-xs text-red-400 font-['Noto_Sans_JP'] mt-1">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Cover Image Field ────────────────────────────────────────────────────────
function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const uploadMutation = trpc.posts.uploadImage.useMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("画像ファイルを選択してください");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("ファイルサイズは10MB以下にしてください");
        return;
      }
      setUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const result = await uploadMutation.mutateAsync({ base64, filename: file.name });
          onChange(result.url);
        } catch (err: any) {
          setUploadError(err.message ?? "アップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [uploadMutation, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-[oklch(0.65_0.15_190)] bg-[oklch(0.65_0.15_190/0.08)]"
            : "border-[oklch(0.28_0.04_240)] hover:border-[oklch(0.45_0.08_240)] bg-[oklch(0.12_0.025_240)]"
        }`}
        style={{ minHeight: "120px" }}
      >
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="カバー画像"
              className="w-full h-40 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-['Noto_Sans_JP']">クリックまたはドラッグで変更</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            {uploading ? (
              <>
                <svg className="animate-spin w-6 h-6 text-[oklch(0.65_0.15_190)]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                <span className="text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">アップロード中...</span>
              </>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[oklch(0.45_0.04_240)]">
                  <path d="M4 20l6-6 4 4 4-5 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="2" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="9" r="2" fill="currentColor"/>
                </svg>
                <span className="text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">
                  クリックまたはドラッグ＆ドロップで画像を追加
                </span>
                <span className="text-[10px] text-[oklch(0.40_0.02_240)] font-['Space_Mono']">
                  JPG / PNG / WEBP · 最大10MB
                </span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {uploadError && (
        <p className="text-xs text-red-400 font-['Noto_Sans_JP'] mt-1">{uploadError}</p>
      )}
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          className="mt-2 text-xs text-[oklch(0.50_0.02_240)] hover:text-red-400 font-['Space_Mono'] transition-colors"
        >
          × 画像を削除
        </button>
      )}
    </div>
  );
}

// ─── Inline Image Inserter ────────────────────────────────────────────────────
function InlineImageInserter({
  onInsert,
}: {
  onInsert: (markdown: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [altText, setAltText] = useState("");
  const uploadMutation = trpc.posts.uploadImage.useMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("画像ファイルを選択してください");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("ファイルサイズは10MB以下にしてください");
        return;
      }
      setUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const result = await uploadMutation.mutateAsync({ base64, filename: file.name });
          const md = `![${altText || file.name}](${result.url})`;
          onInsert(md);
          setOpen(false);
          setAltText("");
        } catch (err: any) {
          setUploadError(err.message ?? "アップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [uploadMutation, onInsert, altText]
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 border border-[oklch(0.30_0.04_240)] text-[oklch(0.60_0.02_240)] rounded text-xs font-['Space_Mono'] hover:border-[oklch(0.65_0.15_190)] hover:text-[oklch(0.65_0.15_190)] transition-colors flex items-center gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M1 11l4-4 3 3 2-2.5 5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/>
        </svg>
        本文に画像を挿入
      </button>
    );
  }

  return (
    <div className="border border-[oklch(0.30_0.04_240)] rounded-lg p-4 bg-[oklch(0.11_0.025_240)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-['Space_Mono'] text-[oklch(0.65_0.15_190)] uppercase tracking-wider">
          画像を挿入
        </span>
        <button
          type="button"
          onClick={() => { setOpen(false); setUploadError(null); }}
          className="text-[oklch(0.45_0.02_240)] hover:text-white text-sm"
        >
          ×
        </button>
      </div>
      <div>
        <label className="block text-xs text-[oklch(0.50_0.02_240)] font-['Space_Mono'] mb-1 uppercase tracking-wider">
          代替テキスト（任意）
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="画像の説明"
          className="w-full bg-[oklch(0.10_0.025_240)] border border-[oklch(0.22_0.03_240)] rounded px-3 py-2 text-white text-sm font-['Noto_Sans_JP'] focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors"
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2 border-2 border-dashed border-[oklch(0.30_0.04_240)] hover:border-[oklch(0.65_0.15_190)] rounded text-xs text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.65_0.15_190)] font-['Noto_Sans_JP'] transition-colors disabled:opacity-50"
      >
        {uploading ? "アップロード中..." : "クリックして画像を選択"}
      </button>
      {uploadError && (
        <p className="text-xs text-red-400 font-['Noto_Sans_JP']">{uploadError}</p>
      )}
    </div>
  );
}

// ─── Article Preview ──────────────────────────────────────────────────────────
function ArticlePreview({
  form,
  onClose,
}: {
  form: PostForm;
  onClose: () => void;
}) {
  const categoryColors: Record<string, string> = {
    釣果記録: "oklch(0.65 0.15 190)",
    タックル: "oklch(0.75 0.12 55)",
    テクニック: "oklch(0.65 0.15 280)",
    フィールド: "oklch(0.65 0.12 145)",
    その他: "oklch(0.65 0.10 30)",
  };
  const accent = categoryColors[form.category] ?? "oklch(0.65 0.15 190)";

  return (
    <div className="fixed inset-0 z-50 bg-[oklch(0.08_0.025_240)] overflow-y-auto">
      {/* Preview bar */}
      <div className="sticky top-0 z-10 bg-[oklch(0.10_0.025_240)] border-b border-[oklch(0.20_0.03_240)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-['Space_Mono'] tracking-[0.3em] uppercase text-[oklch(0.65_0.15_190)]">
            Preview
          </span>
          <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP']">
            ※ 実際の表示とは若干異なる場合があります
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 border border-[oklch(0.30_0.03_240)] text-[oklch(0.60_0.02_240)] rounded text-xs font-['Space_Mono'] hover:border-white hover:text-white transition-colors"
        >
          ← 編集に戻る
        </button>
      </div>

      {/* Hero */}
      <div className="relative min-h-[320px] overflow-hidden">
        {form.coverImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${form.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.025_240)] via-[oklch(0.08_0.025_240/0.5)] to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.12_0.03_240)] to-[oklch(0.08_0.025_240)]" />
        )}
        <div className="relative container py-16 flex flex-col justify-end min-h-[320px]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-['Space_Mono'] tracking-[0.2em] uppercase px-3 py-1 rounded-sm"
                style={{ backgroundColor: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
              >
                {form.category}
              </span>
              {form.membersOnly && (
                <span className="text-xs font-['Space_Mono'] tracking-[0.2em] uppercase px-3 py-1 rounded-sm bg-[oklch(0.75_0.12_55/0.15)] text-[oklch(0.75_0.12_55)] border border-[oklch(0.75_0.12_55/0.3)]">
                  会員限定
                </span>
              )}
            </div>
            <h1 className="font-['Playfair_Display'] font-black text-3xl md:text-5xl text-white leading-tight mb-4">
              {form.title || "（タイトル未入力）"}
            </h1>
            {form.excerpt && (
              <p className="text-[oklch(0.70_0.02_240)] font-['Noto_Sans_JP'] text-base leading-relaxed max-w-2xl">
                {form.excerpt}
              </p>
            )}
            {(form.fishingDate || form.location) && (
              <div className="flex items-center gap-4 mt-4 text-xs text-[oklch(0.50_0.02_240)] font-['Space_Mono']">
                {form.fishingDate && <span>📅 {form.fishingDate}</span>}
                {form.location && <span>📍 {form.location}</span>}
                {form.depth && <span>⬇ {form.depth}m</span>}
                {form.maxWeight && <span>⚖ {form.maxWeight}kg</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 max-w-3xl">
        {form.content ? (
          <div className="prose prose-invert prose-lg max-w-none font-['Noto_Sans_JP']">
            <Streamdown>{form.content}</Streamdown>
          </div>
        ) : (
          <p className="text-[oklch(0.40_0.02_240)] font-['Noto_Sans_JP'] italic">（本文未入力）</p>
        )}
      </div>
    </div>
  );
}

// ─── Tackle Manager Sub-component ───────────────────────────────────────────
function TackleManager({ postId }: { postId: number }) {
  const utils = trpc.useUtils();
  const [tackleForm, setTackleForm] = useState<TackleForm>(emptyTackleForm);
  const [editTackleId, setEditTackleId] = useState<number | null>(null);
  const [tackleError, setTackleError] = useState<string | null>(null);

  const { data: tackles = [] } = trpc.tackles.byPostId.useQuery({ postId });

  const createTackle = trpc.tackles.create.useMutation({
    onSuccess: () => {
      utils.tackles.byPostId.invalidate({ postId });
      setTackleForm(emptyTackleForm);
      setEditTackleId(null);
    },
    onError: (e) => setTackleError(e.message),
  });

  const updateTackle = trpc.tackles.update.useMutation({
    onSuccess: () => {
      utils.tackles.byPostId.invalidate({ postId });
      setTackleForm(emptyTackleForm);
      setEditTackleId(null);
    },
    onError: (e) => setTackleError(e.message),
  });

  const deleteTackle = trpc.tackles.delete.useMutation({
    onSuccess: () => utils.tackles.byPostId.invalidate({ postId }),
    onError: (e) => setTackleError(e.message),
  });

  const inputClass =
    "w-full bg-[oklch(0.10_0.025_240)] border border-[oklch(0.22_0.03_240)] rounded px-3 py-2 text-white text-sm font-['Noto_Sans_JP'] focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors";
  const labelClass =
    "block text-xs text-[oklch(0.50_0.02_240)] font-['Space_Mono'] mb-1 uppercase tracking-wider";

  function handleTackleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTackleError(null);
    const payload = {
      postId,
      name: tackleForm.name,
      imageUrl: tackleForm.imageUrl || undefined,
      amazonUrl: tackleForm.amazonUrl || undefined,
      rakutenUrl: tackleForm.rakutenUrl || undefined,
      yahooUrl: tackleForm.yahooUrl || undefined,
      sortOrder: parseInt(tackleForm.sortOrder) || 0,
    };
    if (editTackleId !== null) {
      updateTackle.mutate({ id: editTackleId, data: payload });
    } else {
      createTackle.mutate(payload);
    }
  }

  function handleEditTackle(t: any) {
    setEditTackleId(t.id);
    setTackleForm({
      name: t.name ?? "",
      imageUrl: t.imageUrl ?? "",
      amazonUrl: t.amazonUrl ?? "",
      rakutenUrl: t.rakutenUrl ?? "",
      yahooUrl: t.yahooUrl ?? "",
      sortOrder: String(t.sortOrder ?? 0),
    });
  }

  return (
    <div className="border border-[oklch(0.22_0.03_240)] rounded-lg p-5 mt-6">
      <h3 className="text-[oklch(0.75_0.12_55)] font-['Space_Mono'] text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>🪝</span> 使用タックル・アフィリエイトリンク
      </h3>

      {tackles.length > 0 && (
        <div className="space-y-2 mb-5">
          {tackles.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 bg-[oklch(0.10_0.025_240)] border border-[oklch(0.18_0.02_240)] rounded px-4 py-3"
            >
              {t.imageUrl && (
                <img src={t.imageUrl} alt={t.name} className="w-12 h-12 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-['Noto_Sans_JP'] font-bold truncate">{t.name}</p>
                <div className="flex gap-2 mt-1">
                  {t.amazonUrl && <span className="text-xs text-orange-400 font-['Space_Mono']">Amazon ✓</span>}
                  {t.rakutenUrl && <span className="text-xs text-red-400 font-['Space_Mono']">楽天 ✓</span>}
                  {t.yahooUrl && <span className="text-xs text-purple-400 font-['Space_Mono']">Yahoo ✓</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEditTackle(t)}
                  className="px-2 py-1 text-xs border border-[oklch(0.65_0.15_190/0.5)] text-[oklch(0.65_0.15_190)] rounded font-['Space_Mono'] hover:bg-[oklch(0.65_0.15_190/0.1)] transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => {
                    if (confirm(`「${t.name}」を削除しますか？`)) {
                      deleteTackle.mutate({ id: t.id });
                    }
                  }}
                  className="px-2 py-1 text-xs border border-red-900/50 text-red-400 rounded font-['Space_Mono'] hover:bg-red-900/20 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleTackleSubmit} className="space-y-3">
        <p className="text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP']">
          {editTackleId !== null ? "タックルを編集中" : "+ タックルを追加"}
        </p>
        {tackleError && <p className="text-xs text-red-400 font-['Noto_Sans_JP']">{tackleError}</p>}
        <div>
          <label className={labelClass}>商品名 *</label>
          <input
            type="text"
            required
            value={tackleForm.name}
            onChange={(e) => setTackleForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="例: ゼスタ スロースタイル SSD #3"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>商品画像URL</label>
          <input
            type="text"
            value={tackleForm.imageUrl}
            onChange={(e) => setTackleForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClass}>🛒 Amazonアフィリエイトリンク</label>
            <input type="text" value={tackleForm.amazonUrl} onChange={(e) => setTackleForm((p) => ({ ...p, amazonUrl: e.target.value }))} placeholder="https://amzn.to/..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>🛒 楽天アフィリエイトリンク</label>
            <input type="text" value={tackleForm.rakutenUrl} onChange={(e) => setTackleForm((p) => ({ ...p, rakutenUrl: e.target.value }))} placeholder="https://hb.afl.rakuten.co.jp/..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>🛒 Yahoo!ショッピングリンク</label>
            <input type="text" value={tackleForm.yahooUrl} onChange={(e) => setTackleForm((p) => ({ ...p, yahooUrl: e.target.value }))} placeholder="https://ck.jp.ap.valuecommerce.com/..." className={inputClass} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={createTackle.isPending || updateTackle.isPending}
            className="px-4 py-2 bg-[oklch(0.75_0.12_55)] text-[oklch(0.08_0.025_240)] font-bold rounded text-xs font-['Space_Mono'] hover:bg-[oklch(0.80_0.12_55)] disabled:opacity-50 transition-colors"
          >
            {editTackleId !== null ? "更新" : "追加"}
          </button>
          {editTackleId !== null && (
            <button
              type="button"
              onClick={() => { setEditTackleId(null); setTackleForm(emptyTackleForm); }}
              className="px-4 py-2 border border-[oklch(0.30_0.03_240)] text-[oklch(0.55_0.02_240)] rounded text-xs font-['Space_Mono'] hover:border-[oklch(0.50_0.03_240)] transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading } = useAuth();
  const [adminSection, setAdminSection] = useState<"posts" | "comments" | "members">("posts");
  const [view, setView] = useState<"list" | "create" | "edit" | "preview">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { data: posts, refetch } = trpc.posts.adminList.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const { data: allComments = [], refetch: refetchComments, isLoading: commentsLoading, isError: commentsError } = trpc.comments.adminList.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const approveComment = trpc.comments.approve.useMutation({ onSuccess: () => refetchComments() });
  const deleteComment = trpc.comments.delete.useMutation({ onSuccess: () => refetchComments() });
  const { data: allMembers = [], isLoading: membersLoading, isError: membersError } = trpc.blogMembers.adminList.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: (created) => {
      setSuccess("記事を作成しました。下のタックルセクションからアフィリエイト商品を追加できます。");
      setEditId(created?.id ?? null);
      setView("edit");
      refetch();
    },
    onError: (e) => setError(e.message),
    onSettled: () => setSaving(false),
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      setSuccess("記事を更新しました");
      refetch();
    },
    onError: (e) => setError(e.message),
    onSettled: () => setSaving(false),
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      setSuccess("記事を削除しました");
      refetch();
    },
    onError: (e) => setError(e.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.025_240)] flex items-center justify-center">
        <div className="text-[oklch(0.65_0.15_190)] font-['Space_Mono'] text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.025_240)] flex flex-col items-center justify-center gap-6">
        <SPJLogo size={56} />
        <p className="text-white font-['Noto_Sans_JP']">管理ページにアクセスするにはログインが必要です</p>
        <a href={getLoginUrl()} className="px-6 py-3 bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold rounded font-['Space_Mono'] text-sm">
          ログイン
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.025_240)] flex flex-col items-center justify-center gap-4">
        <SPJLogo size={56} />
        <p className="text-white font-['Noto_Sans_JP']">管理者権限が必要です</p>
        <a href="/" className="text-[oklch(0.65_0.15_190)] text-sm font-['Space_Mono']">← ホームに戻る</a>
      </div>
    );
  }

  function handleFormChange(field: keyof PostForm, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && (view === "create")) {
        next.slug = slugify(value as string);
      }
      return next;
    });
    setError(null);
  }

  function handleEdit(post: any) {
    setEditId(post.id);
    setForm({
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      category: post.category ?? "釣果記録",
      coverImage: post.coverImage ?? "",
      published: post.published ?? false,
      fishingDate: post.fishingDate ? new Date(post.fishingDate).toISOString().slice(0, 10) : "",
      location: post.location ?? "",
      depth: post.depth != null ? String(post.depth) : "",
      maxWeight: post.maxWeight != null ? String(post.maxWeight) : "",
      species: post.species ?? "",
      tags: post.tags ?? "",
      membersOnly: post.membersOnly ?? false,
    });
    setView("edit");
    setError(null);
    setSuccess(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || undefined,
      content: form.content,
      category: form.category,
      coverImage: form.coverImage || undefined,
      published: form.published,
      fishingDate: form.fishingDate || undefined,
      location: form.location || undefined,
      depth: form.depth ? parseInt(form.depth) : undefined,
      maxWeight: form.maxWeight ? parseFloat(form.maxWeight) : undefined,
      species: form.species || undefined,
      tags: form.tags || undefined,
      membersOnly: form.membersOnly,
    };
    if (view === "create") {
      createMutation.mutate(payload);
    } else if (view === "edit" && editId !== null) {
      updateMutation.mutate({ id: editId, data: payload });
    }
  }

  // Insert markdown at cursor position in content textarea
  function insertIntoContent(markdown: string) {
    const ta = contentRef.current;
    if (!ta) {
      setForm((p) => ({ ...p, content: p.content + "\n\n" + markdown + "\n\n" }));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const newContent = before + (before.length > 0 && !before.endsWith("\n") ? "\n\n" : "") + markdown + "\n\n" + after;
    setForm((p) => ({ ...p, content: newContent }));
    setTimeout(() => {
      const pos = (before.length > 0 && !before.endsWith("\n") ? before.length + 2 : before.length) + markdown.length + 2;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    }, 0);
  }

  const inputClass =
    "w-full bg-[oklch(0.12_0.025_240)] border border-[oklch(0.25_0.03_240)] rounded px-3 py-2 text-white text-sm font-['Noto_Sans_JP'] focus:outline-none focus:border-[oklch(0.65_0.15_190)] transition-colors";
  const labelClass =
    "block text-xs text-[oklch(0.55_0.02_240)] font-['Space_Mono'] mb-1 uppercase tracking-wider";

  // Preview overlay
  if (view === "preview") {
    return (
      <ArticlePreview
        form={form}
        onClose={() => setView(editId !== null ? "edit" : "create")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.025_240)]">
      {/* Header */}
      <header className="bg-[oklch(0.10_0.025_240)] border-b border-[oklch(0.20_0.03_240)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SPJLogo size={36} />
          <div>
            <h1 className="text-white font-['Playfair_Display'] font-bold text-lg">管理パネル</h1>
            <p className="text-xs text-[oklch(0.50_0.02_240)] font-['Space_Mono']">SPJ Fishing Blog CMS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[oklch(0.55_0.02_240)] font-['Space_Mono']">
            {user.name ?? user.email ?? "Admin"}
          </span>
          <a href="/" className="text-xs text-[oklch(0.65_0.15_190)] font-['Space_Mono'] hover:underline">
            ← サイトを見る
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Alerts */}
        {success && (
          <div className="mb-4 px-4 py-3 bg-[oklch(0.65_0.15_190/0.15)] border border-[oklch(0.65_0.15_190/0.4)] rounded text-[oklch(0.65_0.15_190)] text-sm font-['Noto_Sans_JP']">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[oklch(0.55_0.20_25/0.15)] border border-[oklch(0.55_0.20_25/0.4)] rounded text-[oklch(0.70_0.15_25)] text-sm font-['Noto_Sans_JP']">
            エラー: {error}
          </div>
        )}

        {/* Section Navigation */}
        <div className="flex gap-2 mb-6 border-b border-[oklch(0.20_0.03_240)] pb-4">
          <button
            onClick={() => setAdminSection("posts")}
            className={`px-4 py-2 rounded text-sm font-['Space_Mono'] transition-colors ${adminSection === "posts" ? "bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold" : "text-[oklch(0.55_0.02_240)] hover:text-white border border-[oklch(0.25_0.03_240)]"}`}
          >
            📝 記事管理
          </button>
          <button
            onClick={() => setAdminSection("comments")}
            className={`px-4 py-2 rounded text-sm font-['Space_Mono'] transition-colors ${adminSection === "comments" ? "bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold" : "text-[oklch(0.55_0.02_240)] hover:text-white border border-[oklch(0.25_0.03_240)]"}`}
          >
            💬 コメント管理
            {(allComments as any[]).filter((c: any) => !c.approved).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {(allComments as any[]).filter((c: any) => !c.approved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminSection("members")}
            className={`px-4 py-2 rounded text-sm font-['Space_Mono'] transition-colors ${adminSection === "members" ? "bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold" : "text-[oklch(0.55_0.02_240)] hover:text-white border border-[oklch(0.25_0.03_240)]"}`}
          >
            👥 会員一覧
            {(allMembers as any[]).length > 0 && (
              <span className="ml-2 bg-[oklch(0.65_0.15_190/0.3)] text-[oklch(0.65_0.15_190)] text-[10px] px-1.5 py-0.5 rounded-full">
                {(allMembers as any[]).length}
              </span>
            )}
          </button>
        </div>

        {/* Comments Section */}
        {adminSection === "comments" && (
          <div>
            <h2 className="text-white font-['Playfair_Display'] text-2xl font-bold mb-6">コメント管理</h2>
            {commentsLoading ? (
              <div className="flex items-center gap-3 text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] text-sm py-8">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
                読み込み中…
              </div>
            ) : commentsError ? (
              <div className="text-red-400 font-['Noto_Sans_JP'] text-sm py-4">⚠️ コメントの取得に失敗しました。</div>
            ) : (allComments as any[]).length === 0 ? (
              <p className="text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP'] text-sm">コメントはまだありません。</p>
            ) : (
              <div className="space-y-3">
                {(allComments as any[]).map((c: any) => (
                  <div key={c.id} className={`glass-card rounded-lg p-5 border ${c.approved ? "border-[oklch(0.25_0.03_240)]" : "border-[oklch(0.55_0.20_25/0.5)]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white font-['Noto_Sans_JP']">{c.authorName}</span>
                          {c.isVerifiedMember && (
                            <span className="text-[10px] bg-[oklch(0.65_0.15_190/0.2)] text-[oklch(0.65_0.15_190)] border border-[oklch(0.65_0.15_190/0.4)] px-2 py-0.5 rounded-full font-['Space_Mono']">会員</span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-['Space_Mono'] ${c.approved ? "bg-green-900/30 text-green-400 border border-green-700/40" : "bg-orange-900/30 text-orange-400 border border-orange-700/40"}`}>
                            {c.approved ? "承認済み" : "承認待ち"}
                          </span>
                          <span className="text-xs text-[oklch(0.40_0.02_240)] font-['Space_Mono'] ml-auto">
                            {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <p className="text-xs text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] mb-2">記事ID: {c.postId}</p>
                        <p className="text-sm text-[oklch(0.70_0.02_240)] font-['Noto_Sans_JP'] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {!c.approved && (
                          <button onClick={() => approveComment.mutate({ id: c.id })} disabled={approveComment.isPending} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded font-['Space_Mono'] transition-colors disabled:opacity-50">承認</button>
                        )}
                        <button onClick={() => { if (confirm("このコメントを削除しますか？")) deleteComment.mutate({ id: c.id }); }} disabled={deleteComment.isPending} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs rounded font-['Space_Mono'] transition-colors disabled:opacity-50">削除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Section */}
        {adminSection === "members" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-['Playfair_Display'] text-2xl font-bold">会員一覧</h2>
              <button
                onClick={() => {
                  const headers = ["ID", "ユーザー名", "メールアドレス", "居住地", "年代", "性別", "ターゲット魚種", "認証済み", "登録日"];
                  const rows = (allMembers as any[]).map((m: any) => [
                    m.id, m.username ?? "", m.email ?? "", m.homeArea ?? "", m.age ?? "", m.gender ?? "", m.targetFish ?? "",
                    m.isVerified ? "済" : "未",
                    m.createdAt ? new Date(m.createdAt).toLocaleDateString("ja-JP") : "",
                  ]);
                  const csv = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "members.csv"; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 border border-[oklch(0.65_0.15_190/0.5)] text-[oklch(0.65_0.15_190)] rounded text-sm font-['Space_Mono'] hover:bg-[oklch(0.65_0.15_190/0.1)] transition-colors"
              >
                ⬇ CSVエクスポート
              </button>
            </div>
            {membersLoading ? (
              <div className="flex items-center gap-3 text-[oklch(0.55_0.02_240)] font-['Noto_Sans_JP'] text-sm py-8">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
                読み込み中…
              </div>
            ) : membersError ? (
              <div className="text-red-400 font-['Noto_Sans_JP'] text-sm py-4">⚠️ 会員一覧の取得に失敗しました。</div>
            ) : (allMembers as any[]).length === 0 ? (
              <p className="text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP'] text-sm">会員はまだいません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[oklch(0.22_0.03_240)]">
                      {["ID", "ユーザー名", "メール", "居住地", "年代", "性別", "ターゲット魚種", "認証", "登録日"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-[oklch(0.50_0.02_240)] font-['Space_Mono'] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(allMembers as any[]).map((m: any) => (
                      <tr key={m.id} className="border-b border-[oklch(0.15_0.02_240)] hover:bg-[oklch(0.15_0.02_240/0.5)] transition-colors">
                        <td className="py-2.5 px-3 text-[oklch(0.45_0.02_240)] font-['Space_Mono']">{m.id}</td>
                        <td className="py-2.5 px-3 text-white font-['Noto_Sans_JP'] font-semibold">{m.username}</td>
                        <td className="py-2.5 px-3 text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">{m.email ?? "—"}</td>
                        <td className="py-2.5 px-3 text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">{m.homeArea ?? "—"}</td>
                        <td className="py-2.5 px-3 text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">{m.age ?? "—"}</td>
                        <td className="py-2.5 px-3 text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP']">{m.gender ?? "—"}</td>
                        <td className="py-2.5 px-3 text-[oklch(0.60_0.02_240)] font-['Noto_Sans_JP'] max-w-[160px] truncate">{m.targetFish ?? "—"}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-['Space_Mono'] ${m.isVerified ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                            {m.isVerified ? "済" : "未"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[oklch(0.45_0.02_240)] font-['Space_Mono'] whitespace-nowrap">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString("ja-JP") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Posts Section */}
        {adminSection === "posts" && (
          <>
            {/* List View */}
            {view === "list" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-['Playfair_Display'] text-2xl font-bold">記事一覧</h2>
                  <button
                    onClick={() => { setForm(emptyForm); setView("create"); setError(null); setSuccess(null); }}
                    className="px-4 py-2 bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold rounded text-sm font-['Space_Mono'] hover:bg-[oklch(0.70_0.15_190)] transition-colors"
                  >
                    + 新規記事
                  </button>
                </div>
                {!posts || posts.length === 0 ? (
                  <div className="text-center py-16 text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP']">
                    記事がまだありません。「新規記事」から作成してください。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-[oklch(0.11_0.025_240)] border border-[oklch(0.20_0.03_240)] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-[oklch(0.65_0.15_190/0.15)] text-[oklch(0.65_0.15_190)] font-['Space_Mono']">{post.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-['Space_Mono'] ${post.published ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                              {post.published ? "公開中" : "下書き"}
                            </span>
                          </div>
                          <h3 className="text-white font-['Noto_Sans_JP'] font-bold truncate">{post.title}</h3>
                          <p className="text-xs text-[oklch(0.45_0.02_240)] font-['Space_Mono'] mt-1">
                            {post.location && `📍 ${post.location}  `}
                            {post.fishingDate && new Date(post.fishingDate).toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(post)}
                            className="px-3 py-1.5 text-xs border border-[oklch(0.65_0.15_190/0.5)] text-[oklch(0.65_0.15_190)] rounded font-['Space_Mono'] hover:bg-[oklch(0.65_0.15_190/0.1)] transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`「${post.title}」を削除しますか？この操作は取り消せません。`)) {
                                deleteMutation.mutate({ id: post.id });
                              }
                            }}
                            className="px-3 py-1.5 text-xs border border-red-900/50 text-red-400 rounded font-['Space_Mono'] hover:bg-red-900/20 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create / Edit Form */}
            {(view === "create" || view === "edit") && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => { setView("list"); setError(null); setSuccess(null); }}
                    className="text-[oklch(0.55_0.02_240)] hover:text-white font-['Space_Mono'] text-sm transition-colors"
                  >
                    ← 戻る
                  </button>
                  <h2 className="text-white font-['Playfair_Display'] text-2xl font-bold">
                    {view === "create" ? "新規記事作成" : "記事を編集"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className={labelClass}>タイトル *</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      placeholder="記事タイトルを入力"
                      className={inputClass}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className={labelClass}>スラッグ（URL の一部）*</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Space_Mono'] shrink-0">/article/</span>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => handleFormChange("slug", e.target.value)}
                        placeholder="article-slug"
                        className={inputClass}
                      />
                    </div>
                    <p className="text-[10px] text-[oklch(0.40_0.02_240)] font-['Noto_Sans_JP'] mt-1">
                      半角英数字とハイフンのみ使用可。タイトル入力時に自動生成されます。
                    </p>
                  </div>

                  {/* Category & Published */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>カテゴリ *</label>
                      <select
                        value={form.category}
                        onChange={(e) => handleFormChange("category", e.target.value)}
                        className={inputClass}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.published}
                          onChange={(e) => handleFormChange("published", e.target.checked)}
                          className="w-4 h-4 accent-[oklch(0.65_0.15_190)]"
                        />
                        <span className="text-sm text-white font-['Noto_Sans_JP']">公開する</span>
                      </label>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className={labelClass}>概要（一覧表示用）</label>
                    <textarea
                      rows={2}
                      value={form.excerpt}
                      onChange={(e) => handleFormChange("excerpt", e.target.value)}
                      placeholder="記事の概要を入力（省略可）"
                      className={inputClass + " resize-none"}
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className={labelClass}>カバー画像</label>
                    <CoverImageField
                      value={form.coverImage}
                      onChange={(url) => handleFormChange("coverImage", url)}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelClass + " mb-0"}>本文（Markdown）*</label>
                    </div>
                    <div className="mb-2">
                      <InlineImageInserter onInsert={insertIntoContent} />
                    </div>
                    <textarea
                      ref={contentRef}
                      rows={16}
                      required
                      value={form.content}
                      onChange={(e) => handleFormChange("content", e.target.value)}
                      placeholder="記事本文をMarkdown形式で入力&#10;&#10;# 見出し&#10;&#10;本文テキスト&#10;&#10;![画像の説明](/manus-storage/...)"
                      className={inputClass + " resize-y font-mono text-xs leading-relaxed"}
                    />
                    <p className="text-[10px] text-[oklch(0.40_0.02_240)] font-['Noto_Sans_JP'] mt-1">
                      Markdown形式で記述できます。「本文に画像を挿入」ボタンで画像を追加できます。
                    </p>
                  </div>

                  {/* Fishing Metadata */}
                  <div className="border border-[oklch(0.20_0.03_240)] rounded-lg p-4">
                    <h3 className="text-[oklch(0.65_0.15_190)] font-['Space_Mono'] text-xs uppercase tracking-wider mb-4">
                      釣行データ（任意）
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>釣行日</label>
                        <input type="date" value={form.fishingDate} onChange={(e) => handleFormChange("fishingDate", e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>場所</label>
                        <input type="text" value={form.location} onChange={(e) => handleFormChange("location", e.target.value)} placeholder="例: 相模湾" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>水深 (m)</label>
                        <input type="number" value={form.depth} onChange={(e) => handleFormChange("depth", e.target.value)} placeholder="150" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>最大魚体 (kg)</label>
                        <input type="number" step="0.1" value={form.maxWeight} onChange={(e) => handleFormChange("maxWeight", e.target.value)} placeholder="8.2" className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>魚種</label>
                        <input type="text" value={form.species} onChange={(e) => handleFormChange("species", e.target.value)} placeholder="例: ブリ・マダイ" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Tags & Members Only */}
                  <div className="border border-[oklch(0.22_0.03_240)] rounded-lg p-5">
                    <h3 className="text-[oklch(0.65_0.15_190)] font-['Space_Mono'] text-xs uppercase tracking-wider mb-4">タグ・公開設定</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>タグ（カンマ区切り）</label>
                        <input type="text" value={form.tags} onChange={(e) => handleFormChange("tags", e.target.value)} placeholder="例: ロッド,リール,ジグ" className={inputClass} />
                        <p className="text-xs text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP'] mt-1">
                          タックル記事の場合: ロッド / リール / ジグ / ライン / フック
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.membersOnly}
                            onChange={(e) => handleFormChange("membersOnly", e.target.checked)}
                            className="w-4 h-4 accent-[oklch(0.65_0.15_190)]"
                          />
                          <span className="text-sm text-white font-['Noto_Sans_JP']">会員限定記事</span>
                        </label>
                        <span className="text-xs text-[oklch(0.45_0.02_240)] font-['Noto_Sans_JP']">（非会員には冒頭のみ表示）</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit + Preview */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[oklch(0.65_0.15_190)] text-[oklch(0.08_0.025_240)] font-bold rounded font-['Space_Mono'] text-sm hover:bg-[oklch(0.70_0.15_190)] disabled:opacity-50 transition-colors"
                    >
                      {saving ? "保存中..." : view === "create" ? "記事を作成" : "変更を保存"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("preview")}
                      className="px-6 py-2.5 border border-[oklch(0.65_0.15_190/0.6)] text-[oklch(0.65_0.15_190)] rounded font-['Space_Mono'] text-sm hover:bg-[oklch(0.65_0.15_190/0.1)] transition-colors"
                    >
                      👁 プレビュー
                    </button>
                    <button
                      type="button"
                      onClick={() => { setView("list"); setError(null); }}
                      className="px-6 py-2.5 border border-[oklch(0.30_0.03_240)] text-[oklch(0.60_0.02_240)] rounded font-['Space_Mono'] text-sm hover:border-[oklch(0.50_0.03_240)] transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>

                {/* Tackle Manager — only shown when editing an existing post */}
                {view === "edit" && editId !== null && (
                  <TackleManager postId={editId} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
