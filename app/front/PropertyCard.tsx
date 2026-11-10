"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

export interface PropertyCardProps {
  property: {
    id: string | number;
    title: { vi?: string; en?: string; ja?: string } | string;
    description?: { vi?: string; en?: string; ja?: string } | string;
    location?: { vi?: string; en?: string; ja?: string } | string;
    price?: number;
    price_yen?: number;
    area_sqm?: number;
    layout?: string;
    year_built?: number;
    bedrooms?: number;
    current_status?: string;
    status?: string;
    images?: string[];
    property_type?: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { currentLang } = useLanguage();
  const langKey = (currentLang as "vi" | "en" | "ja") || "vi";

  // Helper xử lý triệt để dữ liệu JSONB object, JSON string thô lẫn String thông thường
  const getLangValue = (field: unknown): string => {
    if (!field) return "";

    // 1. Nếu field là Object JSONB { vi: "...", en: "..." }
    if (typeof field === "object" && field !== null) {
      const record = field as Record<string, string>;
      return record[langKey] || record.vi || record.en || record.ja || "";
    }

    // 2. Nếu field là String (Bao gồm trường hợp bị Stringify nhầm dạng {"vi":"..."})
    if (typeof field === "string") {
      const trimmed = field.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === "object" && parsed !== null) {
            return parsed[langKey] || parsed.vi || parsed.en || parsed.ja || "";
          }
        } catch {
          // Parse không được thì giữ nguyên chuỗi
        }
      }
      return field;
    }

    return String(field);
  };

  const title = getLangValue(property.title) || "Bất động sản Nhật Bản";
  const location = getLangValue(property.location) || "TOKYO";
  const price = property.price_yen || property.price || 0;
  const statusBadge = property.current_status || property.status || "AVAILABLE";

  // Kiểm tra ảnh hợp lệ
  const imageSrc =
    property.images && property.images.length > 0 && property.images[0].startsWith("http")
      ? property.images[0]
      : "/placeholder.jpg";

  return (
    <div className="bg-white border border-[#e6dfd5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full text-[#3c352d]">
      {/* Khung Ảnh & Badge */}
      <div className="relative aspect-16/10 w-full bg-[#eae4dc]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 bg-[#2c2623]/80 backdrop-blur-sm text-[#f8f6f0] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
          {statusBadge}
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8c827a] mb-1">
            {location}
          </p>
          <h3 className="font-serif text-base font-bold text-[#2c2623] line-clamp-2 hover:text-[#7a482b] transition">
            <Link href={`/properties/${property.id}`}>{title}</Link>
          </h3>
        </div>

        <div>
          <div className="text-lg font-serif font-bold text-[#7a482b]">
            ¥{price ? price.toLocaleString("ja-JP") : "0"}
          </div>
        </div>

        {/* Thông số bên dưới Footer thẻ */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#f3eee7] text-center text-xs bg-[#f8f6f0]/60 -mx-5 -mb-5 p-3 mt-auto">
          <div>
            <span className="block font-semibold text-[#2c2623]">
              {property.layout || (property.bedrooms ? `${property.bedrooms} Bed` : "1LDK")}
            </span>
            <span className="text-[10px] uppercase text-[#8c827a]">LAYOUT</span>
          </div>
          <div className="border-x border-[#e6dfd5]">
            <span className="block font-semibold text-[#2c2623]">
              {property.area_sqm ? `${property.area_sqm} m²` : "—"}
            </span>
            <span className="text-[10px] uppercase text-[#8c827a]">HOUSE</span>
          </div>
          <div>
            <span className="block font-semibold text-[#2c2623]">
              {property.year_built || "2024"}
            </span>
            <span className="text-[10px] uppercase text-[#8c827a]">BUILT</span>
          </div>
        </div>
      </div>
    </div>
  );
}