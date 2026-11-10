"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { autoTranslateText } from "./translate";

// --- Action Đăng nhập Admin ---
export async function signIn(prevStateOrFormData: unknown, formDataParam?: FormData) {
  let email = "";
  let password = "";

  if (formDataParam instanceof FormData) {
    email = (formDataParam.get("email") as string) || "";
    password = (formDataParam.get("password") as string) || "";
  } else if (prevStateOrFormData instanceof FormData) {
    email = (prevStateOrFormData.get("email") as string) || "";
    password = (prevStateOrFormData.get("password") as string) || "";
  } else if (typeof prevStateOrFormData === "object" && prevStateOrFormData !== null) {
    const record = prevStateOrFormData as Record<string, unknown>;
    email = typeof record.email === "string" ? record.email : "";
    password = typeof record.password === "string" ? record.password : "";
  }

  if (!email.trim() || !password.trim()) {
    return { error: "Vui lòng nhập đầy đủ Email và Mật khẩu." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

// --- Action Đăng xuất Admin ---
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

// --- Action Xoá Bài Bất Động Sản ---
export async function deleteProperty(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      throw new Error(`DB Delete Error: ${error.message}`);
    }

    revalidatePath("/admin");
    revalidatePath("/properties");
    revalidatePath("/sanpham");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Xoá bài thất bại";
    console.error("Error deleting property:", err);
    return { success: false, error: errorMessage };
  }
}

// --- Interface Đầy đủ tất cả trường BĐS ---
export interface CreatePropertyInput {
  id?: string;
  titleRaw: string;
  descriptionRaw: string;
  locationRaw: string;
  priceYen: number;
  priceVnd?: number;
  areaSqm: number;
  buildingSize?: string;
  landSize?: string;
  layout?: string;
  structure?: string;
  yearBuilt?: number;
  parking?: string;
  landRights?: string;
  zoning?: string;
  access?: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  images: string[];
  floorPlanUrl?: string;
}

// --- Action Đăng Bài Bất Động Sản ---
export async function createPropertyAction(input: CreatePropertyInput) {
  try {
    const supabase = await createClient();

    // Dịch tự động các trường văn bản sang 3 ngôn ngữ (VI - EN - JA)
    const [title, description, location] = await Promise.all([
      autoTranslateText(input.titleRaw, "vi"),
      autoTranslateText(input.descriptionRaw, "vi"),
      autoTranslateText(input.locationRaw, "vi")
    ]);

    const payload = {
      title,
      description,
      location,
      price: input.priceYen,
      price_yen: input.priceYen,
      price_vnd: input.priceVnd || Math.round(input.priceYen * 165),
      area_sqm: input.areaSqm,
      building_size: input.buildingSize || `${input.areaSqm} m²`,
      land_size: input.landSize || null,
      layout: input.layout || "2LDK",
      structure: input.structure || "RC (Bê tông cốt thép)",
      year_built: input.yearBuilt || new Date().getFullYear(),
      parking: input.parking || "Có",
      land_rights: input.landRights || "Sở hữu vĩnh viễn (Ownership)",
      zoning: input.zoning || "Khu dân cư",
      access: input.access || "Cách ga 5 phút đi bộ",
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      property_type: input.propertyType,
      images: input.images,
      floor_plan: input.floorPlanUrl || input.images[0] || null,
      floor_plan_url: input.floorPlanUrl || input.images[0] || null,
      status: "available",
      current_status: "available",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from("properties").insert([payload]).select().single();

    if (error) {
      throw new Error(`DB Insert Error: ${error.message}`);
    }

    revalidatePath("/admin");
    revalidatePath("/properties");
    revalidatePath("/sanpham");
    revalidatePath("/");

    return { success: true, propertyId: data.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Đăng bài thất bại";
    console.error("Error creating property:", err);
    return { success: false, error: errorMessage };
  }
}

// --- Action Cập Nhật Bài Bất Động Sản ---
export async function updatePropertyAction(id: string, input: CreatePropertyInput) {
  try {
    const supabase = await createClient();

    const [title, description, location] = await Promise.all([
      autoTranslateText(input.titleRaw, "vi"),
      autoTranslateText(input.descriptionRaw, "vi"),
      autoTranslateText(input.locationRaw, "vi")
    ]);

    const payload = {
      title,
      description,
      location,
      price: input.priceYen,
      price_yen: input.priceYen,
      price_vnd: input.priceVnd || Math.round(input.priceYen * 165),
      area_sqm: input.areaSqm,
      building_size: input.buildingSize || `${input.areaSqm} m²`,
      land_size: input.landSize || null,
      layout: input.layout || "2LDK",
      structure: input.structure || "RC (Bê tông cốt thép)",
      year_built: input.yearBuilt || new Date().getFullYear(),
      parking: input.parking || "Có",
      land_rights: input.landRights || "Sở hữu vĩnh viễn (Ownership)",
      zoning: input.zoning || "Khu dân cư",
      access: input.access || "Cách ga 5 phút đi bộ",
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      property_type: input.propertyType,
      images: input.images,
      floor_plan: input.floorPlanUrl || input.images[0] || null,
      floor_plan_url: input.floorPlanUrl || input.images[0] || null,
    };

    const { data, error } = await supabase.from("properties").update(payload).eq("id", id).select().single();

    if (error) {
      throw new Error(`DB Update Error: ${error.message}`);
    }

    revalidatePath("/admin");
    revalidatePath(`/properties/${id}`);
    revalidatePath("/properties");
    revalidatePath("/sanpham");
    revalidatePath("/");

    return { success: true, propertyId: data.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Cập nhật bài thất bại";
    console.error("Error updating property:", err);
    return { success: false, error: errorMessage };
  }
}

// --- Action Save Tổng Hợp (Tự động nhận diện Tạo mới hoặc Cập nhật) ---
export async function saveProperty(input: CreatePropertyInput) {
  if (input.id) {
    return updatePropertyAction(input.id, input);
  }
  return createPropertyAction(input);
}