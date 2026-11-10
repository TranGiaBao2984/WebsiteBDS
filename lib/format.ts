// Locale cố định 'en-US' để server và trình duyệt luôn ra cùng một chuỗi.
// Nếu để mặc định, trình duyệt tiếng Việt in "1.000.000" còn server in "1,000,000"
// và React báo lỗi hydration.
const yen = new Intl.NumberFormat('en-US');

export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isFinite(n) ? `¥${yen.format(n)}` : '—';
}
