/* eslint-disable @next/next/no-img-element */
'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import InquiryForm from './InquiryForm';

export default function VeToiSection() {
  const { t } = useLanguage();

  return (
    <section className="space-y-12 w-full max-w-4xl mx-auto">
      {/* Intro Bio Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#e6dfd5] shadow-sm">
        <div className="md:col-span-5 aspect-4/5 rounded-2xl bg-[#eae4dc] overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
            alt={t.about.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6d53]">
            {t.about.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c2623]">
            {t.about.name}
          </h1>
          <p className="text-sm text-[#665c54] leading-relaxed">
            {t.about.bio}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f0eae1] text-xs">
            <div>
              <span className="block font-bold text-[#2c2623]">{t.about.expTitle}</span>
              <span className="text-[#8c827a]">{t.about.expValue}</span>
            </div>
            <div>
              <span className="block font-bold text-[#2c2623]">{t.about.langTitle}</span>
              <span className="text-[#8c827a]">{t.about.langValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Support */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-serif font-bold text-[#2c2623]">{t.about.servicesTitle}</h2>
          <p className="text-xs text-[#786e65] mt-1">{t.about.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">📜</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{t.about.service1Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {t.about.service1Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">🌏</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{t.about.service2Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {t.about.service2Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">🏡</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{t.about.service3Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {t.about.service3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Form Đăng ký tư vấn */}
      <div className="pt-6 border-t border-[#e6dfd5]">
        <InquiryForm propertyId="" propertyTitle="" />
      </div>
    </section>
  );
}