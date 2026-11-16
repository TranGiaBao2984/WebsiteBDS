// Dùng được cả ở server lẫn trình duyệt.

export const IMAGE_BUCKET = 'property-images';

function getStoragePublicBase(): string {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  return `${supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/`;
}

/**
 * Nếu url là ảnh nằm trong bucket của mình thì trả về đường dẫn file trong bucket,
 * ngược lại (ảnh dán link từ nơi khác) trả về null để không đụng tới.
 */
export function storagePathFromUrl(url: string): string | null {
  const base = getStoragePublicBase();
  if (!base.startsWith('http') || !url.startsWith(base)) return null;
  const path = decodeURIComponent(url.slice(base.length).split('?')[0]);
  return path || null;
}

export function isManagedStorageUrl(url: string): boolean {
  return storagePathFromUrl(url) !== null;
}