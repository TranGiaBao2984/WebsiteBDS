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

export default function VeToiSection() {
  const { currentLang } = useLanguage();
  const content = ABOUT_CONTENT[currentLang] || ABOUT_CONTENT.en;

  return (
    <section className="space-y-12 w-full max-w-4xl mx-auto">
      {/* Intro Bio Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#e6dfd5] shadow-sm">
        <div className="md:col-span-5 aspect-4/5 rounded-2xl bg-[#eae4dc] overflow-hidden relative">
          <img
            src="/face.jpg"
            alt={AGENT_INFO.nameEn}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-3 left-3 right-3 bg-[#2c2623]/90 backdrop-blur-xs text-white px-3.5 py-2.5 rounded-xl">
            <p className="text-[11px] font-bold tracking-widest uppercase">
              {AGENT_INFO.brand}{' '}
              <span className="font-normal text-[#d8c7b8]">{AGENT_INFO.subBrand}</span>
            </p>
            <p className="text-[10px] text-white/80 mt-0.5">{AGENT_INFO.slogan}</p>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6d53] block">
            {content.badge}
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c2623]">
              {content.name}
            </h1>
            <p className="text-xs font-semibold text-[#7a482b] mt-1">
              {content.tagline}
            </p>
          </div>

          <p className="text-sm text-[#665c54] leading-relaxed">
            {content.bio}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f0eae1] text-xs">
            <div>
              <span className="block font-bold text-[#2c2623]">{content.companyLabel}</span>
              <span className="text-[#8c827a]">{content.companyValue}</span>
            </div>
            <div>
              <span className="block font-bold text-[#2c2623]">{content.specialtyLabel}</span>
              <span className="text-[#8c827a]">{content.specialtyValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Support (Rental / Sales / Relocation Support) */}
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-serif font-bold text-[#2c2623]">{content.servicesTitle}</h2>
          <p className="text-xs text-[#786e65] mt-1">{content.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">🔑</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{content.service1Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {content.service1Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">🏡</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{content.service2Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {content.service2Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e6dfd5] space-y-2">
            <span className="text-xl">🌏</span>
            <h3 className="font-serif font-bold text-sm text-[#2c2623]">{content.service3Title}</h3>
            <p className="text-xs text-[#665c54] leading-relaxed">
              {content.service3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Direct Contact Card (Thông tin danh thiếp đầy đủ, không mã QR) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6dfd5] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0eae1] pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c6d53] block">
              {AGENT_INFO.brand} {AGENT_INFO.subBrand}
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#2c2623] mt-0.5">
              {content.connectTitle}
            </h2>
            <p className="text-xs text-[#786e65] mt-1">{content.connectSubtitle}</p>
          </div>

          {/* Nút liên hệ nhanh WhatsApp & Instagram */}
          <div className="flex flex-wrap gap-2.5">
            <a
              href={AGENT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1f7a4c] hover:bg-[#18633d] text-white text-xs font-bold transition shadow-xs"
            >
              <span>💬</span>
              <span>{content.whatsappBtn}</span>
            </a>

            <a
              href={AGENT_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2c2623] hover:bg-[#463d38] text-white text-xs font-bold transition shadow-xs"
            >
              <span>📷</span>
              <span>{content.instagramBtn}</span>
            </a>
          </div>
        </div>

        {/* Chi tiết thông tin liên hệ & văn phòng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.mobileLabel}</span>
            <a
              href={`tel:${AGENT_INFO.mobileIntl.replace(/\s+/g, '')}`}
              className="font-bold text-sm text-[#2c2623] hover:text-[#7a482b] transition"
            >
              📱 {AGENT_INFO.mobile}
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.telLabel}</span>
            <a
              href={`tel:${AGENT_INFO.telIntl.replace(/\s+/g, '')}`}
              className="font-bold text-sm text-[#2c2623] hover:text-[#7a482b] transition"
            >
              ☎️ {AGENT_INFO.tel}
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.faxLabel}</span>
            <span className="font-bold text-sm text-[#2c2623]">📠 {AGENT_INFO.fax}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.emailLabel}</span>
            <a
              href={`mailto:${AGENT_INFO.email}`}
              className="font-bold text-sm text-[#7a482b] hover:underline break-all"
            >
              ✉️ {AGENT_INFO.email}
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.websiteLabel}</span>
            <a
              href={AGENT_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-[#7a482b] hover:underline break-all"
            >
              🌐 {AGENT_INFO.website}
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.companyLabel}</span>
            <span className="font-bold text-sm text-[#2c2623]">🏢 {AGENT_INFO.companyJa}</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-xl bg-[#faf8f5] border border-[#f0eae1]">
            <span className="text-[#8c827a] block mb-1">{content.addressLabel}</span>
            <p className="font-bold text-sm text-[#2c2623]">
              📍 {AGENT_INFO.postalCode} {AGENT_INFO.addressJa}
            </p>
            <p className="text-[11px] text-[#786e65] mt-1">{AGENT_INFO.addressEn}</p>
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