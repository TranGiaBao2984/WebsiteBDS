import type { Metadata } from 'next';
import './globals.css';
import { Inter, Noto_Sans_JP, Lora } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-lora', // globals.css map biến này sang --font-serif
});

export const metadata: Metadata = {
  metadataBase: new URL('https://myrealestate.estate'),
  title: {
    default: 'MII SHINTANI • Real Estate Agent in Japan',
    template: '%s | MII SHINTANI',
  },
  description: 'Japanese traditional homes and properties across Japan.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    siteName: 'MII SHINTANI',
    title: 'MII SHINTANI • Real Estate Agent in Japan',
    description: 'Japanese traditional homes and properties across Japan.',
    url: 'https://myrealestate.estate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MII SHINTANI • Real Estate Agent in Japan',
    description: 'Japanese traditional homes and properties across Japan.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
      className={`scroll-smooth ${inter.variable} ${notoSansJP.variable} ${lora.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#d7c4b7]">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}