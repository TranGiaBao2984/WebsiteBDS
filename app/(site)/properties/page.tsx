import { getProperties } from '@/app/back/properties';
import SanPhamSection from '@/app/front/properties';

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 text-[#134E4A] sm:px-6 sm:py-12 lg:px-10">
      <SanPhamSection properties={properties} />
    </main>
  );
}