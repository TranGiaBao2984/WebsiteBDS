import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import PropertyForm from "@/app/front/admin/PropertyForm";
import type { Property } from "@/lib/types";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

async function EditPropertyLoader({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return (
      <div className="bg-white border border-[#e3c9bd] rounded-xl p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-[#8a3b1d]">
          Không tìm thấy dữ liệu bất động sản này.
        </p>
        {error?.message && (
          <p className="text-xs text-[#8c827a]">{error.message}</p>
        )}
        <Link
          href="/admin"
          className="inline-block px-4 py-2 bg-[#3c352d] text-white text-xs font-bold rounded-lg"
        >
          Quay về trang quản lý
        </Link>
      </div>
    );
  }

  return <PropertyForm property={property as Property} />;
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-semibold text-[#7a482b] hover:underline"
        >
          ← Quay lại danh sách
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2c2623]">
          Sửa bất động sản
        </h1>
      </div>

      <Suspense
        fallback={
          <div className="bg-white border border-[#e6dfd5] rounded-xl p-8 text-center text-xs text-[#8c827a]">
            Đang tải dữ liệu bất động sản...
          </div>
        }
      >
        <EditPropertyLoader params={params} />
      </Suspense>
    </div>
  );
}