import Link from "next/link";
import PropertyForm from "@/app/front/admin/PropertyForm";

export default function AdminNewPropertyPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-[#3c352d] space-y-6">
      <div className="border-b border-[#e6dfd5] pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-semibold text-[#7a482b] hover:underline mb-2"
        >
          ← Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-serif font-bold">Thêm Bất Động Sản Nhật Bản mới</h1>
        <p className="text-sm text-[#3c352d]/70 mt-1">
          Nhập thông tin tiêu chuẩn, đa ngôn ngữ và gắn thẻ bộ lọc cho BĐS Nhật Bản.
        </p>
      </div>

      {/* Tái sử dụng form chuẩn đã đồng bộ bộ lọc động và đa ngôn ngữ */}
      <PropertyForm />
    </div>
  );
}