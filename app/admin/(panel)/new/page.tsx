import { Suspense } from "react";
import Link from "next/link";
import PropertyForm from "@/app/front/admin/PropertyForm";

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

export default function AdminNewPropertyPage() {
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
            Thêm Bất Động Sản Nhật Bản mới
          </h1>
          <p className="mt-1 text-xs text-[#475569] sm:text-sm">
            Nhập thông tin tiêu chuẩn, đa ngôn ngữ và gắn thẻ bộ lọc cho BĐS Nhật Bản.
          </p>
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
              Đang tải biểu mẫu đăng bất động sản...
            </span>
          </div>
        }
      >
        <PropertyForm />
      </Suspense>
    </div>
  );
}