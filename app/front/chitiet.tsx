/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/app/context/LanguageContext';
import type { Property } from '@/lib/types';
import PropertyCard from './PropertyCard';
import InquiryForm from './InquiryForm';

interface ChiTietSectionProps {
  property: Property;
  similarProperties?: Property[];
}

interface LightboxState {
  images: string[];
  index: number;
  title: string;
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

function ZoomInIcon({ className }: { className?: string }) {
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
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
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

function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
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

function parseFloorPlanImages(property: Property): string[] {
  const descObj = unwrapJson(property.description);
  if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    if (Array.isArray(record.floor_plans)) {
      return parseImages(record.floor_plans);
    }
  }

  const fromUrl = parseImages(property.floor_plan_url);
  if (fromUrl.length > 0) return fromUrl;

  return parseImages(property.floor_plan);
}

function getSavedMapAddress(property: Property): string {
  const descObj = unwrapJson(property.description);
  if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    if (typeof record.map_address === 'string' && record.map_address.trim()) {
      return record.map_address.trim();
    }
  }
  return '';
}

function buildGoogleMapsData(
  rawMapAddress: string,
  fallbackLocation: string,
  currentLang: 'vi' | 'en' | 'ja'
) {
  const target = rawMapAddress || fallbackLocation || 'Tokyo, Japan';
  const isUrl = /^https?:\/\//i.test(target);

  let embedQuery = target;
  const displayAddress = rawMapAddress && !isUrl ? rawMapAddress : fallbackLocation;

  if (isUrl) {
    const atCoords = target.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const dataCoords = target.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const placeMatch = target.match(/\/place\/([^/@?]+)/);

    if (atCoords) {
      embedQuery = `${atCoords[1]},${atCoords[2]}`;
    } else if (dataCoords) {
      embedQuery = `${dataCoords[1]},${dataCoords[2]}`;
    } else if (placeMatch) {
      embedQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    } else {
      embedQuery = fallbackLocation || 'Tokyo, Japan';
    }
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    embedQuery
  )}&hl=${currentLang}&z=16&output=embed`;

  const externalUrl = isUrl
    ? target
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(embedQuery)}`;

  return {
    embedUrl,
    externalUrl,
    displayAddress,
  };
}

const DETAIL_LABELS = {
  vi: {
    defaultType: 'CĂN HỘ',
    bedrooms: 'PHÒNG NGỦ',
    specsTitle: 'Thông số bất động sản',
    area: 'Diện tích sử dụng',
    buildingSize: 'Diện tích sàn',
    landSize: 'Diện tích đất',
    layout: 'Bố cục phòng',
    structure: 'Kết cấu',
    yearBuilt: 'Năm xây dựng',
    landRights: 'Quyền sở hữu',
    access: 'Vị trí ga / Giao thông',
    parking: 'Chỗ đậu xe',
    zoning: 'Quy hoạch đất',
    bedroomsCount: 'Số phòng ngủ',
    bathroomsCount: 'Số phòng tắm',
    floorPlanTitle: 'Sơ đồ nhà ở',
    noFloorPlan: 'Chưa có hình ảnh sơ đồ nhà ở.',
    descTitle: 'Mô tả chi tiết',
    noDesc: 'Chưa có mô tả chi tiết.',
    mapTitle: 'Vị trí trên bản đồ',
    openGoogleMaps: 'Mở trên Google Maps',
    similarTitle: 'Bất động sản tương tự',
    prevImg: 'Ảnh trước',
    nextImg: 'Ảnh tiếp theo',
    zoomHint: 'Bấm để phóng to',
    closeModal: 'Đóng chế độ xem lớn (ESC)',
    consultCta: 'Đăng ký tư vấn',
  },
  en: {
    defaultType: 'APARTMENT',
    bedrooms: 'BEDROOMS',
    specsTitle: 'Property Specifications',
    area: 'Usable Area',
    buildingSize: 'Building Size',
    landSize: 'Land Size',
    layout: 'Layout',
    structure: 'Structure',
    yearBuilt: 'Year Built',
    landRights: 'Land Rights',
    access: 'Access / Transit',
    parking: 'Parking',
    zoning: 'Zoning',
    bedroomsCount: 'Bedrooms',
    bathroomsCount: 'Bathrooms',
    floorPlanTitle: 'Floor Plan',
    noFloorPlan: 'No floor plan images available.',
    descTitle: 'Detailed Description',
    noDesc: 'No detailed description available.',
    mapTitle: 'Location on Map',
    openGoogleMaps: 'Open in Google Maps',
    similarTitle: 'Similar Properties',
    prevImg: 'Previous image',
    nextImg: 'Next image',
    zoomHint: 'Click to enlarge',
    closeModal: 'Close fullscreen view (ESC)',
    consultCta: 'Inquire Now',
  },
  ja: {
    defaultType: 'マンション',
    bedrooms: 'ベッドルーム',
    specsTitle: '物件概要・仕様',
    area: '専有面積',
    buildingSize: '建物面積',
    landSize: '土地面積',
    layout: '間取り',
    structure: '構造',
    yearBuilt: '築年',
    landRights: '権利形態',
    access: '交通・アクセス',
    parking: '駐車場',
    zoning: '用途地域',
    bedroomsCount: '寝室数',
    bathroomsCount: '浴室数',
    floorPlanTitle: '間取り図',
    noFloorPlan: '間取り図の画像はまだ登録されていません。',
    descTitle: '物件詳細説明',
    noDesc: '詳細説明はまだ登録されていません。',
    mapTitle: '地図・周辺マップ',
    openGoogleMaps: 'Googleマップで開く',
    similarTitle: '類似のおすすめ物件',
    prevImg: '前の画像',
    nextImg: '次の画像',
    zoomHint: 'クリックして拡大',
    closeModal: '拡大表示を閉じる (ESC)',
    consultCta: 'お問い合わせ',
  },
};

export default function ChiTietSection({ property, similarProperties = [] }: ChiTietSectionProps) {
  const { currentLang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [headerOffset, setHeaderOffset] = useState(72);
  const labels = DETAIL_LABELS[currentLang] || DETAIL_LABELS.en;

  const title = getCleanText(property.title, currentLang) || 'Property';
  const location = getCleanText(property.location, currentLang) || 'Japan';
  const mapFallbackLocation =
    getCleanText(property.location, 'ja') ||
    getCleanText(property.location, 'en') ||
    location;
  const rawMapAddress = getSavedMapAddress(property);
  const { embedUrl, externalUrl, displayAddress } = buildGoogleMapsData(
    rawMapAddress,
    mapFallbackLocation,
    currentLang
  );

  const propertyType = getCleanText(property.property_type, currentLang) || labels.defaultType;
  const description = getCleanText(property.description, currentLang) || labels.noDesc;
  const formattedPrice = getFormattedPrice(property, currentLang);
  const images = parseImages(property.images);
  const floorPlanImages = parseFloorPlanImages(property);

  const fallbackImage =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
  const mainImage = images[activeIndex] || images[0] || fallbackImage;
  const mainFloorPlanImage = floorPlanImages[activeFloorPlanIndex] || floorPlanImages[0] || '';

  // Đo chiều cao Header, khóa cuộn nền và lắng nghe phím tắt Esc / mũi tên khi mở Lightbox
  useEffect(() => {
    if (!lightbox) return;

    const updateHeaderOffset = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderOffset(Math.ceil(headerEl.getBoundingClientRect().height));
      }
    };

    updateHeaderOffset();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
      } else if (e.key === 'ArrowLeft' && lightbox.images.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
              }
            : null
        );
      } else if (e.key === 'ArrowRight' && lightbox.images.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
              }
            : null
        );
      }
    };

    window.addEventListener('resize', updateHeaderOffset);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('resize', updateHeaderOffset);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const handlePrevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevFloorPlan = () => {
    setActiveFloorPlanIndex((prev) => (prev === 0 ? floorPlanImages.length - 1 : prev - 1));
  };

  const handleNextFloorPlan = () => {
    setActiveFloorPlanIndex((prev) => (prev === floorPlanImages.length - 1 ? 0 : prev + 1));
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-0">
      {/* Glassmorphism Property Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#14B8A6]/12 blur-3xl"
        />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F766E]">
            <span className="rounded-md border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1">
              {propertyType}
            </span>
            <span className="text-[#14B8A6]">•</span>
            <span className="rounded-md border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1">
              {property.bedrooms || 1} {labels.bedrooms}
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight text-[#134E4A] sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <div className="flex flex-col justify-between gap-4 border-t border-[#E8F0F3] pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-[#475569]">
              <MapPinIcon className="h-4 w-4 shrink-0 text-[#0F766E]" />
              <span>{location}</span>
            </div>

            <div className="sm:text-right">
              <div className="font-serif text-2xl font-bold text-[#0F766E] sm:text-3xl">
                {formattedPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid hình ảnh & Form tư vấn */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cột trái: Ảnh & Chi tiết */}
        <div className="space-y-6 lg:col-span-8">
          {/* Khung ảnh lớn hiển thị full ảnh kèm nút chuyển trái/phải và bấm phóng to */}
          <div className="group relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-2xl border border-[#99F6E4] bg-[#E8F0F3]/65 shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
            <button
              type="button"
              onClick={() =>
                setLightbox({
                  images: images.length > 0 ? images : [fallbackImage],
                  index: activeIndex,
                  title,
                })
              }
              aria-label={`${labels.zoomHint} - ${title}`}
              className="flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F766E]"
            >
              <img
                src={mainImage}
                alt={title}
                className="h-full w-full select-none object-contain transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
            </button>

            <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#134E4A]/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition-opacity duration-200">
              <ZoomInIcon className="h-3.5 w-3.5 text-[#99F6E4]" />
              <span>{labels.zoomHint}</span>
            </span>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label={labels.prevImg}
                  className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label={labels.nextImg}
                  className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                <div className="absolute right-3 bottom-3 rounded-full border border-white/20 bg-[#134E4A]/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Danh sách ảnh thu nhỏ bên dưới */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((img, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    aria-pressed={isSelected}
                    className={`flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-[#E8F0F3]/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                      isSelected
                        ? 'border-[#0F766E] opacity-100 ring-2 ring-[#0F766E]/25'
                        : 'border-[#99F6E4]/80 opacity-80 hover:border-[#14B8A6] hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Thông số kỹ thuật đầy đủ 12 trường */}
          <div className="space-y-5 rounded-xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <h2 className="font-serif border-b border-[#E8F0F3] pb-3 text-lg font-bold text-[#134E4A]">
              {labels.specsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.area}</span>
                <span className="font-bold text-[#134E4A]">
                  {property.area_sqm ? `${property.area_sqm} m²` : '--'}
                </span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.buildingSize}</span>
                <span className="font-bold text-[#134E4A]">{property.building_size || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.landSize}</span>
                <span className="font-bold text-[#134E4A]">{property.land_size || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.layout}</span>
                <span className="font-bold text-[#134E4A]">{property.layout || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.structure}</span>
                <span className="font-bold text-[#134E4A]">{property.structure || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.yearBuilt}</span>
                <span className="font-bold text-[#134E4A]">{property.year_built || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.parking}</span>
                <span className="font-bold text-[#134E4A]">{property.parking || '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.bedroomsCount}</span>
                <span className="font-bold text-[#134E4A]">{property.bedrooms ?? '--'}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium text-[#475569]">{labels.bathroomsCount}</span>
                <span className="font-bold text-[#134E4A]">{property.bathrooms ?? '--'}</span>
              </div>
              <div className="border-t border-[#E8F0F3] pt-3 sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block font-medium text-[#475569]">{labels.landRights}</span>
                <span className="font-bold text-[#134E4A]">{property.land_rights || '--'}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block font-medium text-[#475569]">{labels.access}</span>
                <span className="font-bold text-[#134E4A]">{property.access || '--'}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block font-medium text-[#475569]">{labels.zoning}</span>
                <span className="font-bold text-[#134E4A]">{property.zoning || '--'}</span>
              </div>
            </div>
          </div>

          {/* Khung Sơ đồ nhà ở (Hỗ trợ bấm phóng to) */}
          <div className="space-y-4 rounded-xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 border-b border-[#E8F0F3] pb-3">
              <h2 className="font-serif text-lg font-bold text-[#134E4A]">
                {labels.floorPlanTitle}
              </h2>
              {floorPlanImages.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      images: floorPlanImages,
                      index: activeFloorPlanIndex,
                      title: `${labels.floorPlanTitle} - ${title}`,
                    })
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md text-xs font-bold text-[#0369A1] transition-colors duration-200 hover:text-[#0F766E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
                >
                  <ZoomInIcon className="h-3.5 w-3.5" />
                  <span>{labels.zoomHint}</span>
                </button>
              )}
            </div>

            {floorPlanImages.length > 0 ? (
              <div className="space-y-4">
                <div className="group relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-xl border border-[#99F6E4] bg-[#E8F0F3]/65">
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        images: floorPlanImages,
                        index: activeFloorPlanIndex,
                        title: `${labels.floorPlanTitle} - ${title}`,
                      })
                    }
                    aria-label={`${labels.zoomHint} - ${labels.floorPlanTitle}`}
                    className="flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F766E]"
                  >
                    <img
                      src={mainFloorPlanImage}
                      alt={`${labels.floorPlanTitle} - ${title}`}
                      className="h-full w-full select-none object-contain transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </button>

                  {floorPlanImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevFloorPlan}
                        aria-label={labels.prevImg}
                        className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextFloorPlan}
                        aria-label={labels.nextImg}
                        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>

                      <div className="absolute right-3 bottom-3 rounded-full border border-white/20 bg-[#134E4A]/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        {activeFloorPlanIndex + 1} / {floorPlanImages.length}
                      </div>
                    </>
                  )}
                </div>

                {floorPlanImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {floorPlanImages.map((img, idx) => {
                      const isSelected = idx === activeFloorPlanIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveFloorPlanIndex(idx)}
                          aria-label={`${labels.floorPlanTitle} ${idx + 1}`}
                          aria-pressed={isSelected}
                          className={`flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-[#E8F0F3]/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] ${
                            isSelected
                              ? 'border-[#0F766E] opacity-100 ring-2 ring-[#0F766E]/25'
                              : 'border-[#99F6E4]/80 opacity-80 hover:border-[#14B8A6] hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${labels.floorPlanTitle} ${idx + 1}`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackImage;
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#99F6E4] bg-[#F0FDFA] py-8 text-center text-xs font-medium text-[#475569] sm:text-sm">
                {labels.noFloorPlan}
              </div>
            )}
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-4 rounded-xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <h2 className="font-serif border-b border-[#E8F0F3] pb-3 text-lg font-bold text-[#134E4A]">
              {labels.descTitle}
            </h2>
            <p className="max-w-prose whitespace-pre-line text-[15px] leading-7 text-[#134E4A] sm:text-base">
              {description}
            </p>
          </div>

          {/* Khung Vị trí trên bản đồ (Google Maps) */}
          <div className="space-y-4 rounded-xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E8F0F3] pb-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#134E4A]">
                  {labels.mapTitle}
                </h2>
                {displayAddress && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#475569] sm:text-sm">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-[#0F766E]" />
                    <span>{displayAddress}</span>
                  </p>
                )}
              </div>

              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border-2 border-[#0F766E] bg-transparent px-4 py-2 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:bg-[#0F766E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 sm:self-auto"
              >
                <span>{labels.openGoogleMaps}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-xl border border-[#99F6E4] bg-[#E8F0F3]">
              <iframe
                src={embedUrl}
                title={`${labels.mapTitle} - ${title}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Form tư vấn (cách top-28 để không bị sticky Header che khuất) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <InquiryForm propertyId={property.id} propertyTitle={title} />
          </div>
        </div>
      </div>

      {/* Bất động sản tương tự */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 border-t border-[#99F6E4] pt-8">
          <h2 className="font-serif text-2xl font-bold text-[#134E4A]">{labels.similarTitle}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      )}

      {/* Thanh CTA cố định đáy màn hình trên Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#99F6E4] bg-[#F0FDFA]/90 px-4 py-3 shadow-[0_-4px_16px_rgba(19,78,74,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-[#475569]">{title}</p>
            <p className="font-serif truncate text-base font-bold text-[#0F766E] sm:text-lg">
              {formattedPrice}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToContact}
            className="shrink-0 cursor-pointer rounded-lg bg-[#0369A1] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 sm:text-sm"
          >
            {labels.consultCta}
          </button>
        </div>
      </div>

      {/* Lightbox phóng to ảnh / sơ đồ nhà ở — đặt ngay bên dưới Header */}
      {lightbox &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.title}
            style={{ top: `${headerOffset}px` }}
            className="fixed inset-x-0 bottom-0 z-40 flex flex-col justify-between bg-[#0F172A]/92 p-4 backdrop-blur-md sm:p-6"
            onClick={() => setLightbox(null)}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 pb-3 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="shrink-0 rounded-md bg-[#0F766E] px-2.5 py-1 text-xs font-bold text-white">
                  {lightbox.index + 1} / {lightbox.images.length}
                </span>
                <p className="truncate text-xs font-medium text-white/90 sm:text-sm">
                  {lightbox.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label={labels.closeModal}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:border-rose-500 hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <CloseIcon className="h-4 w-4" />
                <span>ESC</span>
              </button>
            </div>

            <div
              className="relative my-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.images[lightbox.index] || fallbackImage}
                alt={`${lightbox.title} ${lightbox.index + 1}`}
                className="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                            }
                          : null
                      )
                    }
                    aria-label={labels.prevImg}
                    className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/80 text-white shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                            }
                          : null
                      )
                    }
                    aria-label={labels.nextImg}
                    className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#134E4A]/80 text-white shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}