import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServer } from './supabase-server';

/**
 * Admin = tài khoản có app_metadata.role === 'admin'.
 * app_metadata chỉ sửa được bằng service role (Dashboard/SQL), người dùng không tự sửa được,
 * nên an toàn hơn so với việc chỉ kiểm tra "đã đăng nhập".
 */
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

/** Dùng trong trang admin: không phải admin thì chuyển về trang đăng nhập. */
export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  // getUser() hỏi lại Supabase để xác thực token, an toàn hơn getSession() ở phía server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user)) redirect('/admin/login');
  return { supabase, user: user as User };
}
