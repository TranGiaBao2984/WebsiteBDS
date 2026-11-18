"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { SITE } from "@/lib/site";

const PRIVACY_CONTENT = {
  en: {
    badge: "PERSONAL DATA PROTECTION • JAPAN APPI COMPLIANT",
    title: "Privacy Policy",
    updated: "Last updated: November 2026",
    intro:
      "We respect your privacy and are committed to safeguarding your personal information in strict compliance with Japan's Act on the Protection of Personal Information (APPI) and applicable Japanese regulations.",
    sections: [
      {
        heading: "1. Personal Information Handling Business Operator",
        items: [
          `Operator: ${SITE.company} — ${SITE.brand} ${SITE.subBrand} (Advisor: Mii Shintani / 新谷 美依).`,
          `Office Address: ${SITE.postalCode} ${SITE.addressEn}.`,
          `Privacy Inquiry Desk: ${SITE.email} | Tel: ${SITE.hotline}.`,
        ],
      },
      {
        heading: "2. Categories of Personal Information Collected",
        items: [
          "Basic Information: Full name, email address, phone/WhatsApp/LINE contact, and real estate inquiry details voluntarily provided via our contact form.",
          "Special Care-Required Personal Information: We DO NOT collect or process any sensitive information (My Number, passport/ID numbers, bank account details, medical history, etc.) through this website.",
        ],
      },
      {
        heading: "3. Purpose of Use & Restriction on Third-Party Provision",
        items: [
          "To respond to your property inquiries, introduce suitable real estate listings in Japan, provide transaction/rental cost estimates, and arrange property viewings.",
          "Except as required by Japanese law, we will never sell, rent, or provide your personal information to any third party without your prior consent.",
        ],
      },
      {
        heading: "4. Security Control Measures & Retention",
        items: [
          "All communications are encrypted via HTTPS/TLS and stored in access-controlled cloud environments protected by Row-Level Security (RLS) restricted exclusively to authorized personnel.",
          "Personal information is retained only for as long as necessary to fulfill your real estate consultation or until you request deletion.",
        ],
      },
      {
        heading: "5. Requests for Disclosure, Correction, Suspension & Deletion",
        items: [
          "Pursuant to Japan's APPI, you have the right to request disclosure, correction, addition, suspension of use, or deletion of your retained personal data.",
          `To submit a request, please email ${SITE.email}. Upon verifying your identity, we will respond promptly within 72 business hours.`,
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
        heading: "4. 安全管理措置および保管期間",
        items: [
          "通信の暗号化（HTTPS/TLS）および厳格なアクセス制御（Row-Level Security）を備えたクラウド環境にて安全に管理し、不正アクセスや漏えいの防止に努めます。",
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
  const content =
    PRIVACY_CONTENT[currentLang === "ja" ? "ja" : "en"] || PRIVACY_CONTENT.ja;

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