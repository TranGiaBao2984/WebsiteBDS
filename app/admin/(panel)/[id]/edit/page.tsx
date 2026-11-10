import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import type { Property } from '@/lib/types';
import PropertyForm from '@/app/front/admin/PropertyForm';

// Tắt hoàn toàn việc prerender cho trang chỉnh sửa này
export const instant = false;

export default function EditPropertyPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs font-medium text-[#8c6d53] transition hover:underline">
          ← Quay lại danh sách
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-bold text-[#2c2623] sm:text-3xl">
          Sửa bất động sản
        </h1>
      </div>
      
      {/* Giao diện tải hiển thị ngay lập tức trong khi chờ EditLoader xử lý */}
      <Suspense fallback={<div className="h-150 w-full animate-pulse rounded-3xl bg-[#eae4dc]/50" />}>
        <EditLoader params={params} />
      </Suspense>
    </div>
  );
}

async function EditLoader({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Toàn bộ các thao tác động (đọc URL param, kiểm tra Cookie Admin, gọi Database)
  // được gom gọn và xử lý an toàn tại đây
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();

  return <PropertyForm property={data as Property} />;
}