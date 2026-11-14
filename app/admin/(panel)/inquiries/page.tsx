import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase-server";
import InquiriesManager, {
  type InquiryRecord,
} from "@/app/admin/InquiriesManager";
import type { InquiryStatus } from "@/app/back/inquiries";

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

function parsePropertyTitle(raw: unknown): string {
  if (!raw) return "";
  let val: unknown = raw;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        val = JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    } else {
      return trimmed;
    }
  }
  if (typeof val === "object" && val !== null) {
    const rec = val as Record<string, unknown>;
    const parts = [rec.vi, rec.en, rec.ja]
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .map((v) => v.trim());
    return Array.from(new Set(parts)).join(" / ");
  }
  return String(val);
}

async function InquiriesLoader() {
  // Bắt buộc gọi connection() trước createClient() để Next.js 16 render động theo request
  await connection();
  const supabase = await createClient();

  const [{ data: inquiriesData }, { data: propertiesData }] = await Promise.all([
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("id, title"),
  ]);

  const titleMap = new Map<string, string>();
  for (const prop of propertiesData || []) {
    titleMap.set(String(prop.id), parsePropertyTitle(prop.title));
  }

  const validStatuses: InquiryStatus[] = [
    "pending",
    "consulting",
    "paid",
    "cancelled",
  ];

  const formatted: InquiryRecord[] = (inquiriesData || []).map((row) => {
    const rawStatus = String(row.status || "pending") as InquiryStatus;
    const status: InquiryStatus = validStatuses.includes(rawStatus)
      ? rawStatus
      : "pending";
    const propId = row.property_id ? String(row.property_id) : null;

    return {
      id: String(row.id),
      property_id: propId,
      property_title: propId
        ? titleMap.get(propId) || `BĐS #${propId}`
        : "",
      full_name: String(row.full_name || ""),
      email: String(row.email || ""),
      phone: String(row.phone || ""),
      message: String(row.message || ""),
      status,
      admin_note: String(row.admin_note || ""),
      created_at: String(row.created_at || ""),
    };
  });

  return <InquiriesManager initialInquiries={formatted} />;
}

export default function AdminInquiriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2 border-b border-[#99F6E4]/80 pb-5">
        <Link
          href="/admin"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] transition-colors duration-200 hover:text-[#0369A1]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none" />
          <span>Quay lại trang quản trị</span>
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Chăm sóc khách hàng
          </p>
          <h1 className="mt-0.5 font-serif text-2xl font-bold text-[#134E4A] sm:text-3xl">
            Quản lý Khách hàng &amp; Tiến độ Tư vấn
          </h1>
          <p className="mt-1 text-xs text-[#475569] sm:text-sm">
            Theo dõi trạng thái khách hàng từ lúc mới liên hệ, đang tư vấn cho đến khi chốt thanh toán.
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
              Đang tải danh sách khách hàng...
            </span>
          </div>
        }
      >
        <InquiriesLoader />
      </Suspense>
    </div>
  );
}