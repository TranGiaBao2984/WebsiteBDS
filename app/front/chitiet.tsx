/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
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
    closeModal: 'Đóng chế độ xem lớn',
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
    closeModal: 'Close fullscreen view',
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
    closeModal: '拡大表示を閉じる',
    consultCta: 'お問い合わせ',
  },
};

export default function ChiTietSection({ property, similarProperties = [] }: ChiTietSectionProps) {
  const { currentLang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
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

  // Điều khiển Lightbox bằng bàn phím (Esc, mũi tên trái/phải)
  useEffect(() => {
    if (!lightbox) return;
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="space-y-12 pb-20 lg:pb-0">
      {/* Header thông tin chính */}
      <div className="space-y-4 border-b border-[#e6dfd5] pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7a482b]">
          <span>{propertyType}</span>
          <span>•</span>
          <span>
            {property.bedrooms || 1} {labels.bedrooms}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c2623]">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-[#574d43]">📍 {location}</p>
          <div className="sm:text-right">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#7a482b]">
              {formattedPrice}
            </div>
          </div>
        </div>
      </div>

      {/* Grid hình ảnh & Form tư vấn */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: Ảnh & Chi tiết */}
        <div className="lg:col-span-8 space-y-6">
          {/* Khung ảnh lớn hiển thị full ảnh kèm nút chuyển trái/phải và bấm phóng to */}
          <div className="relative aspect-16/10 rounded-2xl bg-[#f4efe8] overflow-hidden border border-[#e6dfd5] flex items-center justify-center group">
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
              className="w-full h-full flex items-center justify-center cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#7a482b]"
            >
              <img
                src={mainImage}
                alt={title}
                className="w-full h-full object-contain transition-all duration-300 select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
            </button>

            <span className="pointer-events-none absolute top-3 right-3 bg-black/55 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-xs opacity-90 group-hover:opacity-100 transition">
              🔍 {labels.zoomHint}
            </span>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label={labels.prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition duration-200 shadow-md cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label={labels.nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition duration-200 shadow-md cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                <div className="absolute bottom-3 right-3 bg-black/65 text-white text-xs px-2.5 py-1 rounded-full">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Danh sách ảnh thu nhỏ bên dưới */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    aria-pressed={isSelected}
                    className={`aspect-4/3 rounded-xl overflow-hidden border-2 bg-[#f4efe8] flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7a482b] ${
                      isSelected
                        ? 'border-[#7a482b] ring-2 ring-[#7a482b]/30 opacity-100'
                        : 'border-[#e6dfd5] opacity-80 hover:opacity-100 hover:border-[#8c6d53]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Thông số kỹ thuật đầy đủ 12 trường (chống vỡ hàng trên mobile) */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#2c2623] border-b border-[#f0eae1] pb-3">
              {labels.specsTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-xs sm:text-sm">
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.area}</span>
                <span className="font-bold text-[#2c2623]">
                  {property.area_sqm ? `${property.area_sqm} m²` : '--'}
                </span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.buildingSize}</span>
                <span className="font-bold text-[#2c2623]">{property.building_size || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.landSize}</span>
                <span className="font-bold text-[#2c2623]">{property.land_size || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.layout}</span>
                <span className="font-bold text-[#2c2623]">{property.layout || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.structure}</span>
                <span className="font-bold text-[#2c2623]">{property.structure || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.yearBuilt}</span>
                <span className="font-bold text-[#2c2623]">{property.year_built || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.parking}</span>
                <span className="font-bold text-[#2c2623]">{property.parking || '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.bedroomsCount}</span>
                <span className="font-bold text-[#2c2623]">{property.bedrooms ?? '--'}</span>
              </div>
              <div>
                <span className="text-[#574d43] block mb-0.5">{labels.bathroomsCount}</span>
                <span className="font-bold text-[#2c2623]">{property.bathrooms ?? '--'}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-[#f5f0e8]">
                <span className="text-[#574d43] block mb-0.5">{labels.landRights}</span>
                <span className="font-bold text-[#2c2623]">{property.land_rights || '--'}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-[#574d43] block mb-0.5">{labels.access}</span>
                <span className="font-bold text-[#2c2623]">{property.access || '--'}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-[#574d43] block mb-0.5">{labels.zoning}</span>
                <span className="font-bold text-[#2c2623]">{property.zoning || '--'}</span>
              </div>
            </div>
          </div>

          {/* Khung Sơ đồ nhà ở (Hỗ trợ bấm phóng to toàn màn hình) */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#f0eae1] pb-3">
              <h2 className="font-serif font-bold text-lg text-[#2c2623]">
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
                  className="text-xs font-semibold text-[#7a482b] hover:underline cursor-pointer"
                >
                  🔍 {labels.zoomHint}
                </button>
              )}
            </div>

            {floorPlanImages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-16/10 rounded-xl bg-[#f4efe8] overflow-hidden border border-[#e6dfd5] flex items-center justify-center group">
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
                    className="w-full h-full flex items-center justify-center cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#7a482b]"
                  >
                    <img
                      src={mainFloorPlanImage}
                      alt={`${labels.floorPlanTitle} - ${title}`}
                      className="w-full h-full object-contain transition-all duration-300 select-none"
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition duration-200 shadow-md cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextFloorPlan}
                        aria-label={labels.nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition duration-200 shadow-md cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>

                      <div className="absolute bottom-3 right-3 bg-black/65 text-white text-xs px-2.5 py-1 rounded-full">
                        {activeFloorPlanIndex + 1} / {floorPlanImages.length}
                      </div>
                    </>
                  )}
                </div>

                {floorPlanImages.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {floorPlanImages.map((img, idx) => {
                      const isSelected = idx === activeFloorPlanIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveFloorPlanIndex(idx)}
                          aria-label={`${labels.floorPlanTitle} ${idx + 1}`}
                          aria-pressed={isSelected}
                          className={`aspect-4/3 rounded-xl overflow-hidden border-2 bg-[#f4efe8] flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7a482b] ${
                            isSelected
                              ? 'border-[#7a482b] ring-2 ring-[#7a482b]/30 opacity-100'
                              : 'border-[#e6dfd5] opacity-80 hover:opacity-100 hover:border-[#8c6d53]'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${labels.floorPlanTitle} ${idx + 1}`}
                            className="w-full h-full object-contain"
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
              <div className="py-8 text-center text-xs sm:text-sm text-[#574d43] bg-[#faf8f5] rounded-xl border border-dashed border-[#e6dfd5]">
                {labels.noFloorPlan}
              </div>
            )}
          </div>

          {/* Mô tả chi tiết */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-3">
            <h2 className="font-serif font-bold text-lg text-[#2c2623] border-b border-[#f0eae1] pb-3">
              {labels.descTitle}
            </h2>
            <p className="text-[15px] sm:text-base text-[#3c352d] leading-7 max-w-prose whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Khung Vị trí trên bản đồ (Google Maps) */}
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eae1] pb-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#2c2623]">
                  {labels.mapTitle}
                </h2>
                {displayAddress && (
                  <p className="text-xs sm:text-sm text-[#574d43] mt-0.5">📍 {displayAddress}</p>
                )}
              </div>

              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#f4efe8] hover:bg-[#7a482b] text-[#2c2623] hover:text-white text-xs font-bold rounded-xl transition duration-200 self-start sm:self-auto cursor-pointer"
              >
                <span>{labels.openGoogleMaps}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#e6dfd5] bg-[#f4efe8]">
              <iframe
                src={embedUrl}
                title={`${labels.mapTitle} - ${title}`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
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
          <h2 className="text-2xl font-serif font-bold text-[#2c2623]">{labels.similarTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      )}

      {/* Thanh CTA cố định đáy màn hình trên Mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e6dfd5] px-4 py-3 shadow-[0_-4px_16px_rgba(44,38,35,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#574d43] truncate">{title}</p>
            <p className="text-base sm:text-lg font-serif font-bold text-[#7a482b] truncate">
              {formattedPrice}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToContact}
            className="shrink-0 px-5 py-2.5 bg-[#7a482b] hover:bg-[#633a22] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            {labels.consultCta}
          </button>
        </div>
      </div>

      {/* Lightbox phóng to ảnh / sơ đồ nhà ở */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="flex items-center justify-between gap-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs sm:text-sm font-medium truncate">
              {lightbox.title} ({lightbox.index + 1}/{lightbox.images.length})
            </p>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label={labels.closeModal}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.images[lightbox.index] || fallbackImage}
              alt={`${lightbox.title} ${lightbox.index + 1}`}
              className="max-h-[82vh] max-w-full object-contain rounded-lg select-none"
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ‹
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
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}