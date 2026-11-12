/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { useLanguage } from '@/app/context/LanguageContext';

interface PropertyCardProps {
  property: Property;
}

// Hàm giải mã đệ quy bóc sạch mọi tầng JSON lồng nhau để lấy ra văn bản thuần
function getCleanText(val: unknown, currentLang: string = 'vi'): string {
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
      current = record[currentLang] ?? record.vi ?? record.en ?? record.ja ?? Object.values(record)[0] ?? '';
    } else {
      break;
    }
  }

  return typeof current === 'string' ? current : String(current || '');
}

// Hàm giải mã danh sách ảnh an toàn
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

export default function PropertyCard({ property }: PropertyCardProps) {
  const { currentLang } = useLanguage();

  const title = getCleanText(property.title, currentLang) || 'Bất động sản';
  const location = getCleanText(property.location, currentLang) || 'Nhật Bản';
  const images = parseImages(property.images);
  
  const mainImage = images.length > 0 && images[0] 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const priceYen = property.price_yen || property.price || 0;
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(priceYen);

  return (
    <div className="group bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col h-full">
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
          <h3 className="font-serif font-bold text-base text-[#2c2623] line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>

        <div className="pt-3 border-t border-[#f0eae1] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8c827a] block">Giá bán</span>
            <span className="font-bold text-lg text-[#7a482b]">{formattedPrice}</span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="px-4 py-2 bg-[#f4efe8] text-[#3c352d] text-xs font-bold rounded-lg hover:bg-[#3c352d] hover:text-white transition duration-200"
          >
            Chi tiết →
          </Link>
        </div>
      </div>
    </div>
  );
}