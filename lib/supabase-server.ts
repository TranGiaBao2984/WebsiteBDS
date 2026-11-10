import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase chạy trên server, mang theo phiên đăng nhập của người dùng (qua cookie).
 * Khác với lib/supabase.ts (anon, dùng cho khách xem web), client này ghi dữ liệu theo
 * quyền của người đang đăng nhập nên các policy RLS sẽ được áp dụng.
 * Chỉ gọi trong request (Server Action, trang admin), không dùng bên trong 'use cache'.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component không ghi được cookie. proxy.ts đã làm việc làm mới phiên này.
          }
        },
      },
    }
  );
}
