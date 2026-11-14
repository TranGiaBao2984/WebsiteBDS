/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import DeleteButton from '@/app/front/admin/DeleteButton';
import type { Property } from '@/lib/types';

function getCleanText(val: unknown): string {
  if (!val) return '';
  let current: unknown = val;

  for (let i = 0; i < 10; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      } else {
        break;
      }
    } else if (typeof current === 'object' && current !== null) {
      const record = current as Record<string, unknown>;
      current = record.vi ?? record.en ?? record.ja ?? Object.values(record)[0] ?? '';
    } else {
      break;
    }
  }

  return typeof current === 'string' ? current : String(current || '');
}

function parseImages(val: unknown): string[] {
  if (!val) return [];
  let current: unknown = val;

  for (let i = 0; i < 5; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const content = trimmed.slice(1, -1);
        if (!content) return [];
        return content
          .split(',')
          .map((s) => s.replace(/^"|"$/g, '').trim())
          .filter(Boolean);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(current)) {
    return current.map((item) => getCleanText(item)).filter(Boolean);
  }

  if (typeof current === 'string' && current.trim()) {
    return [current.trim()];
  }

  return [];
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#99F6E4] bg-white/80 p-12 text-center shadow-[0_4px_6px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F766E]/25 border-t-[#0F766E]"
            />
            <span className="text-xs font-medium text-[#475569]">
              Đang tải dữ liệu quản trị...
            </span>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  // Khai báo cho Next.js 16 Cache Components render component này ở Request Time
  await connection();

  const { supabase } = await requireAdmin();

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const propertyList = (properties || []) as Property[];

  return (
    <div className="mx-auto max-w-350 space-y-6 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#99F6E4]/80 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Bảng điều khiển
          </p>
          <h1 className="mt-0.5 font-serif text-2xl font-bold text-[#134E4A] sm:text-3xl">
            Quản lý Bất động sản
          </h1>
          <p className="mt-1 text-xs text-[#475569] sm:text-sm">
            Thêm, sửa hoặc xoá các căn đang hiển thị trên website.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0369A1] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Thêm mới BĐS</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#99F6E4] bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#475569] shadow-2xs backdrop-blur-sm">
          <BuildingIcon className="h-3.5 w-3.5 text-[#0F766E]" />
          <span>
            Tổng cộng <strong className="font-bold text-[#0F766E]">{propertyList.length}</strong> bất động sản
          </span>
        </div>
      </div>

      {propertyList.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-[#99F6E4] bg-white/80 p-12 text-center shadow-[0_4px_6px_rgba(0,0,0,0.06)] backdrop-blur-md">
          <p className="text-sm font-semibold text-[#134E4A]">
            Chưa có bất động sản nào được đăng tải.
          </p>
          <p className="text-xs text-[#475569]">
            Bấm nút “Thêm mới BĐS” ở góc trên để tạo bài đăng đầu tiên.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {propertyList.map((item) => {
            const title = getCleanText(item.title) || 'Bất động sản';
            const location = getCleanText(item.location) || 'Nhật Bản';
            const images = parseImages(item.images);
            const mainImage =
              images[0] ||
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
            const priceYen = item.price_yen || item.price || 0;

            return (
              <div
                key={item.id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#99F6E4] bg-white/85 p-4 shadow-[0_4px_6px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-200 hover:border-[#14B8A6] hover:bg-white sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex w-full items-center gap-4 sm:w-auto">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA] sm:h-24 sm:w-32">
                    <img
                      src={mainImage}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#0F766E]" />
                      <span className="truncate">{location}</span>
                    </span>
                    <h2 className="line-clamp-1 font-serif text-base font-bold text-[#134E4A] sm:text-lg">
                      {title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                      <span className="text-sm font-bold text-[#0F766E] sm:text-base">
                        ¥{priceYen.toLocaleString('ja-JP')}
                      </span>
                      <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                        {item.status || 'AVAILABLE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center justify-end gap-2 border-t border-[#E8F0F3] pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                  <Link
                    href={`/properties/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#99F6E4] bg-white px-3 py-1.5 text-xs font-semibold text-[#134E4A] transition-all duration-200 hover:border-[#0F766E] hover:bg-[#F0FDFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                  >
                    <EyeIcon className="h-3.5 w-3.5 text-[#0F766E]" />
                    <span>Xem</span>
                  </Link>
                  <Link
                    href={`/admin/${item.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all duration-200 hover:bg-[#115E59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span>Sửa</span>
                  </Link>
                  <DeleteButton id={item.id} title={title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}