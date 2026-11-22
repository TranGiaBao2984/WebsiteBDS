import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Lấy danh sách email admin từ biến môi trường (ngăn cách bằng dấu phẩy nếu có nhiều admin)
function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowedEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Nếu chưa cấu hình biến môi trường ADMIN_EMAILS thì mặc định cho phép user đã đăng nhập (tránh tự khóa mình)
  if (allowedEmails.length === 0) return true;
  return allowedEmails.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Xác thực lại user trực tiếp với Supabase Auth Server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthorizedAdmin = Boolean(user && isAdminEmail(user.email));

  // 1. Chưa đăng nhập hoặc không phải email Admin mà cố vào /admin -> Đẩy về /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthorizedAdmin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Đã đăng nhập đúng quyền Admin mà vào /admin/login -> Đẩy thẳng vào /admin
  if (pathname === "/admin/login" && isAuthorizedAdmin) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};