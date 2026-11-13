'use client';

import { useState, useTransition } from 'react';
import { deleteProperty } from '@/app/back/admin';

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteProperty(id);
        if (res.error) {
          setError(res.error);
          setConfirming(false);
        }
      } catch {
        setError('Không kết nối được. Hãy thử lại.');
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <span className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-xl border border-[#e3c9bd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#8a3b1d] transition hover:bg-[#fbf1ec] cursor-pointer"
        >
          Xoá
        </button>
        {error && (
          <span role="alert" className="max-w-56 text-right text-[11px] leading-snug text-[#8a3b1d]">
            {error}
          </span>
        )}
      </span>
    );
  }

  return (
    <span role="group" aria-label={`Xác nhận xoá ${title}`} className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs font-medium text-[#8a3b1d]">Xoá hẳn căn này?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-xl bg-[#8a3b1d] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f2f17] cursor-pointer disabled:opacity-60"
      >
        {pending ? 'Đang xoá...' : 'Xoá luôn'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="rounded-xl border border-[#d8cebe] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2c2623] transition hover:bg-[#f3eee7] cursor-pointer disabled:opacity-60"
      >
        Huỷ
      </button>
    </span>
  );
}