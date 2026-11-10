import type { Metadata } from 'next';
import { connection } from 'next/server';

export const metadata: Metadata = {
  title: 'Quản trị • MII SHINTANI',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hàm này báo cho Next.js biết hãy bỏ qua việc tạo file tĩnh 
  // và luôn render mới khi có request tới khu vực admin
  await connection(); 
  
  return <div className="flex-1">{children}</div>;
}