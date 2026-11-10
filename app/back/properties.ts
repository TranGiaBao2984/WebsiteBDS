import { supabase } from '@/lib/supabase';
import { cacheTag } from 'next/cache';
import type { Property } from '@/lib/types';

// Danh sách và thẻ chỉ cần các cột này. Trang chi tiết mới cần đủ bộ (select '*').
// Nếu thêm cột mới vào bảng và muốn hiện trên thẻ, nhớ thêm vào đây.
const CARD_COLUMNS =
  'id, title, price, location, layout, building_size, year_built, structure, current_status, images, created_at';

/** Toàn bộ danh sách cho trang /sanpham (lọc phía client). */
export async function getProperties(): Promise<Property[]> {
  'use cache';
  cacheTag('properties'); // trang admin gọi updateTag('properties') để làm mới
  const { data, error } = await supabase
    .from('properties')
    .select(CARD_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error.message);
    return [];
  }

  return (data as Property[]) || [];
}

/** Vài căn mới nhất cho trang chủ. */
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  'use cache';
  cacheTag('properties'); // trang admin gọi updateTag('properties') để làm mới
  const { data, error } = await supabase
    .from('properties')
    .select(CARD_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  return (data as Property[]) || [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  'use cache';
  cacheTag('properties'); // trang admin gọi updateTag('properties') để làm mới
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error(`Error fetching property ${id}:`, error?.message);
    return null;
  }

  return data as Property;
}

export async function getSimilarProperties(currentId: string, limit = 2): Promise<Property[]> {
  'use cache';
  cacheTag('properties'); // trang admin gọi updateTag('properties') để làm mới
  const { data, error } = await supabase
    .from('properties')
    .select(CARD_COLUMNS)
    .neq('id', currentId)
    .limit(limit);

  if (error) {
    console.error('Error fetching similar properties:', error.message);
    return [];
  }

  return (data as Property[]) || [];
}
