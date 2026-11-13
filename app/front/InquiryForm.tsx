"use client";

import { useState } from "react";
import { submitInquiryAction } from "@/app/back/inquiries";
import { useLanguage } from "@/app/context/LanguageContext";

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

const INQUIRY_LABELS = {
  vi: {
    heading: "Đăng ký Tư vấn BĐS",
    subPrefix: "Gửi yêu cầu thông tin về:",
    generalSub: "Để lại thông tin để nhận tư vấn trực tiếp từ Mii Shintani (RE AGENT by Re iDea).",
    fullName: "Họ và tên *",
    fullNamePlaceholder: "Nguyễn Văn A / Yamada Taro",
    email: "Email *",
    emailPlaceholder: "example@email.com",
    phone: "Số điện thoại *",
    phonePlaceholder: "+81 70-9017-1920",
    message: "Lời nhắn tư vấn",
    messagePlaceholder: "Tôi muốn hẹn lịch xem nhà thực tế / Nhận báo giá tổng chi phí sang tên...",
    submit: "Liên Hệ Ngay Với Mii Shintani",
    submitting: "Đang gửi thông tin...",
    successMsg: "Cảm ơn bạn! Mii đã nhận thông tin và sẽ phản hồi trong 24h.",
    errorMsg: "Gửi yêu cầu thất bại. Vui lòng thử lại.",
  },
  en: {
    heading: "Property Consultation",
    subPrefix: "Requesting details for:",
    generalSub: "Leave your details to receive direct consultation from Mii Shintani (RE AGENT by Re iDea).",
    fullName: "Full Name *",
    fullNamePlaceholder: "John Doe / Yamada Taro",
    email: "Email *",
    emailPlaceholder: "example@email.com",
    phone: "Phone Number *",
    phonePlaceholder: "+81 70-9017-1920",
    message: "Consultation Message",
    messagePlaceholder: "I would like to schedule a viewing / request total closing cost details...",
    submit: "Contact Mii Shintani Now",
    submitting: "Sending information...",
    successMsg: "Thank you! Mii Shintani (RE AGENT by Re iDea) has received your inquiry and will respond within 24 hours.",
    errorMsg: "Failed to send request. Please try again.",
  },
  ja: {
    heading: "物件のお問い合わせ・相談",
    subPrefix: "お問い合わせ物件:",
    generalSub: "株式会社 Re iDea（RE AGENT）新谷 美依へのお問い合わせ・内見予約はこちら。",
    fullName: "お名前 *",
    fullNamePlaceholder: "山田 太郎",
    email: "メールアドレス *",
    emailPlaceholder: "example@email.com",
    phone: "電話番号 *",
    phonePlaceholder: "070-9017-1920",
    message: "ご相談内容",
    messagePlaceholder: "内見の予約をしたい / 諸費用を含めた見積もりが欲しい...",
    submit: "Mii Shintani に今すぐ相談する",
    submitting: "送信中...",
    successMsg: "ありがとうございます！お問い合わせを受け付けました。24時間以内にご返信いたします。",
    errorMsg: "送信に失敗しました。もう一度お試しください。",
  },
};

export default function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const { currentLang } = useLanguage();
  const labels = INQUIRY_LABELS[currentLang] || INQUIRY_LABELS.en;

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
        message: labels.successMsg,
      });
      (e.target as HTMLFormElement).reset();
    } else {
      setFeedback({
        success: false,
        message: result.error || labels.errorMsg,
      });
    }
  };

  return (
    <div id="contact" className="bg-[#f8f6f0] border border-[#e6dfd5] p-6 lg:p-8 rounded-lg shadow-sm text-[#3c352d] scroll-mt-24">
      <h3 className="text-xl font-serif font-bold mb-2">{labels.heading}</h3>
      <p className="text-xs text-[#3c352d]/70 mb-6">
        {propertyTitle ? (
          <>
            {labels.subPrefix}{" "}
            <span className="font-semibold text-[#3c352d]">{propertyTitle}</span>
          </>
        ) : (
          labels.generalSub
        )}
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
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
            {labels.fullName}
          </label>
          <input
            type="text"
            name="fullName"
            required
            className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
            placeholder={labels.fullNamePlaceholder}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              {labels.email}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
              placeholder={labels.emailPlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              {labels.phone}
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
              placeholder={labels.phonePlaceholder}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
            {labels.message}
          </label>
          <textarea
            name="message"
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
            placeholder={labels.messagePlaceholder}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-[#3c352d] text-[#f8f6f0] font-medium rounded hover:bg-[#3c352d]/90 transition duration-200 disabled:opacity-50 text-sm tracking-wide cursor-pointer"
        >
          {loading ? labels.submitting : labels.submit}
        </button>
      </form>
    </div>
  );
}