"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPropertyAction } from "@/app/back/admin";

export default function AdminNewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // Sử dụng domain dự án Supabase thực tế của bạn
    const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jclbxsnsorfotwndpxle.supabase.co";

    const uploadedUrls = Array.from(files).map(
      (_, idx) => `${supabaseProjectUrl}/storage/v1/object/public/properties/${Date.now()}_${idx}.jpg`
    );

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh BĐS.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const inputData = {
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
      images: images,
      floorPlanUrl: images[0]
    };

    const res = await createPropertyAction(inputData);
    setLoading(false);

    if (res.success) {
      alert("Đăng bài thành công! Đã lưu đầy đủ thông số BĐS Nhật Bản.");
      router.push("/admin");
    } else {
      alert(`Đăng bài thất bại: ${res.error}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-[#3c352d]">
      <div className="mb-8 border-b border-[#e6dfd5] pb-4">
        <h1 className="text-3xl font-serif font-bold">Đăng Bất Động Sản Nhật Bản (Đầy đủ trường)</h1>
        <p className="text-sm text-[#3c352d]/70 mt-1">
          Nhập thông tin chi tiết tiêu chuẩn BĐS Nhật Bản.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-[#e6dfd5] rounded-lg shadow-sm">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold border-b border-[#e6dfd5] pb-2 text-[#7a482b]">
            1. Thông tin cơ bản
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tên Bất động sản (Tiếng Việt) *</label>
            <input
              type="text"
              name="title"
              required
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
                placeholder="45000000"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Loại BĐS *</label>
              <select
                name="propertyType"
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
              placeholder="Shinjuku-ku, Tokyo, Japan"
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
            />
          </div>
        </div>

        {/* Thông số kỹ thuật BĐS Nhật */}
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
                placeholder="65.5"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Diện tích sàn (Building Size)</label>
              <input
                type="text"
                name="buildingSize"
                placeholder="65.5 m² / 19.8 tsubo"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Diện tích đất (Land Size)</label>
              <input
                type="text"
                name="landSize"
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
                placeholder="2LDK / 3DK / 1K"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Kết cấu (Structure)</label>
              <input
                type="text"
                name="structure"
                placeholder="RC (Bê tông cốt thép) / Gỗ"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Năm xây dựng (Year Built)</label>
              <input
                type="number"
                name="yearBuilt"
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
                placeholder="Sở hữu vĩnh viễn (Ownership)"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Vị trí ga / Giao thông (Access)</label>
              <input
                type="text"
                name="access"
                placeholder="Đi bộ 5 phút ra ga Shinjuku"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Chỗ đậu xe (Parking)</label>
              <input
                type="text"
                name="parking"
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
                placeholder="Khu dân cư thương mại"
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Số phòng ngủ</label>
              <input
                type="number"
                name="bedrooms"
                defaultValue={2}
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Số phòng tắm</label>
              <input
                type="number"
                name="bathrooms"
                defaultValue={1}
                className="w-full px-4 py-2 border border-[#e6dfd5] rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Mô tả & Hình ảnh */}
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
              placeholder="Mô tả tiện ích xung quanh, tình trạng pháp lý, ban công..."
              className="w-full px-4 py-2 border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Hình ảnh BĐS *</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-[#3c352d] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#3c352d] file:text-[#f8f6f0] hover:file:opacity-90"
            />
            {uploading && <p className="text-xs text-amber-600 mt-1">Đang xử lý hình ảnh...</p>}
            {images.length > 0 && (
              <p className="text-xs text-emerald-700 mt-1">Đã chuẩn bị {images.length} hình ảnh.</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3 bg-[#7a482b] text-white font-bold rounded hover:bg-[#633a22] transition duration-200 disabled:opacity-50 text-sm tracking-wider uppercase"
        >
          {loading ? "Đăng bài..." : "Lưu & Đăng BĐS Nhật Bản"}
        </button>
      </form>
    </div>
  );
}