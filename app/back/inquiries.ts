"use server";

import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase-server";

export type InquiryStatus = "pending" | "consulting" | "paid" | "cancelled";

export interface SubmitInquiryInput {
  propertyId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
}

interface PropertySummary {
  titleText: string;
  priceText: string;
  url: string;
}

function extractLocalizedTitle(rawTitle: unknown): string {
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
    const parts = [rec.vi, rec.en, rec.ja]
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .map((v) => v.trim());
    return Array.from(new Set(parts)).join(" / ");
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
  propertyId: string
): Promise<PropertySummary | null> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, price, price_yen")
      .eq("id", propertyId)
      .maybeSingle();

    if (error || !data) return null;

    const titleText = extractLocalizedTitle(data.title) || `BĐS #${propertyId}`;
    const yen = Number(data.price_yen || data.price || 0);
    const priceText = yen > 0 ? `¥${yen.toLocaleString("en-US")}` : "";
    const baseUrl = getSiteBaseUrl();

    return {
      titleText,
      priceText,
      url: `${baseUrl}/properties/${propertyId}`,
    };
  } catch {
    return null;
  }
}

async function sendGmailNotification(data: {
  propertyId: string | null;
  propertySummary: PropertySummary | null;
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const notifyTo = process.env.AGENT_NOTIFY_EMAIL || gmailUser;

  if (!gmailUser || !gmailPass || !notifyTo) {
    console.warn("Thiếu cấu hình GMAIL_USER hoặc GMAIL_APP_PASSWORD trong .env.local.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass.replace(/\s+/g, ""),
    },
  });

  const subject = data.propertySummary
    ? `[RE AGENT] Khách ${data.fullName} hỏi về: ${data.propertySummary.titleText}`
    : `[RE AGENT] Yêu cầu tư vấn BĐS mới từ ${data.fullName}`;

  const propertySectionHtml = data.propertySummary
    ? `
      <tr>
        <td style="padding: 8px 0; color: #475569; vertical-align: top;"><strong>BĐS quan tâm:</strong></td>
        <td style="padding: 8px 0; color: #134E4A;">
          <div style="font-weight: bold; color: #0F766E;">${data.propertySummary.titleText}</div>
          ${
            data.propertySummary.priceText
              ? `<div style="font-size: 13px; color: #475569; margin-top: 2px;">Giá niêm yết: <strong style="color: #134E4A;">${data.propertySummary.priceText}</strong></div>`
              : ""
          }
          <div style="margin-top: 8px;">
            <a href="${data.propertySummary.url}" target="_blank" style="display: inline-block; padding: 8px 14px; background-color: #0369A1; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold;">
              Xem chi tiết căn nhà trên Website →
            </a>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 5px;">ID: ${data.propertyId}</div>
        </td>
      </tr>
    `
    : data.propertyId
    ? `
      <tr>
        <td style="padding: 8px 0; color: #475569;"><strong>Mã BĐS:</strong></td>
        <td style="padding: 8px 0; color: #134E4A;">${data.propertyId}</td>
      </tr>
    `
    : "";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #134E4A; max-width: 600px; border: 1px solid #99F6E4; border-radius: 14px; padding: 24px; background-color: #ffffff;">
      <p style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #0F766E; text-transform: uppercase; margin: 0 0 6px 0;">
        RE AGENT by Re iDea • Global Property Advisor
      </p>
      <h2 style="color: #134E4A; border-bottom: 1px solid #99F6E4; padding-bottom: 12px; margin-top: 0;">
        Yêu Cầu Tư Vấn Bất Động Sản Mới
      </h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 0; color: #475569; width: 150px;"><strong>Khách hàng:</strong></td>
          <td style="padding: 8px 0; color: #134E4A;">${data.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569;"><strong>Email liên hệ:</strong></td>
          <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #0369A1; font-weight: 600;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569;"><strong>Điện thoại:</strong></td>
          <td style="padding: 8px 0; color: #134E4A;">${data.phone}</td>
        </tr>
        ${propertySectionHtml}
      </table>

      <p style="font-size: 14px; font-weight: bold; color: #134E4A; margin-bottom: 6px;">Lời nhắn tư vấn:</p>
      <div style="background: #F0FDFA; padding: 14px 16px; border-radius: 10px; border: 1px solid #99F6E4; font-size: 14px; color: #134E4A;">
        ${data.message ? data.message.replace(/\n/g, "<br/>") : "<em>(Khách không để lại lời nhắn thêm)</em>"}
      </div>

      <p style="font-size: 12px; color: #64748B; margin-top: 20px; border-top: 1px solid #E2E8F0; padding-top: 12px;">
        Bạn có thể bấm trực tiếp nút <strong>Trả lời (Reply)</strong> trên email này để phản hồi cho khách hàng (${data.email}).
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"RE AGENT by Re iDea" <${gmailUser}>`,
    to: notifyTo,
    replyTo: data.email,
    subject,
    html: htmlContent,
  });
}

export async function submitInquiryAction(input: SubmitInquiryInput) {
  const fullName = input.fullName?.trim() || "";
  const email = input.email?.trim() || "";
  const phone = input.phone?.trim() || "";
  const message = input.message?.trim() || "";
  const cleanPropertyId =
    input.propertyId && input.propertyId.trim() !== ""
      ? input.propertyId.trim()
      : null;

  if (!fullName || !email || !phone) {
    return {
      success: false,
      error: "Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.",
    };
  }

  try {
    const supabase = await createClient();

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
      ? await getPropertySummary(supabase, cleanPropertyId)
      : null;

    try {
      await sendGmailNotification({
        propertyId: cleanPropertyId,
        propertySummary,
        fullName,
        email,
        phone,
        message,
      });
    } catch (mailErr) {
      console.error("Đã lưu DB nhưng gửi Gmail thất bại:", mailErr);
    }

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Không thể gửi tư vấn. Vui lòng thử lại sau.";
    console.error("Error submitting inquiry:", err);
    return { success: false, error: errorMessage };
  }
}

export async function updateInquiryProgressAction(
  id: string,
  status: InquiryStatus,
  adminNote?: string
) {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status };
    if (typeof adminNote === "string") {
      updateData.admin_note = adminNote;
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
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Không thể cập nhật trạng thái khách hàng.";
    return { success: false, error: msg };
  }
}

export async function deleteInquiryAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Không thể xóa dữ liệu khách hàng.";
    return { success: false, error: msg };
  }
}