import './globals.css';
import { Noto_Sans, Lora } from 'next/font/google';

const notoSans = Noto_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-noto-sans', // globals.css map biến này sang --font-sans
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-lora', // globals.css map biến này sang --font-serif
});

export const metadata = {
  title: 'MII SHINTANI • Real Estate Agent in Japan',
  description: 'Japanese traditional homes and properties across Japan.',
};

// Layout gốc chỉ giữ <html>/<body>. Header + Footer của website nằm ở app/(site)/layout.tsx,
// còn khu vực /admin có khung riêng nên không bị dính Header/Footer công khai.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${notoSans.variable} ${lora.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#d7c4b7]">
        {children}
      </body>
    </html>
  );
}
