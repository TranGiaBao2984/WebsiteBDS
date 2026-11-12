/* eslint-disable @next/next/no-img-element */
'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import type { Property } from '@/lib/types';
import PropertyCard from './PropertyCard';
import InquiryForm from './InquiryForm';

interface ChiTietSectionProps {
  property: Property;
  similarProperties?: Property[];
}

// Hàm giải mã đệ quy bóc sạch mọi tầng JSON lồng nhau
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

export default function ChiTietSection({ property, similarProperties = [] }: ChiTietSectionProps) {
  const { currentLang } = useLanguage();

  const title = getCleanText(property.title, currentLang) || 'Bất động sản';
  const location = getCleanText(property.location, currentLang) || 'Nhật Bản';
  const description = getCleanText(property.description, currentLang) || 'Chưa có mô tả chi tiết.';
  const images = parseImages(property.images);
  
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
  const priceYen = property.price_yen || property.price || 0;
  const priceVnd = property.price_vnd || Math.round(priceYen * 165);

  return (
    <div className="space-y-12">
      {/* Header thông tin chính */}
      <div className="space-y-4 border-b border-[#e6dfd5] pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8c6d53]">
          <span>{property.property_type || 'APARTMENT'}</span>
          <span>•</span>
          <span>{property.bedrooms || 1} BEDROOMS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c2623]">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-[#786e65]">📍 {location}</p>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#7a482b]">
              ¥{priceYen.toLocaleString('ja-JP')}
            </div>
            <div className="text-xs text-[#8c827a]">
              ~ {(priceVnd / 1000000000).toFixed(2)} tỷ VNĐ
            </div>
          </div>
        </div>
      </div>

      {/* Grid hình ảnh & Form tư vấn */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: Ảnh & Chi tiết */}
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-16/10 rounded-2xl bg-stone-100 overflow-hidden border border-[#e6dfd5]">
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>

          {/* Danh sách ảnh phụ */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-4/3 rounded-lg overflow-hidden border border-[#e6dfd5] bg-stone-100">
                  <img src={img} alt={`${title} ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Thông số kỹ thuật */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#2c2623] border-b border-[#f0eae1] pb-3">
              Thông số bất động sản
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#8c827a] block">Diện tích</span>
                <span className="font-bold text-[#2c2623]">{property.area_sqm || '--'} m²</span>
              </div>
              <div>
                <span className="text-[#8c827a] block">Bố cục</span>
                <span className="font-bold text-[#2c2623]">{property.layout || '--'}</span>
              </div>
              <div>
                <span className="text-[#8c827a] block">Kết cấu</span>
                <span className="font-bold text-[#2c2623]">{property.structure || '--'}</span>
              </div>
              <div>
                <span className="text-[#8c827a] block">Năm xây dựng</span>
                <span className="font-bold text-[#2c2623]">{property.year_built || '--'}</span>
              </div>
              <div>
                <span className="text-[#8c827a] block">Quyền sở hữu</span>
                <span className="font-bold text-[#2c2623]">{property.land_rights || '--'}</span>
              </div>
              <div>
                <span className="text-[#8c827a] block">Đậu xe</span>
                <span className="font-bold text-[#2c2623]">{property.parking || '--'}</span>
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-3">
            <h2 className="font-serif font-bold text-lg text-[#2c2623] border-b border-[#f0eae1] pb-3">
              Mô tả chi tiết
            </h2>
            <p className="text-sm text-[#574d43] leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        </div>

        {/* Cột phải: Form tư vấn */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <InquiryForm propertyId={property.id} propertyTitle={title} />
          </div>
        </div>
      </div>

      {/* Bất động sản tương tự */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-[#e6dfd5]">
          <h2 className="text-2xl font-serif font-bold text-[#2c2623]">Bất động sản tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}