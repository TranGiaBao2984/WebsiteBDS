'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
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

type FilterKey = 'location' | 'layout' | 'price' | 'q' | 'sort';
type SortOption = 'default' | 'price_asc' | 'price_desc';

interface IndexedProperty {
  raw: Property;
  titles: {
    en: string;
    ja: string;
    uniqueList: { lang: 'EN' | 'JA'; text: string }[];
  };
  searchBlob: string;
  searchBlobAscii: string;
  savedLocTag: string;
  fallbackLocBlob: string;
  savedPriceTag: string;
  yenPrice: number;
  savedLayoutTag: string;
  layoutNorm: string;
  structureNorm: string;
  thumb: string | null;
}

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

const CATALOG_UI_LABELS = {
  en: {
    eyebrow: 'JAPAN PROPERTY PORTFOLIO',
    subtitle: 'Explore curated apartments, residences, and traditional homes by prefecture, budget, and layout.',
    placeholder: 'Search by property name, station, or area (EN / JA)...',
    clearSearch: 'Clear search',
    suggestionsHeader: 'Top Matching Properties',
    viewDetail: 'View details',
    noSuggestions: 'No properties match this keyword',
    activeFiltersLabel: 'Active filters:',
    keywordPrefix: 'Keyword',
    locationPrefix: 'Location',
    pricePrefix: 'Price',
    layoutPrefix: 'Layout',
    clearAll: 'Reset all',
    sortLabel: 'Sort:',
    sortDefault: 'Featured',
    sortPriceAsc: 'Price: Low → High',
    sortPriceDesc: 'Price: High → Low',
    emptyHint: 'Try removing one or more filters or searching with another keyword.',
  },
  ja: {
    eyebrow: '日本不動産物件一覧',
    subtitle: 'エリア・ご予算・間取りから、ご希望に合う厳選物件をお探しいただけます。',
    placeholder: '物件名・駅名・エリアで検索（日本語 / 英語）...',
    clearSearch: '検索をクリア',
    suggestionsHeader: '一致する物件候補',
    viewDetail: '詳細を見る',
    noSuggestions: '一致する物件が見つかりませんでした',
    activeFiltersLabel: '適用中の条件:',
    keywordPrefix: 'キーワード',
    locationPrefix: 'エリア',
    pricePrefix: '価格',
    layoutPrefix: '間取り',
    clearAll: 'すべて解除',
    sortLabel: '並び替え:',
    sortDefault: '新着順',
    sortPriceAsc: '価格が安い順',
    sortPriceDesc: '価格が高い順',
    emptyHint: '条件を一部解除するか、別のキーワードでお試しください。',
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

function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function LayoutGridIcon({ className }: { className?: string }) {
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
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
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
  for (let i = 0; i < 6; i++) {
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
    return getString(record.en || record.ja || '');
  }
  return String(val);
}

function getBiLingualTitles(val: unknown): {
  en: string;
  ja: string;
  uniqueList: { lang: 'EN' | 'JA'; text: string }[];
} {
  const unwrapped = unwrapJson(val);

  if (typeof unwrapped === 'string') {
    const clean = unwrapped.trim();
    return {
      en: clean,
      ja: clean,
      uniqueList: clean ? [{ lang: 'EN', text: clean }] : [],
    };
  }

  if (typeof unwrapped === 'object' && unwrapped !== null) {
    const record = unwrapped as Record<string, unknown>;
    const en = typeof record.en === 'string' ? record.en.trim() : '';
    const ja = typeof record.ja === 'string' ? record.ja.trim() : '';

    const rawEntries: { lang: 'EN' | 'JA'; text: string }[] = [
      { lang: 'EN', text: en },
      { lang: 'JA', text: ja },
    ];

    const uniqueList = rawEntries.filter((entry) => entry.text.length > 0);
    return { en, ja, uniqueList };
  }

  return { en: '', ja: '', uniqueList: [] };
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

function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getYenPrice(property: Property, descRecord: Record<string, unknown>): number {
  const savedJa = Number(descRecord.price_ja);
  if (Number.isFinite(savedJa) && savedJa > 0) return savedJa;

  const yenCol = Number(property.price_yen);
  if (Number.isFinite(yenCol) && yenCol > 0) return yenCol;

  const basePrice = Number(property.price);
  return Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 0;
}

function matchesPriceIndexed(item: IndexedProperty, selectedPriceNorm: string): boolean {
  if (item.savedPriceTag) {
    return item.savedPriceTag === selectedPriceNorm;
  }

  const yen = item.yenPrice;
  if (yen <= 0) return false;

  const ltMatch = selectedPriceNorm.match(/^<\s*¥?\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (ltMatch) {
    const maxVal = Number(ltMatch[1]) * (selectedPriceNorm.includes('m') ? 1_000_000 : 1);
    return yen < maxVal;
  }

  const gteMatch = selectedPriceNorm.match(/^(?:≥|>=|>)\s*¥?\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (gteMatch) {
    const minVal = Number(gteMatch[1]) * (selectedPriceNorm.includes('m') ? 1_000_000 : 1);
    return yen >= minVal;
  }

  const rangeMatch = selectedPriceNorm.match(/^¥?\s*(\d+(?:\.\d+)?)\s*–\s*¥?\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (rangeMatch) {
    const multiplier = selectedPriceNorm.includes('m') ? 1_000_000 : 1;
    const minVal = Number(rangeMatch[1]) * multiplier;
    const maxVal = Number(rangeMatch[2]) * multiplier;
    return yen >= minVal && yen <= maxVal;
  }

  const exactNum = Number(selectedPriceNorm.replace(/[^\d.]/g, ''));
  if (Number.isFinite(exactNum) && exactNum > 0) {
    return yen === exactNum;
  }

  return false;
}

function PropertyCatalogContent({
  properties,
  initialFilterOptions,
}: {
  properties: Property[];
  initialFilterOptions?: FilterOptionsData;
}) {
  const { t, currentLang } = useLanguage();
  const ui = CATALOG_UI_LABELS[currentLang === 'ja' ? 'ja' : 'en'];
  const catalogObj =
    t && typeof t === 'object' && 'catalog' in t
      ? (t as Record<string, Record<string, string>>).catalog
      : undefined;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>(
    initialFilterOptions || DEFAULT_FILTER_OPTIONS
  );
  const [searchInput, setSearchInput] = useState<string>(() => searchParams.get('q') || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialFilterOptions) return;
    let mounted = true;
    getFilterOptions().then((opts) => {
      if (mounted) {
        setFilterOptions(opts);
      }
    });
    return () => {
      mounted = false;
    };
  }, [initialFilterOptions]);

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
    if (key === 'sort') {
      return v === 'price_asc' || v === 'price_desc' ? v : 'default';
    }
    if (!v || v.toUpperCase() === 'ALL') return 'ALL';
    if (key === 'price' && LEGACY_PRICE_MAP[v]) return LEGACY_PRICE_MAP[v];
    if (key === 'layout' && LEGACY_LAYOUT_MAP[v]) return LEGACY_LAYOUT_MAP[v];
    return v.normalize('NFC');
  };

  const selectedLocation = read('location');
  const selectedLayout = read('layout');
  const selectedPrice = read('price');
  const selectedSort = read('sort') as SortOption;

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'ALL' || (key === 'sort' && value === 'default')) {
        params.delete(key);
      } else {
        params.set(key, value.normalize('NFC'));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const currentParamQ = (searchParams.get('q') || '').normalize('NFC');
    const trimmedInput = searchInput.trim().normalize('NFC');
    if (currentParamQ === trimmedInput) return;

    const timer = setTimeout(() => {
      setFilter('q', trimmedInput);
    }, trimmedInput === '' ? 0 : 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setFilter]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    setShowDropdown(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('location');
    params.delete('price');
    params.delete('layout');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const indexedProperties = useMemo<IndexedProperty[]>(() => {
    return properties.map((item) => {
      const titles = getBiLingualTitles(item.title);
      const descRecord = getDescriptionRecord(item);
      const locStr = getString(item.location);
      const filterLocStr =
        typeof descRecord.filter_location === 'string' ? descRecord.filter_location : '';

      const rawBlob = [titles.en, titles.ja, locStr, filterLocStr]
        .filter(Boolean)
        .join(' | ')
        .normalize('NFC')
        .toLowerCase();

      return {
        raw: item,
        titles,
        searchBlob: rawBlob,
        searchBlobAscii: stripAccents(rawBlob),
        savedLocTag: filterLocStr ? normalizeLabel(filterLocStr) : '',
        fallbackLocBlob: normalizeLabel(JSON.stringify(item.location || '')),
        savedPriceTag:
          typeof descRecord.filter_price === 'string' && descRecord.filter_price.trim()
            ? normalizeLabel(descRecord.filter_price)
            : '',
        yenPrice: getYenPrice(item, descRecord),
        savedLayoutTag:
          typeof descRecord.filter_layout === 'string' && descRecord.filter_layout.trim()
            ? normalizeLabel(descRecord.filter_layout)
            : '',
        layoutNorm: normalizeLabel(getString(item.layout)),
        structureNorm: normalizeLabel(getString(item.structure)),
        thumb: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
      };
    });
  }, [properties]);

  const locationOptions = useMemo(
    () => ['ALL', ...filterOptions.locations],
    [filterOptions.locations]
  );
  const priceOptions = useMemo(
    () => ['ALL', ...filterOptions.prices],
    [filterOptions.prices]
  );
  const layoutOptions = useMemo(
    () => ['ALL', ...filterOptions.layouts],
    [filterOptions.layouts]
  );

  const searchSuggestions = useMemo(() => {
    const cleanQuery = searchInput.normalize('NFC').trim().toLowerCase();
    if (!cleanQuery) return [];
    const asciiQuery = stripAccents(cleanQuery);

    return indexedProperties
      .filter(
        (item) =>
          item.searchBlob.includes(cleanQuery) || item.searchBlobAscii.includes(asciiQuery)
      )
      .slice(0, 6);
  }, [indexedProperties, searchInput]);

  const filteredAndSortedProperties = useMemo(() => {
    const cleanQuery = searchInput.normalize('NFC').trim().toLowerCase();
    const asciiQuery = cleanQuery ? stripAccents(cleanQuery) : '';
    const normSelectedLoc = selectedLocation !== 'ALL' ? normalizeLabel(selectedLocation) : '';
    const normSelectedPrice = selectedPrice !== 'ALL' ? normalizeLabel(selectedPrice) : '';
    const normSelectedLayout = selectedLayout !== 'ALL' ? normalizeLabel(selectedLayout) : '';

    const filtered = indexedProperties.filter((item) => {
      if (cleanQuery) {
        if (!item.searchBlob.includes(cleanQuery) && !item.searchBlobAscii.includes(asciiQuery)) {
          return false;
        }
      }

      if (normSelectedLoc) {
        if (item.savedLocTag) {
          if (item.savedLocTag !== normSelectedLoc) return false;
        } else if (!item.fallbackLocBlob.includes(normSelectedLoc)) {
          return false;
        }
      }

      if (normSelectedPrice) {
        if (!matchesPriceIndexed(item, normSelectedPrice)) return false;
      }

      if (normSelectedLayout) {
        if (item.savedLayoutTag) {
          return item.savedLayoutTag === normSelectedLayout;
        }

        if (normSelectedLayout.includes('1k') || normSelectedLayout.includes('1ldk')) {
          return (
            item.layoutNorm.includes('1k') ||
            item.layoutNorm.includes('1ldk') ||
            item.layoutNorm.includes('1dk')
          );
        }
        if (normSelectedLayout.includes('2ldk') || normSelectedLayout.includes('3ldk')) {
          return (
            item.layoutNorm.includes('2ldk') ||
            item.layoutNorm.includes('3ldk') ||
            item.layoutNorm.includes('4ldk') ||
            item.layoutNorm.includes('2dk') ||
            item.layoutNorm.includes('3dk')
          );
        }
        if (
          normSelectedLayout.includes('kominka') ||
          normSelectedLayout.includes('traditional')
        ) {
          return (
            item.layoutNorm.includes('kominka') || item.structureNorm.includes('traditional')
          );
        }

        return (
          item.layoutNorm.includes(normSelectedLayout) ||
          item.structureNorm.includes(normSelectedLayout)
        );
      }

      return true;
    });

    if (selectedSort === 'default') return filtered;

    return [...filtered].sort((a, b) =>
      selectedSort === 'price_asc' ? a.yenPrice - b.yenPrice : b.yenPrice - a.yenPrice
    );
  }, [
    indexedProperties,
    searchInput,
    selectedLocation,
    selectedPrice,
    selectedLayout,
    selectedSort,
  ]);

  const activeChips: { key: FilterKey; label: string; onRemove: () => void }[] = [];
  if (searchInput.trim() !== '') {
    activeChips.push({
      key: 'q',
      label: `${ui.keywordPrefix}: “${searchInput.trim()}”`,
      onRemove: () => handleSearchChange(''),
    });
  }
  if (selectedLocation !== 'ALL') {
    activeChips.push({
      key: 'location',
      label: `${ui.locationPrefix}: ${selectedLocation}`,
      onRemove: () => setFilter('location', 'ALL'),
    });
  }
  if (selectedPrice !== 'ALL') {
    activeChips.push({
      key: 'price',
      label: `${ui.pricePrefix}: ${selectedPrice}`,
      onRemove: () => setFilter('price', 'ALL'),
    });
  }
  if (selectedLayout !== 'ALL') {
    const layoutText = selectedLayout.toUpperCase().includes('KOMINKA')
      ? getString(catalogObj?.kominka) || selectedLayout
      : selectedLayout;
    activeChips.push({
      key: 'layout',
      label: `${ui.layoutPrefix}: ${layoutText}`,
      onRemove: () => setFilter('layout', 'ALL'),
    });
  }

  const hasFilters = activeChips.length > 0;

  return (
    <section className="w-full space-y-8">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#E5DFD6] pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-[#B8D200]">
            {ui.eyebrow}
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#26221F] sm:text-4xl">
            {getString(catalogObj?.title) || 'All Properties'}
          </h1>
          <p className="text-sm leading-relaxed text-[#66605A]">{ui.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-baseline gap-1.5 rounded-xl border border-[#E5DFD6] bg-white px-4 py-2.5 shadow-2xs">
            <span className="font-serif text-xl font-bold text-[#B8D200]">
              {filteredAndSortedProperties.length}
            </span>
            <span className="text-xs font-medium text-[#66605A]">
              {getString(catalogObj?.properties) || 'properties'}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E5DFD6] bg-white px-3.5 py-2 shadow-2xs">
            <label
              htmlFor="catalog-sort-select"
              className="text-xs font-semibold text-[#948D86]"
            >
              {ui.sortLabel}
            </label>
            <select
              id="catalog-sort-select"
              value={selectedSort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="cursor-pointer bg-transparent pr-1 text-xs font-bold text-[#26221F] focus:outline-none"
            >
              <option value="default">{ui.sortDefault}</option>
              <option value="price_asc">{ui.sortPriceAsc}</option>
              <option value="price_desc">{ui.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED SEARCH & FILTER CONSOLE */}
      <div className="overflow-visible rounded-2xl border border-[#E5DFD6] bg-white shadow-[0_6px_20px_rgba(38,34,31,0.05)]">
        <div ref={searchBoxRef} className="relative border-b border-[#E5DFD6] p-4 sm:p-5">
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-[#B8D200]">
              <SearchIcon className="h-4.5 w-4.5" />
            </span>

            <input
              id="property-bilingual-search"
              type="text"
              value={searchInput}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              placeholder={ui.placeholder}
              className="w-full rounded-xl border border-[#E5DFD6] bg-[#FAF8F5] py-3.5 pr-11 pl-11 text-sm text-[#26221F] placeholder:text-[#948D86] transition-all duration-200 focus:border-[#B8D200] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#B8D200]/20"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label={ui.clearSearch}
                className="absolute right-3 cursor-pointer rounded-lg p-1.5 text-[#66605A] transition-colors duration-200 hover:bg-[#F2EFE9] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Bilingual search suggestions dropdown */}
          {showDropdown && searchInput.trim() !== '' && (
            <div className="absolute right-4 left-4 z-30 mt-2 overflow-hidden rounded-xl border border-[#E5DFD6] bg-white shadow-[0_14px_30px_rgba(38,34,31,0.14)] sm:right-5 sm:left-5">
              <div className="flex items-center justify-between border-b border-[#E5DFD6] bg-[#FAF8F5] px-4 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8D200]">
                  {ui.suggestionsHeader}
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#26221F] ring-1 ring-[#E5DFD6]">
                  {searchSuggestions.length}
                </span>
              </div>

              {searchSuggestions.length > 0 ? (
                <ul className="max-h-80 divide-y divide-[#E5DFD6] overflow-y-auto">
                  {searchSuggestions.map((indexed) => {
                    const { raw: item, titles, yenPrice, thumb } = indexed;

                    return (
                      <li key={item.id}>
                        <Link
                          href={`/properties/${item.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="group flex cursor-pointer items-center gap-3.5 p-3.5 transition-colors duration-200 hover:bg-[#FAF8F5] focus-visible:bg-[#FAF8F5] focus-visible:outline-none"
                        >
                          {thumb ? (
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E5DFD6] bg-[#F2EFE9]">
                              <Image
                                src={thumb}
                                alt={titles.en || titles.ja || 'Property'}
                                fill
                                sizes="56px"
                                quality={65}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#E5DFD6] bg-[#F2EFE9] text-[#B8D200]">
                              <BuildingIcon className="h-6 w-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            {titles.uniqueList.map((entry) => (
                              <div
                                key={`${item.id}-${entry.lang}`}
                                className="flex items-baseline gap-1.5 text-xs"
                              >
                                <span className="inline-block shrink-0 rounded border border-[#E5DFD6] bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-bold text-[#B8D200]">
                                  {entry.lang}
                                </span>
                                <span className="truncate font-medium text-[#26221F] transition-colors group-hover:text-[#B8D200]">
                                  {entry.text}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="font-serif block text-base font-bold text-[#26221F]">
                              {yenPrice > 0 ? `¥${yenPrice.toLocaleString('en-US')}` : ''}
                            </span>
                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#B8D200] group-hover:underline">
                              <span>{ui.viewDetail}</span>
                              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs font-medium text-[#66605A]">
                  {ui.noSuggestions}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#E5DFD6] bg-[#FAF8F5]/55 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Location */}
          <div className="p-4 sm:p-5 lg:col-span-6">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#26221F]">
              <MapPinIcon className="h-3.5 w-3.5 text-[#B8D200]" />
              <span>{getString(catalogObj?.locationLabel) || 'Location'}</span>
            </div>
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
                    className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] ${
                      isActive
                        ? 'border-[#B8D200] bg-[#B8D200] text-[#26221F] shadow-xs'
                        : 'border-[#E5DFD6] bg-white text-[#26221F] hover:border-[#B8D200] hover:text-[#B8D200]'
                    }`}
                  >
                    {loc === 'ALL' ? getString(catalogObj?.allLocations) || 'All' : loc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Layout */}
          <div className="flex flex-col justify-between divide-y divide-[#E5DFD6] lg:col-span-6">
            <div className="p-4 sm:p-5">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#26221F]">
                <TagIcon className="h-3.5 w-3.5 text-[#B8D200]" />
                <span>{getString(catalogObj?.priceLabel) || 'Price Range'}</span>
              </div>
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
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] ${
                        isActive
                          ? 'border-[#B8D200] bg-[#B8D200] text-[#26221F] shadow-xs'
                          : 'border-[#E5DFD6] bg-white text-[#26221F] hover:border-[#B8D200] hover:text-[#B8D200]'
                      }`}
                    >
                      {priceLabel === 'ALL'
                        ? getString(catalogObj?.allPrices) || 'All'
                        : priceLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#26221F]">
                <LayoutGridIcon className="h-3.5 w-3.5 text-[#B8D200]" />
                <span>{getString(catalogObj?.layoutLabel) || 'Layout'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {layoutOptions.map((layoutLabel) => {
                  const isActive =
                    layoutLabel === 'ALL'
                      ? selectedLayout === 'ALL'
                      : normalizeLabel(selectedLayout) === normalizeLabel(layoutLabel);
                  const displayLabel =
                    layoutLabel === 'ALL'
                      ? getString(catalogObj?.allLayouts) || 'All'
                      : layoutLabel.toUpperCase().includes('KOMINKA')
                        ? getString(catalogObj?.kominka) || layoutLabel
                        : layoutLabel;

                  return (
                    <button
                      key={layoutLabel}
                      type="button"
                      onClick={() => setFilter('layout', layoutLabel)}
                      aria-pressed={isActive}
                      className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] ${
                        isActive
                          ? 'border-[#B8D200] bg-[#B8D200] text-[#26221F] shadow-xs'
                          : 'border-[#E5DFD6] bg-white text-[#26221F] hover:border-[#B8D200] hover:text-[#B8D200]'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-[#E5DFD6] bg-[#F2EFE9]/75 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#66605A]">
                {ui.activeFiltersLabel}
              </span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#B8D200]/50 bg-white px-3 py-1 text-xs font-semibold text-[#26221F] shadow-2xs transition-colors duration-200 hover:border-[#B8D200] hover:bg-[#B8D200] hover:text-[#26221F]"
                >
                  <span>{chip.label}</span>
                  <CloseIcon className="h-3 w-3" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#B8D200] transition-colors duration-200 hover:text-[#9FB600] hover:underline"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              <span>{ui.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. PROPERTY GRID */}
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {filteredAndSortedProperties.length > 0 ? (
          filteredAndSortedProperties.map((indexed, index) => (
            <PropertyCard
              key={indexed.raw.id}
              property={indexed.raw}
              priority={index < 3}
            />
          ))
        ) : (
          <div className="col-span-full flex w-full flex-col items-center justify-center space-y-4 rounded-2xl border border-[#E5DFD6] bg-white p-14 text-center shadow-[0_4px_12px_rgba(38,34,31,0.05)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E5DFD6] bg-[#F2EFE9] text-[#B8D200]">
              <BuildingIcon className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <p className="font-serif text-lg font-bold text-[#26221F]">
                {getString(catalogObj?.noResults) || 'No matching properties found'}
              </p>
              <p className="text-xs text-[#66605A]">{ui.emptyHint}</p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#B8D200] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#26221F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9FB600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <CloseIcon className="h-4 w-4" />
                <span>{getString(catalogObj?.clearFilter) || 'Clear filters'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function SanPhamSection({
  properties,
  initialFilterOptions,
}: {
  properties: Property[];
  initialFilterOptions?: FilterOptionsData;
}) {
  const { t } = useLanguage();
  const catalogObj =
    t && typeof t === 'object' && 'catalog' in t
      ? (t as Record<string, Record<string, string>>).catalog
      : undefined;

  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs font-medium text-[#66605A]">
          {getString(catalogObj?.loading) || 'Loading...'}
        </div>
      }
    >
      <PropertyCatalogContent
        properties={properties}
        initialFilterOptions={initialFilterOptions}
      />
    </Suspense>
  );
}