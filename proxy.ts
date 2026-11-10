import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Chỉ chạy cho /admin/*. Hai việc:
//  1. Làm mới token đăng nhập (Server Component không ghi được cookie nên phải làm ở đây).
//  2. Người chưa đăng nhập (hoặc không phải admin) bị chuyển về /admin/login.
// Đây mới là lớp chặn đầu tiên. Mỗi trang, mỗi Server Action và RLS trong database vẫn tự kiểm tra lại.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === 'admin';
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  let target: string | null = null;
  if (!isAdmin && !isLoginPage) target = '/admin/login';
  else if (isAdmin && isLoginPage) target = '/admin';

  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = '';
    const redirect = NextResponse.redirect(url);
    // Giữ lại cookie vừa được làm mới (nếu có)
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set('Cache-Control', 'private, no-store');
    return redirect;
  }

  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
