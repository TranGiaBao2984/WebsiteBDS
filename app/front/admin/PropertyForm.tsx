"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProperty } from "@/app/back/admin";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { Property } from "@/lib/types";

interface PropertyFormProps {
  property?: Property;
}

// Bóc tách văn bản thuần từ các chuỗi JSON lồng nhau
function getCleanText(val: unknown): string {
  if (!val) return "";
  let current: unknown = val;

  for (let i = 0; i < 10; i++) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
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
    } else if (typeof current === "object" && current !== null) {
      const record = current as Record<string, unknown>;
      current = record.vi ?? record.en ?? record.ja ?? Object.values(record)[0] ?? "";
    } else {
      break;
    }
  }

  return typeof current === "string" ? current : String(current || "");
}

// Giải mã danh sách URL ảnh từ Database
function parseImages(val: unknown): string[] {
  if (!val) return [];
  let current: unknown = val;

  for (let i = 0; i < 5; i++) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      } else if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const content = trimmed.slice(1, -1);
        if (!content) return [];
        return content
          .split(",")
          .map((s) => s.replace(/^"|"$/g, "").trim())
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

  if (typeof current === "string" && current.trim()) {
    return [current.trim()];
  }

  return [];
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(() => parseImages(property?.images));
  const [uploading, setUploading] = useState(false);

  const isEdit = Boolean(property?.id);

  // Tải ảnh trực tiếp từ trình duyệt lên Supabase Storage để lấy URL nhẹ
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createSupabaseBrowser();

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        let bucketName = "properties";
        let { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        // Dự phòng nếu bucket tên là 'property-images'
        if (uploadError && uploadError.message.toLowerCase().includes("bucket not found")) {
          bucketName = "property-images";
          const retry = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });
          uploadError = retry.error;
        }

        if (uploadError) {
          throw new Error(`Tải ảnh "${file.name}" thất bại: ${uploadError.message}`);
        }

        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải ảnh lên Supabase Storage.";
      alert(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const oldImages = parseImages(property?.images);
    const finalImages = images.length > 0 ? images : oldImages;

    if (!isEdit && finalImages.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh BĐS.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const inputData = {
      id: property?.id,
      titleRaw: formData.get("title") as string,
      descriptionRaw: formData.get("description") as string,
      locationRaw: formData.get("address") as string,
      priceYen: Number(formData.get("priceYen")),
      areaSqm: Number(formData.get("areaSqm")),
      buildingSize: formData.get("buildingSize") as string,
      landSize: formData.get("landSize") as string,
      layout: formData.get("layout") as string,
      structure: formData.get("structure") as string,
      yearBuilt: Number(formData.get("yearBuilt")),
      parking: formData.get("parking") as string,
      landRights: formData.get("landRights") as string,
      zoning: formData.get("zoning") as string,
      access: formData.get("access") as string,
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      propertyType: formData.get("propertyType") as string,
      images: finalImages,
      floorPlanUrl: finalImages[0] || property?.floor_plan || property?.floor_plan_url || "",
    };

    const res = await saveProperty(inputData);
    setLoading(false);

    if (res.success) {
      alert(isEdit ? "Cập nhật bài thành công!" : "Đăng bài thành công!");
      router.push("/admin");
      router.refresh();
    } else {
      alert(`Thao tác thất bại: ${res.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-[#e6dfd5] rounded-lg shadow-sm">
      {/* 1. Thông tin cơ bản */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold border-b border-[#e6dfd5] pb-2 text-[#7a482b]">
          1. Thông tin cơ bản
        </h2>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tên Bất động sản *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={getCleanText(property?.title)}
            placeholder="Căn hộ chung cư cao cấp Shinjuku 2LDK gần ga"
            className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Giá bán (Yen - JPY) *</label>
            <input
              type="number"
              name="priceYen"
              required
              defaultValue={property?.price_yen || property?.price || ""}
              placeholder="45000000"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Loại BĐS *</label>
            <select
              name="propertyType"
              defaultValue={property?.property_type || "Apartment"}
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
            >
              <option value="Apartment">Căn hộ (Apartment)</option>
              <option value="House">Nhà riêng (House)</option>
              <option value="Mansion">Mansion</option>
              <option value="Land">Đất nền (Land)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Địa chỉ / Vị trí *</label>
          <input
            type="text"
            name="address"
            required
            defaultValue={getCleanText(property?.location)}
            placeholder="Shinjuku-ku, Tokyo, Japan"
            className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
          />
        </div>
      </div>

      {/* 2. Thông số kỹ thuật BĐS Nhật Bản */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-serif font-bold border-b border-[#e6dfd5] pb-2 text-[#7a482b]">
          2. Thông số kỹ thuật BĐS Nhật Bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Diện tích sử dụng (m²) *</label>
            <input
              type="number"
              step="0.1"
              name="areaSqm"
              required
              defaultValue={property?.area_sqm || ""}
              placeholder="65.5"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Diện tích sàn (Building Size)</label>
            <input
              type="text"
              name="buildingSize"
              defaultValue={property?.building_size || ""}
              placeholder="65.5 m² / 19.8 tsubo"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Diện tích đất (Land Size)</label>
            <input
              type="text"
              name="landSize"
              defaultValue={property?.land_size || ""}
              placeholder="80.0 m² / 24.2 tsubo"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Bố cục phòng (Layout)</label>
            <input
              type="text"
              name="layout"
              defaultValue={property?.layout || "2LDK"}
              placeholder="2LDK / 3DK / 1K"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Kết cấu (Structure)</label>
            <input
              type="text"
              name="structure"
              defaultValue={property?.structure || "RC (Bê tông cốt thép)"}
              placeholder="RC (Bê tông cốt thép) / Gỗ"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Năm xây dựng (Year Built)</label>
            <input
              type="number"
              name="yearBuilt"
              defaultValue={property?.year_built || new Date().getFullYear()}
              placeholder="2020"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Quyền sở hữu (Land Rights)</label>
            <input
              type="text"
              name="landRights"
              defaultValue={property?.land_rights || "Sở hữu vĩnh viễn (Ownership)"}
              placeholder="Sở hữu vĩnh viễn (Ownership)"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Vị trí ga / Giao thông (Access)</label>
            <input
              type="text"
              name="access"
              defaultValue={property?.access || ""}
              placeholder="Đi bộ 5 phút ra ga Shinjuku"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Chỗ đậu xe (Parking)</label>
            <input
              type="text"
              name="parking"
              defaultValue={property?.parking || "Có"}
              placeholder="Có (1 chỗ) / Không"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Quy hoạch đất (Zoning)</label>
            <input
              type="text"
              name="zoning"
              defaultValue={property?.zoning || "Khu dân cư"}
              placeholder="Khu dân cư thương mại"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Số phòng ngủ</label>
            <input
              type="number"
              name="bedrooms"
              defaultValue={property?.bedrooms ?? 2}
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Số phòng tắm</label>
            <input
              type="number"
              name="bathrooms"
              defaultValue={property?.bathrooms ?? 1}
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Mô tả & Hình ảnh */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-serif font-bold border-b border-[#e6dfd5] pb-2 text-[#7a482b]">
          3. Mô tả & Hình ảnh
        </h2>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Mô tả chi tiết *</label>
          <textarea
            name="description"
            rows={5}
            required
            defaultValue={getCleanText(property?.description)}
            placeholder="Mô tả tiện ích xung quanh, tình trạng pháp lý, ban công..."
            className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Hình ảnh BĐS</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-[#3c352d] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#3c352d] file:text-[#f8f6f0] hover:file:opacity-90 cursor-pointer"
          />
          {uploading && <p className="text-xs text-amber-600 mt-1">Đang tải ảnh lên Storage...</p>}

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative group w-24 h-24 rounded border border-[#e6dfd5] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Property image ${idx}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-size='12'>Ảnh lỗi</text></svg>";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded shadow hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3 bg-[#7a482b] text-white font-bold rounded hover:bg-[#633a22] transition duration-200 disabled:opacity-50 text-sm tracking-wider uppercase"
      >
        {loading ? "Đang lưu..." : isEdit ? "Cập Nhật BĐS" : "Lưu & Đăng BĐS Nhật Bản"}
      </button>
    </form>
  );
}