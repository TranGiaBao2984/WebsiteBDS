/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useLanguage } from '@/app/context/LanguageContext';

export default function PropertyCard({ property }: { property: Property }) {
  const { t } = useLanguage();
  const cover = property.images?.[0];

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-sm hover:shadow-md hover:border-[#c8b8a6] transition duration-300 flex flex-col w-full"
    >
      <div className="relative aspect-16/10 bg-[#eae4dc] overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#a0958b] p-4 text-center">
            <span className="text-xs">{t.home.noPreview}</span>
          </div>
        )}
        {property.current_status && (
          <span className="absolute top-3 left-3 bg-[#3c352d]/80 backdrop-blur-md text-[#f8f6f0] text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
            {property.current_status}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#8c827a] font-semibold">
            {property.location}
          </p>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#2c2623] mt-1 group-hover:text-[#8c6d53] transition line-clamp-1">
            {property.title}
          </h3>
          <p className="text-lg sm:text-xl font-serif font-bold text-[#7a482b] mt-2">
            {formatPrice(property.price)}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#f0eae1]">
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-[#f8f6f0] p-2 rounded-lg">
              <span className="block font-bold text-[#3c352d] truncate">{property.layout || 'N/A'}</span>
              <span className="text-[9px] text-[#8c827a] uppercase">{t.home.layout}</span>
            </div>
            <div className="bg-[#f8f6f0] p-2 rounded-lg">
              <span className="block font-bold text-[#3c352d] truncate">{property.building_size || 'N/A'}</span>
              <span className="text-[9px] text-[#8c827a] uppercase">{t.home.house}</span>
            </div>
            <div className="bg-[#f8f6f0] p-2 rounded-lg">
              <span className="block font-bold text-[#3c352d] truncate">{property.year_built || 'N/A'}</span>
              <span className="text-[9px] text-[#8c827a] uppercase">{t.home.built}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
