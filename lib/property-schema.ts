// Kiểu dữ liệu form + hàm kiểm tra phía server cho trang admin.
// Server Action có thể bị gọi với dữ liệu bất kỳ, nên mọi thứ đều phải kiểm tra lại ở đây.

/** Giá trị form: tất cả là chuỗi (đúng như người dùng gõ), trừ danh sách ảnh. */
export type PropertyInput = {
  title: string;
  price: string;
  location: string;
  current_status: string;
  layout: string;
  structure: string;
  building_size: string;
  land_size: string;
  year_built: string;
  parking: string;
  land_rights: string;
  zoning: string;
  access: string;
  description: string;
  images: string[];
  floor_plan: string;
};

/** Dòng ghi xuống bảng properties. */
export type PropertyRow = {
  title: string;
  price: number;
  location: string;
  current_status: string | null;
  layout: string | null;
  structure: string | null;
  building_size: string | null;
  land_size: string | null;
  year_built: number | null;
  parking: string | null;
  land_rights: string | null;
  zoning: string | null;
  access: string | null;
  description: string | null;
  images: string[];
  floor_plan: string | null;
};

export type FieldErrors = Partial<Record<keyof PropertyInput, string>>;

export const MAX_IMAGES = 30;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const opt = (v: unknown, max: number) => str(v, max) || null;

function isHttpUrl(s: string): boolean {
  if (s.length > 2000) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function parsePropertyInput(
  raw: unknown
): { ok: true; row: PropertyRow } | { ok: false; errors: FieldErrors } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const title = str(r.title, 200);
  if (!title) errors.title = 'Vui lòng nhập tiêu đề.';

  const location = str(r.location, 200);
  if (!location) errors.location = 'Vui lòng nhập địa điểm.';

  // Giá: chấp nhận "25,000,000" hoặc "¥25000000"
  const priceText = typeof r.price === 'string' || typeof r.price === 'number' ? String(r.price) : '';
  const price = Number(priceText.replace(/[,\s¥]/g, ''));
  if (!priceText.trim() || !Number.isInteger(price) || price < 0 || price > 1_000_000_000_000) {
    errors.price = 'Giá phải là số nguyên (yên), ví dụ 25000000.';
  }

  let year_built: number | null = null;
  const yearText = str(r.year_built, 10);
  if (yearText) {
    const y = Number(yearText);
    const maxYear = new Date().getFullYear() + 2;
    if (!Number.isInteger(y) || y < 1600 || y > maxYear) {
      errors.year_built = `Năm xây phải nằm trong khoảng 1600 đến ${maxYear}.`;
    } else {
      year_built = y;
    }
  }

  const imagesRaw = Array.isArray(r.images) ? r.images : [];
  const images = imagesRaw.filter((u): u is string => typeof u === 'string').map((u) => u.trim()).filter(Boolean);
  if (images.length > MAX_IMAGES) {
    errors.images = `Tối đa ${MAX_IMAGES} ảnh.`;
  } else if (!images.every(isHttpUrl)) {
    errors.images = 'Có ảnh không hợp lệ. Hãy xoá ảnh đó và thêm lại.';
  }

  const floor_plan = str(r.floor_plan, 2000);
  if (floor_plan && !isHttpUrl(floor_plan)) errors.floor_plan = 'Ảnh mặt bằng không hợp lệ.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    row: {
      title,
      price,
      location,
      current_status: opt(r.current_status, 100),
      layout: opt(r.layout, 100),
      structure: opt(r.structure, 200),
      building_size: opt(r.building_size, 100),
      land_size: opt(r.land_size, 100),
      year_built,
      parking: opt(r.parking, 200),
      land_rights: opt(r.land_rights, 200),
      zoning: opt(r.zoning, 300),
      access: opt(r.access, 500),
      description: opt(r.description, 10000),
      images,
      floor_plan: floor_plan || null,
    },
  };
}
