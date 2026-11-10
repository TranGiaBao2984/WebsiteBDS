/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { SITE, whatsappLink } from '@/lib/site';
import { useLanguage } from '@/app/context/LanguageContext';
import { detailText } from '@/app/context/detail';
import InquiryForm from './InquiryForm';

// Mục nào trong DB không có dữ liệu thì ẩn đi, không điền số mẫu.
// Nhãn giao diện lấy từ detailText (3 ngôn ngữ). Nội dung do admin nhập (mô tả, tình trạng...) hiện đúng như đã lưu.

const hasText = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== '';

export default function ChiTietSection({
  property,
  similarProperties,
}: {
  property: Property;
  similarProperties: Property[];
}) {
  const { t, currentLang } = useLanguage();
  const d = detailText[currentLang];

  // Script cào dữ liệu điền '/placeholder.jpg' khi căn không có ảnh, coi như không có ảnh
  const photos = (property.images ?? []).filter((u) => hasText(u) && u !== '/placeholder.jpg');

  const whatsappHref = whatsappLink(`${d.whatsappMsg}${property.title} (ID: ${property.id})`);
  const mailHref = `mailto:${SITE.email}?subject=${encodeURIComponent(`${d.mailSubject}${property.title}`)}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`;

  // Ba ô thông số nhanh: ô nào không có dữ liệu thì bỏ
  const specs = [
    { value: property.layout, note: null },
    { value: property.building_size, note: d.houseNote },
    { value: property.land_size, note: d.landNote },
  ].filter((s) => hasText(s.value));

  const badges = [
    hasText(property.current_status) ? property.current_status : null,
    property.year_built ? d.builtBadge(property.year_built) : null,
  ].filter((b): b is string => !!b);

  // Bảng chi tiết: chỉ hiện dòng có giá trị. Dòng "wide" là chuỗi dài nên căn phải và giới hạn bề rộng.
  const rows: Array<[label: string, value: string | number | null | undefined, wide?: boolean]> = [
    [d.fields.price, formatPrice(property.price)],
    [d.location, property.location],
    [d.fields.buildingSize, property.building_size],
    [d.fields.landSize, property.land_size],
    [d.fields.layout, property.layout],
    [d.fields.structure, property.structure],
    [d.fields.yearBuilt, property.year_built],
    [d.fields.status, property.current_status],
    [d.fields.parking, property.parking],
    [d.fields.landRights, property.land_rights],
    [d.fields.zoning, property.zoning, true],
    [d.fields.access, property.access, true],
  ];
  const detailRows = rows.filter(([, value]) => hasText(value));

  return (
    <main className="w-full max-w-120 md:max-w-3xl lg:max-w-250 mx-auto bg-[#f8f6f0] text-[#3c352d] min-h-screen pb-16 font-sans">
      {/* Main Photo Showcase */}
      <div className="relative aspect-16/11 bg-[#eae4dc] overflow-hidden">
        {photos.length > 0 ? (
          <>
            <img src={photos[0]} alt={property.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#2c2623]/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-3">
                <span>1 / {photos.length}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#a0958b]">{d.noPhotos}</div>
        )}
      </div>

      <div className="px-5 py-6 space-y-8">
        {/* Breadcrumbs */}
        <nav className="text-[11px] text-[#8c827a] flex items-center gap-1.5 font-medium tracking-wide">
          <Link href="/" className="hover:underline">{t.header.home}</Link>
          <span>&gt;</span>
          <Link href="/sanpham" className="hover:underline">{t.header.properties}</Link>
          <span>&gt;</span>
          <span className="text-[#2c2623]">{property.location}</span>
        </nav>

        {/* Title & Price */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8c827a]">
            {property.location.toUpperCase()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2c2623] leading-tight">
            {property.title}
          </h1>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#7a482b] pt-1">
            {formatPrice(property.price)}
          </p>
        </div>

        {/* Quick Specs Cards */}
        {specs.length > 0 && (
          <div className="flex gap-2 text-center">
            {specs.map((s) => (
              <div
                key={`${s.note}-${s.value}`}
                className="flex-1 min-w-0 bg-[#f0ebe1] p-3 rounded-xl border border-[#e6dfd5]/60 flex flex-col items-center justify-center"
              >
                <span className="text-xs font-bold text-[#2c2623] wrap-break-word">{s.value}</span>
                {s.note && <span className="text-[9px] text-[#8c827a]">{s.note}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Tag Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {badges.map((b) => (
              <span key={b} className="bg-[#eae4dc] text-[#574d43] px-3 py-1 rounded-full font-medium">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {hasText(property.description) && (
          <p className="text-xs sm:text-sm text-[#665c54] leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <a
            href="#contact"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#d8c7b8] hover:bg-[#c8b5a4] text-[#2c2623] font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
          >
            {d.inquireCta}
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-white border border-[#d8cebe] rounded-xl text-xs font-medium text-[#2c2623] hover:bg-[#f3eee7] transition"
            >
              💬 WHATSAPP
            </a>
            <a
              href={mailHref}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-[#d8cebe] rounded-xl text-xs font-medium text-[#2c2623] hover:bg-[#f3eee7] transition"
            >
              ✉️ EMAIL
            </a>
          </div>
        </div>

        {/* Gallery: chỉ có ý nghĩa khi có từ 2 ảnh trở lên */}
        {photos.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-[#e6dfd5]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.gallery}</h2>
              <span className="text-xs text-[#8c827a]">{d.photosCount(photos.length)}</span>
            </div>

            <div className="relative aspect-16/10 bg-[#eae4dc] rounded-2xl overflow-hidden">
              <img src={photos[1]} alt={d.gallery} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 3).map((img, idx) => (
                <div key={idx} className="aspect-4/3 rounded-xl overflow-hidden bg-[#eae4dc]">
                  <img src={img} alt={`${property.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Details Table */}
        <div className="space-y-3 pt-4 border-t border-[#e6dfd5]">
          <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.details}</h2>
          <div className="bg-white rounded-2xl border border-[#e6dfd5] divide-y divide-[#f0eae1] text-xs">
            {detailRows.map(([label, value, wide]) => (
              <div key={label} className="flex justify-between gap-4 p-3.5">
                <span className="text-[#8c827a]">{label}</span>
                <span className={`font-semibold ${wide ? 'text-right max-w-[60%]' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Plan */}
        {property.floor_plan && (
          <div className="space-y-3 pt-4 border-t border-[#e6dfd5]">
            <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.floorPlan}</h2>
            <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 flex items-center justify-center">
              <img src={property.floor_plan} alt={d.floorPlan} className="max-h-64 object-contain" />
            </div>
          </div>
        )}

        {/* More Photos */}
        {photos.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-[#e6dfd5]">
            <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.morePhotos}</h2>
            <div className="space-y-3">
              {photos.map((img, idx) => (
                <div key={idx} className="aspect-16/10 rounded-2xl overflow-hidden bg-[#eae4dc]">
                  <img src={img} alt={`${property.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="space-y-3 pt-4 border-t border-[#e6dfd5]">
          <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.location}</h2>
          <div className="bg-white rounded-2xl border border-[#e6dfd5] p-4 flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0 text-[#574d43]">📍 {property.location}</span>
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 font-semibold text-[#7a482b] underline underline-offset-4"
            >
              {d.viewOnMap}
            </a>
          </div>
        </div>

        {/* Form Inquiry */}
        <div className="pt-4 border-t border-[#e6dfd5]">
          <InquiryForm propertyId={property.id} propertyTitle={property.title} />
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#e6dfd5]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-[#2c2623]">{d.similar}</h2>
              <Link href="/sanpham" className="text-xs text-[#8c827a]">{d.viewAll}</Link>
            </div>

            <div className="space-y-4">
              {similarProperties.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/properties/${sim.id}`}
                  className="block bg-white rounded-2xl border border-[#e6dfd5] overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-video bg-[#eae4dc]">
                    {sim.images?.[0] && (
                      <img src={sim.images[0]} alt={sim.title} className="w-full h-full object-cover" />
                    )}
                    {hasText(sim.current_status) && (
                      <span className="absolute top-3 right-3 bg-[#3c352d]/80 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
                        {sim.current_status}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[9px] font-bold uppercase text-[#8c827a]">{sim.location}</p>
                    <h3 className="font-serif font-bold text-sm text-[#2c2623] truncate">{sim.title}</h3>
                    <p className="font-serif font-bold text-sm text-[#7a482b]">{formatPrice(sim.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}