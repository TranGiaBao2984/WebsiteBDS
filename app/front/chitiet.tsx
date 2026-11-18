/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/app/context/LanguageContext';
import type { NearbyCategory, Property } from '@/lib/types';
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

interface ResolvedNearbyItem {
  id: string;
  category: NearbyCategory;
  name: string;
  distance: string;
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

function TrainIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="16" height="16" x="4" y="3" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <path d="m8 19-2 3" />
      <path d="m18 22-2-3" />
      <path d="M8 15h.01" />
      <path d="M16 15h.01" />
    </svg>
  );
}

function BeachIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function UtensilsIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </svg>
  );
}

function SchoolIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

function HospitalIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 6v4" />
      <path d="M14 14h-4" />
      <path d="M14 18h-4" />
      <path d="M14 8h-4" />
      <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
      <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </svg>
  );
}

function ParkIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
      <path d="M7 16v6" />
      <path d="M13 19v3" />
      <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5" />
    </svg>
  );
}

function AirportIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  );
}

function NearbyCategoryIcon({
  category,
  className,
}: {
  category: NearbyCategory;
  className?: string;
}) {
  switch (category) {
    case 'station':
      return <TrainIcon className={className} />;
    case 'beach':
      return <BeachIcon className={className} />;
    case 'supermarket':
      return <ShoppingCartIcon className={className} />;
    case 'restaurant':
      return <UtensilsIcon className={className} />;
    case 'convenience':
      return <StoreIcon className={className} />;
    case 'school':
      return <SchoolIcon className={className} />;
    case 'hospital':
      return <HospitalIcon className={className} />;
    case 'park':
      return <ParkIcon className={className} />;
    case 'airport':
      return <AirportIcon className={className} />;
    default:
      return <MapPinIcon className={className} />;
  }
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
      current = record[currentLang] || record.en || record.ja || firstNonEmpty || '';
    } else {
      break;
    }
  }

  return typeof current === 'string' ? current : String(current || '');
}

function parseNearbyItems(property: Property, currentLang: string): ResolvedNearbyItem[] {
  let rawList: unknown = property.nearby;

  if (!Array.isArray(rawList)) {
    const descObj = unwrapJson(property.description);
    if (typeof descObj === 'object' && descObj !== null && !Array.isArray(descObj)) {
      rawList = (descObj as Record<string, unknown>).nearby;
    }
  }

  const unwrapped = unwrapJson(rawList);
  if (!Array.isArray(unwrapped)) return [];

  return unwrapped
    .map((entry, idx): ResolvedNearbyItem | null => {
      if (!entry || typeof entry !== 'object') return null;
      const rec = entry as Record<string, unknown>;
      const category = (rec.category as NearbyCategory) || 'other';
      const name = getCleanText(rec.name, currentLang).trim();
      const distance = getCleanText(rec.distance, currentLang).trim();

      if (!name && !distance) return null;

      return {
        id: typeof rec.id === 'string' && rec.id ? rec.id : `nearby-${idx}`,
        category,
        name,
        distance,
      };
    })
    .filter((item): item is ResolvedNearbyItem => item !== null);
}

function toPositiveNumber(val: unknown): number {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function getFormattedPrice(property: Property, currentLang: 'en' | 'ja'): string {
  const descObj = unwrapJson(property.description);
  let priceEn = 0;
  let priceJa = toPositiveNumber(property.price_yen) || toPositiveNumber(property.price);

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
  currentLang: 'en' | 'ja'
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
    nearbyTitle: 'Nearby',
    mapTitle: 'Location on Map',
    openGoogleMaps: 'Open in Google Maps',
    similarTitle: 'Similar Properties',
    prevImg: 'Previous image',
    nextImg: 'Next image',
    zoomHint: 'Click to enlarge',
    closeLabel: 'Close',
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
    nearbyTitle: '周辺施設・アクセス',
    mapTitle: '地図・周辺マップ',
    openGoogleMaps: 'Googleマップで開く',
    similarTitle: '類似のおすすめ物件',
    prevImg: '前の画像',
    nextImg: '次の画像',
    zoomHint: 'クリックして拡大',
    closeLabel: '閉じる',
    closeModal: '拡大表示を閉じる (ESC)',
    consultCta: 'お問い合わせ',
  },
};

const ZOOM_SCALE = 2.2;

export default function ChiTietSection({ property, similarProperties = [] }: ChiTietSectionProps) {
  const { currentLang } = useLanguage();
  const lang = currentLang === 'ja' ? 'ja' : 'en';
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const suppressBackdropCloseRef = useRef(false);

  const labels = DETAIL_LABELS[lang];

  const title = getCleanText(property.title, lang) || 'Property';
  const location = getCleanText(property.location, lang) || 'Japan';
  const mapFallbackLocation =
    getCleanText(property.location, 'ja') ||
    getCleanText(property.location, 'en') ||
    location;
  const rawMapAddress = getSavedMapAddress(property);
  const { embedUrl, externalUrl, displayAddress } = buildGoogleMapsData(
    rawMapAddress,
    mapFallbackLocation,
    lang
  );

  const propertyType = getCleanText(property.property_type, lang) || labels.defaultType;
  const description = getCleanText(property.description, lang) || labels.noDesc;
  const nearbyItems = parseNearbyItems(property, lang);
  const formattedPrice = getFormattedPrice(property, lang);
  const images = parseImages(property.images);
  const floorPlanImages = parseFloorPlanImages(property);

  const fallbackImage =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
  const mainImage = images[activeIndex] || images[0] || fallbackImage;
  const mainFloorPlanImage = floorPlanImages[activeFloorPlanIndex] || floorPlanImages[0] || '';

  const resetZoom = () => {
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
    hasDraggedRef.current = false;
  };

  const openLightbox = (nextState: LightboxState) => {
    resetZoom();
    setLightbox(nextState);
  };

  const closeLightbox = () => {
    resetZoom();
    setLightbox(null);
  };

  useEffect(() => {
    if (!lightbox) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetZoom();
        setLightbox(null);
      } else if (e.key === 'ArrowLeft' && lightbox.images.length > 1) {
        resetZoom();
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
              }
            : null
        );
      } else if (e.key === 'ArrowRight' && lightbox.images.length > 1) {
        resetZoom();
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
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasDraggedRef.current = true;
      }

      const imgEl = imgRef.current;
      const maxX = imgEl ? (imgEl.offsetWidth * (ZOOM_SCALE - 1)) / 2 : 500;
      const maxY = imgEl ? (imgEl.offsetHeight * (ZOOM_SCALE - 1)) / 2 : 500;

      const nextX = Math.min(maxX, Math.max(-maxX, panStartRef.current.x + dx));
      const nextY = Math.min(maxY, Math.max(-maxY, panStartRef.current.y + dy));

      setPanOffset({ x: nextX, y: nextY });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      if (hasDraggedRef.current) {
        suppressBackdropCloseRef.current = true;
        requestAnimationFrame(() => {
          suppressBackdropCloseRef.current = false;
        });
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

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

  const handleLightboxImageMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };

    if (isZoomed) {
      setIsDragging(true);
    }
  };

  const handleLightboxImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (!isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetFromCenterX = e.clientX - (rect.left + rect.width / 2);
      const offsetFromCenterY = e.clientY - (rect.top + rect.height / 2);

      const maxX = (rect.width * (ZOOM_SCALE - 1)) / 2;
      const maxY = (rect.height * (ZOOM_SCALE - 1)) / 2;

      const initialX = Math.min(maxX, Math.max(-maxX, -offsetFromCenterX * (ZOOM_SCALE - 1)));
      const initialY = Math.min(maxY, Math.max(-maxY, -offsetFromCenterY * (ZOOM_SCALE - 1)));

      setPanOffset({ x: initialX, y: initialY });
      setIsZoomed(true);
    } else {
      resetZoom();
    }
  };

  const handleBackdropClick = () => {
    if (suppressBackdropCloseRef.current) return;
    closeLightbox();
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-0">
      {/* Property Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.05)] sm:p-8">
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#948D86]">
            <span className="rounded-md border border-[#E5DFD6] bg-[#F2EFE9] px-2.5 py-1 text-[#26221F]">
              {propertyType}
            </span>
            <span className="text-[#B8D200]">•</span>
            <span className="rounded-md border border-[#E5DFD6] bg-[#F2EFE9] px-2.5 py-1 text-[#26221F]">
              {property.bedrooms || 1} {labels.bedrooms}
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight text-[#26221F] sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <div className="flex flex-col justify-between gap-4 border-t border-[#E5DFD6] pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-[#66605A]">
              <MapPinIcon className="h-4 w-4 shrink-0 text-[#B8D200]" />
              <span>{location}</span>
            </div>

            <div className="sm:text-right">
              <div className="font-serif text-2xl font-bold text-[#B8D200] sm:text-3xl">
                {formattedPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery & Inquiry Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="group relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-2xl border border-[#E5DFD6] bg-[#F2EFE9] shadow-[0_4px_12px_rgba(38,34,31,0.05)]">
            <button
              type="button"
              onClick={() =>
                openLightbox({
                  images: images.length > 0 ? images : [fallbackImage],
                  index: activeIndex,
                  title,
                })
              }
              aria-label={`${labels.zoomHint} - ${title}`}
              className="flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8D200]"
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

            <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1E1B18]/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition-opacity duration-200">
              <ZoomInIcon className="h-3.5 w-3.5 text-[#FAF8F5]" />
              <span>{labels.zoomHint}</span>
            </span>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label={labels.prevImg}
                  className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1E1B18]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label={labels.nextImg}
                  className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1E1B18]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                <div className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-[#1E1B18]/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((img, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`${title} ${idx + 1}`}
                    aria-pressed={isSelected}
                    className={`flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-[#F2EFE9] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] ${
                      isSelected
                        ? 'border-[#B8D200] opacity-100 ring-2 ring-[#B8D200]/25'
                        : 'border-[#E5DFD6] opacity-80 hover:border-[#B8D200]/70 hover:opacity-100'
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

          {/* Specifications */}
          <div className="space-y-5 rounded-xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.04)]">
            <h2 className="font-serif border-b border-[#E5DFD6] pb-3 text-lg font-bold text-[#26221F]">
              {labels.specsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">{labels.area}</span>
                <span className="font-bold text-[#26221F]">
                  {property.area_sqm ? `${property.area_sqm} m²` : '--'}
                </span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.buildingSize}
                </span>
                <span className="font-bold text-[#26221F]">{property.building_size || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.landSize}
                </span>
                <span className="font-bold text-[#26221F]">{property.land_size || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.layout}
                </span>
                <span className="font-bold text-[#26221F]">{property.layout || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.structure}
                </span>
                <span className="font-bold text-[#26221F]">{property.structure || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.yearBuilt}
                </span>
                <span className="font-bold text-[#26221F]">{property.year_built || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.parking}
                </span>
                <span className="font-bold text-[#26221F]">{property.parking || '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.bedroomsCount}
                </span>
                <span className="font-bold text-[#26221F]">{property.bedrooms ?? '--'}</span>
              </div>
              <div className="rounded-lg bg-[#F2EFE9] p-3.5">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.bathroomsCount}
                </span>
                <span className="font-bold text-[#26221F]">{property.bathrooms ?? '--'}</span>
              </div>
              <div className="mt-1 border-t border-[#E5DFD6] pt-3 sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.landRights}
                </span>
                <span className="font-bold text-[#26221F]">{property.land_rights || '--'}</span>
              </div>
              <div className="border-t border-[#E5DFD6] pt-3 sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.access}
                </span>
                <span className="font-bold text-[#26221F]">{property.access || '--'}</span>
              </div>
              <div className="border-t border-[#E5DFD6] pt-3 sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs font-medium text-[#948D86]">
                  {labels.zoning}
                </span>
                <span className="font-bold text-[#26221F]">{property.zoning || '--'}</span>
              </div>
            </div>
          </div>

          {/* Floor Plan */}
          <div className="space-y-4 rounded-xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.04)]">
            <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD6] pb-3">
              <h2 className="font-serif text-lg font-bold text-[#26221F]">
                {labels.floorPlanTitle}
              </h2>
              {floorPlanImages.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openLightbox({
                      images: floorPlanImages,
                      index: activeFloorPlanIndex,
                      title: `${labels.floorPlanTitle} - ${title}`,
                    })
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md text-xs font-bold text-[#B8D200] transition-colors duration-200 hover:text-[#9FB600] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200]"
                >
                  <ZoomInIcon className="h-3.5 w-3.5" />
                  <span>{labels.zoomHint}</span>
                </button>
              )}
            </div>

            {floorPlanImages.length > 0 ? (
              <div className="space-y-4">
                <div className="group relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-xl border border-[#E5DFD6] bg-[#F2EFE9]">
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox({
                        images: floorPlanImages,
                        index: activeFloorPlanIndex,
                        title: `${labels.floorPlanTitle} - ${title}`,
                      })
                    }
                    aria-label={`${labels.zoomHint} - ${labels.floorPlanTitle}`}
                    className="flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8D200]"
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
                        className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1E1B18]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextFloorPlan}
                        aria-label={labels.nextImg}
                        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1E1B18]/75 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>

                      <div className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-[#1E1B18]/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
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
                          className={`flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-[#F2EFE9] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] ${
                            isSelected
                              ? 'border-[#B8D200] opacity-100 ring-2 ring-[#B8D200]/25'
                              : 'border-[#E5DFD6] opacity-80 hover:border-[#B8D200]/70 hover:opacity-100'
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
              <div className="rounded-xl border border-dashed border-[#E5DFD6] bg-[#FAF8F5] py-8 text-center text-xs font-medium text-[#948D86] sm:text-sm">
                {labels.noFloorPlan}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4 rounded-xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.04)]">
            <h2 className="font-serif border-b border-[#E5DFD6] pb-3 text-lg font-bold text-[#26221F]">
              {labels.descTitle}
            </h2>
            <p className="max-w-prose whitespace-pre-line text-[15px] leading-7 text-[#66605A] sm:text-base">
              {description}
            </p>
          </div>

          {/* Nearby */}
          {nearbyItems.length > 0 && (
            <div className="space-y-4 rounded-xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.04)]">
              <h2 className="font-serif border-b border-[#E5DFD6] pb-3 text-lg font-bold text-[#26221F]">
                {labels.nearbyTitle}
              </h2>

              <ul className="divide-y divide-[#E5DFD6]">
                {nearbyItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5DFD6] bg-[#FAF8F5] text-[#B8D200]">
                        <NearbyCategoryIcon category={item.category} className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium text-[#26221F]">
                        {item.name}
                      </span>
                    </div>

                    {item.distance && (
                      <span className="shrink-0 text-right text-xs font-semibold text-[#66605A] sm:text-sm">
                        {item.distance}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map */}
          <div className="space-y-4 rounded-xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.04)]">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E5DFD6] pb-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#26221F]">
                  {labels.mapTitle}
                </h2>
                {displayAddress && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#66605A] sm:text-sm">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-[#B8D200]" />
                    <span>{displayAddress}</span>
                  </p>
                )}
              </div>

              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-[#E5DFD6] bg-[#FAF8F5] px-4 py-2 text-xs font-semibold text-[#26221F] transition-all duration-200 hover:border-[#B8D200] hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2 sm:self-auto"
              >
                <span>{labels.openGoogleMaps}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-xl border border-[#E5DFD6] bg-[#F2EFE9]">
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

        {/* Inquiry Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <InquiryForm propertyId={property.id} propertyTitle={title} />
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 border-t border-[#E5DFD6] pt-8">
          <h2 className="font-serif text-2xl font-bold text-[#26221F]">{labels.similarTitle}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5DFD6] bg-[#FAF8F5]/95 px-4 py-3 shadow-[0_-4px_16px_rgba(38,34,31,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-[#66605A]">{title}</p>
            <p className="font-serif truncate text-base font-bold text-[#B8D200] sm:text-lg">
              {formattedPrice}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToContact}
            className="shrink-0 cursor-pointer rounded-lg bg-[#B8D200] px-5 py-2.5 text-xs font-semibold text-[#26221F] shadow-sm transition-all duration-200 hover:bg-[#9FB600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D200] focus-visible:ring-offset-2 sm:text-sm"
          >
            {labels.consultCta}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.title}
            className="fixed inset-0 z-70 flex cursor-zoom-out flex-col justify-between bg-[#141210]/94 p-4 backdrop-blur-md select-none sm:p-6"
            onClick={handleBackdropClick}
          >
            <div
              className="mx-auto flex w-full max-w-7xl shrink-0 cursor-default items-center justify-between gap-4 border-b border-white/15 pb-3 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-full bg-[#B8D200] px-3 py-1 text-xs font-bold tracking-wider text-[#26221F] shadow-xs">
                  {lightbox.index + 1} / {lightbox.images.length}
                </span>
                <p className="truncate text-xs font-medium text-[#FAF8F5]/90 sm:text-sm">
                  {lightbox.title}
                </p>
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                aria-label={labels.closeModal}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold text-[#FAF8F5] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#B8D200] hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <CloseIcon className="h-4 w-4" />
                <span>{labels.closeLabel}</span>
                <kbd className="hidden rounded bg-black/35 px-1.5 py-0.5 font-mono text-[10px] text-white/80 sm:inline-block">
                  ESC
                </kbd>
              </button>
            </div>

            <div className="relative my-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-14">
              <img
                ref={imgRef}
                src={lightbox.images[lightbox.index] || fallbackImage}
                alt={`${lightbox.title} ${lightbox.index + 1}`}
                draggable={false}
                onMouseDown={handleLightboxImageMouseDown}
                onClick={handleLightboxImageClick}
                style={{
                  transform: isZoomed
                    ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${ZOOM_SCALE})`
                    : 'translate3d(0px, 0px, 0) scale(1)',
                  transition: isDragging ? 'none' : 'transform 200ms ease-out',
                }}
                className={`max-h-full max-w-full w-auto h-auto select-none rounded-xl border border-white/15 object-contain shadow-2xl ${
                  isZoomed
                    ? isDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-zoom-in'
                }`}
              />

              {lightbox.images.length > 1 && !isZoomed && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                            }
                          : null
                      );
                    }}
                    aria-label={labels.prevImg}
                    className="absolute top-1/2 left-1 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#1E1B18]/85 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#B8D200] hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4 sm:h-12 sm:w-12"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                            }
                          : null
                      );
                    }}
                    aria-label={labels.nextImg}
                    className="absolute top-1/2 right-1 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#1E1B18]/85 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#B8D200] hover:bg-[#B8D200] hover:text-[#26221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:h-12 sm:w-12"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div
              className="mx-auto flex w-full max-w-4xl shrink-0 cursor-default flex-col items-center gap-2 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.length > 1 && (
                <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-white/15 bg-black/45 p-1.5 backdrop-blur-md">
                  {lightbox.images.map((img, idx) => {
                    const isCurrent = idx === lightbox.index;
                    return (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => {
                          resetZoom();
                          setLightbox((prev) => (prev ? { ...prev, index: idx } : null));
                        }}
                        aria-label={`${idx + 1} / ${lightbox.images.length}`}
                        className={`relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                          isCurrent
                            ? 'scale-105 border-[#B8D200] opacity-100'
                            : 'border-transparent opacity-55 hover:opacity-90'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}