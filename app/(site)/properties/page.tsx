import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/app/back/properties';
import ChiTietSection from '@/app/front/chitiet';

async function PropertyDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return <ChiTietSection property={property} />;
}

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-[#8c827a]">
          Đang tải thông tin bất động sản...
        </div>
      }
    >
      <PropertyDetailLoader params={params} />
    </Suspense>
  );
}