'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';
import PropertyCard from './PropertyCard';

// Trang chủ nhận sẵn tối đa 6 căn từ getFeaturedProperties, không cần cắt lại ở đây.
export default function TrangChuSection({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();

  return (
    <section id="trangchu" className="space-y-8 w-full">
      {/* Hero Header */}
      <div className="text-center sm:text-left border-b border-[#e6dfd5] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6d53]">
            {t.home.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#2c2623] mt-1 tracking-wide">
            {t.home.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#786e65] mt-1.5 max-w-xl">
            {t.home.description}
          </p>
        </div>

        <Link
          href="/sanpham"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#7a482b] hover:bg-[#633a22] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          {t.home.viewAll}
        </Link>
      </div>

      {/* Grid sản phẩm nổi bật */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {properties.length > 0 ? (
          properties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 w-full">
            <p className="text-stone-600 font-serif font-medium text-base">{t.home.noProperties}</p>
          </div>
        )}
      </div>

      {/* Footer CTA Banner ở Trang Chủ */}
      <div className="pt-4 text-center">
        <Link
          href="/sanpham"
          className="inline-block text-xs font-semibold text-[#7a482b] hover:text-[#2c2623] underline underline-offset-4 tracking-wider uppercase transition"
        >
          {t.home.exploreMore}
        </Link>
      </div>
    </section>
  );
}
