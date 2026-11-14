"use client";

import { useState } from "react";
import Link from "next/link";
import {
  updateInquiryProgressAction,
  deleteInquiryAction,
  type InquiryStatus,
} from "@/app/back/inquiries";

export interface InquiryRecord {
  id: string;
  property_id: string | null;
  property_title: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  admin_note: string;
  created_at: string;
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; badgeClass: string; cardBorder: string }
> = {
  pending: {
    label: "1. Mới liên hệ",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    cardBorder: "border-l-4 border-l-amber-500",
  },
  consulting: {
    label: "2. Đang tư vấn / Hẹn xem",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-300",
    cardBorder: "border-l-4 border-l-sky-500",
  },
  paid: {
    label: "3. Đã chốt / Đã thanh toán",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
    cardBorder: "border-l-4 border-l-emerald-600",
  },
  cancelled: {
    label: "4. Đã hủy / Không nhu cầu",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    cardBorder: "border-l-4 border-l-slate-400",
  },
};

function formatDateTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function toWhatsAppLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
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
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
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
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
      <path d="m9 12 2 2 4-4" />
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

export default function InquiriesManager({
  initialInquiries,
}: {
  initialInquiries: InquiryRecord[];
}) {
  const [items, setItems] = useState<InquiryRecord[]>(initialInquiries);
  const [filterStatus, setFilterStatus] = useState<"ALL" | InquiryStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of initialInquiries) {
      map[item.id] = item.admin_note || "";
    }
    return map;
  });

  const counts = {
    ALL: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    consulting: items.filter((i) => i.status === "consulting").length,
    paid: items.filter((i) => i.status === "paid").length,
    cancelled: items.filter((i) => i.status === "cancelled").length,
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    const previousItems = [...items];
    setBanner(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setSavingId(id);

    const res = await updateInquiryProgressAction(id, newStatus, noteDrafts[id]);
    setSavingId(null);

    if (!res.success) {
      setItems(previousItems);
      setBanner({
        type: "error",
        text: `Lỗi cập nhật trạng thái: ${res.error}`,
      });
    }
  };

  const handleSaveNote = async (item: InquiryRecord) => {
    const noteText = noteDrafts[item.id] ?? "";
    setBanner(null);
    setSavingId(item.id);
    const res = await updateInquiryProgressAction(item.id, item.status, noteText);
    setSavingId(null);

    if (res.success) {
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, admin_note: noteText } : row
        )
      );
      setBanner({
        type: "success",
        text: `Đã lưu ghi chú tiến độ cho khách hàng "${item.full_name}".`,
      });
    } else {
      setBanner({
        type: "error",
        text: `Lưu ghi chú thất bại: ${res.error}`,
      });
    }
  };

  const handleConfirmDelete = async (id: string, name: string) => {
    setBanner(null);
    setSavingId(id);
    const res = await deleteInquiryAction(id);
    setSavingId(null);
    setConfirmDeleteId(null);

    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({
        type: "success",
        text: `Đã xóa thông tin khách hàng "${name}".`,
      });
    } else {
      setBanner({
        type: "error",
        text: `Xóa thất bại: ${res.error}`,
      });
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.full_name.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchProp = item.property_title.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchProp;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-[#134E4A]">
      {/* Thông báo trạng thái inline (thay thế alert) */}
      {banner && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-medium shadow-xs backdrop-blur-md sm:text-sm ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : "border-rose-200 bg-rose-50/90 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.type === "success" ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircleIcon className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Đóng thông báo"
            className="cursor-pointer rounded-md p-1 opacity-75 transition-opacity hover:opacity-100"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Thẻ thống kê nhanh theo từng bước */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setFilterStatus("ALL")}
          aria-pressed={filterStatus === "ALL"}
          className={`cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
            filterStatus === "ALL"
              ? "border-[#0F766E] bg-[#0F766E] text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
              : "border-[#99F6E4] bg-white/80 text-[#134E4A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md hover:-translate-y-0.5 hover:border-[#14B8A6] hover:bg-white motion-reduce:transform-none"
          }`}
        >
          <span
            className={`block text-[11px] font-bold uppercase tracking-wider ${
              filterStatus === "ALL" ? "text-[#99F6E4]" : "text-[#475569]"
            }`}
          >
            Tất cả khách
          </span>
          <span className="font-serif mt-1.5 block text-2xl font-bold">
            {counts.ALL}
          </span>
        </button>

        {(Object.keys(STATUS_CONFIG) as InquiryStatus[]).map((statusKey) => {
          const isSelected = filterStatus === statusKey;
          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => setFilterStatus(statusKey)}
              aria-pressed={isSelected}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                isSelected
                  ? "border-[#0F766E] bg-[#0F766E] text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
                  : "border-[#99F6E4] bg-white/80 text-[#134E4A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md hover:-translate-y-0.5 hover:border-[#14B8A6] hover:bg-white motion-reduce:transform-none"
              }`}
            >
              <span
                className={`block truncate text-[11px] font-bold ${
                  isSelected ? "text-[#99F6E4]" : "text-[#475569]"
                }`}
              >
                {STATUS_CONFIG[statusKey].label}
              </span>
              <span className="font-serif mt-1.5 block text-2xl font-bold">
                {counts[statusKey]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Thanh tìm kiếm khách hàng */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-[#99F6E4] bg-white/80 p-4 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:flex-row">
        <div className="relative flex w-full items-center sm:max-w-md">
          <span className="pointer-events-none absolute left-3.5 text-[#0F766E]">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách hàng, số điện thoại, email hoặc tên BĐS..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pr-9 pl-10 text-sm text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 cursor-pointer rounded-md p-1 text-[#475569] transition-colors hover:bg-[#F0FDFA] hover:text-[#134E4A]"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <span className="text-xs font-medium text-[#475569]">
          Hiển thị{" "}
          <strong className="font-bold text-[#0F766E]">{filteredItems.length}</strong>{" "}
          khách hàng
        </span>
      </div>

      {/* Danh sách thẻ khách hàng */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-[#99F6E4] bg-white/80 p-12 text-center text-sm font-medium text-[#475569] shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
          Chưa có khách hàng nào ở trạng thái này.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredItems.map((item) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const isSaving = savingId === item.id;
            const isConfirmingDelete = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className={`space-y-4 rounded-2xl border border-[#99F6E4] bg-white/85 p-5 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-6 ${cfg.cardBorder}`}
              >
                {/* Hàng 1: Tên khách + Chọn bước tiến độ */}
                <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0F3] pb-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-lg font-bold text-[#134E4A]">
                        {item.full_name}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cfg.badgeClass}`}
                      >
                        {cfg.label}
                      </span>
                      {isSaving && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E]">
                          <span
                            aria-hidden="true"
                            className="h-3 w-3 animate-spin rounded-full border-2 border-[#0F766E]/30 border-t-[#0F766E]"
                          />
                          <span>Đang lưu...</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#475569]">
                      Gửi lúc: {formatDateTime(item.created_at)}
                    </p>
                  </div>

                  {/* Dropdown chuyển bước tiến độ */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`status-${item.id}`}
                      className="shrink-0 text-xs font-bold text-[#134E4A]"
                    >
                      Tiến độ:
                    </label>
                    <select
                      id={`status-${item.id}`}
                      value={item.status}
                      disabled={isSaving}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as InquiryStatus)
                      }
                      className="cursor-pointer rounded-lg border border-[#99F6E4] bg-[#F0FDFA] px-3 py-2 text-xs font-bold text-[#134E4A] transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 disabled:opacity-60"
                    >
                      <option value="pending">1. Mới liên hệ</option>
                      <option value="consulting">2. Đang tư vấn / Hẹn xem</option>
                      <option value="paid">3. Đã chốt / Đã thanh toán</option>
                      <option value="cancelled">4. Đã hủy / Không nhu cầu</option>
                    </select>
                  </div>
                </div>

                {/* Hàng 2: Thông tin liên hệ & BĐS quan tâm */}
                <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                  <div className="space-y-2 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/65 p-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                      Thông tin liên hệ
                    </span>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-[#134E4A]">
                      <SmartphoneIcon className="h-4 w-4 shrink-0 text-[#0F766E]" />
                      <span>{item.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 break-all font-medium text-[#0369A1]">
                      <MailIcon className="h-4 w-4 shrink-0 text-[#0F766E]" />
                      <span>{item.email}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      <a
                        href={toWhatsAppLink(item.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#0F766E] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${item.phone.replace(/\s+/g, "")}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#0369A1] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <PhoneIcon className="h-3 w-3" />
                        <span>Gọi điện</span>
                      </a>
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#99F6E4] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#134E4A] transition-colors hover:border-[#0F766E] hover:bg-[#F0FDFA]"
                      >
                        <MailIcon className="h-3 w-3 text-[#0F766E]" />
                        <span>Gửi Email</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/65 p-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                      Bất động sản quan tâm
                    </span>
                    {item.property_id ? (
                      <>
                        <p className="line-clamp-2 text-sm font-bold text-[#134E4A]">
                          {item.property_title}
                        </p>
                        <Link
                          href={`/properties/${item.property_id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 pt-1 font-semibold text-[#0369A1] transition-colors hover:text-[#0F766E] hover:underline"
                        >
                          <span>Xem căn nhà trên website</span>
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </Link>
                      </>
                    ) : (
                      <p className="italic text-[#475569]">
                        Tư vấn chung (từ trang Giới thiệu)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/65 p-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                      Lời nhắn của khách
                    </span>
                    <p className="whitespace-pre-line leading-relaxed text-[#134E4A]">
                      {item.message || "(Không có lời nhắn)"}
                    </p>
                  </div>
                </div>

                {/* Hàng 3: Ghi chú nội bộ của Mii Shintani + Nút xóa */}
                <div className="flex flex-col items-stretch gap-2.5 pt-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    aria-label={`Ghi chú nội bộ cho ${item.full_name}`}
                    value={noteDrafts[item.id] ?? ""}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Ghi chú nội bộ (VD: Đã gọi tư vấn ngày 15/11, hẹn xem nhà tuần sau, đã thanh toán cọc...)"
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveNote(item)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <SaveIcon className="h-3.5 w-3.5" />
                      <span>Lưu ghi chú</span>
                    </button>

                    {!isConfirmingDelete ? (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition-colors duration-200 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        <span>Xóa</span>
                      </button>
                    ) : (
                      <div
                        role="group"
                        aria-label={`Xác nhận xóa khách hàng ${item.full_name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/90 px-2.5 py-1"
                      >
                        <span className="text-[11px] font-semibold text-rose-900">
                          Xóa hẳn?
                        </span>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleConfirmDelete(item.id, item.full_name)}
                          className="cursor-pointer rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                        >
                          Xóa luôn
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => setConfirmDeleteId(null)}
                          className="cursor-pointer rounded-md border border-[#99F6E4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#134E4A] transition-colors hover:bg-[#F0FDFA] disabled:opacity-60"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}