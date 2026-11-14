import { Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F0FDFA] text-[#134E4A]">
      {/* Hiệu ứng chiều sâu ánh sáng nền Glassmorphism */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 -right-32 h-96 w-96 rounded-full bg-[#14B8A6]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#0369A1]/8 blur-3xl"
      />

      <Suspense
        fallback={
          <div className="sticky top-0 z-50 h-16 border-b border-[#99F6E4] bg-white/80 backdrop-blur-xl" />
        }
      >
        <Header />
      </Suspense>

      <div className="relative z-10 flex-1">{children}</div>

      <Footer />
    </div>
  );
}