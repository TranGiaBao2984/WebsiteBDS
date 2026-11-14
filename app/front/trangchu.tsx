'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';
import PropertyCard from './PropertyCard';

function BuildingIcon({ className }: { className?: string }) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

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

// Trang chủ nhận sẵn tối đa 6 căn từ getFeaturedProperties, không cần cắt lại ở đây.
export default function TrangChuSection({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();

  return (
    <section id="trangchu" className="w-full space-y-10">
      {/* Glassmorphism Showcase Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/75 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-8 lg:p-10">
        {/* Điểm sáng chiều sâu cho hiệu ứng Glassmorphism */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#14B8A6]/12 blur-3xl"
        />

        <div className="relative flex flex-col justify-between gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#99F6E4] bg-[#F0FDFA]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
              <BuildingIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{t.home.badge}</span>
            </span>

            <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#134E4A] sm:text-3xl lg:text-4xl">
              {t.home.title}
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-[#475569] sm:text-base">
              {t.home.description}
            </p>
          </div>

          <Link
            href="/properties"
            className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-center rounded-lg bg-[#0369A1] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 sm:self-end motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span>{t.home.viewAll}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </div>
      </div>

      {/* Grid sản phẩm nổi bật */}
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {properties.length > 0 ? (
          properties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full flex w-full flex-col items-center justify-center rounded-xl border border-[#99F6E4] bg-white/80 p-12 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <p className="font-serif text-base font-semibold text-[#134E4A]">
              {t.home.noProperties}
            </p>
          </div>
        )}
      </div>

      {/* Secondary CTA ở cuối Trang Chủ */}
      <div className="pt-2 text-center">
        <Link
          href="/properties"
          className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-[#0F766E] bg-white/75 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F766E] backdrop-blur-sm transition-all duration-200 hover:bg-[#0F766E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
        >
          <span>{t.home.exploreMore}</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </div>
    </section>
  );
}