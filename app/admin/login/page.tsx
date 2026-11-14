import LoginForm from '@/app/front/admin/LoginForm';

export const instant = false;

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/80 p-7 shadow-[0_10px_25px_rgba(19,78,74,0.08)] backdrop-blur-xl sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-[#14B8A6]/15 blur-3xl"
        />

        <div className="relative space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E] shadow-2xs">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <p className="font-serif text-xl font-bold uppercase tracking-[0.16em] text-[#134E4A] sm:text-2xl">
              MII SHINTANI
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              RE AGENT BY RE IDEA • QUẢN TRỊ VIÊN
            </p>
          </div>

          <div className="border-t border-[#E8F0F3] pt-5">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}