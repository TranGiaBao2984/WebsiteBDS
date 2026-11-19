"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { ImageCaptions, NearbyCategory, NearbyItem } from "@/lib/types";

const VALID_NEARBY_CATEGORIES: NearbyCategory[] = [
  "station",
  "beach",
  "supermarket",
  "restaurant",
  "convenience",
  "school",
  "hospital",
  "park",
  "airport",
  "other",
];

const JPY_TO_USD = 1 / 150;

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
      current = record.en ?? record.ja ?? Object.values(record)[0] ?? "";
    } else {
      break;
    }
  }

  return typeof current === "string" ? current : String(current || "");
}

function cleanLocalizedField(val: unknown): string | Record<string, string> {
  if (!val) return "";
  if (typeof val === "string") {
    return val.trim();
  }
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    const rec = val as Record<string, unknown>;
    const en = typeof rec.en === "string" ? rec.en.trim() : "";
    const ja = typeof rec.ja === "string" ? rec.ja.trim() : "";
    if (!en && !ja) return "";
    return { en, ja };
  }
  return cleanText(val);
}

function hasFieldContent(val: string | Record<string, string>): boolean {
  if (typeof val === "string") return val.trim().length > 0;
  return Boolean(val.en?.trim() || val.ja?.trim());
}

function toNullableString(val?: string | null): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullablePositiveNumber(val?: number | null): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function toNullableNonNegativeInt(val?: number | null): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : null;
}

function sanitizeNearbyList(items?: NearbyItem[]): NearbyItem[] {
  if (!Array.isArray(items)) return [];
  const result: NearbyItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const category: NearbyCategory = VALID_NEARBY_CATEGORIES.includes(item.category)
      ? item.category
      : "other";
    const name = cleanLocalizedField(item.name);
    const distance = cleanLocalizedField(item.distance);

    if (!hasFieldContent(name) && !hasFieldContent(distance)) continue;

    result.push({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : undefined,
      category,
      name,
      distance,
    });
  }

  return result;
}

// Chỉ giữ ghi chú của những ảnh còn tồn tại trong bài, bỏ ghi chú trống
function sanitizeImageCaptions(captions: ImageCaptions | undefined, urls: string[]): ImageCaptions {
  if (!captions || typeof captions !== "object") return {};
  const result: ImageCaptions = {};

  for (const url of urls) {
    const raw = captions[url];
    if (!raw || typeof raw !== "object") continue;
    const en = typeof raw.en === "string" ? raw.en.trim() : "";
    const ja = typeof raw.ja === "string" ? raw.ja.trim() : "";
    if (!en && !ja) continue;
    result[url] = { en, ja };
  }

  return result;
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
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Xoá bài thất bại";
    console.error("Error deleting property:", err);
    return { success: false, error: errorMessage };
  }
}

// --- Interface 2 ngôn ngữ (EN & JA) & Bộ lọc ---
export interface CreatePropertyInput {
  id?: string;
  titleEn: string;
  titleJa: string;
  descriptionEn?: string;
  descriptionJa?: string;
  locationEn: string;
  locationJa: string;
  mapAddress?: string;
  filterLocation?: string;
  filterPrice?: string;
  filterLayout?: string;
  propertyTypeEn: string;
  propertyTypeJa: string;
  priceEn?: number;
  priceJa: number;
  areaSqm?: number | null;
  buildingSize?: string | null;
  landSize?: string | null;
  layout?: string | null;
  structure?: string | null;
  yearBuilt?: number | null;
  parking?: string | null;
  landRights?: string | null;
  zoning?: string | null;
  access?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  images: string[];
  floorPlanImages?: string[];
  imageCaptions?: ImageCaptions;
  nearby?: NearbyItem[];
}

function buildPropertyPayload(input: CreatePropertyInput) {
  const cleanFloorPlans = Array.isArray(input.floorPlanImages)
    ? input.floorPlanImages.filter(Boolean)
    : [];
  const cleanNearby = sanitizeNearbyList(input.nearby);
  const cleanImageCaptions = sanitizeImageCaptions(input.imageCaptions, [
    ...(Array.isArray(input.images) ? input.images : []),
    ...cleanFloorPlans,
  ]);

  const title = {
    en: cleanText(input.titleEn),
    ja: cleanText(input.titleJa),
  };

  const rawJa = Number(input.priceJa) || 0;
  const rawEn = Number(input.priceEn) || 0;
  const priceJa =
    rawJa > 0 ? Math.round(rawJa) : rawEn > 0 ? Math.round(rawEn / JPY_TO_USD) : 0;
  const priceEn =
    rawEn > 0 ? Math.round(rawEn) : priceJa > 0 ? Math.round(priceJa * JPY_TO_USD) : 0;

  const description = {
    en: cleanText(input.descriptionEn),
    ja: cleanText(input.descriptionJa),
    price_en: priceEn,
    price_ja: priceJa,
    floor_plans: cleanFloorPlans,
    image_captions: cleanImageCaptions,
    map_address: cleanText(input.mapAddress),
    filter_location: cleanText(input.filterLocation),
    filter_price: cleanText(input.filterPrice),
    filter_layout: cleanText(input.filterLayout),
    nearby: cleanNearby,
  };

  const location = {
    en: cleanText(input.locationEn),
    ja: cleanText(input.locationJa),
  };

  const propertyType = {
    en: cleanText(input.propertyTypeEn),
    ja: cleanText(input.propertyTypeJa),
  };

  const serializedFloorPlans =
    cleanFloorPlans.length > 0 ? JSON.stringify(cleanFloorPlans) : null;

  return {
    title,
    description,
    location,
    property_type: propertyType,
    price: priceEn,
    price_yen: priceJa,
    area_sqm: toNullablePositiveNumber(input.areaSqm),
    building_size: toNullableString(input.buildingSize),
    land_size: toNullableString(input.landSize),
    layout: toNullableString(input.layout),
    structure: toNullableString(input.structure),
    year_built: toNullablePositiveNumber(input.yearBuilt),
    parking: toNullableString(input.parking),
    land_rights: toNullableString(input.landRights),
    zoning: toNullableString(input.zoning),
    access: toNullableString(input.access),
    bedrooms: toNullableNonNegativeInt(input.bedrooms),
    bathrooms: toNullableNonNegativeInt(input.bathrooms),
    images: Array.isArray(input.images) && input.images.length > 0 ? input.images : null,
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
    revalidatePath("/properties");
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