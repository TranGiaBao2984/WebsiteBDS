"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { SITE } from "@/lib/site";

const PRIVACY_CONTENT = {
  vi: {
    badge: "BẢO VỆ DỮ LIỆU CÁ NHÂN • NGHỊ ĐỊNH 13/2023/NĐ-CP",
    title: "Chính sách Bảo mật & Xử lý Dữ liệu Cá nhân",
    updated: "Cập nhật lần cuối: Tháng 11/2026",
    intro:
      "Chúng tôi tôn trọng quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân của khách hàng tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam và pháp luật hiện hành về bảo vệ thông tin cá nhân.",
    sections: [
      {
        heading: "1. Bên kiểm soát và xử lý dữ liệu cá nhân",
        items: [
          `Đơn vị phụ trách: ${SITE.company} — ${SITE.brand} ${SITE.subBrand} (Đại diện tư vấn: Mii Shintani / 新谷 美依).`,
          `Địa chỉ văn phòng: ${SITE.postalCode} ${SITE.addressJa} (${SITE.addressEn}).`,
          `Email tiếp nhận yêu cầu về dữ liệu cá nhân: ${SITE.email} | Hotline: ${SITE.hotline}.`,
        ],
      },
      {
        heading: "2. Phân loại dữ liệu cá nhân được thu thập",
        items: [
          "Dữ liệu cá nhân cơ bản: Họ và tên, địa chỉ Email, số điện thoại / WhatsApp, và nội dung yêu cầu tư vấn bất động sản do bạn chủ động cung cấp qua biểu mẫu liên hệ.",
          "Dữ liệu cá nhân nhạy cảm: Website KHÔNG thu thập, lưu trữ hay xử lý bất kỳ dữ liệu cá nhân nhạy cảm nào (số CCCD/hộ chiếu, tài khoản ngân hàng, hồ sơ y tế, tôn giáo...).",
        ],
      },
      {
        heading: "3. Mục đích và phạm vi xử lý dữ liệu",
        items: [
          "Liên hệ phản hồi câu hỏi, cung cấp thông tin chi tiết căn nhà, báo giá chi phí sang tên/thuê nhà và sắp xếp lịch xem bất động sản theo đúng yêu cầu của bạn.",
          "Dữ liệu tuyệt đối không được bán, cho thuê hoặc chia sẻ cho bên thứ ba phục vụ mục đích quảng cáo ngoài phạm vi tư vấn bất động sản bạn đã đồng ý.",
        ],
      },
      {
        heading: "4. Thời gian lưu trữ & Biện pháp bảo mật",
        items: [
          "Thông tin được lưu trữ trên hệ thống cơ sở dữ liệu đám mây có mã hóa đường truyền HTTPS/TLS và áp dụng cơ chế phân quyền truy cập nghiêm ngặt (Row-Level Security) chỉ dành cho quản trị viên được ủy quyền.",
          "Dữ liệu chỉ được lưu giữ trong thời gian cần thiết để hoàn tất quá trình tư vấn giao dịch hoặc cho đến khi bạn yêu cầu xóa bỏ.",
        ],
      },
      {
        heading: "5. Quyền của chủ thể dữ liệu (Xem, Trích xuất, Chỉnh sửa & Xóa)",
        items: [
          "Theo Nghị định 13/2023/NĐ-CP, bạn có quyền được biết, quyền đồng ý hoặc rút lại sự đồng ý, quyền truy cập để xem, chỉnh sửa, yêu cầu trích xuất bản sao hoặc yêu cầu xóa vĩnh viễn dữ liệu cá nhân của mình.",
          `Để thực hiện các quyền trên, vui lòng gửi yêu cầu tới email ${SITE.email}. Chúng tôi sẽ xác minh và xử lý yêu cầu của bạn trong vòng 72 giờ làm việc.`,
        ],
      },
    ],
    backHome: "← Quay lại trang chủ",
  },
  en: {
    badge: "PERSONAL DATA PROTECTION • DECREE 13/2023/ND-CP",
    title: "Privacy & Personal Data Processing Policy",
    updated: "Last updated: November 2026",
    intro:
      "We respect your privacy and are committed to safeguarding your personal information in compliance with Vietnam's Decree 13/2023/ND-CP on Personal Data Protection and applicable privacy regulations.",
    sections: [
      {
        heading: "1. Data Controller & Processor",
        items: [
          `Entity: ${SITE.company} — ${SITE.brand} ${SITE.subBrand} (Advisor: Mii Shintani / 新谷 美依).`,
          `Office Address: ${SITE.postalCode} ${SITE.addressEn}.`,
          `Privacy Contact Email: ${SITE.email} | Mobile: ${SITE.hotline}.`,
        ],
      },
      {
        heading: "2. Categories of Personal Data Collected",
        items: [
          "Basic Personal Data: Full name, email address, phone/WhatsApp number, and property inquiry notes voluntarily submitted through our consultation form.",
          "Sensitive Personal Data: We DO NOT collect or process any sensitive personal data (government IDs, financial/bank records, health data, etc.) through this website.",
        ],
      },
      {
        heading: "3. Purpose & Scope of Processing",
        items: [
          "To respond to your property inquiries, provide detailed listings, estimate closing/rental costs, and coordinate property viewings in Japan.",
          "We never sell, rent, or trade your personal information to third parties for marketing purposes.",
        ],
      },
      {
        heading: "4. Retention & Security Measures",
        items: [
          "All submissions are transmitted over encrypted HTTPS/TLS connections and stored in access-controlled databases protected by Row-Level Security (RLS) restricted strictly to authorized administrators.",
          "Personal data is retained only as long as necessary to fulfill your consultation request or until you request deletion.",
        ],
      },
      {
        heading: "5. Your Rights (Access, Export, Rectification & Deletion)",
        items: [
          "You have the right to know, consent or withdraw consent, access/export a copy of your data, rectify inaccuracies, or request permanent deletion of your personal records.",
          `To exercise any of these rights, please email ${SITE.email}. We will verify and fulfill your request within 72 business hours.`,
        ],
      },
    ],
    backHome: "← Back to Home",
  },
  ja: {
    badge: "個人情報保護方針 • 政令第13/2023/ND-CP号準拠",
    title: "プライバシーポリシー（個人情報の取り扱いについて）",
    updated: "最終更新日：2026年11月",
    intro:
      "当サイトは、お客様のプライバシーを尊重し、ベトナム個人データ保護政令（Decree 13/2023/ND-CP）および関連法令に基づき個人情報を適切に保護・管理いたします。",
    sections: [
      {
        heading: "1. 個人情報取扱事業者",
        items: [
          `事業者名：${SITE.company} — ${SITE.brand} ${SITE.subBrand}（担当：新谷 美依 / Mii Shintani）`,
          `所在地：${SITE.postalCode} ${SITE.addressJa}`,
          `お問い合わせ窓口：${SITE.email} / TEL：${SITE.hotline}`,
        ],
      },
      {
        heading: "2. 取得する個人情報の項目",
        items: [
          "基本個人データ：お問い合わせフォームよりお客様ご自身が入力されたお名前、メールアドレス、電話番号（WhatsApp）、および物件に関するご相談内容。",
          "機微（センシティブ）情報：当サイトでは、マイナンバー・パスポート番号・銀行口座情報・健康状態等の機微な個人情報は一切取得いたしません。",
        ],
      },
      {
        heading: "3. 利用目的および第三者提供の制限",
        items: [
          "物件情報のご案内、諸費用のお見積もり、内見予約の調整など、不動産取引に関するご相談への対応のみに利用いたします。",
          "お客様の同意なく個人情報を第三者へ販売・貸与・提供することは一切ありません。",
        ],
      },
      {
        heading: "4. 安全管理措置および保管期間",
        items: [
          "通信の暗号化（HTTPS/TLS）および厳格なアクセス制御（Row-Level Security）を備えたクラウド環境にて安全に保管いたします。",
          "個人情報はご相談対応の完了に必要な期間、またはお客様から削除のご請求があるまで保管いたします。",
        ],
      },
      {
        heading: "5. 開示・訂正・利用停止・削除のご請求",
        items: [
          "お客様は、ご自身の個人情報の開示・写しの提供、訂正、同意の撤回、および完全削除を請求する権利を有します。",
          `ご希望の場合は ${SITE.email} までご連絡ください。ご本人確認のうえ、72営業時間以内に対応いたします。`,
        ],
      },
    ],
    backHome: "← トップページへ戻る",
  },
};

export default function PrivacyPolicyPage() {
  const { currentLang } = useLanguage();
  const content = PRIVACY_CONTENT[currentLang] || PRIVACY_CONTENT.en;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 text-[#134E4A] sm:px-6 sm:py-14">
      <article className="space-y-8 rounded-2xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-10">
        <header className="space-y-3 border-b border-[#E8F0F3] pb-6">
          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
            {content.badge}
          </span>
          <h1 className="font-serif text-2xl font-bold leading-tight text-[#134E4A] sm:text-3xl">
            {content.title}
          </h1>
          <p className="text-xs font-medium text-[#475569]">{content.updated}</p>
          <p className="pt-2 text-sm leading-relaxed text-[#475569]">
            {content.intro}
          </p>
        </header>

        <div className="space-y-6">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-2.5">
              <h2 className="font-serif text-lg font-bold text-[#134E4A]">
                {section.heading}
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#475569]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="border-t border-[#E8F0F3] pt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-[#99F6E4] bg-[#F0FDFA] px-4 py-2 text-xs font-semibold text-[#0F766E] transition-colors hover:bg-[#0F766E] hover:text-white"
          >
            {content.backHome}
          </Link>
        </div>
      </article>
    </main>
  );
}