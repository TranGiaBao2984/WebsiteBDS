'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { createInquiry } from '@/app/back/inquiries';
import { useLanguage } from '@/app/context/LanguageContext';

const ICONS = {
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  mail: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2.1Z',
  check: 'M4.5 12.75l6 6 9-13.5',
};

const FIELD =
  'w-full rounded-xl border border-[#e6dfd5] bg-[#f8f6f0] py-3 text-base text-[#2c2623] placeholder:text-[#b0a499] transition focus:border-[#8c6d53] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8c6d53]/15 md:text-sm';

function Icon({ path, className = 'h-4 w-4' }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

function Field({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-[#574d43]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0958b]">
            <Icon path={icon} />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

export default function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId?: string;
  propertyTitle?: string;
}) {
  const { t, currentLang } = useLanguage();
  const uid = useId();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });

  // Tin nhắn mặc định tính trực tiếp lúc render; chỉ lưu lại khi khách tự sửa
  const defaultMessage = propertyTitle
    ? `${t.inquiry.defaultMsgProperty}${propertyTitle}`
    : t.inquiry.defaultMsgGeneral;
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const message = customMessage ?? defaultMessage;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setFailed(false);

    try {
      const result = await createInquiry({
        property_id: propertyId ?? null,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        message,
      }, currentLang);

      if (result.success) {
        setSuccess(true);
      } else {
        console.error(result.error);
        setFailed(true);
      }
    } catch (err) {
      console.error(err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section
        id="contact"
        role="status"
        className="scroll-mt-24 rounded-3xl border border-[#e6dfd5] bg-white px-6 py-12 text-center shadow-sm sm:px-10"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebe1] text-[#7a482b]">
          <Icon path={ICONS.check} className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-serif text-xl font-bold text-[#2c2623] sm:text-2xl">
          {t.inquiry.successTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#665c54]">
          {t.inquiry.successDesc}
        </p>
      </section>
    );
  }

  const perks = [t.inquiry.perk1, t.inquiry.perk2, t.inquiry.perk3];

  return (
    <section
      id="contact"
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-[#e6dfd5] bg-white shadow-sm md:grid md:grid-cols-5"
    >
      {/* Khung tối bên trái: vòng enso là điểm nhấn duy nhất */}
      <div className="relative overflow-hidden bg-[#2c2623] p-6 text-[#f8f6f0] sm:p-8 md:col-span-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 text-[#d8c7b8]/25"
        >
          <path
            d="M100 18a82 82 0 1 1-58 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-bold leading-snug sm:text-3xl">
              {propertyTitle ? t.inquiry.titleProperty : t.inquiry.titleGeneral}
            </h3>
            <p className="text-sm leading-relaxed text-[#d9d0c6]">{t.inquiry.panelDesc}</p>
            {propertyTitle && (
              <p className="line-clamp-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm font-medium leading-snug">
                {propertyTitle}
              </p>
            )}
          </div>

          <ul className="space-y-3 text-sm text-[#e6dfd5]">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d8c7b8]/20 text-[#d8c7b8]">
                  <Icon path={ICONS.check} className="h-3 w-3" />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form bên phải */}
      <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-5 p-6 sm:p-8 md:col-span-3">
        <Field label={t.inquiry.fullName} htmlFor={`${uid}-name`} icon={ICONS.user}>
          <input
            id={`${uid}-name`}
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="John Doe"
            className={`${FIELD} pl-10 pr-3`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t.inquiry.email} htmlFor={`${uid}-email`} icon={ICONS.mail}>
            <input
              id={`${uid}-email`}
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@gmail.com"
              className={`${FIELD} pl-10 pr-3`}
            />
          </Field>

          <Field label={t.inquiry.phone} htmlFor={`${uid}-phone`} icon={ICONS.phone}>
            <input
              id={`${uid}-phone`}
              type="tel"
              inputMode="tel"
              maxLength={40}
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+81 901234567"
              className={`${FIELD} pl-10 pr-3`}
            />
          </Field>
        </div>

        <Field label={t.inquiry.message} htmlFor={`${uid}-message`}>
          <textarea
            id={`${uid}-message`}
            rows={4}
            maxLength={2000}
            value={message}
            onChange={(e) => setCustomMessage(e.target.value)}
            className={`${FIELD} min-h-28 resize-y px-3.5 leading-relaxed`}
          />
        </Field>

        {failed && (
          <p
            role="alert"
            className="rounded-xl border border-[#e3c9bd] bg-[#fbf1ec] px-4 py-3 text-sm leading-relaxed text-[#8a3b1d]"
          >
            {t.inquiry.errorGeneric}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#7a482b] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#633a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7a482b]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {loading ? t.inquiry.sending : t.inquiry.send}
        </button>
      </form>
    </section>
  );
}