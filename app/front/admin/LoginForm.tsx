"use client";

import { useState } from "react";
import { signIn } from "@/app/back/admin";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn(formData);

    // Nếu có lỗi trả về thì mới tắt loading, còn thành công Server Action sẽ tự redirect
    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#3c352d]">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-4 py-2.5 bg-[#f8f6f0] border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
          placeholder="...@gmail.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[#3c352d]">
          Mật khẩu
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full px-4 py-2.5 bg-[#f8f6f0] border border-[#e6dfd5] rounded focus:outline-none focus:border-[#3c352d] text-sm text-[#3c352d]"
          placeholder="••••••••"
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#633a22] text-white font-bold rounded hover:bg-[#4d2d1a] transition duration-200 disabled:opacity-50 text-sm uppercase tracking-wider"
      >
        {loading ? "Đang xử lý..." : "Đăng Nhập"}
      </button>
    </form>
  );
}