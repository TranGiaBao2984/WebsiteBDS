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
      {/* Japandi Warm Minimalist Showcase Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.05)] sm:p-8 lg:p-10">
        <div className="relative flex flex-col justify-between gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD6] bg-[#F2EFE9] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#A64237]">
              <BuildingIcon className="h-3.5 w-3.5 text-[#A64237]" />
              <span>{t.home.badge}</span>
            </span>

            <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#26221F] sm:text-3xl lg:text-4xl">
              {t.home.title}
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-[#66605A] sm:text-base">
              {t.home.description}
            </p>
          </div>

          <Link
            href="/properties"
            className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-center rounded-lg bg-[#A64237] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#8C352C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A64237] focus-visible:ring-offset-2 sm:self-end motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span>{t.home.viewAll}</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </div>
      </div>

      {/* Grid sản phẩm nổi bật */}
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {properties.length > 0 ? (
          properties.map((item, index) => (
            <PropertyCard key={item.id} property={item} priority={index < 3} />
          ))
        ) : (
          <div className="col-span-full flex w-full flex-col items-center justify-center rounded-xl border border-[#E5DFD6] bg-white p-12 text-center shadow-[0_4px_12px_rgba(38,34,31,0.05)]">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#E5DFD6] bg-[#F2EFE9] text-[#A64237]">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <p className="font-serif text-base font-semibold text-[#26221F]">
              {t.home.noProperties}
            </p>
          </div>
        )}
      </div>

      {/* Secondary CTA ở cuối Trang Chủ */}
      <div className="pt-2 text-center">
        <Link
          href="/properties"
          className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#E5DFD6] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#26221F] shadow-2xs transition-all duration-200 hover:border-[#A64237] hover:bg-[#A64237] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A64237] focus-visible:ring-offset-2"
        >
          <span>{t.home.exploreMore}</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </div>
    </section>
  );
}