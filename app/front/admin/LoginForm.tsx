'use client';

import { useId, useState, useTransition, type FormEvent } from 'react';
import { signIn } from '@/app/back/admin';

const FIELD =
  'w-full rounded-xl border border-[#e6dfd5] bg-[#f8f6f0] px-3.5 py-3 text-base text-[#2c2623] placeholder:text-[#b0a499] transition focus:border-[#8c6d53] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#8c6d53]/15 md:text-sm';

export default function LoginForm() {
  const uid = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setError(null);

    startTransition(async () => {
      try {
        // Đăng nhập thành công thì server tự chuyển sang /admin
        const res = await signIn(email, password);
        if (res?.error) setError(res.error);
      } catch {
        setError('Không kết nối được. Hãy kiểm tra mạng và thử lại.');
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={pending}
      className="space-y-5 rounded-3xl border border-[#e6dfd5] bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1.5 block text-xs font-semibold text-[#574d43]">
          Email
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-password`} className="mb-1.5 block text-xs font-semibold text-[#574d43]">
          Mật khẩu
        </label>
        <input
          id={`${uid}-password`}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={FIELD}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#e3c9bd] bg-[#fbf1ec] px-4 py-3 text-sm leading-relaxed text-[#8a3b1d]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#7a482b] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#633a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7a482b]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
