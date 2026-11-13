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
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
        cardBorder: "border-l-4 border-l-amber-500",
    },
    consulting: {
        label: "2. Đang tư vấn / Hẹn xem",
        badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
        cardBorder: "border-l-4 border-l-sky-500",
    },
    paid: {
        label: "3. Đã chốt / Đã thanh toán",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        cardBorder: "border-l-4 border-l-emerald-600",
    },
    cancelled: {
        label: "4. Đã hủy / Không nhu cầu",
        badgeClass: "bg-stone-200 text-stone-700 border-stone-300",
        cardBorder: "border-l-4 border-l-stone-400",
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

export default function InquiriesManager({
    initialInquiries,
}: {
    initialInquiries: InquiryRecord[];
}) {
    const [items, setItems] = useState<InquiryRecord[]>(initialInquiries);
    const [filterStatus, setFilterStatus] = useState<"ALL" | InquiryStatus>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
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
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        setSavingId(id);

        const res = await updateInquiryProgressAction(id, newStatus, noteDrafts[id]);
        setSavingId(null);

        if (!res.success) {
            setItems(previousItems);
            alert(`Lỗi cập nhật trạng thái: ${res.error}`);
        }
    };

    const handleSaveNote = async (item: InquiryRecord) => {
        const noteText = noteDrafts[item.id] ?? "";
        setSavingId(item.id);
        const res = await updateInquiryProgressAction(item.id, item.status, noteText);
        setSavingId(null);

        if (res.success) {
            setItems((prev) =>
                prev.map((row) =>
                    row.id === item.id ? { ...row, admin_note: noteText } : row
                )
            );
            alert("Đã lưu ghi chú tiến độ khách hàng!");
        } else {
            alert(`Lưu ghi chú thất bại: ${res.error}`);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa thông tin khách hàng "${name}" không?`)) {
            return;
        }
        setSavingId(id);
        const res = await deleteInquiryAction(id);
        setSavingId(null);

        if (res.success) {
            setItems((prev) => prev.filter((item) => item.id !== id));
        } else {
            alert(`Xóa thất bại: ${res.error}`);
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
        <div className="space-y-6 text-[#2c2623]">
            {/* Thẻ thống kê nhanh theo từng bước */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                    type="button"
                    onClick={() => setFilterStatus("ALL")}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${filterStatus === "ALL"
                            ? "bg-[#2c2623] text-white border-[#2c2623] shadow-sm"
                            : "bg-white border-[#e6dfd5] hover:border-[#8c6d53]"
                        }`}
                >
                    <span className="text-[11px] uppercase tracking-wider opacity-75 block">
                        Tất cả khách
                    </span>
                    <span className="text-2xl font-serif font-bold mt-1 block">
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
                            className={`p-4 rounded-xl border text-left transition cursor-pointer ${isSelected
                                    ? "bg-[#2c2623] text-white border-[#2c2623] shadow-sm"
                                    : "bg-white border-[#e6dfd5] hover:border-[#8c6d53]"
                                }`}
                        >
                            <span className="text-[11px] font-semibold block truncate">
                                {STATUS_CONFIG[statusKey].label}
                            </span>
                            <span className="text-2xl font-serif font-bold mt-1 block">
                                {counts[statusKey]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Thanh tìm kiếm khách hàng */}
            <div className="bg-white p-4 rounded-xl border border-[#e6dfd5] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên khách hàng, số điện thoại, email hoặc tên BĐS..."
                    className="w-full sm:max-w-md px-4 py-2 border border-[#e6dfd5] rounded-lg text-sm focus:outline-none focus:border-[#8c6d53]"
                />
                <span className="text-xs text-[#8c827a]">
                    Hiển thị <strong className="text-[#2c2623]">{filteredItems.length}</strong> khách hàng
                </span>
            </div>

            {/* Danh sách thẻ khách hàng */}
            {filteredItems.length === 0 ? (
                <div className="bg-white border border-[#e6dfd5] rounded-xl p-10 text-center text-sm text-[#8c827a]">
                    Chưa có khách hàng nào ở trạng thái này.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map((item) => {
                        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                        const isSaving = savingId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white border border-[#e6dfd5] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 ${cfg.cardBorder}`}
                            >
                                {/* Hàng 1: Tên khách + Chọn bước tiến độ */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f0eae1] pb-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-serif font-bold text-[#2c2623]">
                                                {item.full_name}
                                            </h3>
                                            <span
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badgeClass}`}
                                            >
                                                {cfg.label}
                                            </span>
                                            {isSaving && (
                                                <span className="text-xs text-[#8c6d53] animate-pulse">
                                                    Đang lưu...
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#8c827a] mt-1">
                                            Gửi lúc: {formatDateTime(item.created_at)}
                                        </p>
                                    </div>

                                    {/* Dropdown chuyển bước tiến độ */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold text-[#574d43] shrink-0">
                                            Tiến độ:
                                        </label>
                                        <select
                                            value={item.status}
                                            disabled={isSaving}
                                            onChange={(e) =>
                                                handleStatusChange(item.id, e.target.value as InquiryStatus)
                                            }
                                            className="px-3 py-2 bg-[#faf8f5] border border-[#d8cebe] rounded-lg text-xs font-bold text-[#2c2623] focus:outline-none focus:border-[#8c6d53] cursor-pointer"
                                        >
                                            <option value="pending">1. Mới liên hệ</option>
                                            <option value="consulting">2. Đang tư vấn / Hẹn xem</option>
                                            <option value="paid">3. Đã chốt / Đã thanh toán</option>
                                            <option value="cancelled">4. Đã hủy / Không nhu cầu</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Hàng 2: Thông tin liên hệ & BĐS quan tâm */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-[#faf8f5] p-3.5 rounded-lg border border-[#f0eae1] space-y-1.5">
                                        <span className="text-[#8c827a] font-semibold uppercase tracking-wider text-[10px] block">
                                            Thông tin liên hệ
                                        </span>
                                        <p className="font-bold text-sm text-[#2c2623]">📱 {item.phone}</p>
                                        <p className="text-[#7a482b] break-all">✉️ {item.email}</p>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <a
                                                href={toWhatsAppLink(item.phone)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-2.5 py-1 rounded bg-[#1f7a4c] text-white font-semibold text-[11px] hover:opacity-90"
                                            >
                                                WhatsApp
                                            </a>
                                            <a
                                                href={`tel:${item.phone.replace(/\s+/g, "")}`}
                                                className="px-2.5 py-1 rounded bg-[#2c2623] text-white font-semibold text-[11px] hover:opacity-90"
                                            >
                                                Gọi điện
                                            </a>
                                            <a
                                                href={`mailto:${item.email}`}
                                                className="px-2.5 py-1 rounded border border-[#d8cebe] bg-white text-[#2c2623] font-semibold text-[11px] hover:bg-[#f3eee7]"
                                            >
                                                Gửi Email
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-[#faf8f5] p-3.5 rounded-lg border border-[#f0eae1] space-y-1.5">
                                        <span className="text-[#8c827a] font-semibold uppercase tracking-wider text-[10px] block">
                                            Bất động sản quan tâm
                                        </span>
                                        {item.property_id ? (
                                            <>
                                                <p className="font-bold text-sm text-[#2c2623] line-clamp-2">
                                                    {item.property_title}
                                                </p>
                                                <Link
                                                    href={`/properties/${item.property_id}`}
                                                    target="_blank"
                                                    className="inline-block text-[#7a482b] font-semibold hover:underline pt-1"
                                                >
                                                    Xem căn nhà trên website ↗
                                                </Link>
                                            </>
                                        ) : (
                                            <p className="text-[#665c54] italic">
                                                Tư vấn chung (từ trang Giới thiệu)
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-[#faf8f5] p-3.5 rounded-lg border border-[#f0eae1] space-y-1.5">
                                        <span className="text-[#8c827a] font-semibold uppercase tracking-wider text-[10px] block">
                                            Lời nhắn của khách
                                        </span>
                                        <p className="text-[#3c352d] whitespace-pre-line leading-relaxed">
                                            {item.message || "(Không có lời nhắn)"}
                                        </p>
                                    </div>
                                </div>

                                {/* Hàng 3: Ghi chú nội bộ của Mii Shintani + Nút xóa */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                                    <input
                                        type="text"
                                        value={noteDrafts[item.id] ?? ""}
                                        onChange={(e) =>
                                            setNoteDrafts((prev) => ({
                                                ...prev,
                                                [item.id]: e.target.value,
                                            }))
                                        }
                                        placeholder="Ghi chú nội bộ (VD: Đã gọi tư vấn ngày 15/11, hẹn xem nhà tuần sau, đã thanh toán cọc...)"
                                        className="flex-1 px-3.5 py-2 bg-[#faf8f5] border border-[#e6dfd5] rounded-lg text-xs text-[#2c2623] focus:outline-none focus:border-[#8c6d53]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => handleSaveNote(item)}
                                            className="px-4 py-2 bg-[#7a482b] text-white text-xs font-bold rounded-lg hover:bg-[#633a22] transition cursor-pointer disabled:opacity-50"
                                        >
                                            Lưu ghi chú
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => handleDelete(item.id, item.full_name)}
                                            className="px-3 py-2 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                                        >
                                            Xóa
                                        </button>
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