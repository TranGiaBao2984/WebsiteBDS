'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';
import PropertyCard from './PropertyCard';

type FilterKey = 'location' | 'layout' | 'price';

const PRICE_RANGES = [
  { id: 'lt3', label: '< ¥3M', min: 0, max: 3_000_000 },
  { id: '3-5', label: '¥3–5M', min: 3_000_000, max: 5_000_000 },
  { id: '5-10', label: '¥5–10M', min: 5_000_000, max: 10_000_000 },
  { id: '10-20', label: '¥10–20M', min: 10_000_000, max: 20_000_000 },
  { id: 'gte20', label: '≥ ¥20M', min: 20_000_000, max: Infinity },
];

const LOCATIONS = ['ALL', 'Tokyo', 'Chiba', 'Kyoto', 'Osaka', 'Kanagawa', 'Nagano', 'Fukuoka', 'Hokkaido'];

// Hàm chuyển đổi an toàn mọi kiểu dữ liệu (string, object, function) về chuỗi thuần
function getString(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'function') return (val as () => string)();
  if (typeof val === 'object' && val !== null) {
    const record = val as Record<string, unknown>;
    return getString(record.vi || record.en || record.ja || '');
  }
  return String(val);
}

function PropertyCatalogContent({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();
  const catalogObj = (t && typeof t === 'object' && 'catalog' in t)
    ? (t as Record<string, Record<string, string>>).catalog
    : undefined;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const read = (key: FilterKey): string => {
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
    { id: 'ALL', label: getString(catalogObj?.allLayouts) || 'Tất cả' },
    { id: '1K-1LDK', label: '1K / 1LDK' },
    { id: '2LDK-3LDK', label: '2LDK / 3LDK' },
    { id: 'Kominka', label: getString(catalogObj?.kominka) || 'Kominka' },
  ];

  const priceRange = PRICE_RANGES.find((r) => r.id === selectedPrice);

  const filteredProperties = properties.filter((item) => {
    if (selectedLocation !== 'ALL') {
      const itemLoc = getString(item.location).toLowerCase();
      const targetLoc = selectedLocation.toLowerCase();
      if (!itemLoc.includes(targetLoc)) return false;
    }

    if (priceRange) {
      const price = Number(item.price);
      if (!Number.isFinite(price) || price < priceRange.min || price >= priceRange.max) return false;
    }

    if (selectedLayout === 'ALL') return true;
    const layout = getString(item.layout).toUpperCase();
    if (selectedLayout === '1K-1LDK') {
      return layout.includes('1K') || layout.includes('1LDK');
    }
    if (selectedLayout === '2LDK-3LDK') {
      return layout.includes('2LDK') || layout.includes('3LDK') || layout.includes('4LDK');
    }
    if (selectedLayout === 'Kominka') {
      const structure = getString(item.structure).toUpperCase();
      return layout.includes('KOMINKA') || structure.includes('TRADITIONAL');
    }

    return true;
  });

  const hasFilters = selectedLocation !== 'ALL' || selectedLayout !== 'ALL' || !!priceRange;

  return (
    <section className="space-y-6 sm:space-y-8 w-full">
      <div className="text-center sm:text-left border-b border-[#e6dfd5] pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2c2623] tracking-wide">
          {getString(catalogObj?.title) || 'Danh sách bất động sản'}
        </h1>
      </div>

      <div className="space-y-4 border-b border-[#e6dfd5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {getString(catalogObj?.locationLabel) || 'Khu vực'}
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
                  {loc === 'ALL' ? getString(catalogObj?.allLocations) || 'Tất cả' : loc}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {getString(catalogObj?.priceLabel) || 'Khoảng giá'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[{ id: 'ALL', label: getString(catalogObj?.allPrices) || 'Tất cả' }, ...PRICE_RANGES].map((range) => {
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

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c827a] block mb-2">
            {getString(catalogObj?.layoutLabel) || 'Mặt bằng'}
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

      <div className="flex items-center justify-between text-xs text-[#8c827a]">
        <div>
          {getString(catalogObj?.showing) || 'Hiển thị'}{' '}
          <span className="font-bold text-[#2c2623]">{filteredProperties.length}</span>{' '}
          {getString(catalogObj?.properties) || 'bất động sản'}
          {selectedLocation !== 'ALL' && (
            <span className="ml-1">
              {getString(catalogObj?.inLocation) || 'tại'} <strong className="text-[#8c827a]">{selectedLocation}</strong>
            </span>
          )}
        </div>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-[#8c6d53] hover:underline font-medium">
            {getString(catalogObj?.clearFilter) || 'Xóa bộ lọc'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 w-full">
            <p className="text-stone-600 font-serif font-medium text-base">
              {getString(catalogObj?.noResults) || 'Không tìm thấy kết quả phù hợp'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SanPhamSection({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();
  const catalogObj = (t && typeof t === 'object' && 'catalog' in t)
    ? (t as Record<string, Record<string, string>>).catalog
    : undefined;

  return (
    <Suspense fallback={<div className="text-center py-8 text-xs text-[#8c827a]">{getString(catalogObj?.loading) || 'Đang tải...'}</div>}>
      <PropertyCatalogContent properties={properties} />
    </Suspense>
  );
}