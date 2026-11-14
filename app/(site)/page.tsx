import { getFeaturedProperties } from '@/app/back/properties';
import TrangChuSection from '@/app/front/trangchu';

export default async function HomePage() {
  const properties = await getFeaturedProperties(6);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 text-[#134E4A] sm:px-6 sm:py-12 lg:px-10">
      <TrangChuSection properties={properties} />
    </main>
  );
}