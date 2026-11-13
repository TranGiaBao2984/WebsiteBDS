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
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2.1Z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={className}>
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
      {/* Top Bar — Tự động đổi ngôn ngữ theo currentLang */}
      <div className="hidden bg-[#2c2623] text-[#e6dfd5] lg:block">
        <div className={`${CONTAINER} flex h-9 items-center justify-between gap-6 whitespace-nowrap text-sm`}>
          <p>{topBar.intro}</p>
          <span>{topBar.services}</span>
          <a href={`mailto:${SITE.email}`} className="transition hover:text-white">
            {SITE.email}
          </a>
          <div className="flex items-center gap-4">
            <a href={SITE.whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-white">
              WhatsApp
            </a>
            <span>•</span>
            <a href={SITE.instagramHref} target="_blank" rel="noreferrer" className="transition hover:text-white">
              Instagram ({SITE.instagramHandle})
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#e6dfd5] bg-[#f8f6f0]/95 backdrop-blur-md">
        <div className={`${CONTAINER} flex items-center justify-between gap-4 whitespace-nowrap py-3.5`}>
          {/* Logo */}
          <Link href="/" className="group shrink-0 flex items-center">
            <Image
              src="/logo_mii.png"
              alt={SITE.name}
              width={600}
              height={150}
              priority
              className="h-20 w-auto object-contain mix-blend-multiply transition-opacity group-hover:opacity-80 lg:h-25"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:contents" aria-label="Main">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 py-1 text-base font-medium transition-colors ${
                    active ? 'font-bold text-[#8c6d53]' : 'text-[#574d43] hover:text-[#2c2623]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Switcher 3 Ngôn ngữ (Desktop) */}
          <div className="hidden shrink-0 items-center gap-3 text-sm font-medium lg:flex">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`cursor-pointer transition-colors ${
                  currentLang === lang.code
                    ? 'font-bold text-[#8c6d53] underline underline-offset-4'
                    : 'text-[#574d43] hover:text-[#2c2623]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Hotline & CTA */}
          <div className="hidden lg:contents">
            <a href={SITE.hotlineHref} className="flex shrink-0 items-center gap-2 text-base font-bold text-[#2c2623]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8c6d53]/10 text-[#8c6d53]">
                <PhoneIcon className="h-4 w-4" />
              </span>
              {SITE.hotline}
            </a>

            <Link
              href={SITE.ctaHref}
              onClick={handleCtaClick}
              className="inline-flex shrink-0 items-center rounded-lg bg-[#2c2623] px-5 py-2.5 text-base font-semibold text-[#f8f6f0] transition hover:bg-[#8c6d53]"
            >
              {t.header.getConsultation}
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 text-[#3c352d] lg:hidden"
            aria-label="Open Menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-60 bg-[#2c2623]/50 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 flex h-full w-[80%] max-w-sm flex-col justify-between bg-[#f8f6f0] p-6 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-4">
                <Image
                  src="/logo_mii.png"
                  alt={SITE.name}
                  width={300}
                  height={100}
                  className="h-16 w-auto object-contain mix-blend-multiply"
                />
                <button onClick={closeMenu} aria-label="Close Menu">
                  <CloseIcon className="h-6 w-6 text-[#3c352d]" />
                </button>
              </div>

              <nav className="space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-2 text-base font-medium text-[#2c2623] hover:text-[#8c6d53]"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Switcher 3 Ngôn ngữ (Mobile) */}
              <div className="border-t border-[#e6dfd5] pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8c827a]">{t.header.language}</p>
                <div className="flex gap-2 text-sm">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`rounded px-3 py-1.5 transition ${
                        currentLang === lang.code
                          ? 'bg-[#8c6d53] font-bold text-white'
                          : 'bg-[#e6dfd5]/50 text-[#2c2623]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liên hệ nhanh Mobile */}
              <div className="border-t border-[#e6dfd5] pt-4 space-y-2 text-xs text-[#574d43]">
                <p className="font-bold text-[#2c2623]">{SITE.company}</p>
                <p className="text-[#786e65]">{topBar.services}</p>
                <a href={SITE.hotlineHref} className="block font-semibold text-[#7a482b]">
                  Mobile: {SITE.hotline}
                </a>
                <a href={`mailto:${SITE.email}`} className="block break-all">
                  {SITE.email}
                </a>
                <div className="flex gap-4 pt-1 font-semibold text-[#2c2623]">
                  <a href={SITE.whatsappHref} target="_blank" rel="noreferrer" className="underline">
                    WhatsApp
                  </a>
                  <a href={SITE.instagramHref} target="_blank" rel="noreferrer" className="underline">
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#e6dfd5] pt-6 mt-6">
              <Link
                href={SITE.ctaHref}
                onClick={(e) => {
                  closeMenu();
                  handleCtaClick(e);
                }}
                className="block w-full rounded-xl bg-[#2c2623] py-3.5 text-center text-base font-bold uppercase text-white shadow-sm transition hover:bg-[#8c6d53]"
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