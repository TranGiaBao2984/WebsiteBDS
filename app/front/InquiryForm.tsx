"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { submitInquiryAction } from "@/app/back/inquiries";
import { useLanguage } from "@/app/context/LanguageContext";

interface InquiryFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

// Đường dẫn file GIF trong thư mục /public (public/fun.gif -> "/fun.gif")
const SUCCESS_GIF_SRC = "/fun.gif";
// Thời gian GIF tự đóng (ms). Chỉnh số này nếu muốn hiển thị lâu / ngắn hơn.
const SUCCESS_GIF_DURATION_MS = 6000;

const INQUIRY_LABELS = {
  en: {
    heading: "Interested in this property?",
    subPrefix: "Requesting details for:",
    generalSub:
      "Ask Mii about availability, additional photos, arranging a viewing, or purchasing from overseas.",
    fullName: "Full Name *",
    fullNamePlaceholder: "John Doe / Yamada Taro",
    email: "Email *",
    emailPlaceholder: "example@email.com",
    phone: "Phone Number *",
    phonePlaceholder: "+81 70-9017-1920",
    message: "Consultation Message",
    messagePlaceholder:
      "I would like to schedule a viewing / request total closing cost details...",
    consentPrefix:
      "I consent to the collection and processing of my contact details for real estate advisory in accordance with the ",
    consentLink: "Privacy Policy",
    consentSuffix: ". *",
    submit: "Contact Mii Shintani Now",
    submitting: "Sending information...",
    successMsg:
      "Thank you! Mii Shintani has received your inquiry and sent a confirmation email. We will respond within 24 hours.",
    errorMsg: "Failed to send request. Please try again.",
    gifAlt: "Your inquiry has been sent",
    gifClose: "Close",
  },
  ja: {
    heading: "物件のお問い合わせ・相談",
    subPrefix: "お問い合わせ物件:",
    generalSub:
      "株式会社 Re iDea（RE AGENT）新谷 美依へのお問い合わせ・内見予約はこちら。",
    fullName: "お名前 *",
    fullNamePlaceholder: "山田 太郎",
    email: "メールアドレス *",
    emailPlaceholder: "example@email.com",
    phone: "電話番号 *",
    phonePlaceholder: "070-9017-1920",
    message: "ご相談内容",
    messagePlaceholder: "内見の予約をしたい / 諸費用を含めた見積もりが欲しい...",
    consentPrefix:
      "不動産相談の対応を目的とした個人情報の取り扱いに同意します（",
    consentLink: "プライバシーポリシー",
    consentSuffix: "）。*",
    submit: "Mii Shintani に今すぐ相談する",
    submitting: "送信中...",
    successMsg:
      "ありがとうございます！お問い合わせを受け付け、確認メールをお送りしました。24時間以内にご返信いたします。",
    errorMsg: "送信に失敗しました。もう一度お試しください。",
    gifAlt: "お問い合わせを送信しました",
    gifClose: "閉じる",
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

export default function InquiryForm({
  propertyId,
  propertyTitle,
}: InquiryFormProps) {
  const { currentLang } = useLanguage();
  const labels = INQUIRY_LABELS[currentLang === "ja" ? "ja" : "en"];
  const uid = useId();

  const formLoadedAtRef = useRef<number>(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Popup GIF: gifShownAt vừa là cờ hiển thị (khác null) vừa là key để GIF chạy lại từ đầu mỗi lần gửi
  const [gifShownAt, setGifShownAt] = useState<number | null>(null);
  const closeGif = useCallback(() => setGifShownAt(null), []);

  useEffect(() => {
    formLoadedAtRef.current = Date.now();

    // Tải trước GIF để lúc gửi xong hiện ra ngay, không bị trễ
    const preload = new window.Image();
    preload.src = SUCCESS_GIF_SRC;
  }, []);

  // Khi popup mở: tự đóng sau vài giây, bấm Esc để đóng, và khoá cuộn trang phía sau
  useEffect(() => {
    if (gifShownAt === null) return;

    const timer = window.setTimeout(closeGif, SUCCESS_GIF_DURATION_MS);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGif();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [gifShownAt, closeGif]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await submitInquiryAction({
      propertyId,
      fullName: (formData.get("fullName") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || "",
      message: (formData.get("message") as string) || "",
      website: (formData.get("website") as string) || "",
      consent: formData.get("consent") === "on",
      lang: currentLang,
      formLoadedAt: formLoadedAtRef.current,
    });

    setLoading(false);
    if (result.success) {
      setFeedback({
        success: true,
        message: labels.successMsg,
      });
      setGifShownAt(Date.now());
      form.reset();
      formLoadedAtRef.current = Date.now();
    } else {
      setFeedback({
        success: false,
        message: result.error || labels.errorMsg,
      });
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-[#E5DFD6] bg-[#FAF8F5] px-4 py-3 text-base text-[#26221F] placeholder:text-[#948D86] transition-all duration-200 focus:border-[#B8D200] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#B8D200]/20 sm:text-sm";

  return (
    <div
      id="contact"
      className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-[#E5DFD6] bg-white p-6 text-[#26221F] shadow-[0_4px_16px_rgba(38,34,31,0.06)] lg:p-8"
    >
      {/* Popup GIF hiển thị giữa màn hình khi gửi liên hệ thành công.
          Dùng portal gắn vào <body> để không bị ảnh hưởng bởi khung cha (overflow/transform). */}
      {gifShownAt !== null &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.gifAlt}
          onClick={closeGif}
          className="fixed inset-0 z-100 flex cursor-pointer items-center justify-center bg-[#26221F]/60 p-4 backdrop-blur-sm"
        >
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- dùng <img> thường để giữ nguyên hoạt ảnh GIF */}
            <img
              key={gifShownAt}
              src={SUCCESS_GIF_SRC}
              alt={labels.gifAlt}
              draggable={false}
              className="max-h-[70vh] w-auto max-w-[min(90vw,28rem)] rounded-2xl border border-[#E5DFD6] bg-white shadow-[0_10px_30px_rgba(38,34,31,0.25)]"
            />
            <button
              type="button"
              onClick={closeGif}
              aria-label={labels.gifClose}
              className="absolute -top-3 -right-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#B8D200] text-[#26221F] shadow-sm transition-colors duration-200 hover:bg-[#9FB600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="relative">
        <h3 className="font-serif mb-2 text-xl font-bold tracking-tight text-[#26221F] sm:text-2xl">
          {labels.heading}
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-[#66605A] sm:text-sm">
          {propertyTitle ? (
            <>
              {labels.subPrefix}{" "}
              <span className="font-semibold text-[#B8D200]">
                {propertyTitle}
              </span>
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
          {/* Honeypot */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={`${uid}-website`}>Website</label>
            <input
              id={`${uid}-website`}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor={`${uid}-fullName`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#948D86]"
            >
              {labels.fullName}
            </label>
            <input
              id={`${uid}-fullName`}
              type="text"
              name="fullName"
              required
              maxLength={100}
              className={inputClassName}
              placeholder={labels.fullNamePlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${uid}-email`}
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#948D86]"
              >
                {labels.email}
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                name="email"
                required
                maxLength={150}
                className={inputClassName}
                placeholder={labels.emailPlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-phone`}
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#948D86]"
              >
                {labels.phone}
              </label>
              <input
                id={`${uid}-phone`}
                type="tel"
                name="phone"
                required
                maxLength={30}
                className={inputClassName}
                placeholder={labels.phonePlaceholder}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${uid}-message`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#948D86]"
            >
              {labels.message}
            </label>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={4}
              maxLength={2000}
              className={inputClassName}
              placeholder={labels.messagePlaceholder}
            />
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="flex items-start gap-2.5 rounded-xl border border-[#E5DFD6] bg-[#FAF8F5] p-3">
            <input
              id={`${uid}-consent`}
              type="checkbox"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#E5DFD6] accent-[#B8D200] focus:ring-[#B8D200]"
            />
            <label
              htmlFor={`${uid}-consent`}
              className="cursor-pointer text-[11px] leading-relaxed text-[#66605A] sm:text-xs"
            >
              {labels.consentPrefix}
              <Link
                href="/privacy"
                target="_blank"
                className="font-semibold text-[#B8D200] underline underline-offset-2 hover:text-[#9FB600]"
              >
                {labels.consentLink}
              </Link>
              {labels.consentSuffix}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#B8D200] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#26221F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9FB600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#26221F]/30 border-t-[#26221F]"
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