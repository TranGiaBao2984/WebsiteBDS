import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { signOut } from '@/app/back/admin';

async function UserBox() {
  // Khai báo cho Next.js 16 Cache Components biết Component này xử lý ở Request Time
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-[#3c352d] font-medium hidden sm:inline">{user.email}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="px-3 py-1.5 bg-[#e6dfd5] hover:bg-[#d8cebe] text-[#3c352d] text-xs font-semibold rounded transition cursor-pointer"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f6f0]">
      <header className="bg-white border-b border-[#e6dfd5] sticky top-0 z-50">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-xl font-bold text-[#3c352d]">
              MII SHINTANI <span className="text-xs font-sans text-amber-800 uppercase tracking-widest ml-1">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-[#3c352d]/80">
              <Link href="/admin" className="hover:text-[#3c352d] transition">
                Bất động sản
              </Link>
              <Link href="/admin/new" className="hover:text-[#3c352d] transition">
                + Đăng BĐS
              </Link>
              <Link href="/admin/inquiries" className="hover:text-[#3c352d] transition">
                Khách hàng
              </Link>
              <Link href="/" target="_blank" className="hover:text-[#3c352d] transition">
                Xem Website ↗
              </Link>
            </nav>
          </div>

          <Suspense fallback={<div className="h-8 w-24 bg-[#e6dfd5]/50 animate-pulse rounded" />}>
            <UserBox />
          </Suspense>
        </div>

        {/* Thanh điều hướng nhanh trên điện thoại */}
        <nav className="flex md:hidden items-center gap-4 px-4 py-2.5 border-t border-[#f0eae1] bg-[#faf8f5] text-xs font-semibold text-[#3c352d]/85 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="hover:text-[#3c352d]">
            Bất động sản
          </Link>
          <Link href="/admin/new" className="hover:text-[#3c352d]">
            + Đăng BĐS
          </Link>
          <Link href="/admin/inquiries" className="hover:text-[#3c352d]">
            Khách hàng
          </Link>
          <Link href="/" target="_blank" className="hover:text-[#3c352d]">
            Xem Website ↗
          </Link>
        </nav>
      </header>

      <main className="py-6">{children}</main>
    </div>
  );
}