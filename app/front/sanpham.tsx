'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';
import PropertyCard from './PropertyCard';

type FilterKey = 'location' | 'layout' | 'price';

// Khoảng giá tính bằng yên: min được tính, max không tính (p >= min && p < max).
// Nhãn chỉ dùng ký hiệu nên dùng chung cho cả 3 ngôn ngữ. Muốn đổi mốc giá thì sửa ở đây.
const PRICE_RANGES = [
  { id: 'lt3', label: '< ¥3M', min: 0, max: 3_000_000 },
  { id: '3-5', label: '¥3–5M', min: 3_000_000, max: 5_000_000 },
  { id: '5-10', label: '¥5–10M', min: 5_000_000, max: 10_000_000 },
  { id: '10-20', label: '¥10–20M', min: 10_000_000, max: 20_000_000 },
  { id: 'gte20', label: '≥ ¥20M', min: 20_000_000, max: Infinity },
];

const LOCATIONS = ['ALL', 'Tokyo', 'Chiba', 'Kyoto', 'Osaka', 'Kanagawa', 'Nagano', 'Fukuoka', 'Hokkaido'];

function PropertyCatalogContent({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL là nguồn sự thật duy nhất: link chia sẻ được, nút Back hoạt động, không cần đồng bộ state bằng effect.
  const read = (key: FilterKey) => {
    const v = searchParams.get(key);
    return !v || v.toUpperCase() === 'ALL' ? 'ALL' : v;
  };
  const selectedLocation = read('location');
  const selectedLayout = read('layout');
  const selectedPrice = read('price');

  const setFilter = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearFilters = () => router.replace(pathname, { scroll: false });

  const filterTabs = [
    { id: 'ALL', label: t.catalog.allLayouts },
    { id: '1K-1LDK', label: '1K / 1LDK' },
    { id: '2LDK-3LDK', label: '2LDK / 3LDK' },
    { id: 'Kominka', label: t.catalog.kominka },
  ];

  // Giá trị price lạ trên URL (ví dụ ?price=abc) thì bỏ qua, không lọc
  const priceRange = PRICE_RANGES.find((r) => r.id === selectedPrice);

  // Lọc kết hợp Khu vực, Khoảng giá và Mặt bằng
  const filteredProperties = properties.filter((item) => {
    // 1. Khu vực
    if (selectedLocation !== 'ALL') {
      const itemLoc = (item.location || '').toLowerCase();
      if (!itemLoc.includes(selectedLocation.toLowerCase())) return false;
    }

    // 2. Khoảng giá
    if (priceRange) {
      const price = Number(item.price);
      if (!Number.isFinite(price) || price < priceRange.min || price >= priceRange.max) return false;
    }

    // 3. Mặt bằng
    if (selectedLayout === 'ALL') return true;
    const layout = (item.layout || '').toUpperCase();
    if (selectedLayout === '1K-1LDK') {
      return layout.includes('1K') || layout.includes('1LDK');
    }
    if (selectedLayout === '2LDK-3LDK') {
      return layout.includes('2LDK') || layout.includes('3LDK') || layout.includes('4LDK');
    }
    if (selectedLayout === 'Kominka') {
      return layout.includes('KOMINKA') || (item.structure || '').toUpperCase().includes('TRADITIONAL');
    }

    return true;
  });

  const hasFilters = selectedLocation !== 'ALL' || selectedLayout !== 'ALL' || !!priceRange;

  return (
    <section className="space-y-6 sm:space-y-8 w-full">
      {/* Catalog Title */}
      <div className="text-center sm:text-left border-b border-[#e6dfd5] pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2c2623] tracking-wide">
          {t.catalog.title}
        </h1>
      </div>

      {/* FILTER BARS */}
      <div className="space-y-4 border-b border-[#e6dfd5] pb-6">
        {/* Khu vực */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {t.catalog.locationLabel}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {LOCATIONS.map((loc) => {
              const isActive = selectedLocation.toLowerCase() === loc.toLowerCase();
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFilter('location', loc)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${
                    isActive
                      ? 'bg-[#2c2623] border-[#2c2623] text-white shadow-sm'
                      : 'bg-white border-[#e6dfd5] text-[#574d43] hover:border-[#8c6d53]'
                  }`}
                >
                  {loc === 'ALL' ? t.catalog.allLocations : loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {t.catalog.priceLabel}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[{ id: 'ALL', label: t.catalog.allPrices }, ...PRICE_RANGES].map((range) => {
              const isActive = selectedPrice === range.id;
              return (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setFilter('price', range.id)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${
                    isActive
                      ? 'bg-[#2c2623] border-[#2c2623] text-white shadow-sm'
                      : 'bg-white border-[#e6dfd5] text-[#574d43] hover:border-[#8c6d53]'
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mặt bằng */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {t.catalog.layoutLabel}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = selectedLayout === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter('layout', tab.id)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border ${
                    isActive
                      ? 'bg-[#d8c7b8] border-[#8c6d53] text-[#2c2623] shadow-sm'
                      : 'bg-white/80 border-[#e6dfd5] text-[#786e65] hover:border-[#8c6d53] hover:text-[#2c2623]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Đếm số lượng & nút xoá lọc */}
      <div className="flex items-center justify-between text-xs text-[#8c827a]">
        <div>
          {t.catalog.showing} <span className="font-bold text-[#2c2623]">{filteredProperties.length}</span> {t.catalog.properties}
          {selectedLocation !== 'ALL' && (
            <span className="ml-1">
              {t.catalog.inLocation} <strong className="text-[#8c6d53]">{selectedLocation}</strong>
            </span>
          )}
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-[#8c6d53] hover:underline font-medium">
            {t.catalog.clearFilter}
          </button>
        )}
      </div>

      {/* PROPERTY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 w-full">
            <p className="text-stone-600 font-serif font-medium text-base">{t.catalog.noResults}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SanPhamSection({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();

  return (
    <Suspense fallback={<div className="text-center py-8 text-xs text-[#8c827a]">{t.catalog.loading}</div>}>
      <PropertyCatalogContent properties={properties} />
    </Suspense>
  );
}