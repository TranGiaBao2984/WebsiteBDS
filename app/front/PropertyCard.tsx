"use client";

import Image from "next/image";
import Link from "next/link";

// Interface định nghĩa đúng các trường trong bảng `properties` trên Supabase
export interface Property {
  id: string;
  title: string | Record<string, string>;
  description?: string | Record<string, string>;
  location: string | Record<string, string>;
  price?: number;
  price_yen?: number;
  price_vnd?: number;
  building_size?: string;
  land_size?: string;
  area_sqm?: number;
  layout?: string;
  structure?: string;
  year_built?: number;
  current_status?: string;
  status?: string;
  parking?: string;
  land_rights?: string;
  zoning?: string;
  access?: string;
  images?: string[];
  floor_plan?: string;
  floor_plan_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  created_at?: string;
}

interface PropertyCardProps {
  property: Property;
  lang?: string;
}

export default function PropertyCard({ property, lang = "vi" }: PropertyCardProps) {
  // 1. Ảnh hiển thị (Lấy ảnh đầu tiên trong mảng images[])
  const imageSrc =
    property.images && property.images.length > 0 && property.images[0]
      ? property.images[0]
      : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80";

  // 2. Tiêu đề & Địa điểm (Hỗ trợ cả String hoặc Object đa ngôn ngữ)
  const title =
    typeof property.title === "object"
      ? property.title[lang] || property.title["vi"] || property.title["en"] || ""
      : property.title || "";

  const location =
    typeof property.location === "object"
      ? property.location[lang] || property.location["vi"] || property.location["en"] || ""
      : property.location || "";

  // 3. Trạng thái (Ưu tiên current_status -> status)
  const displayStatus = (property.current_status || property.status || "AVAILABLE").toUpperCase();

  // 4. Giá (Ưu tiên price_yen -> price)
  const priceYenVal = property.price_yen || property.price || 0;
  const priceDisplay = priceYenVal > 0 ? `¥${priceYenVal.toLocaleString("en-US")}` : "Liên hệ";

  // 5. Cột HOUSE: Ưu tiên building_size -> area_sqm (m²) -> land_size -> property_type
  const houseDisplay =
    property.building_size ||
    (property.area_sqm ? `${property.area_sqm} m²` : null) ||
    property.land_size ||
    property.property_type ||
    "-";

  // 6. Cột LAYOUT: Ưu tiên layout -> bedrooms
  const layoutDisplay =
    property.layout ||
    (property.bedrooms ? `${property.bedrooms} LDK` : "-");

  // 7. Cột BUILT: NĂm xây dựng (year_built)
  const builtDisplay = property.year_built ? property.year_built.toString() : "-";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-[#e8e2d9]"
    >
      {/* Khung Ảnh & Status Badge */}
      <div className="relative aspect-16/10 w-full bg-[#eae4dc] overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="rounded bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {displayStatus}
          </span>
        </div>
      </div>

      {/* Nội dung thông tin chi tiết */}
      <div className="p-4 flex flex-col justify-between">
        <div>
          {/* Địa điểm */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09485] truncate">
            {location || "JAPAN"}
          </p>

          {/* Tiêu đề */}
          <h3 className="mt-1 text-base font-bold text-[#3c352d] line-clamp-1 group-hover:text-[#8b6f4e] transition-colors">
            {title}
          </h3>

          {/* Giá */}
          <p className="mt-2 text-lg font-extrabold text-[#3c352d]">
            {priceDisplay}
          </p>
        </div>

        {/* Khung 3 cột thông tin: LAYOUT | HOUSE | BUILT */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[#eee9e0] border-t border-[#eee9e0] pt-3 text-center">
          {/* LAYOUT */}
          <div className="flex flex-col items-center px-1">
            <span className="font-bold text-xs text-[#3c352d] truncate max-w-full">
              {layoutDisplay}
            </span>
            <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wider mt-0.5">
              LAYOUT
            </span>
          </div>

          {/* HOUSE */}
          <div className="flex flex-col items-center px-1">
            <span className="font-bold text-xs text-[#3c352d] truncate max-w-full">
              {houseDisplay}
            </span>
            <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wider mt-0.5">
              HOUSE
            </span>
          </div>

          {/* BUILT */}
          <div className="flex flex-col items-center px-1">
            <span className="font-bold text-xs text-[#3c352d] truncate max-w-full">
              {builtDisplay}
            </span>
            <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wider mt-0.5">
              BUILT
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}