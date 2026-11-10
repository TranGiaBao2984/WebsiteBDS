import { Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-[#e6dfd5] bg-[#f8f6f0]" />}>
        <Header />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
