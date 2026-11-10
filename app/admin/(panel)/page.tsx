/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import DeleteButton from '@/app/front/admin/DeleteButton';

export const instant = false;

interface PropertyItem {
  id: string | number;
  title?: unknown;
  price?: number;
  price_yen?: number;
  location?: unknown;
  current_status?: string;
  status?: string;
  images?: string[];
  created_at?: string;
}

// Hàm bóc tách dữ liệu JSONB / Stringified JSON sang chuỗi hiển thị
function getLangValue(field: unknown): string {
  if (!field) return "";
  if (typeof field === "object" && field !== null) {
    const record = field as Record<string, string>;
    return record.vi || record.en || record.ja || "";
  }
  if (typeof field === "string") {
    const trimmed = field.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed.vi || parsed.en || parsed.ja || "";
        }
      } catch {
        // Giữ nguyên nếu không parse được
      }
    }
    return field;
  }
  return String(field);
}

export default function AdminHomePage() {
  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-[#3c352d]">
      <div className="flex flex-col gap-4 border-b border-[#e6dfd5] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2c2623] sm:text-3xl">Quản lý Bất động sản</h1>
          <p className="mt-1 text-sm text-[#786e65]">Thêm, sửa hoặc xoá các căn đang hiển thị trên website.</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#7a482b] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#633a22]"
        >
          + Thêm mới BĐS
        </Link>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <PropertyList />
      </Suspense>
    </div>
  );
}

async function PropertyList() {
  await connection();

  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('properties')
    .select('id, title, price, price_yen, location, current_status, status, images, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-[#e3c9bd] bg-[#fbf1ec] px-4 py-3 text-sm text-[#8a3b1d]">
        Không tải được danh sách: {error.message}
      </p>
    );
  }

  const items: PropertyItem[] = (data as PropertyItem[]) ?? [];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e6dfd5] bg-white p-10 text-center">
        <p className="font-serif text-base text-stone-600">Chưa có bất động sản nào.</p>
        <Link href="/admin/new" className="mt-3 inline-block text-sm font-semibold text-[#7a482b] underline underline-offset-4">
          Thêm căn đầu tiên
        </Link>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Tokyo' });

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-[#8c827a]">
        Tổng cộng <span className="font-bold text-[#2c2623]">{items.length}</span> bất động sản
      </p>

      <div className="space-y-3">
        {items.map((p: PropertyItem) => {
          const cover: string | undefined = p.images?.[0];
          const displayTitle = getLangValue(p.title) || "Bất động sản chưa đặt tên";
          const displayLocation = getLangValue(p.location) || "TOKYO";
          const priceVal = p.price_yen || p.price || 0;
          const statusVal = p.current_status || p.status || "available";

          return (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#e6dfd5] bg-white p-4 shadow-sm sm:flex-row sm:items-center justify-between"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Khung ảnh thu nhỏ gọn */}
                <div className="relative aspect-16/10 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-[#eae4dc]">
                  {cover ? (
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[11px] text-[#a0958b]">Chưa có ảnh</div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8c827a]">
                    📍 {displayLocation}
                  </p>
                  <h2 className="truncate font-serif text-base font-bold text-[#2c2623]">
                    {displayTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#786e65]">
                    <span className="font-serif text-sm font-bold text-[#7a482b]">
                      ¥{priceVal ? priceVal.toLocaleString("ja-JP") : "0"}
                    </span>
                    <span className="rounded-full bg-[#eae4dc] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#574d43]">
                      {statusVal}
                    </span>
                    {p.created_at && (
                      <span className="text-[11px] text-[#a0958b]">
                        Đăng {dateFmt.format(new Date(p.created_at))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Các nút thao tác */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f3eee7]">
                <Link
                  href={`/properties/${p.id}`}
                  target="_blank"
                  className="rounded-lg border border-[#d8cebe] bg-white px-3.5 py-2 text-xs font-semibold text-[#2c2623] transition hover:bg-[#f3eee7]"
                >
                  Xem
                </Link>
                <Link
                  href={`/admin/${p.id}/edit`}
                  className="rounded-lg bg-[#2c2623] px-3.5 py-2 text-xs font-semibold text-[#f8f6f0] transition hover:bg-[#7a482b]"
                >
                  Sửa
                </Link>
                <DeleteButton id={String(p.id)} title={displayTitle} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#eae4dc]" />
      ))}
    </div>
  );
}