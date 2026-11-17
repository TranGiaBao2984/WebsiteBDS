"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { SITE } from "@/lib/site";

const PRIVACY_CONTENT = {
  vi: {
    badge: "BẢO VỆ DỮ LIỆU CÁ NHÂN • APPI NHẬT BẢN & NGHỊ ĐỊNH 13/2023/NĐ-CP",
    title: "Chính sách Bảo mật & Xử lý Dữ liệu Cá nhân",
    updated: "Cập nhật lần cuối: Tháng 11/2026",
    intro:
      "Chúng tôi tôn trọng quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân của khách hàng tuân thủ Luật Bảo vệ Thông tin Cá nhân Nhật Bản (APPI), Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam và các quy định pháp luật hiện hành.",
    sections: [
      {
        heading: "1. Đơn vị quản lý và xử lý dữ liệu cá nhân",
        items: [
          `Đơn vị phụ trách: ${SITE.company} — ${SITE.brand} ${SITE.subBrand} (Đại diện tư vấn: Mii Shintani / 新谷 美依).`,
          `Địa chỉ văn phòng tại Nhật Bản: ${SITE.postalCode} ${SITE.addressJa} (${SITE.addressEn}).`,
          `Đầu mối tiếp nhận yêu cầu về dữ liệu cá nhân: ${SITE.email} | Hotline: ${SITE.hotline}.`,
        ],
      },
      {
        heading: "2. Phân loại dữ liệu cá nhân được thu thập",
        items: [
          "Dữ liệu cá nhân cơ bản: Họ và tên, địa chỉ Email, số điện thoại / WhatsApp / LINE, và nội dung yêu cầu tư vấn bất động sản do bạn chủ động cung cấp qua biểu mẫu liên hệ.",
          "Dữ liệu cá nhân nhạy cảm: Website KHÔNG thu thập, lưu trữ hay xử lý bất kỳ dữ liệu cá nhân nhạy cảm nào (số My Number, CCCD/hộ chiếu, tài khoản ngân hàng, hồ sơ y tế, tôn giáo...).",
        ],
      },
      {
        heading: "3. Mục đích sử dụng và giới hạn cung cấp cho bên thứ ba",
        items: [
          "Liên hệ phản hồi câu hỏi, cung cấp thông tin chi tiết bất động sản tại Nhật Bản, dự toán chi phí mua bán/thuê nhà và sắp xếp lịch xem nhà theo đúng yêu cầu của bạn.",
          "Dữ liệu tuyệt đối không được bán, cho thuê hoặc chia sẻ cho bên thứ ba phục vụ mục đích tiếp thị ngoài phạm vi tư vấn bất động sản mà bạn đã đồng ý.",
        ],
      },
      {
        heading: "4. Lưu trữ đám mây quốc tế & Biện pháp bảo mật",
        items: [
          "Thông tin được lưu trữ trên hạ tầng cơ sở dữ liệu đám mây quốc tế đạt chuẩn bảo mật, áp dụng mã hóa đường truyền HTTPS/TLS và cơ chế kiểm soát truy cập nghiêm ngặt (Row-Level Security) chỉ dành cho quản trị viên được ủy quyền.",
          "Dữ liệu chỉ được lưu giữ trong thời gian cần thiết để hoàn tất quá trình tư vấn giao dịch hoặc cho đến khi bạn yêu cầu xóa bỏ.",
        ],
      },
      {
        heading: "5. Quyền của chủ thể dữ liệu (Xem, Trích xuất, Chỉnh sửa & Xóa)",
        items: [
          "Theo Luật APPI Nhật Bản và Nghị định 13/2023/NĐ-CP, bạn có quyền được thông báo, đồng ý hoặc rút lại sự đồng ý, yêu cầu truy cập xem, trích xuất bản sao, chỉnh sửa hoặc xóa vĩnh viễn dữ liệu cá nhân của mình.",
          `Để thực hiện các quyền trên, vui lòng gửi yêu cầu tới email ${SITE.email}. Chúng tôi sẽ xác minh danh tính và xử lý yêu cầu trong vòng 72 giờ làm việc.`,
        ],
      },
    ],
    backHome: "← Quay lại trang chủ",
  },
  en: {
    badge: "PERSONAL DATA PROTECTION • JAPAN APPI & DECREE 13/2023/ND-CP",
    title: "Privacy & Personal Data Processing Policy",
    updated: "Last updated: November 2026",
    intro:
      "We respect your privacy and are committed to safeguarding your personal information in compliance with Japan's Act on the Protection of Personal Information (APPI), Vietnam's Decree 13/2023/ND-CP, and applicable data protection laws.",
    sections: [
      {
        heading: "1. Personal Information Handling Business Operator",
        items: [
          `Entity: ${SITE.company} — ${SITE.brand} ${SITE.subBrand} (Advisor: Mii Shintani / 新谷 美依).`,
          `Office Address (Japan): ${SITE.postalCode} ${SITE.addressEn}.`,
          `Privacy Inquiry Desk: ${SITE.email} | Mobile: ${SITE.hotline}.`,
        ],
      },
      {
        heading: "2. Categories of Personal Data Collected",
        items: [
          "Basic Personal Data: Full name, email address, phone/WhatsApp/LINE contact, and property inquiry details voluntarily submitted through our consultation form.",
          "Sensitive Personal Data: We DO NOT collect or process any sensitive personal information (My Number, government IDs, bank records, health data, etc.) through this website.",
        ],
      },
      {
        heading: "3. Purpose of Use & Restriction on Third-Party Provision",
        items: [
          "To respond to your property inquiries, share relevant real estate listings in Japan, estimate transaction/rental costs, and coordinate property viewings.",
          "We never sell, rent, or disclose your personal data to third parties for marketing purposes without your explicit consent.",
        ],
      },
      {
        heading: "4. Cross-Border Cloud Storage & Security Measures",
        items: [
          "Submissions are transmitted via encrypted HTTPS/TLS connections and stored in secure international cloud infrastructure protected by strict Row-Level Security (RLS) restricted solely to authorized personnel.",
          "Personal data is retained only for as long as necessary to fulfill your consultation request or until you request deletion.",
        ],
      },
      {
        heading: "5. Your Rights (Disclosure, Correction, Suspension & Deletion)",
        items: [
          "Under Japan's APPI and Decree 13/2023/ND-CP, you have the right to request disclosure/export of your personal records, correction of inaccuracies, withdrawal of consent, or permanent deletion.",
          `To exercise any of these rights, please contact ${SITE.email}. We will verify your identity and respond within 72 business hours.`,
        ],
      },
    ],
    backHome: "← Back to Home",
  },
  ja: {
    badge: "個人情報保護方針 • 個人情報保護法（APPI）準拠",
    title: "プライバシーポリシー（個人情報の取り扱いについて）",
    updated: "最終更新日：2026年11月",
    intro:
      "当サイトは、お客様のプライバシーを尊重し、日本国の「個人情報の保護に関する法律（個人情報保護法）」および関連法令を遵守して、個人情報を適正に取得・管理・保護いたします。",
    sections: [
      {
        heading: "1. 個人情報取扱事業者の名称および住所",
        items: [
          `事業者名：${SITE.company} — ${SITE.brand} ${SITE.subBrand}（担当：新谷 美依 / Mii Shintani）`,
          `所在地：${SITE.postalCode} ${SITE.addressJa}`,
          `個人情報に関するお問い合わせ窓口：${SITE.email} / TEL：${SITE.hotline}`,
        ],
      },
      {
        heading: "2. 取得する個人情報の項目",
        items: [
          "基本情報：お問い合わせフォームよりお客様ご自身が入力されたお名前、メールアドレス、お電話番号（WhatsApp・LINE等）、および不動産に関するご相談内容。",
          "要配慮個人情報：当サイトでは、マイナンバー（個人番号）、パスポート番号、口座情報、病歴等の要配慮個人情報は一切取得いたしません。",
        ],
      },
      {
        heading: "3. 個人情報の利用目的および第三者提供の制限",
        items: [
          "物件情報のご案内、購入・賃貸に伴う諸費用のお見積もり、内見日程の調整など、不動産取引に関するご相談への対応のみに利用いたします。",
          "法令に基づく場合を除き、お客様の事前の同意なく個人情報を第三者へ販売・貸与・提供することは一切ありません。",
        ],
      },
      {
        heading: "4. 安全管理措置およびクラウド環境での保管",
        items: [
          "通信の暗号化（HTTPS/TLS）および厳格なアクセス制御（Row-Level Security）を備えた国際基準のクラウドサーバーにて安全に管理し、不正アクセスや漏えいの防止に努めます。",
          "個人情報はご相談対応の完了に必要な期間、またはお客様から削除のご請求があるまで適切に保管いたします。",
        ],
      },
      {
        heading: "5. 保有個人データの開示・訂正・利用停止・削除等のご請求",
        items: [
          "お客様は、個人情報保護法に基づき、ご自身の保有個人データの開示・写しの交付、内容の訂正・追加、利用停止・消去、ならびに同意の撤回を請求することができます。",
          `ご請求の際は ${SITE.email} までご連絡ください。ご本人様確認のうえ、72営業時間以内（土日祝を除く）に速やかに対応いたします。`,
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
    <main className="mx-auto w-full max-w-4xl px-4 py-10 text-[#26221F] sm:px-6 sm:py-14">
      <article className="space-y-8 rounded-2xl border border-[#E5DFD6] bg-white p-6 shadow-[0_4px_12px_rgba(38,34,31,0.05)] sm:p-10">
        <header className="space-y-3 border-b border-[#E5DFD6] pb-6">
          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#A64237]">
            {content.badge}
          </span>
          <h1 className="font-serif text-2xl font-bold leading-tight text-[#26221F] sm:text-3xl">
            {content.title}
          </h1>
          <p className="text-xs font-medium text-[#948D86]">{content.updated}</p>
          <p className="pt-2 text-sm leading-relaxed text-[#66605A]">
            {content.intro}
          </p>
        </header>

        <div className="space-y-6">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-2.5">
              <h2 className="font-serif text-lg font-bold text-[#26221F]">
                {section.heading}
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#66605A]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="border-t border-[#E5DFD6] pt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-[#E5DFD6] bg-[#FAF8F5] px-4 py-2 text-xs font-semibold text-[#26221F] transition-colors hover:border-[#A64237] hover:bg-[#A64237] hover:text-white"
          >
            {content.backHome}
          </Link>
        </div>
      </article>
    </main>
  );
}