/* eslint-disable @next/next/no-img-element */
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';
import { getFilterOptions } from '@/app/back/filter-options';
import {
  DEFAULT_FILTER_OPTIONS,
  type FilterOptionsData,
} from '@/lib/filter-constants';
import PropertyCard from './PropertyCard';

type FilterKey = 'location' | 'layout' | 'price' | 'q';

const LEGACY_PRICE_MAP: Record<string, string> = {
  lt3: '< ¥3M',
  '3-5': '¥3–5M',
  '5-10': '¥5–10M',
  '10-20': '¥10–20M',
  gte20: '≥ ¥20M',
};

const LEGACY_LAYOUT_MAP: Record<string, string> = {
  '1K-1LDK': '1K / 1LDK',
  '2LDK-3LDK': '2LDK / 3LDK',
  Kominka: 'KOMINKA (TRADITIONAL)',
};

const SEARCH_UI_LABELS = {
  vi: {
    label: 'TÌM KIẾM',
    placeholder: 'Tìm theo tên BĐS hoặc khu vực (Việt / Anh / Nhật)...',
    clearSearch: 'Xóa từ khóa',
    suggestionsHeader: 'Gợi ý bất động sản',
    viewDetail: 'Xem chi tiết →',
    noSuggestions: 'Không có BĐS nào khớp từ khóa này',
    keywordTag: 'từ khóa',
  },
  en: {
    label: 'SEARCH',
    placeholder: 'Search by property name or location (EN / JA / VI)...',
    clearSearch: 'Clear search',
    suggestionsHeader: 'Matching Properties',
    viewDetail: 'View details →',
    noSuggestions: 'No properties match this keyword',
    keywordTag: 'keyword',
  },
  ja: {
    label: '検索',
    placeholder: '物件名・エリアで検索（日本語 / 英語 / ベトナム語）...',
    clearSearch: '検索をクリア',
    suggestionsHeader: '一致する物件候補',
    viewDetail: '詳細を見る →',
    noSuggestions: '一致する物件が見つかりませんでした',
    keywordTag: 'キーワード',
  },
};

function unwrapJson(val: unknown): unknown {
  let current: unknown = val;
  for (let i = 0; i < 10; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      }
    }
    break;
  }
  return current;
}

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

function getTriLingualTitles(val: unknown): {
  vi: string;
  en: string;
  ja: string;
  uniqueList: { lang: 'VI' | 'EN' | 'JA'; text: string }[];
} {
  const unwrapped = unwrapJson(val);

  if (typeof unwrapped === 'string') {
    const clean = unwrapped.trim();
    return {
      vi: clean,
      en: clean,
      ja: clean,
      uniqueList: clean ? [{ lang: 'VI', text: clean }] : [],
    };
  }

  if (typeof unwrapped === 'object' && unwrapped !== null) {
    const record = unwrapped as Record<string, unknown>;
    const vi = typeof record.vi === 'string' ? record.vi.trim() : '';
    const en = typeof record.en === 'string' ? record.en.trim() : '';
    const ja = typeof record.ja === 'string' ? record.ja.trim() : '';

    const rawEntries: { lang: 'VI' | 'EN' | 'JA'; text: string }[] = [
      { lang: 'VI', text: vi },
      { lang: 'EN', text: en },
      { lang: 'JA', text: ja },
    ];

    const uniqueList = rawEntries.filter((entry) => entry.text.length > 0);
    return { vi, en, ja, uniqueList };
  }

  return { vi: '', en: '', ja: '', uniqueList: [] };
}

function getDescriptionRecord(property: Property): Record<string, unknown> {
  const descObj = unwrapJson(property.description);
  if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
    return descObj as Record<string, unknown>;
  }
  return {};
}

function normalizeLabel(str: string): string {
  return str
    .normalize('NFC')
    .replace(/[-–—]/g, '–')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stripVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function matchesSearchKeyword(property: Property, keyword: string): boolean {
  const cleanQuery = keyword.normalize('NFC').trim().toLowerCase();
  if (!cleanQuery) return true;

  const asciiQuery = stripVietnameseAccents(cleanQuery);
  const titles = getTriLingualTitles(property.title);
  const descRecord = getDescriptionRecord(property);

  const searchableFields = [
    titles.vi,
    titles.en,
    titles.ja,
    getString(property.location),
    typeof descRecord.filter_location === 'string' ? descRecord.filter_location : '',
  ].filter(Boolean);

  return searchableFields.some((field) => {
    const normField = field.normalize('NFC').toLowerCase();
    const asciiField = stripVietnameseAccents(normField);
    return normField.includes(cleanQuery) || asciiField.includes(asciiQuery);
  });
}

function getYenPrice(property: Property, descRecord: Record<string, unknown>): number {
  const savedJa = Number(descRecord.price_ja);
  if (Number.isFinite(savedJa) && savedJa > 0) return savedJa;

  const yenCol = Number(property.price_yen);
  if (Number.isFinite(yenCol) && yenCol > 0) return yenCol;

  const basePrice = Number(property.price);
  return Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 0;
}

function matchesPriceFilter(
  property: Property,
  descRecord: Record<string, unknown>,
  selectedPrice: string
): boolean {
  const savedPriceTag =
    typeof descRecord.filter_price === 'string' ? descRecord.filter_price.trim() : '';

  if (savedPriceTag) {
    return normalizeLabel(savedPriceTag) === normalizeLabel(selectedPrice);
  }

  const yen = getYenPrice(property, descRecord);
  if (yen <= 0) return false;

  const clean = selectedPrice.replace(/[-–—]/g, '–').trim();

  const ltMatch = clean.match(/^<\s*¥?\s*(\d+(?:\.\d+)?)\s*M?$/i);
  if (ltMatch) {
    const maxVal = Number(ltMatch[1]) * (clean.toUpperCase().includes('M') ? 1_000_000 : 1);
    return yen < maxVal;
  }

  const gteMatch = clean.match(/^(?:≥|>=|>)\s*¥?\s*(\d+(?:\.\d+)?)\s*M?$/i);
  if (gteMatch) {
    const minVal = Number(gteMatch[1]) * (clean.toUpperCase().includes('M') ? 1_000_000 : 1);
    return yen >= minVal;
  }

  const rangeMatch = clean.match(/^¥?\s*(\d+(?:\.\d+)?)\s*–\s*¥?\s*(\d+(?:\.\d+)?)\s*M?$/i);
  if (rangeMatch) {
    const multiplier = clean.toUpperCase().includes('M') ? 1_000_000 : 1;
    const minVal = Number(rangeMatch[1]) * multiplier;
    const maxVal = Number(rangeMatch[2]) * multiplier;
    return yen >= minVal && yen <= maxVal;
  }

  const exactNum = Number(clean.replace(/[^\d.]/g, ''));
  if (Number.isFinite(exactNum) && exactNum > 0) {
    return yen === exactNum;
  }

  return false;
}

function PropertyCatalogContent({ properties }: { properties: Property[] }) {
  const { t, currentLang } = useLanguage();
  const searchLabels = SEARCH_UI_LABELS[currentLang] || SEARCH_UI_LABELS.en;
  const catalogObj =
    t && typeof t === 'object' && 'catalog' in t
      ? (t as Record<string, Record<string, string>>).catalog
      : undefined;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>(DEFAULT_FILTER_OPTIONS);
  const [searchInput, setSearchInput] = useState<string>(() => searchParams.get('q') || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getFilterOptions().then((opts) => {
      if (mounted) {
        setFilterOptions(opts);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const read = (key: FilterKey): string => {
    const v = searchParams.get(key);
    if (key === 'q') return v ? v.normalize('NFC') : '';
    if (!v || v.toUpperCase() === 'ALL') return 'ALL';
    if (key === 'price' && LEGACY_PRICE_MAP[v]) return LEGACY_PRICE_MAP[v];
    if (key === 'layout' && LEGACY_LAYOUT_MAP[v]) return LEGACY_LAYOUT_MAP[v];
    return v.normalize('NFC');
  };

  const selectedLocation = read('location');
  const selectedLayout = read('layout');
  const selectedPrice = read('price');

  const setFilter = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'ALL') params.delete(key);
    else params.set(key, value.normalize('NFC'));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setShowDropdown(true);
    setFilter('q', val.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setShowDropdown(false);
    router.replace(pathname, { scroll: false });
  };

  const locationOptions = ['ALL', ...filterOptions.locations];
  const priceOptions = ['ALL', ...filterOptions.prices];
  const layoutOptions = ['ALL', ...filterOptions.layouts];

  const searchSuggestions = searchInput.trim()
    ? properties.filter((item) => matchesSearchKeyword(item, searchInput)).slice(0, 6)
    : [];

  const filteredProperties = properties.filter((item) => {
    const descRecord = getDescriptionRecord(item);

    if (searchInput.trim() !== '') {
      if (!matchesSearchKeyword(item, searchInput)) return false;
    }

    if (selectedLocation !== 'ALL') {
      const savedLocTag =
        typeof descRecord.filter_location === 'string' ? descRecord.filter_location.trim() : '';

      if (savedLocTag) {
        if (normalizeLabel(savedLocTag) !== normalizeLabel(selectedLocation)) return false;
      } else {
        const allLocText = normalizeLabel(JSON.stringify(item.location || ''));
        if (!allLocText.includes(normalizeLabel(selectedLocation))) return false;
      }
    }

    if (selectedPrice !== 'ALL') {
      if (!matchesPriceFilter(item, descRecord, selectedPrice)) return false;
    }

    if (selectedLayout !== 'ALL') {
      const savedLayoutTag =
        typeof descRecord.filter_layout === 'string' ? descRecord.filter_layout.trim() : '';

      if (savedLayoutTag) {
        return normalizeLabel(savedLayoutTag) === normalizeLabel(selectedLayout);
      }

      const layout = normalizeLabel(getString(item.layout));
      const structure = normalizeLabel(getString(item.structure));
      const target = normalizeLabel(selectedLayout);

      if (target.includes('1k') || target.includes('1ldk')) {
        return layout.includes('1k') || layout.includes('1ldk') || layout.includes('1dk');
      }
      if (target.includes('2ldk') || target.includes('3ldk')) {
        return (
          layout.includes('2ldk') ||
          layout.includes('3ldk') ||
          layout.includes('4ldk') ||
          layout.includes('2dk') ||
          layout.includes('3dk')
        );
      }
      if (target.includes('kominka') || target.includes('traditional')) {
        return layout.includes('kominka') || structure.includes('traditional');
      }

      return layout.includes(target) || structure.includes(target);
    }

    return true;
  });

  const hasFilters =
    searchInput.trim() !== '' ||
    selectedLocation !== 'ALL' ||
    selectedLayout !== 'ALL' ||
    selectedPrice !== 'ALL';

  return (
    <section className="space-y-6 sm:space-y-8 w-full">
      <div className="text-center sm:text-left border-b border-[#e6dfd5] pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2c2623] tracking-wide">
          {getString(catalogObj?.title) || 'Danh sách bất động sản'}
        </h1>
      </div>

      <div className="space-y-5 border-b border-[#e6dfd5] pb-6">
        {/* THANH TÌM KIẾM TÊN BĐS (3 NGÔN NGỮ VI / EN / JA) */}
        <div ref={searchBoxRef} className="relative max-w-2xl">
          <label
            htmlFor="property-trilingual-search"
            className="text-xs font-bold uppercase tracking-wider text-[#574d43] block mb-2"
          >
            {searchLabels.label}
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-[#7a482b]">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.05 6.05a7.5 7.5 0 0 0 10.6 10.6Z"
                />
              </svg>
            </span>

            <input
              id="property-trilingual-search"
              type="text"
              value={searchInput}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              placeholder={searchLabels.placeholder}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#d8cebe] rounded-xl text-sm text-[#2c2623] placeholder:text-[#786e65] focus:outline-none focus:border-[#7a482b] focus:ring-2 focus:ring-[#7a482b]/20 shadow-2xs transition"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label={searchLabels.clearSearch}
                className="absolute right-3 p-1 text-[#574d43] hover:text-[#2c2623] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown hiển thị gợi ý tên BĐS cả 3 ngôn ngữ */}
          {showDropdown && searchInput.trim() !== '' && (
            <div className="absolute z-30 mt-2 w-full bg-white border border-[#e6dfd5] rounded-2xl shadow-xl overflow-hidden">
              <div className="px-4 py-2 bg-[#faf8f5] border-b border-[#f0eae1] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a482b]">
                  {searchLabels.suggestionsHeader}
                </span>
                <span className="text-[11px] font-medium text-[#574d43]">
                  {searchSuggestions.length}
                </span>
              </div>

              {searchSuggestions.length > 0 ? (
                <ul className="divide-y divide-[#f3eee7] max-h-80 overflow-y-auto">
                  {searchSuggestions.map((item) => {
                    const titles = getTriLingualTitles(item.title);
                    const descRecord = getDescriptionRecord(item);
                    const yen = getYenPrice(item, descRecord);
                    const thumb =
                      Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0]
                        : null;

                    return (
                      <li key={item.id}>
                        <Link
                          href={`/properties/${item.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-start gap-3 p-3.5 hover:bg-[#faf8f5] transition group"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={titles.en || titles.vi || 'Property'}
                              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#e6dfd5]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-[#f3eee7] shrink-0 flex items-center justify-center text-xs text-[#574d43]">
                              BĐS
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-1">
                            {titles.uniqueList.map((entry) => (
                              <div
                                key={`${item.id}-${entry.lang}`}
                                className="flex items-baseline gap-1.5 text-xs"
                              >
                                <span className="inline-block px-1.5 py-0.5 rounded bg-[#f3eee7] text-[#7a482b] font-bold text-[10px] shrink-0">
                                  {entry.lang}
                                </span>
                                <span className="font-medium text-[#2c2623] group-hover:text-[#7a482b] truncate">
                                  {entry.text}
                                </span>
                              </div>
                            ))}

                            <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#574d43]">
                              <span>
                                {yen > 0 ? `¥${yen.toLocaleString('en-US')}` : ''}
                              </span>
                              <span className="font-semibold text-[#7a482b] group-hover:underline">
                                {searchLabels.viewDetail}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-[#574d43]">
                  {searchLabels.noSuggestions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOCATION */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#574d43] block mb-2">
            {getString(catalogObj?.locationLabel) || 'Khu vực'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {locationOptions.map((loc) => {
              const isActive =
                loc === 'ALL'
                  ? selectedLocation === 'ALL'
                  : normalizeLabel(selectedLocation) === normalizeLabel(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFilter('location', loc)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#2c2623] border-[#2c2623] text-white shadow-sm'
                      : 'bg-white border-[#e6dfd5] text-[#3c352d] hover:border-[#8c6d53]'
                  }`}
                >
                  {loc === 'ALL' ? getString(catalogObj?.allLocations) || 'Tất cả' : loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRICE */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#574d43] block mb-2">
            {getString(catalogObj?.priceLabel) || 'Khoảng giá'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {priceOptions.map((priceLabel) => {
              const isActive =
                priceLabel === 'ALL'
                  ? selectedPrice === 'ALL'
                  : normalizeLabel(selectedPrice) === normalizeLabel(priceLabel);
              return (
                <button
                  key={priceLabel}
                  type="button"
                  onClick={() => setFilter('price', priceLabel)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#2c2623] border-[#2c2623] text-white shadow-sm'
                      : 'bg-white border-[#e6dfd5] text-[#3c352d] hover:border-[#8c6d53]'
                  }`}
                >
                  {priceLabel === 'ALL'
                    ? getString(catalogObj?.allPrices) || 'Tất cả'
                    : priceLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* LAYOUT */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#574d43] block mb-2">
            {getString(catalogObj?.layoutLabel) || 'Mặt bằng'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {layoutOptions.map((layoutLabel) => {
              const isActive =
                layoutLabel === 'ALL'
                  ? selectedLayout === 'ALL'
                  : normalizeLabel(selectedLayout) === normalizeLabel(layoutLabel);
              const displayLabel =
                layoutLabel === 'ALL'
                  ? getString(catalogObj?.allLayouts) || 'Tất cả'
                  : layoutLabel.toUpperCase().includes('KOMINKA')
                    ? getString(catalogObj?.kominka) || layoutLabel
                    : layoutLabel;

              return (
                <button
                  key={layoutLabel}
                  type="button"
                  onClick={() => setFilter('layout', layoutLabel)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#d8c7b8] border-[#8c6d53] text-[#2c2623] shadow-sm'
                      : 'bg-white border-[#e6dfd5] text-[#574d43] hover:border-[#8c6d53] hover:text-[#2c2623]'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#574d43]">
        <div>
          {getString(catalogObj?.showing) || 'Hiển thị'}{' '}
          <span className="font-bold text-[#2c2623]">{filteredProperties.length}</span>{' '}
          {getString(catalogObj?.properties) || 'bất động sản'}
          {selectedLocation !== 'ALL' && (
            <span className="ml-1">
              {getString(catalogObj?.inLocation) || 'tại'}{' '}
              <strong className="text-[#2c2623]">{selectedLocation}</strong>
            </span>
          )}
          {searchInput.trim() !== '' && (
            <span className="ml-1">
              ({searchLabels.keywordTag}:{' '}
              <strong className="text-[#2c2623]">“{searchInput.trim()}”</strong>)
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[#7a482b] hover:underline font-semibold cursor-pointer"
          >
            {getString(catalogObj?.clearFilter) || 'Xóa bộ lọc'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e6dfd5] p-8 w-full space-y-4">
            <p className="text-[#3c352d] font-serif font-medium text-base">
              {getString(catalogObj?.noResults) || 'Không tìm thấy kết quả phù hợp'}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-[#7a482b] hover:bg-[#633a22] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
              >
                {getString(catalogObj?.clearFilter) || 'Xóa bộ lọc'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function SanPhamSection({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();
  const catalogObj =
    t && typeof t === 'object' && 'catalog' in t
      ? (t as Record<string, Record<string, string>>).catalog
      : undefined;

  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-xs text-[#574d43]">
          {getString(catalogObj?.loading) || 'Đang tải...'}
        </div>
      }
    >
      <PropertyCatalogContent properties={properties} />
    </Suspense>
  );
}