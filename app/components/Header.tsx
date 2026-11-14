'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, type Language } from '@/app/context/LanguageContext';
import { SITE } from '@/lib/site';
import Image from 'next/image';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'vi', label: 'Tiếng Việt' },
];

const TOPBAR_LABELS: Record<Language, { intro: string; services: string }> = {
  vi: {
    intro: 'RE AGENT by Re iDea — Hỗ trợ khách hàng quốc tế tìm nhà tại Nhật Bản',
    services: 'Cho thuê / Mua bán / Hỗ trợ định cư',
  },
  en: {
    intro: 'RE AGENT by Re iDea — Helping Overseas Clients Find Homes in Japan',
    services: 'Rental / Sales / Relocation Support',
  },
  ja: {
    intro: 'RE AGENT by Re iDea — 海外のお客様の日本での住まい探しをサポート',
    services: '賃貸 / 売買 / リロケーション支援',
  },
};

const CONTAINER = 'w-full px-6 sm:px-10 lg:px-16 2xl:px-24';

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2.1Z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
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
      <path d="M4 7h16M4 12h16M4 17h16" />
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
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentLang, setLanguage, t } = useLanguage();
  const topBar = TOPBAR_LABELS[currentLang] || TOPBAR_LABELS.en;

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Tự động cuộn xuống phần form liên hệ nếu đã đứng ở trang /about
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/about') {
      e.preventDefault();
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const links = [
    { name: t.header.home, href: '/' },
    { name: t.header.properties, href: '/properties' },
    { name: t.header.aboutMe, href: '/about' },
  ];

  return (
    <>
      {/* Top Bar — Nền xanh ngọc đậm đồng bộ bảng màu Foreground */}
      <div className="hidden bg-[#134E4A] text-[#F0FDFA] lg:block">
        <div className={`${CONTAINER} flex h-9 items-center justify-between gap-6 whitespace-nowrap text-xs font-medium tracking-wide`}>
          <p className="text-[#F0FDFA]/90">{topBar.intro}</p>
          <span className="text-[#99F6E4]">{topBar.services}</span>
          <a
            href={`mailto:${SITE.email}`}
            className="cursor-pointer transition-colors duration-200 hover:text-[#99F6E4] focus-visible:underline focus-visible:outline-none"
          >
            {SITE.email}
          </a>
          <div className="flex items-center gap-3">
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer transition-colors duration-200 hover:text-[#99F6E4] focus-visible:underline focus-visible:outline-none"
            >
              WhatsApp
            </a>
            <span className="text-[#14B8A6]">•</span>
            <a
              href={SITE.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer transition-colors duration-200 hover:text-[#99F6E4] focus-visible:underline focus-visible:outline-none"
            >
              Instagram ({SITE.instagramHandle})
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#99F6E4]/80 bg-[#F0FDFA]/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className={`${CONTAINER} flex items-center justify-between gap-4 whitespace-nowrap py-3`}>
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 cursor-pointer items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <Image
              src="/logo_mii.png"
              alt={SITE.name}
              width={600}
              height={150}
              priority
              className="h-16 w-auto object-contain mix-blend-multiply transition-opacity duration-200 group-hover:opacity-85 lg:h-20"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative shrink-0 cursor-pointer py-1.5 text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded ${
                    active
                      ? 'font-bold text-[#0F766E] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#0F766E]'
                      : 'font-medium text-[#475569] hover:text-[#134E4A]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Switcher 3 Ngôn ngữ (Desktop Glass Pill) */}
          <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-[#99F6E4] bg-white/75 p-1 text-xs font-semibold backdrop-blur-sm lg:flex">
            {LANGUAGES.map((lang) => {
              const selected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                    selected
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-[#475569] hover:bg-[#F0FDFA] hover:text-[#134E4A]'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Hotline & Primary CTA */}
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href={SITE.hotlineHref}
              className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg py-1 text-sm font-bold text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#99F6E4] bg-white/80 text-[#0F766E] shadow-xs">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span>{SITE.hotline}</span>
            </a>

            <Link
              href={SITE.ctaHref}
              onClick={handleCtaClick}
              className="inline-flex shrink-0 cursor-pointer items-center rounded-lg bg-[#0369A1] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {t.header.getConsultation}
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="cursor-pointer rounded-lg border border-[#99F6E4] bg-white/80 p-2 text-[#134E4A] transition-colors duration-200 hover:bg-white hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] lg:hidden"
            aria-label="Open Menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Glassmorphism Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-60 bg-[#134E4A]/45 backdrop-blur-sm lg:hidden">
          <div className="absolute top-0 right-0 flex h-full w-[82%] max-w-sm flex-col justify-between overflow-y-auto border-l border-[#99F6E4] bg-[#F0FDFA]/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#99F6E4] pb-4">
                <Image
                  src="/logo_mii.png"
                  alt={SITE.name}
                  width={300}
                  height={100}
                  className="h-14 w-auto object-contain mix-blend-multiply"
                />
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close Menu"
                  className="cursor-pointer rounded-lg border border-[#99F6E4] bg-white/80 p-2 text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2" aria-label="Mobile Main">
                {links.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`block cursor-pointer rounded-lg px-3 py-2.5 text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                        active
                          ? 'bg-white font-bold text-[#0F766E] ring-1 ring-[#99F6E4]'
                          : 'font-medium text-[#134E4A] hover:bg-white/60 hover:text-[#0F766E]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Switcher 3 Ngôn ngữ (Mobile) */}
              <div className="border-t border-[#99F6E4] pt-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  {t.header.language}
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                        currentLang === lang.code
                          ? 'bg-[#0F766E] font-bold text-white shadow-xs'
                          : 'border border-[#99F6E4] bg-white/80 text-[#134E4A] hover:bg-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liên hệ nhanh Mobile */}
              <div className="space-y-2 rounded-xl border border-[#99F6E4] bg-white/80 p-4 text-xs text-[#475569]">
                <p className="font-bold text-[#134E4A]">{SITE.company}</p>
                <p>{topBar.services}</p>
                <a
                  href={SITE.hotlineHref}
                  className="block cursor-pointer pt-1 font-bold text-[#0F766E] hover:underline"
                >
                  Mobile: {SITE.hotline}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="block cursor-pointer break-all hover:text-[#134E4A] hover:underline"
                >
                  {SITE.email}
                </a>
                <div className="flex gap-4 pt-1.5 font-semibold text-[#0369A1]">
                  <a
                    href={SITE.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer underline hover:opacity-80"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={SITE.instagramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer underline hover:opacity-80"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#99F6E4] pt-5">
              <Link
                href={SITE.ctaHref}
                onClick={(e) => {
                  closeMenu();
                  handleCtaClick(e);
                }}
                className="block w-full cursor-pointer rounded-lg bg-[#0369A1] py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
              >
                {t.header.getConsultation}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}