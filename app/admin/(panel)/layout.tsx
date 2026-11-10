import { Suspense } from 'react';
import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase-server';
import { signOut } from '@/app/back/admin';

async function UserBox() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-xs text-[#8c827a] md:inline">{user?.email}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-[#d8cebe] bg-white px-3 py-1.5 text-xs font-semibold text-[#2c2623] transition hover:bg-[#f3eee7]"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e6dfd5] bg-[#f8f6f0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="group shrink-0">
            <span className="block font-serif text-base font-bold uppercase tracking-[0.15em] text-[#2c2623] transition group-hover:text-[#8c6d53]">
              MII SHINTANI
            </span>
            <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-[#8c827a]">
              Khu vực quản trị
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-[#574d43] transition hover:text-[#2c2623]"
            >
              Xem website ↗
            </Link>
            <Suspense fallback={null}>
              <UserBox />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
