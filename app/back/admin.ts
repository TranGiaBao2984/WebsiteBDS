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
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --- Chốt chặn xác thực & phân quyền Admin phía Server ---
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && (!user.email || !allowedEmails.includes(user.email.toLowerCase()))) {
    throw new Error("Forbidden: Tài khoản không có quyền quản trị.");
  }

  return supabase;
}

// Chỉ chấp nhận URL ảnh hợp lệ từ Supabase Storage của dự án
function sanitizeImageUrls(urls?: string[]): string[] {
  if (!Array.isArray(urls)) return [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return urls
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter((url) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") return false;
        if (supabaseUrl && !url.startsWith(supabaseUrl)) return false;
        return parsed.hostname.endsWith(".supabase.co");
      } catch {
        return false;
      }
    })
    .slice(0, 50); // Giới hạn tối đa 50 ảnh/bài
}

// Hàm làm sạch chuỗi và giới hạn độ dài chống payload quá tải
function cleanText(val: unknown, maxLength = 5000): string {
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

  const result = typeof current === "string" ? current : String(current || "");
  return result.slice(0, maxLength);
}

function cleanLocalizedField(val: unknown): string | Record<string, string> {
  if (!val) return "";
  if (typeof val === "string") {
    return val.trim().slice(0, 500);
  }
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    const rec = val as Record<string, unknown>;
    const en = typeof rec.en === "string" ? rec.en.trim().slice(0, 500) : "";
    const ja = typeof rec.ja === "string" ? rec.ja.trim().slice(0, 500) : "";
    if (!en && !ja) return "";
    return { en, ja };
  }
  return cleanText(val, 500);
}

function hasFieldContent(val: string | Record<string, string>): boolean {
  if (typeof val === "string") return val.trim().length > 0;
  return Boolean(val.en?.trim() || val.ja?.trim());
}

function toNullableString(val?: string | null, maxLength = 500): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim().slice(0, maxLength);
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

  for (const item of items.slice(0, 30)) {
    if (!item || typeof item !== "object") continue;
    const category: NearbyCategory = VALID_NEARBY_CATEGORIES.includes(item.category)
      ? item.category
      : "other";
    const name = cleanLocalizedField(item.name);
    const distance = cleanLocalizedField(item.distance);

    if (!hasFieldContent(name) && !hasFieldContent(distance)) continue;

    result.push({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim().slice(0, 100) : undefined,
      category,
      name,
      distance,
    });
  }

  return result;
}

function sanitizeImageCaptions(captions: ImageCaptions | undefined, urls: string[]): ImageCaptions {
  if (!captions || typeof captions !== "object") return {};
  const result: ImageCaptions = {};

  for (const url of urls) {
    const raw = captions[url];
    if (!raw || typeof raw !== "object") continue;
    const en = typeof raw.en === "string" ? raw.en.trim().slice(0, 500) : "";
    const ja = typeof raw.ja === "string" ? raw.ja.trim().slice(0, 500) : "";
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

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { error: "Vui lòng nhập đầy đủ Email và Mật khẩu." };
  }

  // Chặn sớm nếu email không nằm trong danh sách Admin được phép
  const allowedEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes(cleanEmail)) {
    return { error: "Email hoặc mật khẩu không chính xác." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (error) {
    // Trả thông báo chung chung để tránh lộ thông tin tài khoản tồn tại hay chưa
    return { error: "Email hoặc mật khẩu không chính xác." };
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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: "ID bài viết không hợp lệ." };
    }

    const supabase = await requireAdmin();
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
  const cleanImages = sanitizeImageUrls(input.images);
  const cleanFloorPlans = sanitizeImageUrls(input.floorPlanImages);
  const cleanNearby = sanitizeNearbyList(input.nearby);
  const cleanImageCaptions = sanitizeImageCaptions(input.imageCaptions, [
    ...cleanImages,
    ...cleanFloorPlans,
  ]);

  const title = {
    en: cleanText(input.titleEn, 300),
    ja: cleanText(input.titleJa, 300),
  };

  const rawJa = Number(input.priceJa) || 0;
  const rawEn = Number(input.priceEn) || 0;
  const priceJa =
    rawJa > 0 ? Math.round(rawJa) : rawEn > 0 ? Math.round(rawEn / JPY_TO_USD) : 0;
  const priceEn =
    rawEn > 0 ? Math.round(rawEn) : priceJa > 0 ? Math.round(priceJa * JPY_TO_USD) : 0;

  const description = {
    en: cleanText(input.descriptionEn, 10000),
    ja: cleanText(input.descriptionJa, 10000),
    price_en: priceEn,
    price_ja: priceJa,
    floor_plans: cleanFloorPlans,
    image_captions: cleanImageCaptions,
    map_address: cleanText(input.mapAddress, 500),
    filter_location: cleanText(input.filterLocation, 200),
    filter_price: cleanText(input.filterPrice, 200),
    filter_layout: cleanText(input.filterLayout, 200),
    nearby: cleanNearby,
  };

  const location = {
    en: cleanText(input.locationEn, 300),
    ja: cleanText(input.locationJa, 300),
  };

  const propertyType = {
    en: cleanText(input.propertyTypeEn, 200),
    ja: cleanText(input.propertyTypeJa, 200),
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
    building_size: toNullableString(input.buildingSize, 200),
    land_size: toNullableString(input.landSize, 200),
    layout: toNullableString(input.layout, 100),
    structure: toNullableString(input.structure, 200),
    year_built: toNullablePositiveNumber(input.yearBuilt),
    parking: toNullableString(input.parking, 200),
    land_rights: toNullableString(input.landRights, 200),
    zoning: toNullableString(input.zoning, 200),
    access: toNullableString(input.access, 500),
    bedrooms: toNullableNonNegativeInt(input.bedrooms),
    bathrooms: toNullableNonNegativeInt(input.bathrooms),
    images: cleanImages.length > 0 ? cleanImages : null,
    floor_plan: serializedFloorPlans,
    floor_plan_url: serializedFloorPlans,
  };
}

// --- Action Đăng Bài Bất Động Sản ---
export async function createPropertyAction(input: CreatePropertyInput) {
  try {
    const supabase = await requireAdmin();

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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: "ID bài viết không hợp lệ." };
    }

    const supabase = await requireAdmin();
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