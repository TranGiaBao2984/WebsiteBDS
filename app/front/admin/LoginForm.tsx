"use client";

import { useId, useState } from "react";
import { signIn } from "@/app/back/admin";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor={`${uid}-email`}
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#3c352d]"
        >
          Email
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          name="email"
          required
          className="w-full px-4 py-2.5 bg-[#f8f6f0] border border-[#e6dfd5] rounded-xl text-sm text-[#2c2623] placeholder:text-[#786e65] focus:bg-white focus:outline-none focus:border-[#7a482b] focus:ring-2 focus:ring-[#7a482b]/20 transition"
          placeholder="...@gmail.com"
        />
      </div>

      <div>
        <label
          htmlFor={`${uid}-password`}
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#3c352d]"
        >
          Mật khẩu
        </label>
        <input
          id={`${uid}-password`}
          type="password"
          name="password"
          required
          className="w-full px-4 py-2.5 bg-[#f8f6f0] border border-[#e6dfd5] rounded-xl text-sm text-[#2c2623] placeholder:text-[#786e65] focus:bg-white focus:outline-none focus:border-[#7a482b] focus:ring-2 focus:ring-[#7a482b]/20 transition"
          placeholder="••••••••"
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#7a482b] hover:bg-[#633a22] text-white font-bold rounded-xl transition duration-200 disabled:opacity-50 text-sm uppercase tracking-wider cursor-pointer shadow-xs"
      >
        {loading ? "Đang xử lý..." : "Đăng Nhập"}
      </button>
    </form>
  );
}