"use client";

import { useId, useState } from "react";
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
    successMsg:
      "Thank you! Mii Shintani (RE AGENT by Re iDea) has received your inquiry and will respond within 24 hours.",
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

function SendIcon({ className }: { className?: string }) {
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
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
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

export default function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const { currentLang } = useLanguage();
  const labels = INQUIRY_LABELS[currentLang] || INQUIRY_LABELS.en;
  const uid = useId();

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
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
      form.reset();
    } else {
      setFeedback({
        success: false,
        message: result.error || labels.errorMsg,
      });
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-base text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15 sm:text-sm";

  return (
    <div
      id="contact"
      className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/80 p-6 text-[#134E4A] shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md lg:p-8"
    >
      {/* Điểm sáng chiều sâu cho hiệu ứng Glassmorphism */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#14B8A6]/12 blur-3xl"
      />

      <div className="relative">
        <h3 className="font-serif mb-2 text-xl font-bold tracking-tight text-[#134E4A] sm:text-2xl">
          {labels.heading}
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-[#475569] sm:text-sm">
          {propertyTitle ? (
            <>
              {labels.subPrefix}{" "}
              <span className="font-semibold text-[#0F766E]">{propertyTitle}</span>
            </>
          ) : (
            labels.generalSub
          )}
        </p>

        {feedback && (
          <div
            role="alert"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed sm:text-sm ${
              feedback.success
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
                : "border-rose-200 bg-rose-50/90 text-rose-900"
            }`}
          >
            {feedback.success ? (
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={`${uid}-fullName`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              {labels.fullName}
            </label>
            <input
              id={`${uid}-fullName`}
              type="text"
              name="fullName"
              required
              className={inputClassName}
              placeholder={labels.fullNamePlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${uid}-email`}
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
              >
                {labels.email}
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                name="email"
                required
                className={inputClassName}
                placeholder={labels.emailPlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-phone`}
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
              >
                {labels.phone}
              </label>
              <input
                id={`${uid}-phone`}
                type="tel"
                name="phone"
                required
                className={inputClassName}
                placeholder={labels.phonePlaceholder}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${uid}-message`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              {labels.message}
            </label>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={4}
              className={inputClassName}
              placeholder={labels.messagePlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0369A1] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                <span>{labels.submitting}</span>
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                <span>{labels.submit}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}