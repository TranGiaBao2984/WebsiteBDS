'use server';

import { cacheTag, revalidatePath, updateTag } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';
import {
  DEFAULT_FILTER_OPTIONS,
  type FilterOptionsData,
} from '@/lib/filter-constants';

const SETTINGS_KEY = 'property_filter_options';

function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Hàm nội bộ (không export) để dùng 'use cache' mà không xung đột với 'use server'
async function readCachedFilterOptions(): Promise<FilterOptionsData> {
  'use cache';
  cacheTag('filter-options');

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_FILTER_OPTIONS;
    }

    const val = data.value as Partial<FilterOptionsData>;
    return {
      locations:
        Array.isArray(val.locations) && val.locations.length > 0
          ? val.locations
          : DEFAULT_FILTER_OPTIONS.locations,
      prices:
        Array.isArray(val.prices) && val.prices.length > 0
          ? val.prices
          : DEFAULT_FILTER_OPTIONS.prices,
      layouts:
        Array.isArray(val.layouts) && val.layouts.length > 0
          ? val.layouts
          : DEFAULT_FILTER_OPTIONS.layouts,
    };
  } catch {
    return DEFAULT_FILTER_OPTIONS;
  }
}

export async function getFilterOptions(): Promise<FilterOptionsData> {
  return readCachedFilterOptions();
}

export async function saveFilterOptions(options: FilterOptionsData) {
  try {
    const supabase = await createClient();

    const cleanOptions: FilterOptionsData = {
      locations: options.locations.map((s) => s.trim()).filter(Boolean),
      prices: options.prices.map((s) => s.trim()).filter(Boolean),
      layouts: options.layouts.map((s) => s.trim()).filter(Boolean),
    };

    const { error } = await supabase.from('site_settings').upsert(
      {
        key: SETTINGS_KEY,
        value: cleanOptions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      throw new Error(error.message);
    }

    updateTag('filter-options');
    revalidatePath('/admin');
    revalidatePath('/properties');
    revalidatePath('/');

    return { success: true, data: cleanOptions };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lưu bộ lọc thất bại';
    return { success: false, error: msg };
  }
}