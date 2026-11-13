/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';

interface PropertyCardProps {
  property: Property;
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

  // Tỷ giá quy đổi dự phòng nếu bài đăng chưa nhập đủ cả 3 loại tiền trong Admin
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
  vi: { price: 'Giá bán', details: 'Chi tiết →', defaultTitle: 'Bất động sản', defaultLoc: 'Nhật Bản' },
  en: { price: 'Price', details: 'Details →', defaultTitle: 'Property', defaultLoc: 'Japan' },
  ja: { price: '販売価格', details: '詳細 →', defaultTitle: '物件情報', defaultLoc: '日本' },
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const { currentLang } = useLanguage();
  const labels = CARD_LABELS[currentLang] || CARD_LABELS.en;

  const title = getCleanText(property.title, currentLang) || labels.defaultTitle;
  const location = getCleanText(property.location, currentLang) || labels.defaultLoc;
  const formattedPrice = getFormattedPrice(property, currentLang);
  const images = parseImages(property.images);

  const mainImage = images.length > 0 && images[0]
    ? images[0]
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Hình ảnh */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-[#3c352d]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
          {property.status || 'AVAILABLE'}
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-5 flex flex-col justify-between grow space-y-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c6d53] block mb-1">
            📍 {location}
          </span>
          <h3 className="font-serif font-bold text-base text-[#2c2623] group-hover:text-[#7a482b] transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>

        <div className="pt-3 border-t border-[#f0eae1] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8c827a] block">{labels.price}</span>
            <span className="font-bold text-lg text-[#7a482b]">{formattedPrice}</span>
          </div>

          <span className="px-4 py-2 bg-[#f4efe8] text-[#3c352d] text-xs font-bold rounded-lg group-hover:bg-[#3c352d] group-hover:text-white transition duration-200">
            {labels.details}
          </span>
        </div>
      </div>
    </Link>
  );
}