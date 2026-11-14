"use client";

import { useId, useState } from "react";
import { signIn } from "@/app/back/admin";

function MailIcon({ className }: { className?: string }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LogInIcon({ className }: { className?: string }) {
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export default function LoginForm() {
  const uid = useId();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn(formData);

    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor={`${uid}-email`}
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
        >
          Email
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-[#0F766E]">
            <MailIcon className="h-4 w-4" />
          </span>
          <input
            id={`${uid}-email`}
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-[#E2E8F0] bg-white py-3 pr-4 pl-10 text-base text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15 sm:text-sm"
            placeholder="...@gmail.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${uid}-password`}
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
        >
          Mật khẩu
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-[#0F766E]">
            <LockIcon className="h-4 w-4" />
          </span>
          <input
            id={`${uid}-password`}
            type="password"
            name="password"
            required
            className="w-full rounded-lg border border-[#E2E8F0] bg-white py-3 pr-4 pl-10 text-base text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-900"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0369A1] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <LogInIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            <span>Đăng Nhập</span>
          </>
        )}
      </button>
    </form>
  );
}