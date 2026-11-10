"use client";

import { useState } from "react";
import Image from "next/image";
import InquiryForm from "./InquiryForm";
import { useLanguage } from "@/app/context/LanguageContext";

export interface PropertyDetail {
  id: string;
  title: { vi: string; en: string; ja: string } | string;
  description: { vi: string; en: string; ja: string } | string;
  location: { vi: string; en: string; ja: string } | string;
  price_yen: number;
  price_vnd: number;
  area_sqm: number;
  building_size?: string;
  land_size?: string;
  layout?: string;
  structure?: string;
  year_built?: number;
  parking?: string;
  land_rights?: string;
  zoning?: string;
  access?: string;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  images: string[];
  floor_plan_url?: string;
}

export default function ChitietView({ property }: { property: PropertyDetail }) {
  const { currentLang } = useLanguage();
  const langKey = (currentLang as "vi" | "en" | "ja") || "vi";

  // Thay thế `any` bằng `unknown` và ép kiểu an toàn
  const getLangValue = (field: unknown): string => {
    if (typeof field === "object" && field !== null) {
      const record = field as Record<string, string>;
      return record[langKey] || record.vi || "";
    }
    return typeof field === "string" ? field : String(field || "");
  };

  const title = getLangValue(property.title) || "Bất động sản Nhật Bản";
  const description = getLangValue(property.description);
  const location = getLangValue(property.location);

  const [selectedImage, setSelectedImage] = useState(property.images?.[0] || "/placeholder.jpg");

  return (
    <div className="bg-[#f8f6f0] min-h-screen py-10 text-[#3c352d]">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#e6dfd5] pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7a482b] mb-1 block">
              {property.property_type} • {property.layout || "2LDK"}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3c352d]">{title}</h1>
            <p className="text-sm text-[#3c352d]/70 mt-2 flex items-center gap-1">
              📍 {location}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-bold text-[#7a482b]">
              ¥{property.price_yen ? property.price_yen.toLocaleString("ja-JP") : 0}
            </div>
            <div className="text-sm text-[#3c352d]/70">
              ~ {property.price_vnd ? (property.price_vnd / 100_000_000).toFixed(2) : 0} tỷ VNĐ
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Image */}
            <div className="relative aspect-16/10 w-full bg-stone-200 rounded-lg overflow-hidden border border-[#e6dfd5]">
              <Image src={selectedImage} alt={title} fill className="object-cover" priority />
            </div>

            {/* Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-20 shrink-0 rounded overflow-hidden border-2 transition ${
                      selectedImage === img ? "border-[#7a482b]" : "border-transparent opacity-70"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* BẢNG THÔNG SỐ KỸ THUẬT BĐS NHẬT BẢN */}
            <div className="bg-white border border-[#e6dfd5] p-6 lg:p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif font-bold text-[#3c352d] mb-4 border-b border-[#e6dfd5] pb-3">
                Thông số chi tiết Bất động sản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Bố cục phòng (Layout):</span>
                  <span className="font-semibold">{property.layout || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Diện tích sử dụng:</span>
                  <span className="font-semibold">{property.area_sqm} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Diện tích sàn (Building Size):</span>
                  <span className="font-semibold">{property.building_size || `${property.area_sqm} m²`}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Diện tích đất (Land Size):</span>
                  <span className="font-semibold">{property.land_size || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Kết cấu (Structure):</span>
                  <span className="font-semibold">{property.structure || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Năm xây dựng:</span>
                  <span className="font-semibold">{property.year_built || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Quyền sở hữu đất:</span>
                  <span className="font-semibold">{property.land_rights || "Sở hữu vĩnh viễn"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Giao thông / Vị trí ga:</span>
                  <span className="font-semibold">{property.access || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Bãi đậu xe:</span>
                  <span className="font-semibold">{property.parking || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f8f6f0]">
                  <span className="text-[#3c352d]/60 font-medium">Quy hoạch đất (Zoning):</span>
                  <span className="font-semibold">{property.zoning || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="bg-white border border-[#e6dfd5] p-6 lg:p-8 rounded-lg space-y-4">
              <h2 className="text-2xl font-serif font-bold text-[#3c352d]">Chi tiết & Mô tả</h2>
              <div className="text-[#3c352d]/90 whitespace-pre-line leading-relaxed text-base">
                {description}
              </div>
            </div>

            {/* Floor Plan */}
            {property.floor_plan_url && (
              <div className="bg-white border border-[#e6dfd5] p-6 lg:p-8 rounded-lg space-y-4">
                <h2 className="text-2xl font-serif font-bold text-[#3c352d]">Sơ đồ Mặt bằng (Floor Plan)</h2>
                <div className="relative aspect-4/3 w-full max-w-2xl mx-auto rounded overflow-hidden border border-[#e6dfd5]">
                  <Image src={property.floor_plan_url} alt="Floor Plan" fill className="object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Form tư vấn */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <InquiryForm propertyId={property.id} propertyTitle={title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}