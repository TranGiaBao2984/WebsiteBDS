/* eslint-disable @next/next/no-img-element */
'use client';

import { useId, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { IMAGE_BUCKET } from '@/lib/storage';

const MAX_SIDE = 1600; // cạnh dài tối đa (px) sau khi nén
const JPEG_QUALITY = 0.85;

/** Thu nhỏ + đổi sang JPEG ngay trên máy, ảnh điện thoại vài MB còn khoảng 300 đến 600 KB. */
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

  ctx.fillStyle = '#ffffff'; // ảnh PNG trong suốt (ví dụ bản vẽ mặt bằng) sẽ có nền trắng
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không nén được ảnh.'))), 'image/jpeg', JPEG_QUALITY)
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

const SMALL_BTN =
  'flex h-7 w-7 items-center justify-center rounded-md bg-[#2c2623]/75 text-xs text-white backdrop-blur transition hover:bg-[#2c2623] disabled:cursor-not-allowed disabled:opacity-40';

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

    // Các nút sửa/xoá bị khoá trong lúc tải nên danh sách không bị đổi giữa chừng
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
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#574d43]">{label}</p>
          {hint && <p className="mt-0.5 text-[11px] text-[#8c827a]">{hint}</p>}
        </div>
        <span className="text-[11px] text-[#8c827a]">
          {value.length}/{max}
        </span>
      </div>

      {value.length > 0 && (
        <ul className={`grid gap-3 ${max === 1 ? 'grid-cols-1 sm:max-w-xs' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="relative overflow-hidden rounded-xl border border-[#e6dfd5] bg-[#eae4dc]">
              <img src={url} alt={`${label} ${i + 1}`} className="aspect-4/3 w-full object-cover" />

              {max > 1 && i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-[#7a482b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Ảnh bìa
                </span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
                {max > 1 ? (
                  <div className="flex gap-1">
                    <button type="button" aria-label="Chuyển sang trái" disabled={busy || i === 0} onClick={() => move(i, i - 1)} className={SMALL_BTN}>
                      ←
                    </button>
                    <button type="button" aria-label="Chuyển sang phải" disabled={busy || i === value.length - 1} onClick={() => move(i, i + 1)} className={SMALL_BTN}>
                      →
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                <button type="button" aria-label="Xoá ảnh" disabled={busy} onClick={() => remove(i)} className={SMALL_BTN}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={`${uid}-file`}
          className={`inline-flex cursor-pointer items-center rounded-xl border border-dashed border-[#c8b8a6] bg-white px-4 py-2.5 text-xs font-semibold text-[#574d43] transition hover:border-[#8c6d53] hover:bg-[#f3eee7] ${
            busy || full ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {busy ? progress || 'Đang tải...' : full ? 'Đã đủ số ảnh' : max === 1 ? '+ Chọn ảnh' : '+ Chọn ảnh (chọn được nhiều ảnh)'}
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
            e.target.value = ''; // cho phép chọn lại đúng file đó lần sau
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
          className="min-w-0 flex-1 rounded-xl border border-[#e6dfd5] bg-[#f8f6f0] px-3.5 py-2.5 text-base text-[#2c2623] placeholder:text-[#b0a499] focus:border-[#8c6d53] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8c6d53]/15 disabled:opacity-50 md:text-sm"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={busy || full || !urlText.trim()}
          className="rounded-xl border border-[#d8cebe] bg-white px-4 text-xs font-semibold text-[#2c2623] transition hover:bg-[#f3eee7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thêm
        </button>
      </div>

      {(error || problems.length > 0) && (
        <div role="alert" className="space-y-1 rounded-xl border border-[#e3c9bd] bg-[#fbf1ec] px-4 py-3 text-xs leading-relaxed text-[#8a3b1d]">
          {error && <p>{error}</p>}
          {problems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
