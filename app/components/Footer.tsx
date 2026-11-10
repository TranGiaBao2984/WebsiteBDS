'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { SITE } from '@/lib/site';

export default function Footer() {
  const [year, setYear] = useState('2026');
  const { t } = useLanguage();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-[#f3eee7] border-t border-[#e6dfd5] mt-12 sm:mt-16 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-md sm:max-w-xl mx-auto text-left space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif text-[#2c2623] font-normal tracking-tight">
              {t.footer.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#665c54] leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {/* WhatsApp */}
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-[#d8c7b8] text-[#3c352d] rounded-xl font-medium text-xs tracking-wider uppercase hover:bg-[#c8b5a4] transition shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{t.footer.whatsapp}</span>
              </div>
              <span>→</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${SITE.email}`}
              className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-white/80 border border-[#d8cebe] text-[#3c352d] rounded-xl font-medium text-xs tracking-wider uppercase hover:bg-white transition shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>{t.footer.email}</span>
              </div>
              <span>→</span>
            </a>

            {/* Facebook */}
            <a
              href={SITE.facebookHref}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-white/80 border border-[#d8cebe] text-[#3c352d] rounded-xl font-medium text-xs tracking-wider uppercase hover:bg-white transition shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.964z"/>
                </svg>
                <span>{t.footer.facebook}</span>
              </div>
              <span>→</span>
            </a>
          </div>

          <div className="pt-4 sm:pt-6 text-center border-t border-[#e6dfd5]/60 text-[10px] sm:text-[11px] text-[#9e9389]">
            © {year} {t.footer.rights}
          </div>
        </div>
      </div>
    </footer>
  );
}