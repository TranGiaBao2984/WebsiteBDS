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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 text-[#134E4A] sm:px-6 sm:py-12 lg:px-10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#99F6E4] bg-white/80 p-16 text-center shadow-[0_4px_6px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-7 w-7 animate-spin rounded-full border-2 border-[#0F766E]/25 border-t-[#0F766E]"
            />
            <span className="text-sm font-medium text-[#475569]">
              Đang tải thông tin bất động sản...
            </span>
          </div>
        }
      >
        <PropertyDetailContent params={params} />
      </Suspense>
    </main>
  );
}