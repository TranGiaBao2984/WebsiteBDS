import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { signOut } from '@/app/back/admin';

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

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
      <span className="hidden items-center gap-1.5 rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-3 py-1 text-xs font-medium text-[#134E4A] sm:inline-flex">
        <UserIcon className="h-3.5 w-3.5 text-[#0F766E]" />
        <span>{user.email}</span>
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#99F6E4] bg-white px-3 py-1.5 text-xs font-semibold text-[#134E4A] transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </form>
    </div>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#134E4A]">
      <header className="sticky top-0 z-50 border-b border-[#99F6E4] bg-white/85 shadow-[0_2px_10px_rgba(19,78,74,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-350 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-serif text-lg font-bold tracking-wider text-[#134E4A] sm:text-xl"
            >
              <span>MII SHINTANI</span>
              <span className="rounded-md border border-[#99F6E4] bg-[#F0FDFA] px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-[#0F766E]">
                Admin
              </span>
            </Link>

            <nav className="hidden items-center gap-1.5 text-sm font-semibold text-[#134E4A]/85 md:flex">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-[#F0FDFA] hover:text-[#0F766E]"
              >
                <BuildingIcon className="h-4 w-4 text-[#0F766E]" />
                <span>Bất động sản</span>
              </Link>
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-[#F0FDFA] hover:text-[#0F766E]"
              >
                <PlusIcon className="h-4 w-4 text-[#0F766E]" />
                <span>Đăng BĐS</span>
              </Link>
              <Link
                href="/admin/inquiries"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-[#F0FDFA] hover:text-[#0F766E]"
              >
                <UsersIcon className="h-4 w-4 text-[#0F766E]" />
                <span>Khách hàng</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[#0369A1] transition-colors duration-200 hover:bg-[#F0FDFA] hover:text-[#0F766E]"
              >
                <span>Xem Website</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </div>

          <Suspense
            fallback={
              <div className="h-8 w-28 animate-pulse rounded-lg border border-[#99F6E4] bg-[#F0FDFA]" />
            }
          >
            <UserBox />
          </Suspense>
        </div>

        {/* Thanh điều hướng nhanh trên điện thoại */}
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-t border-[#99F6E4]/70 bg-[#F0FDFA]/90 px-4 py-2 text-xs font-semibold text-[#134E4A] backdrop-blur-md md:hidden">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors hover:bg-white hover:text-[#0F766E]"
          >
            <BuildingIcon className="h-3.5 w-3.5 text-[#0F766E]" />
            <span>Bất động sản</span>
          </Link>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors hover:bg-white hover:text-[#0F766E]"
          >
            <PlusIcon className="h-3.5 w-3.5 text-[#0F766E]" />
            <span>Đăng BĐS</span>
          </Link>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors hover:bg-white hover:text-[#0F766E]"
          >
            <UsersIcon className="h-3.5 w-3.5 text-[#0F766E]" />
            <span>Khách hàng</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[#0369A1] transition-colors hover:bg-white hover:text-[#0F766E]"
          >
            <span>Xem Website</span>
            <ExternalLinkIcon className="h-3 w-3" />
          </Link>
        </nav>
      </header>

      <main className="py-6">{children}</main>
    </div>
  );
}