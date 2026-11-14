/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';

interface PropertyCardProps {
  property: Property;
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

function getCleanText(val: unknown, currentLang: string = 'en'): string {
  if (!val) return '';
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
      } else {
        break;
      }
    } else if (typeof current === 'object' && current !== null) {
      const record = current as Record<string, unknown>;
      const firstNonEmpty = Object.values(record).find(
        (v) => typeof v === 'string' && v.trim().length > 0
      );
      current = record[currentLang] || record.en || record.vi || record.ja || firstNonEmpty || '';
    } else {
      break;
    }
  }

  return typeof current === 'string' ? current : String(current || '');
}

function toPositiveNumber(val: unknown): number {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function getFormattedPrice(property: Property, currentLang: 'vi' | 'en' | 'ja'): string {
  const descObj = unwrapJson(property.description);
  let priceVi = toPositiveNumber(property.price_vnd);
  let priceEn = 0;
  let priceJa = toPositiveNumber(property.price_yen) || toPositiveNumber(property.price);

  if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    const savedVi = toPositiveNumber(record.price_vi);
    const savedEn = toPositiveNumber(record.price_en);
    const savedJa = toPositiveNumber(record.price_ja);

    if (savedVi > 0) priceVi = savedVi;
    if (savedEn > 0) priceEn = savedEn;
    if (savedJa > 0) priceJa = savedJa;
  }

  const JPY_TO_VND = 170;
  const JPY_TO_USD = 1 / 150;
  const USD_TO_VND = 25500;

  if (currentLang === 'vi') {
    const vndAmount =
      priceVi > 0
        ? priceVi
        : priceJa > 0
        ? Math.round(priceJa * JPY_TO_VND)
        : priceEn > 0
        ? Math.round(priceEn * USD_TO_VND)
        : 0;

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(vndAmount);
  }

  if (currentLang === 'en') {
    const usdAmount =
      priceEn > 0
        ? priceEn
        : priceJa > 0
        ? Math.round(priceJa * JPY_TO_USD)
        : priceVi > 0
        ? Math.round(priceVi / USD_TO_VND)
        : 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(usdAmount);
  }

  const jpyAmount =
    priceJa > 0
      ? priceJa
      : priceEn > 0
      ? Math.round(priceEn / JPY_TO_USD)
      : priceVi > 0
      ? Math.round(priceVi / JPY_TO_VND)
      : 0;

  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(jpyAmount);
}

function parseImages(val: unknown): string[] {
  if (!val) return [];
  let current: unknown = val;

  for (let i = 0; i < 5; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const content = trimmed.slice(1, -1);
        if (!content) return [];
        return content
          .split(',')
          .map((s) => s.replace(/^"|"$/g, '').trim())
          .filter(Boolean);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(current)) {
    return current.map((item) => getCleanText(item)).filter(Boolean);
  }

  if (typeof current === 'string' && current.trim()) {
    return [current.trim()];
  }

  return [];
}

const CARD_LABELS = {
  vi: {
    price: 'Giá bán',
    details: 'Chi tiết',
    defaultTitle: 'Bất động sản',
    defaultLoc: 'Nhật Bản',
    statusAvailable: 'Còn trống',
    statusSold: 'Đã bán',
    statusReserved: 'Đang giao dịch',
  },
  en: {
    price: 'Price',
    details: 'Details',
    defaultTitle: 'Property',
    defaultLoc: 'Japan',
    statusAvailable: 'Available',
    statusSold: 'Sold',
    statusReserved: 'Reserved',
  },
  ja: {
    price: '販売価格',
    details: '詳細',
    defaultTitle: '物件情報',
    defaultLoc: '日本',
    statusAvailable: '募集中',
    statusSold: '成約済',
    statusReserved: '商談中',
  },
};

function getLocalizedStatus(
  rawStatus: string | undefined,
  labels: (typeof CARD_LABELS)['en']
): { label: string; badgeClass: string } {
  const normalized = (rawStatus || 'AVAILABLE').trim().toUpperCase();
  if (normalized === 'SOLD' || normalized === 'CLOSED') {
    return {
      label: labels.statusSold,
      badgeClass: 'bg-[#475569]/90 text-white border-white/25',
    };
  }
  if (normalized === 'RESERVED' || normalized === 'PENDING') {
    return {
      label: labels.statusReserved,
      badgeClass: 'bg-[#0369A1]/90 text-white border-white/25',
    };
  }
  return {
    label: normalized === 'AVAILABLE' ? labels.statusAvailable : rawStatus || labels.statusAvailable,
    badgeClass: 'bg-[#0F766E]/90 text-white border-white/25',
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { currentLang } = useLanguage();
  const labels = CARD_LABELS[currentLang] || CARD_LABELS.en;

  const title = getCleanText(property.title, currentLang) || labels.defaultTitle;
  const location = getCleanText(property.location, currentLang) || labels.defaultLoc;
  const formattedPrice = getFormattedPrice(property, currentLang);
  const images = parseImages(property.images);
  const { label: statusLabel, badgeClass } = getLocalizedStatus(property.status, labels);

  const mainImage =
    images.length > 0 && images[0]
      ? images[0]
      : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#99F6E4] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] hover:shadow-[0_10px_15px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* Hình ảnh */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#E8F0F3]">
        <img
          src={mainImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Glassmorphism Status Badge */}
        <div
          className={`absolute top-3 left-3 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs ${badgeClass}`}
        >
          {statusLabel}
        </div>
      </div>

      {/* Nội dung */}
      <div className="flex grow flex-col justify-between space-y-4 p-6">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#0F766E]" />
            <span className="truncate">{location}</span>
          </div>
          <h3 className="font-serif line-clamp-2 text-base font-bold leading-snug text-[#134E4A] transition-colors duration-200 group-hover:text-[#0F766E]">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E8F0F3] pt-4">
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#475569]">{labels.price}</span>
            <span className="block truncate text-lg font-bold text-[#0F766E]">
              {formattedPrice}
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F0FDFA] px-3.5 py-2 text-xs font-semibold text-[#0F766E] ring-1 ring-[#99F6E4] transition-all duration-200 group-hover:bg-[#0369A1] group-hover:text-white group-hover:ring-[#0369A1]">
            <span>{labels.details}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}