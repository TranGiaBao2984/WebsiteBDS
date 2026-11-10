"use client";

import { useState } from "react";
import { submitInquiryAction } from "@/app/back/inquiries";

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

export default function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitInquiryAction({
      propertyId,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    });

    setLoading(false);
    if (result.success) {
      setFeedback({
        success: true,
        message: "Cảm ơn bạn! Mii Shintani đã nhận thông tin và sẽ phản hồi trong 24h."
      });
      (e.target as HTMLFormElement).reset();
    } else {
      setFeedback({
        success: false,
        message: result.error || "Gửi yêu cầu thất bại. Vui lòng thử lại."
      });
    }
  };

  return (
    <div className="bg-[#f8f6f0] border border-[#e6dfd5] p-6 lg:p-8 rounded-lg shadow-sm text-[#3c352d]">
      <h3 className="text-xl font-serif font-bold mb-2">Đăng ký Tư vấn BĐS</h3>
      <p className="text-xs text-[#3c352d]/70 mb-6">
        Gửi yêu cầu thông tin về: <span className="font-semibold text-[#3c352d]">{propertyTitle}</span>
      </p>

      {feedback && (
        <div
          className={`p-4 mb-6 rounded text-sm ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
            placeholder="Yamada Taro / Nguyễn Văn A"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
              placeholder="+81 80 1234 5678"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Lời nhắn tư vấn</label>
          <textarea
            name="message"
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
            placeholder="Tôi muốn hẹn lịch xem nhà thực tế / Nhận báo giá tổng chi phí sang tên..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-[#3c352d] text-[#f8f6f0] font-medium rounded hover:bg-[#3c352d]/90 transition duration-200 disabled:opacity-50 text-sm tracking-wide"
        >
          {loading ? "Đang gửi thông tin..." : "Liên Hệ Ngay Với Mii Shintani"}
        </button>
      </form>
    </div>
  );
}