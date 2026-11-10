// Mẫu email. Chỉ chạy trên server (được import từ file 'use server').
// Giữ riêng khỏi dictionary để chữ trong email không bị đóng gói gửi xuống trình duyệt.

export type Lang = 'en' | 'ja' | 'vi';

export type EmailLead = {
  property_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  message: string;
};

export type EmailContext = {
  propertyTitle: string | null;
  propertyUrl: string | null;
};

export type BuiltEmail = { subject: string; html: string; text: string };

export const toLang = (v: unknown): Lang => (v === 'ja' || v === 'vi' ? v : 'en');

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

const SERIF = "Georgia,'Times New Roman','Hiragino Mincho ProN','Yu Mincho',serif";
const SANS = "Arial,'Helvetica Neue',Helvetica,'Hiragino Sans','Yu Gothic',Meiryo,sans-serif";

const BRAND = 'MII SHINTANI';
const TAGLINE = 'Japan Real Estate Advisory & Brokerage Services';

/** Khung chung: dải mực tối ở đầu (giống khung tối của form trên web) + thẻ trắng trên nền kem. */
function shell(lang: string, headerSub: string, inner: string) {
  return `<!doctype html>
<html lang="${lang}">
<body style="margin:0;padding:0;background:#f8f6f0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f0;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6dfd5;border-radius:16px;overflow:hidden;">
<tr><td style="background:#2c2623;padding:20px 28px;">
<div style="font-family:${SERIF};font-size:16px;font-weight:bold;letter-spacing:3px;color:#f8f6f0;">${BRAND}</div>
<div style="font-family:${SANS};font-size:11px;color:#d8c7b8;margin-top:4px;">${esc(headerSub)}</div>
</td></tr>
${inner}
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${esc(href)}" style="display:inline-block;margin-top:14px;background:#7a482b;color:#ffffff;text-decoration:none;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:1px;padding:11px 20px;border-radius:10px;">${esc(label)}</a>`;
}

/* ------------------------------------------------------------------ */
/* Email gửi cho KHÁCH (xác nhận đã nhận yêu cầu)                       */
/* ------------------------------------------------------------------ */

const CUSTOMER = {
  en: {
    subject: 'We received your inquiry',
    heading: (n: string) => `Thank you, ${n}`,
    body: 'Mii will review your request and reply by email or WhatsApp as soon as possible.',
    about: 'Your inquiry about',
    view: 'View property',
    reply: 'You can reply directly to this email.',
    ignore: 'If you did not send this inquiry, you can ignore this email.',
  },
  ja: {
    subject: 'お問い合わせを受け付けました',
    heading: (n: string) => `${n} 様、お問い合わせありがとうございます`,
    body: '内容を確認のうえ、Mii よりメールまたは WhatsApp にてできるだけ早くご連絡いたします。',
    about: 'お問い合わせの物件',
    view: '物件を見る',
    reply: 'このメールに直接ご返信いただくこともできます。',
    ignore: 'お心当たりのない場合は、このメールを破棄してください。',
  },
  vi: {
    subject: 'Mii đã nhận được yêu cầu của bạn',
    heading: (n: string) => `Cảm ơn ${n} đã liên hệ`,
    body: 'Mii sẽ kiểm tra thông tin và phản hồi sớm nhất qua Email/WhatsApp.',
    about: 'Yêu cầu của bạn về',
    view: 'Xem bất động sản',
    reply: 'Bạn có thể trả lời trực tiếp email này.',
    ignore: 'Nếu bạn không gửi yêu cầu này, bạn có thể bỏ qua email.',
  },
} as const;

export function buildCustomerEmail(lang: Lang, lead: EmailLead, ctx: EmailContext): BuiltEmail {
  const c = CUSTOMER[lang];
  // Cố ý KHÔNG đưa lời nhắn của khách vào email: tránh bị lợi dụng form để gửi nội dung tuỳ ý
  // tới một địa chỉ email bất kỳ dưới tên miền của bạn. Tên cũng được cắt ngắn.
  const name = oneLine(lead.full_name).slice(0, 60);
  const heading = c.heading(name);

  const propertyBlock = ctx.propertyTitle
    ? `<tr><td style="padding:18px 28px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f0;border:1px solid #e6dfd5;border-radius:12px;">
<tr><td style="padding:16px 18px;">
<div style="font-family:${SANS};font-size:12px;color:#8c827a;margin-bottom:6px;">${esc(c.about)}</div>
<div style="font-family:${SERIF};font-size:17px;font-weight:bold;line-height:1.4;color:#2c2623;">${esc(oneLine(ctx.propertyTitle))}</div>
${ctx.propertyUrl ? button(ctx.propertyUrl, c.view) : ''}
</td></tr>
</table>
</td></tr>`
    : '';

  const inner = `<tr><td style="padding:32px 28px 0;">
<h1 style="margin:0 0 14px;font-family:${SERIF};font-size:24px;line-height:1.35;color:#2c2623;">${esc(heading)}</h1>
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.75;color:#665c54;">${esc(c.body)}</p>
</td></tr>
${propertyBlock}
<tr><td style="padding:26px 28px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:#8c827a;">
<p style="margin:0 0 6px;">${esc(c.reply)}</p>
<p style="margin:0;">${esc(c.ignore)}</p>
</td></tr>`;

  const text = [
    heading,
    '',
    c.body,
    ctx.propertyTitle ? `\n${c.about}: ${oneLine(ctx.propertyTitle)}` : '',
    ctx.propertyUrl ?? '',
    '',
    c.reply,
    c.ignore,
    '',
    `${BRAND} - ${TAGLINE}`,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');

  return { subject: c.subject, html: shell(lang, TAGLINE, inner), text };
}

/* ------------------------------------------------------------------ */
/* Email báo cho CHỦ WEB (có khách mới) - tiếng Việt                    */
/* ------------------------------------------------------------------ */

export function buildOwnerEmail(lead: EmailLead, ctx: EmailContext): BuiltEmail {
  const name = oneLine(lead.full_name);
  const title = ctx.propertyTitle ? oneLine(ctx.propertyTitle) : null;
  const subject = `Khách mới: ${name}${title ? ` – ${title}` : ''}`;

  const row = (label: string, valueHtml: string) =>
    `<tr>
<td style="padding:11px 0;border-bottom:1px solid #f0eae1;width:112px;vertical-align:top;font-family:${SANS};font-size:12px;color:#8c827a;">${esc(label)}</td>
<td style="padding:11px 0;border-bottom:1px solid #f0eae1;vertical-align:top;font-family:${SANS};font-size:14px;line-height:1.6;color:#2c2623;">${valueHtml}</td>
</tr>`;

  const link = (href: string, label: string) =>
    `<a href="${esc(href)}" style="color:#7a482b;">${esc(label)}</a>`;

  const phoneDigits = lead.phone.replace(/[^\d+]/g, '');
  const propertyHtml = title
    ? ctx.propertyUrl
      ? link(ctx.propertyUrl, title)
      : esc(title)
    : 'Tư vấn chung (không gắn với căn nào)';

  const inner = `<tr><td style="padding:28px 28px 8px;">
<h1 style="margin:0 0 4px;font-family:${SERIF};font-size:22px;line-height:1.35;color:#2c2623;">Khách mới từ website</h1>
<p style="margin:0 0 14px;font-family:${SANS};font-size:13px;color:#8c827a;">Bấm Reply để trả lời thẳng cho khách.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row('Họ tên', esc(name))}
${row('Email', link(`mailto:${lead.email}`, lead.email))}
${row('Điện thoại', lead.phone ? (phoneDigits ? link(`tel:${phoneDigits}`, lead.phone) : esc(lead.phone)) : '<span style="color:#a0958b;">(không có)</span>')}
${row('Bất động sản', propertyHtml)}
${row('Lời nhắn', `<div style="white-space:pre-wrap;">${esc(lead.message)}</div>`)}
</table>
</td></tr>
<tr><td style="padding:12px 28px 28px;"></td></tr>`;

  const text = [
    `Họ tên: ${name}`,
    `Email: ${lead.email}`,
    `Điện thoại: ${lead.phone || '(không có)'}`,
    `Bất động sản: ${title ?? 'Tư vấn chung'}${ctx.propertyUrl ? `\n${ctx.propertyUrl}` : ''}`,
    '',
    'Lời nhắn:',
    lead.message,
    '',
    'Bấm Reply để trả lời thẳng cho khách.',
  ].join('\n');

  return { subject, html: shell('vi', 'Thông báo từ website', inner), text };
}