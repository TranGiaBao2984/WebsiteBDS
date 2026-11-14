/* eslint-disable @next/next/no-img-element */
'use client';

import { useId, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { IMAGE_BUCKET } from '@/lib/storage';

const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

async function compressToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Không nén được ảnh.'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  );
}

async function uploadImage(file: File): Promise<string> {
  const blob = await compressToJpeg(file);
  const supabase = createSupabaseBrowser();
  const path = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
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

const SMALL_BTN =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-[#134E4A]/85 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40';

export default function ImageUploader({
  label,
  hint,
  value,
  onChange,
  max,
  error,
  onBusyChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  error?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [urlText, setUrlText] = useState('');

  const full = value.length >= max;

  const setBusyBoth = (b: boolean) => {
    setBusy(b);
    onBusyChange?.(b);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || busy) return;
    const files = Array.from(fileList).slice(0, max - value.length);
    const errs: string[] = [];

    setProblems([]);
    setBusyBoth(true);

    let next = value;
    for (let i = 0; i < files.length; i++) {
      setProgress(`Đang tải ${i + 1}/${files.length}...`);
      try {
        const url = await uploadImage(files[i]);
        next = [...next, url];
        onChange(next);
      } catch (e) {
        errs.push(`${files[i].name}: ${e instanceof Error ? e.message : 'lỗi không xác định'}`);
      }
    }

    if (fileList.length > files.length) {
      errs.push(`Chỉ nhận tối đa ${max} ảnh, các ảnh dư đã bị bỏ qua.`);
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

  const addUrl = () => {
    const u = urlText.trim();
    if (!u || full) return;
    if (!isHttpUrl(u)) {
      setProblems(['Link ảnh không hợp lệ (phải bắt đầu bằng http hoặc https).']);
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
          {value.length}/{max}
        </span>
      </div>

      {value.length > 0 && (
        <ul
          className={`grid gap-3.5 ${
            max === 1 ? 'grid-cols-1 sm:max-w-xs' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {value.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="group relative overflow-hidden rounded-xl border border-[#99F6E4] bg-[#E8F0F3]/60 shadow-xs"
            >
              <img src={url} alt={`${label} ${i + 1}`} className="aspect-4/3 w-full object-cover" />

              {max > 1 && i === 0 && (
                <span className="absolute top-2 left-2 rounded-md border border-white/20 bg-[#0F766E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Ảnh bìa
                </span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5">
                {max > 1 ? (
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
            </li>
          ))}
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
                  : max === 1
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
          multiple={max > 1}
          disabled={busy || full}
          className="sr-only"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

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