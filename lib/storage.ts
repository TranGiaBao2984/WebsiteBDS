// Dùng được cả ở server lẫn trình duyệt.

export const IMAGE_BUCKET = 'property-images';

/**
 * Nếu url là ảnh nằm trong bucket của mình thì trả về đường dẫn file trong bucket,
 * ngược lại (ảnh dán link từ nơi khác) trả về null để không đụng tới.
 */
export function storagePathFromUrl(url: string): string | null {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  if (!url.startsWith(base)) return null;
  const path = decodeURIComponent(url.slice(base.length).split('?')[0]);
  return path || null;
}
