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
    viewDetail: 'Xem chi tiết',
    noSuggestions: 'Không có BĐS nào khớp từ khóa này',
    keywordTag: 'từ khóa',
  },
  en: {
    label: 'SEARCH',
    placeholder: 'Search by property name or location (EN / JA / VI)...',
    clearSearch: 'Clear search',
    suggestionsHeader: 'Matching Properties',
    viewDetail: 'View details',
    noSuggestions: 'No properties match this keyword',
    keywordTag: 'keyword',
  },
  ja: {
    label: '検索',
    placeholder: '物件名・エリアで検索（日本語 / 英語 / ベトナム語）...',
    clearSearch: '検索をクリア',
    suggestionsHeader: '一致する物件候補',
    viewDetail: '詳細を見る',
    noSuggestions: '一致する物件が見つかりませんでした',
    keywordTag: 'キーワード',
  },
};

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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
    <section className="w-full space-y-8">
      {/* Glassmorphism Catalog Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/75 p-6 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-8 sm:text-left">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#14B8A6]/12 blur-3xl"
        />
        <h1 className="font-serif relative text-2xl font-bold tracking-tight text-[#134E4A] sm:text-3xl lg:text-4xl">
          {getString(catalogObj?.title) || 'Danh sách bất động sản'}
        </h1>
      </div>

      {/* Glassmorphism Search & Filter Panel */}
      <div className="space-y-6 rounded-2xl border border-[#99F6E4] bg-white/80 p-5 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-6">
        {/* THANH TÌM KIẾM TÊN BĐS (3 NGÔN NGỮ VI / EN / JA) */}
        <div ref={searchBoxRef} className="relative max-w-2xl">
          <label
            htmlFor="property-trilingual-search"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
          >
            {searchLabels.label}
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-[#0F766E]">
              <SearchIcon className="h-4 w-4" />
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
              className="w-full rounded-lg border border-[#E2E8F0] bg-white py-3 pr-10 pl-11 text-base text-[#134E4A] placeholder:text-[#475569]/75 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15 sm:text-sm"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label={searchLabels.clearSearch}
                className="absolute right-3 cursor-pointer rounded-md p-1.5 text-[#475569] transition-colors duration-200 hover:bg-[#F0FDFA] hover:text-[#134E4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown hiển thị gợi ý tên BĐS cả 3 ngôn ngữ */}
          {showDropdown && searchInput.trim() !== '' && (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#99F6E4] bg-white/95 shadow-[0_10px_15px_rgba(0,0,0,0.1)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#E8F0F3] bg-[#F0FDFA] px-4 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                  {searchLabels.suggestionsHeader}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#134E4A] ring-1 ring-[#99F6E4]">
                  {searchSuggestions.length}
                </span>
              </div>

              {searchSuggestions.length > 0 ? (
                <ul className="max-h-80 divide-y divide-[#E8F0F3] overflow-y-auto">
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
                          className="group flex cursor-pointer items-start gap-3.5 p-3.5 transition-colors duration-200 hover:bg-[#F0FDFA] focus-visible:bg-[#F0FDFA] focus-visible:outline-none"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={titles.en || titles.vi || 'Property'}
                              className="h-14 w-14 shrink-0 rounded-lg border border-[#99F6E4] object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
                              <BuildingIcon className="h-6 w-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            {titles.uniqueList.map((entry) => (
                              <div
                                key={`${item.id}-${entry.lang}`}
                                className="flex items-baseline gap-1.5 text-xs"
                              >
                                <span className="inline-block shrink-0 rounded border border-[#99F6E4] bg-[#F0FDFA] px-1.5 py-0.5 text-[10px] font-bold text-[#0F766E]">
                                  {entry.lang}
                                </span>
                                <span className="truncate font-medium text-[#134E4A] transition-colors group-hover:text-[#0F766E]">
                                  {entry.text}
                                </span>
                              </div>
                            ))}

                            <div className="flex items-center justify-between pt-1 text-xs text-[#475569]">
                              <span className="font-semibold text-[#134E4A]">
                                {yen > 0 ? `¥${yen.toLocaleString('en-US')}` : ''}
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#0369A1] group-hover:underline">
                                <span>{searchLabels.viewDetail}</span>
                                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs font-medium text-[#475569]">
                  {searchLabels.noSuggestions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOCATION */}
        <div className="border-t border-[#E8F0F3] pt-5">
          <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
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
                  className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1 ${
                    isActive
                      ? 'border-[#0F766E] bg-[#0F766E] text-white shadow-xs'
                      : 'border-[#99F6E4] bg-white text-[#134E4A] hover:border-[#14B8A6] hover:bg-[#F0FDFA]'
                  }`}
                >
                  {loc === 'ALL' ? getString(catalogObj?.allLocations) || 'Tất cả' : loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRICE */}
        <div className="border-t border-[#E8F0F3] pt-5">
          <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
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
                  className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1 ${
                    isActive
                      ? 'border-[#0F766E] bg-[#0F766E] text-white shadow-xs'
                      : 'border-[#99F6E4] bg-white text-[#134E4A] hover:border-[#14B8A6] hover:bg-[#F0FDFA]'
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
        <div className="border-t border-[#E8F0F3] pt-5">
          <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
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
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1 ${
                    isActive
                      ? 'border-[#0F766E] bg-[#0F766E] text-white shadow-xs'
                      : 'border-[#99F6E4] bg-white text-[#134E4A] hover:border-[#14B8A6] hover:bg-[#F0FDFA]'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thanh trạng thái số lượng kết quả */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#99F6E4]/80 bg-white/70 px-4 py-3 text-xs text-[#475569] backdrop-blur-sm">
        <div>
          {getString(catalogObj?.showing) || 'Hiển thị'}{' '}
          <span className="font-bold text-[#0F766E]">{filteredProperties.length}</span>{' '}
          {getString(catalogObj?.properties) || 'bất động sản'}
          {selectedLocation !== 'ALL' && (
            <span className="ml-1">
              {getString(catalogObj?.inLocation) || 'tại'}{' '}
              <strong className="text-[#134E4A]">{selectedLocation}</strong>
            </span>
          )}
          {searchInput.trim() !== '' && (
            <span className="ml-1">
              ({searchLabels.keywordTag}:{' '}
              <strong className="text-[#134E4A]">“{searchInput.trim()}”</strong>)
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md font-bold text-[#0369A1] transition-colors duration-200 hover:text-[#0F766E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            <span>{getString(catalogObj?.clearFilter) || 'Xóa bộ lọc'}</span>
          </button>
        )}
      </div>

      {/* Lưới kết quả bất động sản */}
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((item) => <PropertyCard key={item.id} property={item} />)
        ) : (
          <div className="col-span-full flex w-full flex-col items-center justify-center space-y-4 rounded-xl border border-[#99F6E4] bg-white/80 p-12 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <p className="font-serif text-base font-semibold text-[#134E4A]">
              {getString(catalogObj?.noResults) || 'Không tìm thấy kết quả phù hợp'}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0369A1] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <CloseIcon className="h-4 w-4" />
                <span>{getString(catalogObj?.clearFilter) || 'Xóa bộ lọc'}</span>
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
        <div className="py-10 text-center text-xs font-medium text-[#475569]">
          {getString(catalogObj?.loading) || 'Đang tải...'}
        </div>
      }
    >
      <PropertyCatalogContent properties={properties} />
    </Suspense>
  );
}