import { getFeaturedProperties } from '@/app/back/properties';
import TrangChuSection from '@/app/front/trangchu';

export default async function HomePage() {
  const properties = await getFeaturedProperties(6);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <TrangChuSection properties={properties} />
    </main>
  );
}
