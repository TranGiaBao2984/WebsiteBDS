/* eslint-disable @next/next/no-img-element */
'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { AGENT_INFO } from '@/lib/agent-info';
import InquiryForm from './InquiryForm';

const ABOUT_CONTENT = {
  vi: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    name: 'Mii Shintani (新谷 美依)',
    tagline: 'Helping Overseas Clients Find Homes in Japan',
    bio: 'Chuyên viên tư vấn bất động sản quốc tế tại RE AGENT by Re iDea (株式会社 Re iDea), đồng hành cùng khách hàng nước ngoài tìm kiếm nhà ở, đầu tư bất động sản và ổn định cuộc sống tại Nhật Bản với phương châm: "People. Homes. A Brighter Tomorrow."',
    companyLabel: 'Đơn vị trực thuộc',
    companyValue: '株式会社 Re iDea (RE AGENT)',
    specialtyLabel: 'Lĩnh vực chuyên môn',
    specialtyValue: 'Rental / Sales / Relocation Support',
    servicesTitle: 'Dịch vụ hỗ trợ toàn diện tại Nhật Bản',
    servicesSubtitle: 'Hỗ trợ khách hàng quốc tế xuyên suốt quá trình thuê, mua bán và chuyển đến sinh sống tại Nhật',
    service1Title: 'Cho thuê BĐS (Rental)',
    service1Desc: 'Tìm kiếm căn hộ, nhà ở phù hợp nhu cầu và ngân sách cho khách hàng quốc tế, hỗ trợ thủ tục hợp đồng và bảo lãnh.',
    service2Title: 'Mua bán & Đầu tư (Sales)',
    service2Desc: 'Tư vấn mua nhà ở thực, căn hộ chung cư, nhà truyền thống Kominka và bất động sản đầu tư minh bạch pháp lý tại Nhật.',
    service3Title: 'Hỗ trợ định cư (Relocation Support)',
    service3Desc: 'Đồng hành trọn gói thủ tục chuyển nhà, kết nối hạ tầng sinh hoạt và hỗ trợ hội nhập cuộc sống mới tại Nhật Bản.',
    connectTitle: 'Kết nối trực tiếp với Mii Shintani',
    connectSubtitle: 'Instagram / WhatsApp / International Support',
    mobileLabel: 'Di động (Mobile)',
    telLabel: 'Điện thoại văn phòng (Tel)',
    faxLabel: 'FAX',
    emailLabel: 'Email',
    addressLabel: 'Địa chỉ văn phòng',
    websiteLabel: 'Website công ty',
    whatsappBtn: 'Chat trực tiếp qua WhatsApp',
    instagramBtn: 'Instagram @MIISHINTANI_AGENT',
  },
  en: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    name: 'Mii Shintani (新谷 美依)',
    tagline: 'Helping Overseas Clients Find Homes in Japan',
    bio: 'Global Property Advisor at RE AGENT by Re iDea (株式会社 Re iDea), dedicated to helping overseas clients find homes, invest in real estate, and relocate smoothly to Japan — guided by our philosophy: "People. Homes. A Brighter Tomorrow."',
    companyLabel: 'Company',
    companyValue: 'Re iDea Co., Ltd. (株式会社 Re iDea)',
    specialtyLabel: 'Core Services',
    specialtyValue: 'Rental / Sales / Relocation Support',
    servicesTitle: 'International Real Estate Services',
    servicesSubtitle: 'End-to-end bilingual and international support for renting, buying, and relocating in Japan',
    service1Title: 'Rental Support',
    service1Desc: 'Curated apartment and home searches tailored for overseas residents, including contract guidance and screening support.',
    service2Title: 'Property Sales',
    service2Desc: 'Transparent advisory for residential homes, condominiums, traditional Kominka, and investment properties across Japan.',
    service3Title: 'Relocation Support',
    service3Desc: 'Comprehensive move-in coordination, utility setup assistance, and local guidance for settling into life in Japan.',
    connectTitle: 'Connect with Mii Shintani',
    connectSubtitle: 'Instagram / WhatsApp / International Support',
    mobileLabel: 'Mobile',
    telLabel: 'Tel',
    faxLabel: 'FAX',
    emailLabel: 'Email',
    addressLabel: 'Office Address',
    websiteLabel: 'Official Website',
    whatsappBtn: 'Chat directly on WhatsApp',
    instagramBtn: 'Instagram @MIISHINTANI_AGENT',
  },
  ja: {
    badge: 'RE AGENT BY RE IDEA • GLOBAL PROPERTY ADVISOR',
    name: '新谷 美依（Mii Shintani）',
    tagline: 'Helping Overseas Clients Find Homes in Japan',
    bio: '株式会社 Re iDea（RE AGENT）のグローバル・プロパティ・アドバイザーとして、「People. Homes. A Brighter Tomorrow.」の理念のもと、海外のお客様の日本での住まい探し・不動産購入・移住サポートを総合的にお手伝いいたします。',
    companyLabel: '所属会社',
    companyValue: '株式会社 Re iDea（RE AGENT）',
    specialtyLabel: '取扱業務',
    specialtyValue: 'Rental / Sales / Relocation Support',
    servicesTitle: 'サービス内容',
    servicesSubtitle: '賃貸・売買から日本での新生活立ち上げまで一貫してサポートいたします',
    service1Title: '賃貸仲介（Rental）',
    service1Desc: '海外からのお客様向けに、ご希望条件に合ったお部屋探しから契約手続き・入居まで丁寧にサポートいたします。',
    service2Title: '不動産売買（Sales）',
    service2Desc: 'マンション・戸建て・古民家・投資用物件など、日本国内の不動産購入・売却を安心の体制でご案内いたします。',
    service3Title: 'リロケーション支援（Relocation Support）',
    service3Desc: '日本への移住・転居に伴う各種手続きや生活立ち上げをトータルで支援いたします。',
    connectTitle: 'Connect with Mii Shintani',
    connectSubtitle: 'Instagram / WhatsApp / International Support',
    mobileLabel: '携帯電話（Mobile）',
    telLabel: '代表電話（Tel）',
    faxLabel: 'FAX',
    emailLabel: 'メール（Email）',
    addressLabel: '所在地',
    websiteLabel: '公式サイト',
    whatsappBtn: 'WhatsAppで直接相談する',
    instagramBtn: 'Instagram @MIISHINTANI_AGENT',
  },
};

function KeyRoundIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function VeToiSection() {
  const { currentLang } = useLanguage();
  const content = ABOUT_CONTENT[currentLang] || ABOUT_CONTENT.en;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-12">
      {/* Intro Bio Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#14B8A6]/12 blur-3xl"
        />

        <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-[#99F6E4] bg-[#E8F0F3] shadow-sm md:col-span-5">
            <img
              src="/face.jpg"
              alt={AGENT_INFO.nameEn}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute right-3 bottom-3 left-3 rounded-xl border border-white/15 bg-[#134E4A]/90 px-4 py-2.5 text-white backdrop-blur-md">
              <p className="text-[11px] font-bold uppercase tracking-widest">
                {AGENT_INFO.brand}{' '}
                <span className="font-normal text-[#99F6E4]">{AGENT_INFO.subBrand}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-white/90">{AGENT_INFO.slogan}</p>
            </div>
          </div>

          <div className="space-y-4 md:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#99F6E4] bg-[#F0FDFA]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
              <GlobeIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.badge}</span>
            </span>

            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#134E4A] sm:text-4xl">
                {content.name}
              </h1>
              <p className="mt-1.5 text-xs font-semibold text-[#0369A1] sm:text-sm">
                {content.tagline}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[#475569] sm:text-[15px]">
              {content.bio}
            </p>

            <div className="grid grid-cols-1 gap-4 border-t border-[#E8F0F3] pt-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-[#99F6E4]/70 bg-[#F0FDFA]/60 p-3.5">
                <span className="block font-bold text-[#134E4A]">{content.companyLabel}</span>
                <span className="mt-0.5 block font-medium text-[#475569]">
                  {content.companyValue}
                </span>
              </div>
              <div className="rounded-xl border border-[#99F6E4]/70 bg-[#F0FDFA]/60 p-3.5">
                <span className="block font-bold text-[#134E4A]">{content.specialtyLabel}</span>
                <span className="mt-0.5 block font-medium text-[#475569]">
                  {content.specialtyValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Support */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#134E4A]">
            {content.servicesTitle}
          </h2>
          <p className="mt-1 text-xs text-[#475569] sm:text-sm">{content.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-3 rounded-xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] motion-reduce:transform-none motion-reduce:transition-none">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
              <KeyRoundIcon className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-base font-bold text-[#134E4A]">{content.service1Title}</h3>
            <p className="text-xs leading-relaxed text-[#475569] sm:text-[13px]">
              {content.service1Desc}
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] motion-reduce:transform-none motion-reduce:transition-none">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
              <HomeIcon className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-base font-bold text-[#134E4A]">{content.service2Title}</h3>
            <p className="text-xs leading-relaxed text-[#475569] sm:text-[13px]">
              {content.service2Desc}
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6] motion-reduce:transform-none motion-reduce:transition-none">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E]">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <h3 className="font-serif text-base font-bold text-[#134E4A]">{content.service3Title}</h3>
            <p className="text-xs leading-relaxed text-[#475569] sm:text-[13px]">
              {content.service3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Direct Contact Card */}
      <div className="space-y-6 rounded-2xl border border-[#99F6E4] bg-white/80 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8F0F3] pb-5 sm:flex-row sm:items-center">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              {AGENT_INFO.brand} {AGENT_INFO.subBrand}
            </span>
            <h2 className="font-serif mt-0.5 text-2xl font-bold text-[#134E4A]">
              {content.connectTitle}
            </h2>
            <p className="mt-1 text-xs text-[#475569]">{content.connectSubtitle}</p>
          </div>

          {/* Nút phụ đồng bộ hệ thống thiết kế, nhường điểm nhấn chính cho nút Form */}
          <div className="flex flex-wrap gap-2.5">
            <a
              href={AGENT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-[#0F766E] bg-[#F0FDFA]/80 px-4 py-2.5 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:bg-[#0F766E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
            >
              <svg
                className="h-4 w-4 shrink-0 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{content.whatsappBtn}</span>
            </a>

            <a
              href={AGENT_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-[#0F766E] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:bg-[#0F766E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2"
            >
              <svg
                className="h-4 w-4 shrink-0 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>{content.instagramBtn}</span>
            </a>
          </div>
        </div>

        {/* Chi tiết thông tin liên hệ & văn phòng */}
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <SmartphoneIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.mobileLabel}</span>
            </span>
            <a
              href={`tel:${AGENT_INFO.mobileIntl.replace(/\s+/g, '')}`}
              className="inline-block cursor-pointer rounded text-sm font-bold text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              {AGENT_INFO.mobile}
            </a>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <PhoneIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.telLabel}</span>
            </span>
            <a
              href={`tel:${AGENT_INFO.telIntl.replace(/\s+/g, '')}`}
              className="inline-block cursor-pointer rounded text-sm font-bold text-[#134E4A] transition-colors duration-200 hover:text-[#0F766E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              {AGENT_INFO.tel}
            </a>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <PrinterIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.faxLabel}</span>
            </span>
            <span className="text-sm font-bold text-[#134E4A]">{AGENT_INFO.fax}</span>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <MailIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.emailLabel}</span>
            </span>
            <a
              href={`mailto:${AGENT_INFO.email}`}
              className="inline-block cursor-pointer break-all rounded text-sm font-bold text-[#0369A1] transition-colors duration-200 hover:text-[#0F766E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              {AGENT_INFO.email}
            </a>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <GlobeIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.websiteLabel}</span>
            </span>
            <a
              href={AGENT_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block cursor-pointer break-all rounded text-sm font-bold text-[#0369A1] transition-colors duration-200 hover:text-[#0F766E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              {AGENT_INFO.website}
            </a>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <BuildingIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.companyLabel}</span>
            </span>
            <span className="text-sm font-bold text-[#134E4A]">{AGENT_INFO.companyJa}</span>
          </div>

          <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/70 p-4 transition-colors duration-200 hover:border-[#14B8A6] sm:col-span-2 lg:col-span-3">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium text-[#475569]">
              <MapPinIcon className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>{content.addressLabel}</span>
            </span>
            <p className="text-sm font-bold text-[#134E4A]">
              {AGENT_INFO.postalCode} {AGENT_INFO.addressJa}
            </p>
            <p className="mt-1 text-xs font-medium text-[#475569]">{AGENT_INFO.addressEn}</p>
          </div>
        </div>
      </div>

      {/* Form Đăng ký tư vấn */}
      <div className="pt-2">
        <InquiryForm propertyId="" propertyTitle="" />
      </div>
    </section>
  );
}