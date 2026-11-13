"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

// Hàm làm sạch chuỗi trước khi lưu vào Database, tránh lồng JSON nhiều lần
function cleanText(val: unknown): string {
  if (!val) return "";
  let current: unknown = val;

  for (let i = 0; i < 10; i++) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          current = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      } else {
        break;
      }
    } else if (typeof current === "object" && current !== null) {
      const record = current as Record<string, unknown>;
      current = record.vi ?? record.en ?? record.ja ?? Object.values(record)[0] ?? "";
    } else {
      break;
    }
  }

  return typeof current === "string" ? current : String(current || "");
}

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

    revalidatePath("/admin", "layout");
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

// --- Interface Đầy đủ 3 ngôn ngữ & Bộ lọc ---
export interface CreatePropertyInput {
  id?: string;
  titleVi: string;
  titleEn: string;
  titleJa: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionJa: string;
  locationVi: string;
  locationEn: string;
  locationJa: string;
  mapAddress?: string;
  filterLocation?: string;
  filterPrice?: string;
  filterLayout?: string;
  propertyTypeVi: string;
  propertyTypeEn: string;
  propertyTypeJa: string;
  priceVi: number;
  priceEn: number;
  priceJa: number;
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
  images: string[];
  floorPlanImages?: string[];
}

function buildPropertyPayload(input: CreatePropertyInput) {
  const cleanFloorPlans = Array.isArray(input.floorPlanImages)
    ? input.floorPlanImages.filter(Boolean)
    : [];

  const title = {
    vi: cleanText(input.titleVi),
    en: cleanText(input.titleEn),
    ja: cleanText(input.titleJa),
  };

  const description = {
    vi: cleanText(input.descriptionVi),
    en: cleanText(input.descriptionEn),
    ja: cleanText(input.descriptionJa),
    price_vi: Number(input.priceVi) || 0,
    price_en: Number(input.priceEn) || 0,
    price_ja: Number(input.priceJa) || 0,
    floor_plans: cleanFloorPlans,
    map_address: cleanText(input.mapAddress),
    filter_location: cleanText(input.filterLocation),
    filter_price: cleanText(input.filterPrice),
    filter_layout: cleanText(input.filterLayout),
  };

  const location = {
    vi: cleanText(input.locationVi),
    en: cleanText(input.locationEn),
    ja: cleanText(input.locationJa),
  };

  const propertyType = {
    vi: cleanText(input.propertyTypeVi),
    en: cleanText(input.propertyTypeEn),
    ja: cleanText(input.propertyTypeJa),
  };

  const priceJa = Number(input.priceJa) || 0;
  const priceVi = Number(input.priceVi) || 0;
  const serializedFloorPlans = cleanFloorPlans.length > 0 ? JSON.stringify(cleanFloorPlans) : null;

  return {
    title,
    description,
    location,
    property_type: propertyType,
    price: priceJa,
    price_yen: priceJa,
    price_vnd: priceVi,
    area_sqm: input.areaSqm,
    building_size: input.buildingSize || `${input.areaSqm} m²`,
    land_size: input.landSize || null,
    layout: input.layout || input.filterLayout || "2LDK",
    structure: input.structure || "RC (Bê tông cốt thép)",
    year_built: input.yearBuilt || new Date().getFullYear(),
    parking: input.parking || "Có",
    land_rights: input.landRights || "Sở hữu vĩnh viễn (Ownership)",
    zoning: input.zoning || "Khu dân cư",
    access: input.access || "Cách ga 5 phút đi bộ",
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    images: input.images,
    floor_plan: serializedFloorPlans,
    floor_plan_url: serializedFloorPlans,
  };
}

// --- Action Đăng Bài Bất Động Sản ---
export async function createPropertyAction(input: CreatePropertyInput) {
  try {
    const supabase = await createClient();

    const payload = {
      ...buildPropertyPayload(input),
      status: "available",
      current_status: "available",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("properties").insert([payload]).select().single();

    if (error) {
      throw new Error(`DB Insert Error: ${error.message}`);
    }

    revalidatePath("/admin", "layout");
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
    const payload = buildPropertyPayload(input);

    const { data, error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`DB Update Error: ${error.message}`);
    }

    revalidatePath("/admin", "layout");
    revalidatePath(`/properties/${id}`);
    revalidatePath(`/sanpham/${id}`);
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

// --- Action Save Tổng Hợp ---
export async function saveProperty(input: CreatePropertyInput) {
  if (input.id) {
    return updatePropertyAction(input.id, input);
  }
  return createPropertyAction(input);
}