import { getProperties } from '@/app/back/properties';
import { getFilterOptions } from '@/app/back/filter-options';
import SanPhamSection from '@/app/front/properties';

export default async function PropertiesPage() {
  const [properties, filterOptions] = await Promise.all([
    getProperties(),
    getFilterOptions(),
  ]);

  return (
    <main className="w-full px-6 py-10 sm:px-10 lg:px-16 2xl:px-24">
      <SanPhamSection
        properties={properties}
        initialFilterOptions={filterOptions}
      />
    </main>
  );
}