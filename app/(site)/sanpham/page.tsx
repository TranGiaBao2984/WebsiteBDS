import { getProperties } from '@/app/back/properties';
import SanPhamSection from '@/app/front/sanpham';

export default async function SanPhamPage() {
  const properties = await getProperties();

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <SanPhamSection properties={properties} />
    </main>
  );
}