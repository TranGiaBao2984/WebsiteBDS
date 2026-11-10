"use server";

import { createClient } from "@/lib/supabase-server";

export interface SubmitInquiryInput {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

export async function submitInquiryAction(input: SubmitInquiryInput) {
  if (!input.fullName || !input.email || !input.phone) {
    return { success: false, error: "Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("inquiries").insert([
      {
        property_id: input.propertyId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        status: "pending",
        created_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Không thể gửi tư vấn. Vui lòng thử lại sau.";
    console.error("Error submitting inquiry:", err);
    return { success: false, error: errorMessage };
  }
}