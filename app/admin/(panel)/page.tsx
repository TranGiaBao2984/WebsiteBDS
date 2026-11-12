/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import Link from 'next/link';
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-[#8c827a]">Đang tải dữ liệu quản trị...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  const { supabase } = await requireAdmin();

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const propertyList = (properties || []) as Property[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6dfd5] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2c2623]">Quản lý Bất động sản</h1>
          <p className="text-sm text-[#8c827a] mt-1">Thêm, sửa hoặc xoá các căn đang hiển thị trên website.</p>
        </div>
        <Link
          href="/admin/new"
          className="px-5 py-2.5 bg-[#7a482b] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#633a22] transition shadow-sm text-center"
        >
          + Thêm mới BĐS
        </Link>
      </div>

      <div className="text-xs text-[#8c827a] font-medium">
        Tổng cộng <strong className="text-[#2c2623]">{propertyList.length}</strong> bất động sản
      </div>

      <div className="space-y-4">
        {propertyList.map((item) => {
          const title = getCleanText(item.title) || 'Bất động sản';
          const location = getCleanText(item.location) || 'Nhật Bản';
          const images = parseImages(item.images);
          const mainImage = images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
          const priceYen = item.price_yen || item.price || 0;

          return (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e6dfd5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl bg-stone-100 overflow-hidden shrink-0 relative">
                  <img
                    src={mainImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c827a] block">
                    📍 {location}
                  </span>
                  <h2 className="font-serif font-bold text-base text-[#2c2623] line-clamp-1">{title}</h2>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm text-[#7a482b]">
                      ¥{priceYen.toLocaleString('ja-JP')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f4efe8] text-[#3c352d] rounded">
                      {item.status || 'AVAILABLE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#f0eae1]">
                <Link
                  href={`/properties/${item.id}`}
                  className="px-3 py-1.5 border border-[#e6dfd5] text-xs font-semibold text-[#574d43] rounded-lg hover:bg-[#f4efe8]"
                >
                  Xem
                </Link>
                <Link
                  href={`/admin/${item.id}/edit`}
                  className="px-3 py-1.5 bg-[#2c2623] text-white text-xs font-semibold rounded-lg hover:bg-[#3c352d]"
                >
                  Sửa
                </Link>
                <DeleteButton id={item.id} title={title} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}