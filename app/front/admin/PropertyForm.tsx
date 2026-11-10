'use client';

import { useId, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { saveProperty } from '@/app/back/admin';
import { formatPrice } from '@/lib/format';
import { MAX_IMAGES, type FieldErrors, type PropertyInput } from '@/lib/property-schema';
import type { Property } from '@/lib/types';
import ImageUploader from './ImageUploader';

const FIELD =
  'w-full rounded-xl border border-[#e6dfd5] bg-[#f8f6f0] px-3.5 py-3 text-base text-[#2c2623] placeholder:text-[#b0a499] transition focus:border-[#8c6d53] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8c6d53]/15 md:text-sm';

type TextKey = Exclude<keyof PropertyInput, 'images' | 'floor_plan'>;

function toInput(p?: Property): PropertyInput {
  return {
    title: p?.title ?? '',
    price: p?.price != null ? String(p.price) : '',
    location: p?.location ?? '',
    current_status: p?.current_status ?? '',
    layout: p?.layout ?? '',
    structure: p?.structure ?? '',
    building_size: p?.building_size ?? '',
    land_size: p?.land_size ?? '',
    year_built: p?.year_built != null ? String(p.year_built) : '',
    parking: p?.parking ?? '',
    land_rights: p?.land_rights ?? '',
    zoning: p?.zoning ?? '',
    access: p?.access ?? '',
    description: p?.description ?? '',
    images: p?.images ?? [],
    floor_plan: p?.floor_plan ?? '',
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-3xl border border-[#e6dfd5] bg-white p-5 shadow-sm sm:p-8">
      <h2 className="font-serif text-lg font-bold text-[#2c2623]">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-[#574d43]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#8c827a]">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-[11px] font-medium text-[#8a3b1d]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function PropertyForm({ property }: { property?: Property }) {
  const uid = useId();
  const [v, setV] = useState<PropertyInput>(() => toInput(property));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (key: TextKey) => (e: { target: { value: string } }) =>
    setV((prev) => ({ ...prev, [key]: e.target.value }));

  // Props chung cho ô nhập: id, giá trị, thông báo lỗi liên kết với ô
  const input = (key: TextKey) => ({
    id: `${uid}-${key}`,
    value: v[key],
    onChange: set(key),
    'aria-invalid': errors[key] ? (true as const) : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-error` : undefined,
    className: `${FIELD} ${errors[key] ? 'border-[#d9a28c]' : ''}`,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || uploading) return;
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      try {
        // Lưu thành công thì server tự chuyển về /admin
        const res = await saveProperty(property?.id ?? null, v);
        if (res && !res.ok) {
          setFormError(res.error);
          setErrors(res.fieldErrors ?? {});
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        setFormError('Không kết nối được. Hãy kiểm tra mạng và thử lại.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const pricePreview = v.price.trim() ? formatPrice(v.price.replace(/[,\s¥]/g, '')) : null;

  return (
    <form onSubmit={handleSubmit} aria-busy={pending} className="space-y-6 pb-24">
      {formError && (
        <p role="alert" className="rounded-xl border border-[#e3c9bd] bg-[#fbf1ec] px-4 py-3 text-sm leading-relaxed text-[#8a3b1d]">
          {formError}
        </p>
      )}

      <Section title="Thông tin chính">
        <Field label="Tiêu đề *" htmlFor={`${uid}-title`} error={errors.title}>
          <input type="text" required maxLength={200} {...input('title')} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Giá (yên) *"
            htmlFor={`${uid}-price`}
            error={errors.price}
            hint={pricePreview && pricePreview !== '—' ? `Hiển thị: ${pricePreview}` : 'Nhập số, ví dụ 25000000'}
          >
            <input type="text" inputMode="numeric" required placeholder="25000000" {...input('price')} />
          </Field>

          <Field label="Địa điểm *" htmlFor={`${uid}-location`} error={errors.location} hint="Ví dụ: Kyoto, Kyoto Prefecture">
            <input type="text" required maxLength={200} {...input('location')} />
          </Field>
        </div>

        <Field label="Tình trạng hiện tại" htmlFor={`${uid}-current_status`} error={errors.current_status}>
          <input type="text" list={`${uid}-status-options`} maxLength={100} placeholder="Vacant" {...input('current_status')} />
          <datalist id={`${uid}-status-options`}>
            <option value="Vacant" />
            <option value="Occupied" />
            <option value="Available" />
            <option value="Under offer" />
            <option value="Sold" />
          </datalist>
        </Field>
      </Section>

      <Section title="Thông số">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Mặt bằng (layout)" htmlFor={`${uid}-layout`} error={errors.layout}>
            <input type="text" maxLength={100} placeholder="3LDK" {...input('layout')} />
          </Field>
          <Field label="Diện tích nhà" htmlFor={`${uid}-building_size`} error={errors.building_size}>
            <input type="text" maxLength={100} placeholder="112 m²" {...input('building_size')} />
          </Field>
          <Field label="Diện tích đất" htmlFor={`${uid}-land_size`} error={errors.land_size}>
            <input type="text" maxLength={100} placeholder="1,040 m²" {...input('land_size')} />
          </Field>
          <Field label="Kết cấu" htmlFor={`${uid}-structure`} error={errors.structure}>
            <input type="text" maxLength={200} placeholder="Traditional wooden" {...input('structure')} />
          </Field>
          <Field label="Năm xây" htmlFor={`${uid}-year_built`} error={errors.year_built}>
            <input type="text" inputMode="numeric" maxLength={4} placeholder="1985" {...input('year_built')} />
          </Field>
          <Field label="Chỗ đậu xe" htmlFor={`${uid}-parking`} error={errors.parking}>
            <input type="text" maxLength={200} placeholder="2 cars" {...input('parking')} />
          </Field>
        </div>
      </Section>

      <Section title="Pháp lý và vị trí">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Quyền đất" htmlFor={`${uid}-land_rights`} error={errors.land_rights}>
            <input type="text" maxLength={200} placeholder="Freehold" {...input('land_rights')} />
          </Field>
          <Field label="Quy hoạch (zoning)" htmlFor={`${uid}-zoning`} error={errors.zoning}>
            <input type="text" maxLength={300} {...input('zoning')} />
          </Field>
        </div>
        <Field label="Giao thông / vị trí" htmlFor={`${uid}-access`} error={errors.access}>
          <input type="text" maxLength={500} placeholder="15 phút lái xe tới ga gần nhất" {...input('access')} />
        </Field>
      </Section>

      <Section title="Mô tả">
        <Field label="Mô tả chi tiết" htmlFor={`${uid}-description`} error={errors.description}>
          <textarea rows={7} maxLength={10000} {...input('description')} className={`${input('description').className} min-h-40 resize-y leading-relaxed`} />
        </Field>
      </Section>

      <Section title="Hình ảnh">
        <ImageUploader
          label="Ảnh bất động sản"
          hint="Ảnh đầu tiên là ảnh bìa hiển thị ngoài danh sách. Ảnh được tự thu nhỏ trước khi tải lên."
          value={v.images}
          onChange={(images) => setV((prev) => ({ ...prev, images }))}
          max={MAX_IMAGES}
          error={errors.images}
          onBusyChange={setUploading}
        />
        <div className="border-t border-[#f0eae1] pt-5">
          <ImageUploader
            label="Ảnh mặt bằng (floor plan)"
            value={v.floor_plan ? [v.floor_plan] : []}
            onChange={(arr) => setV((prev) => ({ ...prev, floor_plan: arr[0] ?? '' }))}
            max={1}
            error={errors.floor_plan}
            onBusyChange={setUploading}
          />
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e6dfd5] bg-[#f8f6f0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {uploading && <span className="mr-auto text-xs text-[#8c827a]">Đang tải ảnh, vui lòng chờ...</span>}
          <Link
            href="/admin"
            className="rounded-xl border border-[#d8cebe] bg-white px-5 py-3 text-xs font-semibold text-[#2c2623] transition hover:bg-[#f3eee7]"
          >
            Huỷ
          </Link>
          <button
            type="submit"
            disabled={pending || uploading}
            className="rounded-xl bg-[#7a482b] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#633a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7a482b]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Đang lưu...' : property ? 'Lưu thay đổi' : 'Thêm bất động sản'}
          </button>
        </div>
      </div>
    </form>
  );
}
