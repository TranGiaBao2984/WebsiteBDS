'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { SITE } from '@/lib/site';

const FOOTER_LABELS = {
  vi: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    title: 'Kết nối với Mii Shintani (新谷 美依)',
    description:
      'Helping Overseas Clients Find Homes in Japan — Hỗ trợ khách hàng quốc tế thuê nhà, mua bán bất động sản và định cư tại Nhật Bản (Rental / Sales / Relocation Support).',
    whatsapp: 'Chat trực tiếp qua WhatsApp (070-9017-1920)',
    instagram: 'Instagram — @MIISHINTANI_AGENT',
    email: `Email — ${SITE.email}`,
    website: 'Website công ty — www.re-idea.com',
    officeHeading: 'Thông tin văn phòng & Liên hệ trực tiếp',
    mobileLabel: 'Mobile',
    telLabel: 'Tel',
    faxLabel: 'FAX',
    addressLabel: 'Địa chỉ',
    rights: 'RE AGENT by Re iDea (株式会社 Re iDea). All rights reserved.',
  },
  en: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    title: 'Connect with Mii Shintani (新谷 美依)',
    description:
      'Helping Overseas Clients Find Homes in Japan — Rental / Sales / Relocation Support for international clients.',
    whatsapp: 'Chat directly on WhatsApp (070-9017-1920)',
    instagram: 'Instagram — @MIISHINTANI_AGENT',
    email: `Email — ${SITE.email}`,
    website: 'Official Website — www.re-idea.com',
    officeHeading: 'Office & Direct Contact Details',
    mobileLabel: 'Mobile',
    telLabel: 'Tel',
    faxLabel: 'FAX',
    addressLabel: 'Address',
    rights: 'RE AGENT by Re iDea (株式会社 Re iDea). All rights reserved.',
  },
  ja: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    title: '新谷 美依（Mii Shintani）へのお問い合わせ',
    description:
      'Helping Overseas Clients Find Homes in Japan — 賃貸・売買・リロケーション支援（Rental / Sales / Relocation Support）を総合サポートいたします。',
    whatsapp: 'WhatsAppで直接相談する（070-9017-1920）',
    instagram: 'Instagram — @MIISHINTANI_AGENT',
    email: `メール — ${SITE.email}`,
    website: '公式サイト — www.re-idea.com',
    officeHeading: '会社概要・連絡先',
    mobileLabel: 'Mobile',
    telLabel: 'Tel',
    faxLabel: 'FAX',
    addressLabel: '所在地',
    rights: 'RE AGENT by Re iDea（株式会社 Re iDea）. All rights reserved.',
  },
};

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function Footer() {
  const [year, setYear] = useState('2026');
  const { currentLang } = useLanguage();
  const labels = FOOTER_LABELS[currentLang] || FOOTER_LABELS.en;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="mt-16 border-t border-[#99F6E4] bg-[#E8F0F3]/75 px-6 py-12 backdrop-blur-md sm:px-10 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Cột trái: Thương hiệu, giới thiệu & thông tin văn phòng */}
          <div className="space-y-5 text-left lg:col-span-6">
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
                {labels.badge}
              </span>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#134E4A] sm:text-3xl">
                {labels.title}
              </h2>
              <p className="text-xs font-semibold italic text-[#0369A1] sm:text-sm">
                “{SITE.slogan}”
              </p>
              <p className="pt-1 text-xs leading-relaxed text-[#475569] sm:text-sm">
                {labels.description}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-[#99F6E4] bg-white/80 p-5 text-xs text-[#134E4A] shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                {labels.officeHeading}
              </p>
              <p className="font-serif text-sm font-bold text-[#134E4A]">
                {SITE.company} — {SITE.brand} {SITE.subBrand}
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
                <div>
                  <span className="block text-[11px] font-medium text-[#475569]">
                    {labels.mobileLabel}
                  </span>
                  <a
                    href={SITE.hotlineHref}
                    className="inline-block cursor-pointer rounded font-bold text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                  >
                    {SITE.hotline}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-[#475569]">
                    {labels.telLabel}
                  </span>
                  <a
                    href={SITE.telHref}
                    className="inline-block cursor-pointer rounded font-bold text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                  >
                    {SITE.tel}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-[#475569]">
                    {labels.faxLabel}
                  </span>
                  <span className="font-bold text-[#134E4A]">{SITE.fax}</span>
                </div>
              </div>

              <div className="border-t border-[#E8F0F3] pt-3">
                <span className="block text-[11px] font-medium text-[#475569]">
                  {labels.addressLabel}
                </span>
                <p className="mt-0.5 font-semibold text-[#134E4A]">
                  {SITE.postalCode} {SITE.addressJa}
                </p>
                <p className="mt-0.5 text-[11px] text-[#475569]">{SITE.addressEn}</p>
              </div>
            </div>
          </div>

          {/* Cột phải: Các nút kết nối trực tiếp */}
          <div className="space-y-3 lg:col-span-6">
            {/* WhatsApp — Primary Accent CTA */}
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#0369A1] px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>{labels.whatsapp}</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </a>

            {/* Instagram @MIISHINTANI_AGENT */}
            <a
              href={SITE.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#99F6E4] bg-white/80 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#134E4A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] hover:bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 fill-current text-[#0F766E]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{labels.instagram}</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-[#0F766E] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${SITE.email}`}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#99F6E4] bg-white/80 px-5 py-4 text-xs font-semibold tracking-wider text-[#134E4A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] hover:bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 fill-none stroke-current text-[#0F766E]"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <span className="break-all">{labels.email}</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-[#0F766E] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </a>

            {/* Website công ty Re iDea */}
            <a
              href={SITE.websiteHref}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#99F6E4] bg-white/80 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#134E4A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] hover:bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 fill-none stroke-current text-[#0F766E]"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                <span>{labels.website}</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-[#0F766E] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </a>
          </div>
        </div>

        <div className="border-t border-[#99F6E4]/80 pt-6 text-center text-xs font-medium text-[#475569]">
          © {year} {labels.rights}
        </div>
      </div>
    </footer>
  );
}