import { createBrowserClient } from '@supabase/ssr';

/** Client Supabase chạy trên trình duyệt, dùng để tải ảnh thẳng lên Storage (tránh giới hạn dung lượng của Server Action). */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
