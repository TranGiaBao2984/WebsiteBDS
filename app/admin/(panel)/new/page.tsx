import Link from 'next/link';
import PropertyForm from '@/app/front/admin/PropertyForm';
export const instant = false;
export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs font-medium text-[#8c6d53] hover:underline">
          ← Quay lại danh sách
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-bold text-[#2c2623] sm:text-3xl">Thêm bất động sản</h1>
      </div>
      <PropertyForm />
    </div>
  );
}
