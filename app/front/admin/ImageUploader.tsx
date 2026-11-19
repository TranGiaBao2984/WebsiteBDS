/* eslint-disable @next/next/no-img-element */
'use client';

import { useId, useRef, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { IMAGE_BUCKET } from '@/lib/storage';
import type { ImageCaption } from '@/lib/types';

const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.85;
const MAX_RAW_FILE_BYTES = 20 * 1024 * 1024; // Giới hạn ảnh gốc tối đa 20MB

interface CompressedImageResult {
  blob: Blob;
  ext: 'webp' | 'jpg';
  contentType: 'image/webp' | 'image/jpeg';
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function compressImage(file: File): Promise<CompressedImageResult> {
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new Error('Dung lượng ảnh vượt quá 20MB. Vui lòng chọn ảnh nhẹ hơn.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Ưu tiên xuất WebP để tối ưu tốc độ tải trên 4G; tự động lùi về JPEG nếu trình duyệt không hỗ trợ
  const webpBlob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
  if (webpBlob && webpBlob.type === 'image/webp') {
    return {
      blob: webpBlob,
      ext: 'webp',
      contentType: 'image/webp',
    };
  }

  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);
  if (!jpegBlob) {
    throw new Error('Không nén được ảnh.');
  }

  return {
    blob: jpegBlob,
    ext: 'jpg',
    contentType: 'image/jpeg',
  };
}

async function uploadImage(file: File): Promise<string> {
  const { blob, ext, contentType } = await compressImage(file);
  const supabase = createSupabaseBrowser();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function isHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ImagePlusIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 5h6" />
      <path d="M19 2v6" />
      <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <circle cx="9" cy="9" r="2" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ReplaceIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const SMALL_BTN =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-[#134E4A]/85 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40';

export default function ImageUploader({
  label,
  hint,
  value,
  onChange,
  max,
  captions,
  onCaptionChange,
  error,
  onBusyChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Số ảnh tối đa. Bỏ trống = không giới hạn. */
  max?: number;
  /** Ghi chú song ngữ của từng ảnh, key = URL ảnh. Bỏ trống = ẩn ô ghi chú. */
  captions?: Record<string, ImageCaption>;
  onCaptionChange?: (url: string, caption: ImageCaption) => void;
  error?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [urlText, setUrlText] = useState('');
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  // max không truyền (hoặc Infinity) = không giới hạn số ảnh
  const limit = typeof max === 'number' && Number.isFinite(max) ? max : null;
  const single = limit === 1;
  const full = limit !== null && value.length >= limit;

  const setBusyBoth = (b: boolean) => {
    setBusy(b);
    onBusyChange?.(b);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || busy) return;
    const allFiles = Array.from(fileList);
    const files =
      limit === null ? allFiles : allFiles.slice(0, Math.max(0, limit - value.length));
    const errs: string[] = [];

    setProblems([]);
    setBusyBoth(true);

    let next = [...value];
    for (let i = 0; i < files.length; i++) {
      setProgress(`Đang tối ưu & tải ${i + 1}/${files.length}...`);
      try {
        const url = await uploadImage(files[i]);
        next = [...next, url];
        onChange(next);
      } catch (e) {
        errs.push(
          `${files[i].name}: ${e instanceof Error ? e.message : 'lỗi không xác định'}`
        );
      }
    }

    if (limit !== null && allFiles.length > files.length) {
      errs.push(`Chỉ nhận tối đa ${limit} ảnh, các ảnh dư đã bị bỏ qua.`);
    }
    setProblems(errs);
    setProgress('');
    setBusyBoth(false);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  // Đưa ảnh được chọn lên vị trí đầu tiên (ảnh bìa)
  const setCover = (index: number) => move(index, 0);

  const updateCaption = (url: string, lang: 'en' | 'ja', text: string) => {
    const current = captions?.[url] ?? { en: '', ja: '' };
    onCaptionChange?.(url, { ...current, [lang]: text });
  };

  // Thay ảnh ở vị trí `index` bằng file mới, giữ nguyên vị trí và ghi chú EN/JA
  const startReplace = (index: number) => {
    if (busy) return;
    replaceIndexRef.current = index;
    replaceInputRef.current?.click();
  };

  const handleReplace = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    const index = replaceIndexRef.current;
    replaceIndexRef.current = null;
    if (!file || index === null || busy) return;

    const oldUrl = value[index];
    if (oldUrl === undefined) return;

    setProblems([]);
    setBusyBoth(true);
    setProgress('Đang tối ưu & thay ảnh...');
    try {
      const newUrl = await uploadImage(file);
      const next = [...value];
      next[index] = newUrl;
      onChange(next);

      // Ghi chú đang gắn theo link ảnh nên chuyển sang link mới
      const oldCaption = captions?.[oldUrl];
      if (oldCaption) onCaptionChange?.(newUrl, oldCaption);
    } catch (e) {
      setProblems([`${file.name}: ${e instanceof Error ? e.message : 'lỗi không xác định'}`]);
    }
    setProgress('');
    setBusyBoth(false);
  };

  const addUrl = () => {
    const u = urlText.trim();
    if (!u || full) return;
    if (!isHttpUrl(u)) {
      setProblems(['Link ảnh không hợp lệ (phải bắt đầu bằng http hoặc https).']);
      return;
    }
    if (value.includes(u)) {
      setProblems(['Link ảnh này đã có trong danh sách.']);
      return;
    }
    setProblems([]);
    onChange([...value, u]);
    setUrlText('');
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#134E4A]">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-[#475569]">{hint}</p>}
        </div>
        <span className="rounded-full border border-[#99F6E4] bg-white px-2.5 py-0.5 text-xs font-bold text-[#0F766E]">
          {limit === null ? `${value.length} ảnh` : `${value.length}/${limit}`}
        </span>
      </div>

      {value.length > 0 && (
        <ul
          className={`grid gap-3.5 ${
            single
              ? 'grid-cols-1 sm:max-w-xs'
              : onCaptionChange
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {value.map((url, i) => {
            const caption = captions?.[url];

            return (
              <li
                key={`${url}-${i}`}
                className="group overflow-hidden rounded-xl border border-[#99F6E4] bg-[#E8F0F3]/60 shadow-xs"
              >
                <div className="relative">
                  <img
                    src={url}
                    alt={`${label} ${i + 1}`}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />

                  {!single && i === 0 && (
                    <span className="absolute top-2 left-2 rounded-md border border-white/20 bg-[#0F766E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                      Ảnh bìa
                    </span>
                  )}

                  {!single && i > 0 && (
                    <button
                      type="button"
                      aria-label="Đặt làm ảnh bìa"
                      title="Đặt làm ảnh bìa (đưa lên vị trí đầu tiên)"
                      disabled={busy}
                      onClick={() => setCover(i)}
                      className="absolute top-2 left-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-white/20 bg-[#134E4A]/85 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <StarIcon className="h-3 w-3" />
                      <span>Đặt làm bìa</span>
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Thay ảnh này"
                    title="Thay ảnh này (giữ nguyên ghi chú)"
                    disabled={busy}
                    onClick={() => startReplace(i)}
                    className={`${SMALL_BTN} absolute top-2 right-2`}
                  >
                    <ReplaceIcon className="h-4 w-4" />
                  </button>

                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5">
                    {!single ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          aria-label="Chuyển sang trái"
                          disabled={busy || i === 0}
                          onClick={() => move(i, i - 1)}
                          className={SMALL_BTN}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Chuyển sang phải"
                          disabled={busy || i === value.length - 1}
                          onClick={() => move(i, i + 1)}
                          className={SMALL_BTN}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      aria-label="Xoá ảnh"
                      disabled={busy}
                      onClick={() => remove(i)}
                      className={`${SMALL_BTN} hover:bg-rose-600`}
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {onCaptionChange && (
                  <div className="space-y-1.5 border-t border-[#99F6E4]/70 bg-white/85 p-2">
                    {(['en', 'ja'] as const).map((lang) => (
                      <div key={lang} className="flex items-center gap-1.5">
                        <span className="w-5 shrink-0 text-[10px] font-bold uppercase text-[#0F766E]">
                          {lang}
                        </span>
                        <input
                          type="text"
                          value={caption?.[lang] ?? ''}
                          disabled={busy}
                          onChange={(e) => updateCaption(url, lang, e.target.value)}
                          onKeyDown={(e) => {
                            // Tránh Enter làm submit cả form
                            if (e.key === 'Enter') e.preventDefault();
                          }}
                          placeholder={lang === 'en' ? 'Living room' : 'リビング'}
                          aria-label={`Ghi chú ${lang === 'en' ? 'tiếng Anh' : 'tiếng Nhật'} cho ảnh ${i + 1}`}
                          className="min-w-0 flex-1 rounded-md border border-[#E2E8F0] bg-white px-2 py-1.5 text-xs text-[#134E4A] placeholder:text-[#475569]/55 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15 disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={`${uid}-file`}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[#0F766E]/55 bg-white/90 px-4 py-2.5 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#0F766E] hover:bg-[#F0FDFA] ${
            busy || full ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {busy ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F766E]/30 border-t-[#0F766E]"
              />
              <span>{progress || 'Đang tải...'}</span>
            </>
          ) : (
            <>
              <ImagePlusIcon className="h-4 w-4 shrink-0" />
              <span>
                {full
                  ? 'Đã đủ số ảnh'
                  : single
                  ? 'Chọn ảnh'
                  : 'Chọn ảnh (chọn được nhiều ảnh)'}
              </span>
            </>
          )}
        </label>
        <input
          id={`${uid}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={!single}
          disabled={busy || full}
          className="sr-only"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void handleReplace(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="flex gap-2">
        <input
          type="url"
          inputMode="url"
          value={urlText}
          disabled={busy || full}
          onChange={(e) => setUrlText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="Hoặc dán link ảnh (https://...)"
          aria-label={`${label}: dán link ảnh`}
          className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={busy || full || !urlText.trim()}
          className="cursor-pointer rounded-lg border-2 border-[#0F766E] bg-white px-4 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:bg-[#0F766E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Thêm
        </button>
      </div>

      {(error || problems.length > 0) && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-xs leading-relaxed text-rose-900"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="space-y-1">
            {error && <p className="font-medium">{error}</p>}
            {problems.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}