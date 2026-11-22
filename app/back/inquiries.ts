"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase-server";
import {
  buildCustomerEmail,
  buildOwnerEmail,
  toLang,
  type Lang,
} from "./emails";

export type InquiryStatus = "pending" | "consulting" | "paid" | "cancelled";

const VALID_INQUIRY_STATUSES: InquiryStatus[] = [
  "pending",
  "consulting",
  "paid",
  "cancelled",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SubmitInquiryInput {
  propertyId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  lang?: Lang;
  consent?: boolean;
  website?: string; // Honeypot field chống bot
  formLoadedAt?: number; // Thời điểm mở form để lọc bot submit tức thì
}

interface PropertySummary {
  titleText: string;
  url: string;
}

// --- Chốt chặn xác thực & phân quyền Admin phía Server ---
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Phiên đăng nhập Admin đã hết hạn.");
  }

  const allowedEmails = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (
    allowedEmails.length > 0 &&
    (!user.email || !allowedEmails.includes(user.email.toLowerCase()))
  ) {
    throw new Error("Tài khoản không có quyền quản trị.");
  }

  return supabase;
}

// Bộ đếm Rate Limit theo IP trên từng instance (3 lần / 10 phút)
const ipHitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipHitMap.get(ip) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipHitMap.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  ipHitMap.set(ip, timestamps);

  if (ipHitMap.size > 2000) {
    for (const [key, list] of ipHitMap.entries()) {
      const valid = list.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) ipHitMap.delete(key);
      else ipHitMap.set(key, valid);
    }
  }

  return false;
}

const VALIDATION_MESSAGES: Record<
  Lang,
  {
    missingFields: string;
    invalidEmail: string;
    invalidPhone: string;
    missingConsent: string;
    rateLimited: string;
    tooFast: string;
    serverError: string;
  }
> = {
  vi: {
    missingFields: "Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.",
    invalidEmail: "Địa chỉ Email không hợp lệ.",
    invalidPhone: "Số điện thoại không hợp lệ (tối thiểu 7 chữ số).",
    missingConsent:
      "Vui lòng tích chọn đồng ý với Chính sách bảo mật trước khi gửi yêu cầu.",
    rateLimited:
      "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau 10 phút.",
    tooFast: "Thao tác gửi quá nhanh. Vui lòng kiểm tra lại thông tin và thử lại.",
    serverError: "Không thể gửi yêu cầu tư vấn. Vui lòng thử lại sau.",
  },
  en: {
    missingFields: "Please fill in your Full Name, Email, and Phone Number.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone: "Please enter a valid phone number (at least 7 digits).",
    missingConsent:
      "Please agree to the Privacy Policy before submitting your inquiry.",
    rateLimited:
      "Too many inquiries submitted recently. Please try again in 10 minutes.",
    tooFast: "Submission was too fast. Please review your details and try again.",
    serverError: "Unable to submit your inquiry. Please try again later.",
  },
  ja: {
    missingFields: "お名前・メールアドレス・電話番号をすべてご入力ください。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    invalidPhone: "有効な電話番号を入力してください（7桁以上）。",
    missingConsent:
      "送信前にプライバシーポリシーへの同意にチェックを入れてください。",
    rateLimited:
      "短時間に複数の送信が行われたため制限されています。10分後に再度お試しください。",
    tooFast: "送信が早すぎます。内容をご確認のうえ再度お試しください。",
    serverError: "お問い合わせを送信できませんでした。後ほど再度お試しください。",
  },
};

function extractLocalizedTitle(rawTitle: unknown, preferredLang: Lang): string {
  if (!rawTitle) return "";
  let parsed: unknown = rawTitle;

  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    } else {
      return trimmed;
    }
  }

  if (typeof parsed === "object" && parsed !== null) {
    const rec = parsed as Record<string, unknown>;
    const preferred = rec[preferredLang];
    if (typeof preferred === "string" && preferred.trim()) {
      return preferred.trim();
    }
    const fallback = [rec.en, rec.ja, rec.vi].find(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    );
    return fallback ? fallback.trim() : "";
  }

  return String(parsed);
}

function getSiteBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProdUrl) {
    return `https://${vercelProdUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  const vercelPreviewUrl = process.env.VERCEL_URL?.trim();
  if (vercelPreviewUrl) {
    return `https://${vercelPreviewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

async function getPropertySummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  lang: Lang
): Promise<PropertySummary | null> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title")
      .eq("id", propertyId)
      .maybeSingle();

    if (error || !data) return null;

    const titleText =
      extractLocalizedTitle(data.title, lang) || `Property #${propertyId}`;
    const baseUrl = getSiteBaseUrl();

    return {
      titleText,
      url: `${baseUrl}/properties/${propertyId}`,
    };
  } catch {
    return null;
  }
}

async function dispatchInquiryEmails(params: {
  lang: Lang;
  propertyId: string | null;
  propertySummary: PropertySummary | null;
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const notifyTo = (process.env.AGENT_NOTIFY_EMAIL || gmailUser)?.trim();

  if (!gmailUser || !gmailPass || !notifyTo) {
    console.warn("Thiếu cấu hình GMAIL_USER hoặc GMAIL_APP_PASSWORD.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass.replace(/\s+/g, ""),
    },
  });

  const lead = {
    property_id: params.propertyId,
    full_name: params.fullName,
    email: params.email,
    phone: params.phone,
    message: params.message,
  };

  const ctx = {
    propertyTitle: params.propertySummary?.titleText ?? null,
    propertyUrl: params.propertySummary?.url ?? null,
  };

  const ownerMail = buildOwnerEmail(lead, ctx);
  const customerMail = buildCustomerEmail(params.lang, lead, ctx);

  await Promise.allSettled([
    transporter.sendMail({
      from: `"MII SHINTANI Real Estate" <${gmailUser}>`,
      to: notifyTo,
      replyTo: params.email,
      subject: ownerMail.subject,
      html: ownerMail.html,
      text: ownerMail.text,
    }),
    transporter.sendMail({
      from: `"MII SHINTANI Real Estate" <${gmailUser}>`,
      to: params.email,
      replyTo: notifyTo,
      subject: customerMail.subject,
      html: customerMail.html,
      text: customerMail.text,
    }),
  ]);
}

export async function submitInquiryAction(input: SubmitInquiryInput) {
  const lang = toLang(input.lang);
  const msg = VALIDATION_MESSAGES[lang];

  // 1. Lớp chống bot 1: Honeypot
  if (input.website && input.website.trim().length > 0) {
    return { success: true };
  }

  // 2. Lớp chống bot 2: Thời gian điền form quá nhanh (< 1.2 giây)
  if (
    typeof input.formLoadedAt === "number" &&
    input.formLoadedAt > 0 &&
    Date.now() - input.formLoadedAt < 1200
  ) {
    return { success: false, error: msg.tooFast };
  }

  // 3. Kiểm tra đồng ý xử lý dữ liệu cá nhân
  if (!input.consent) {
    return { success: false, error: msg.missingConsent };
  }

  // 4. Chuẩn hóa & Validate dữ liệu đầu vào chặt chẽ
  const fullName = (input.fullName || "").trim().slice(0, 100);
  const email = (input.email || "").trim().toLowerCase().slice(0, 150);
  // Chỉ giữ lại chữ số, dấu +, khoảng trắng, gạch ngang và ngoặc đơn cho SĐT
  const phone = (input.phone || "")
    .replace(/[^\d+\s()-]/g, "")
    .trim()
    .slice(0, 30);
  const message = (input.message || "").trim().slice(0, 2000);

  // Chỉ chấp nhận propertyId là UUID hợp lệ (nếu có truyền lên)
  const rawPropertyId = (input.propertyId || "").trim();
  const cleanPropertyId =
    rawPropertyId && UUID_REGEX.test(rawPropertyId) ? rawPropertyId : null;

  if (!fullName || !email || !phone) {
    return { success: false, error: msg.missingFields };
  }

  // Ngăn chặn ký tự xuống dòng trong email/tên chống Header Injection
  if (/[\r\n]/.test(email) || /[\r\n]/.test(fullName)) {
    return { success: false, error: msg.invalidEmail };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: msg.invalidEmail };
  }

  const digitCount = phone.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 15) {
    return { success: false, error: msg.invalidPhone };
  }

  // 5. Rate Limit tầng IP (ưu tiên header đáng tin cậy từ Vercel / Reverse Proxy)
  const reqHeaders = await headers();
  const vercelIp = reqHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const realIp = reqHeaders.get("x-real-ip")?.trim();
  const forwardedIp = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = vercelIp || realIp || forwardedIp || "unknown";

  if (clientIp !== "unknown" && isIpRateLimited(clientIp)) {
    return { success: false, error: msg.rateLimited };
  }

  try {
    const supabase = await createClient();

    // 6. Rate Limit tầng Database thông qua RPC SECURITY DEFINER (không bị chặn bởi RLS)
    const { data: isDbLimited, error: rpcError } = await supabase.rpc(
      "check_inquiry_rate_limit",
      {
        p_email: email,
        p_phone: phone,
        p_window_minutes: 10,
        p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      }
    );

    if (!rpcError && isDbLimited === true) {
      return { success: false, error: msg.rateLimited };
    }

    // 7. Lưu bản ghi vào bảng inquiries
    const basePayload = {
      property_id: cleanPropertyId,
      full_name: fullName,
      email,
      phone,
      message,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("inquiries")
      .insert([{ ...basePayload, status: "pending" }]);

    if (error && error.code === "PGRST204") {
      const { error: retryError } = await supabase
        .from("inquiries")
        .insert([basePayload]);

      if (retryError) throw retryError;
    } else if (error) {
      throw error;
    }

    const propertySummary = cleanPropertyId
      ? await getPropertySummary(supabase, cleanPropertyId, lang)
      : null;

    // 8. Đẩy tác vụ gửi Gmail thông báo + xác nhận chạy ngầm
    after(async () => {
      try {
        await dispatchInquiryEmails({
          lang,
          propertyId: cleanPropertyId,
          propertySummary,
          fullName,
          email,
          phone,
          message,
        });
      } catch (mailErr) {
        console.error("Đã lưu DB nhưng gửi email chạy ngầm thất bại:", mailErr);
      }
    });

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error submitting inquiry:", err);
    return { success: false, error: msg.serverError };
  }
}

export async function updateInquiryProgressAction(
  id: string,
  status: InquiryStatus,
  adminNote?: string
) {
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: "ID yêu cầu không hợp lệ." };
    }

    if (!VALID_INQUIRY_STATUSES.includes(status)) {
      return { success: false, error: "Trạng thái cập nhật không hợp lệ." };
    }

    const supabase = await requireAdmin();

    const updateData: Record<string, unknown> = { status };
    if (typeof adminNote === "string") {
      updateData.admin_note = adminNote.trim().slice(0, 3000);
    }

    const { error } = await supabase
      .from("inquiries")
      .update(updateData)
      .eq("id", id);

    if (error && error.code === "PGRST204") {
      const { error: retryErr } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", id);
      if (retryErr) throw retryErr;
    } else if (error) {
      throw error;
    }

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Không thể cập nhật trạng thái khách hàng.";
    return { success: false, error: msg };
  }
}

export async function deleteInquiryAction(id: string) {
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: "ID yêu cầu không hợp lệ." };
    }

    const supabase = await requireAdmin();

    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Không thể xóa dữ liệu khách hàng.";
    return { success: false, error: msg };
  }
}