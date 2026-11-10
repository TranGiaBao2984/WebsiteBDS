import { ReactNode } from 'react';

// Khai báo cho Next.js 16 cho phép render động (blocking route) cho toàn bộ khu vực /admin
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>;
}