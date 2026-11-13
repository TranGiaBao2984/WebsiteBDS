import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById, getSimilarProperties } from '@/app/back/properties';
import ChiTietSection from '@/app/front/chitiet';

async function PropertyDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === 'undefined') {
    notFound();
  }

  const [property, similarProperties] = await Promise.all([
    getPropertyById(id),
    getSimilarProperties(id, 3),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <ChiTietSection
      property={property}
      similarProperties={similarProperties}
    />
  );
}

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-[#574d43]">
            Đang tải thông tin bất động sản...
          </div>
        }
      >
        <PropertyDetailContent params={params} />
      </Suspense>
    </main>
  );
}