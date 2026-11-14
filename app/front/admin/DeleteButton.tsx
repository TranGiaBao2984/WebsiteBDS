'use client';

import { useState, useTransition } from 'react';
import { deleteProperty } from '@/app/back/admin';

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

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
      <span className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          <span>Xoá</span>
        </button>
        {error && (
          <span
            role="alert"
            className="max-w-56 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-right text-[11px] font-medium leading-snug text-rose-800"
          >
            {error}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      role="group"
      aria-label={`Xác nhận xoá ${title}`}
      className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-1.5 backdrop-blur-sm"
    >
      <span className="text-xs font-semibold text-rose-900">Xoá hẳn căn này?</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <span
              aria-hidden="true"
              className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            <span>Đang xoá...</span>
          </>
        ) : (
          <>
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Xoá luôn</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#99F6E4] bg-white px-3 py-1.5 text-xs font-semibold text-[#134E4A] transition-all duration-200 hover:bg-[#F0FDFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CloseIcon className="h-3.5 w-3.5" />
        <span>Huỷ</span>
      </button>
    </span>
  );
}