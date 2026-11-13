import { Suspense } from "react";
import { createClient } from "@/lib/supabase-server";
import InquiriesManager, {
  type InquiryRecord,
} from "@/app/admin/InquiriesManager";
import type { InquiryStatus } from "@/app/back/inquiries";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-[#e6dfd5] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2c2623]">
          Quản lý Khách hàng & Tiến độ Tư vấn
        </h1>
        <p className="text-xs sm:text-sm text-[#786e65] mt-1">
          Theo dõi trạng thái khách hàng từ lúc mới liên hệ, đang tư vấn cho đến khi chốt thanh toán.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white border border-[#e6dfd5] rounded-xl p-8 text-center text-xs text-[#8c827a]">
            Đang tải danh sách khách hàng...
          </div>
        }
      >
        <InquiriesLoader />
      </Suspense>
    </div>
  );
}