import { Suspense, type ComponentProps } from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/app/back/properties';
import ChiTietSection from '@/app/front/chitiet';

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <Suspense fallback={<DetailSkeleton />}>
        <PropertyDetail params={params} />
      </Suspense>
    </div>
  );
}

async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  type ChiTietProps = ComponentProps<typeof ChiTietSection>;

  return <ChiTietSection property={property as unknown as ChiTietProps['property']} />;
}

function DetailSkeleton() {
  return (
    <div className="w-full max-w-120 md:max-w-3xl lg:max-w-250 mx-auto animate-pulse space-y-4">
      <div className="aspect-16/11 rounded-2xl bg-[#eae4dc]" />
      <div className="h-6 w-2/3 rounded bg-[#eae4dc]" />
      <div className="h-6 w-1/3 rounded bg-[#eae4dc]" />
    </div>
  );
}