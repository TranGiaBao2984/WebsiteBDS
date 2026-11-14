import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase-server";
import PropertyForm from "@/app/front/admin/PropertyForm";
import type { Property } from "@/lib/types";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
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

async function EditPropertyLoader({ params }: EditPropertyPageProps) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-200 bg-white/85 p-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
          <AlertCircleIcon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-rose-900">
            Không tìm thấy dữ liệu bất động sản này.
          </p>
          {error?.message && (
            <p className="text-xs text-[#475569]">{error.message}</p>
          )}
        </div>
        <div className="pt-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0369A1] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Quay về trang quản lý</span>
          </Link>
        </div>
      </div>
    );
  }

  return <PropertyForm property={property as Property} />;
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2 border-b border-[#99F6E4]/80 pb-5">
        <Link
          href="/admin"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] transition-colors duration-200 hover:text-[#0369A1]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none" />
          <span>Quay lại danh sách</span>
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Quản trị bất động sản
          </p>
          <h1 className="mt-0.5 font-serif text-2xl font-bold text-[#134E4A] sm:text-3xl">
            Sửa bất động sản
          </h1>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#99F6E4] bg-white/80 p-12 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F766E]/25 border-t-[#0F766E]"
            />
            <span className="text-xs font-medium text-[#475569]">
              Đang tải dữ liệu bất động sản...
            </span>
          </div>
        }
      >
        <EditPropertyLoader params={params} />
      </Suspense>
    </div>
  );
}