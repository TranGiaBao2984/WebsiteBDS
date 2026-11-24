'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=75';

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

function getCleanText(val: unknown, currentLang: string = 'en'): string {
  if (!val) return '';
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
      } else {
        break;
      }
    } else if (typeof current === 'object' && current !== null) {
      const record = current as Record<string, unknown>;
      const firstNonEmpty = Object.values(record).find(
        (v) => typeof v === 'string' && v.trim().length > 0
      );
      current = record[currentLang] || record.en || record.ja || firstNonEmpty || '';
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

function getFormattedPrice(property: Property, currentLang: 'en' | 'ja'): string {
  const descObj = unwrapJson(property.description);
  const colYen = toPositiveNumber(property.price_yen);
  const colUsd = toPositiveNumber(property.price);

  let priceJa = colYen;
  let priceEn = colUsd > 0 && colUsd !== colYen ? colUsd : 0;

  if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    const savedEn = toPositiveNumber(record.price_en);
    const savedJa = toPositiveNumber(record.price_ja);

    if (savedEn > 0) priceEn = savedEn;
    if (savedJa > 0) priceJa = savedJa;
  }

  const JPY_TO_USD = 1 / 150;

  if (currentLang === 'en') {
    const usdAmount =
      priceEn > 0
        ? priceEn
        : priceJa > 0
        ? Math.round(priceJa * JPY_TO_USD)
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
      : 0;

  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(jpyAmount);
}

function parseFirstImage(val: unknown): string {
  if (!val) return FALLBACK_IMAGE;
  if (Array.isArray(val) && val.length > 0) {
    const first = getCleanText(val[0]);
    return first || FALLBACK_IMAGE;
  }

  let current: unknown = val;
  for (let i = 0; i < 4; i++) {
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
        if (!content) return FALLBACK_IMAGE;
        const first = content
          .split(',')[0]
          ?.replace(/^"|"$/g, '')
          .trim();
        return first || FALLBACK_IMAGE;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(current) && current.length > 0) {
    return getCleanText(current[0]) || FALLBACK_IMAGE;
  }

  if (typeof current === 'string' && current.trim()) {
    return current.trim();
  }

  return FALLBACK_IMAGE;
}

const CARD_LABELS = {
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
      badgeClass: 'bg-[#B8D200]/95 text-[#26221F] border-[#26221F]/15',
    };
  }
  if (normalized === 'RESERVED' || normalized === 'PENDING') {
    return {
      label: labels.statusReserved,
      badgeClass: 'bg-[#66605A]/90 text-white border-white/20',
    };
  }
  return {
    label: normalized === 'AVAILABLE' ? labels.statusAvailable : rawStatus || labels.statusAvailable,
    badgeClass: 'bg-[#1E1B18]/80 text-[#FAF8F5] border-white/20',
  };
}

function PropertyCardComponent({ property, priority = false }: PropertyCardProps) {
  const { currentLang } = useLanguage();
  const lang = currentLang === 'ja' ? 'ja' : 'en';
  const labels = CARD_LABELS[lang];

  const title = getCleanText(property.title, lang) || labels.defaultTitle;
  const location = getCleanText(property.location, lang) || labels.defaultLoc;
  const formattedPrice = getFormattedPrice(property, lang);
  const initialImage = parseFirstImage(property.images);

  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imgSrc = failedImage === initialImage ? FALLBACK_IMAGE : initialImage;

  const { label: statusLabel, badgeClass } = getLocalizedStatus(
    property.status || property.current_status,
    labels
  );

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#E5DFD6] bg-white shadow-[0_4px_12px_rgba(38,34,31,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8D200] hover:shadow-[0_10px_20px_rgba(38,34,31,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-[#F2EFE9]">
        <Image
          src={imgSrc}
          alt={title}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none [-webkit-touch-callout:none]"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) {
              setFailedImage(initialImage);
            }
          }}
        />
        <div
          className={`absolute top-3 left-3 z-10 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs ${badgeClass}`}
        >
          {statusLabel}
        </div>
      </div>

      <div className="flex grow flex-col justify-between space-y-4 p-6">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#948D86]">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#B8D200]" />
            <span className="truncate">{location}</span>
          </div>
          <h3 className="font-serif line-clamp-2 text-base font-bold leading-snug text-[#26221F] transition-colors duration-200 group-hover:text-[#B8D200]">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E5DFD6] pt-4">
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#948D86]">{labels.price}</span>
            <span className="font-serif block truncate text-4xl font-bold text-[#B8D200]">
              {formattedPrice}
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-xs font-semibold text-[#26221F] ring-1 ring-[#E5DFD6] transition-all duration-200 group-hover:bg-[#B8D200] group-hover:text-[#26221F] group-hover:ring-[#B8D200]">
            <span>{labels.details}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}

const PropertyCard = memo(PropertyCardComponent);
export default PropertyCard;