// Thông tin thương hiệu và liên hệ dùng chung cho Header, Footer và trang chi tiết.
// TODO: thay các giá trị mẫu bên dưới bằng thông tin thật. Chỉ cần sửa ở file này.

// Số điện thoại dạng quốc tế, không khoảng trắng. WhatsApp lấy từ số này.
// Nếu số WhatsApp khác số hotline, hãy gán thẳng vào whatsappHref bên dưới.
const PHONE_E164 = '+819000000000';

export const SITE = {
  name: 'MII SHINTANI',
  tagline: 'Real Estate Agent • Japan Nationwide',
  intro: 'Japan Real Estate Advisory & Brokerage Services',
  hours: '8:00 AM – 9:00 PM, Mon – Sun',
  email: 'contact@example.com',
  hotline: '+81 90 0000 0000',
  hotlineHref: `tel:${PHONE_E164}`,
  whatsappHref: `https://wa.me/${PHONE_E164.replace(/\D/g, '')}`,
  facebookHref: 'https://facebook.com/',
  ctaHref: '/vetoi#contact',
} as const;

/** Link WhatsApp, có thể kèm sẵn nội dung tin nhắn. */
export function whatsappLink(text?: string): string {
  return text
    ? `${SITE.whatsappHref}?text=${encodeURIComponent(text)}`
    : SITE.whatsappHref;
}
