"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import {
  DEFAULT_FILTER_OPTIONS,
  type FilterOptionsData,
} from "@/lib/filter-constants";

const SETTINGS_KEY = "property_filter_options";

export async function getFilterOptions(): Promise<FilterOptionsData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
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

export async function saveFilterOptions(options: FilterOptionsData) {
  try {
    const supabase = await createClient();

    const cleanOptions: FilterOptionsData = {
      locations: options.locations.map((s) => s.trim()).filter(Boolean),
      prices: options.prices.map((s) => s.trim()).filter(Boolean),
      layouts: options.layouts.map((s) => s.trim()).filter(Boolean),
    };

    const { error } = await supabase.from("site_settings").upsert(
      {
        key: SETTINGS_KEY,
        value: cleanOptions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/properties");
    revalidatePath("/properties");
    revalidatePath("/");

    return { success: true, data: cleanOptions };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lưu bộ lọc thất bại";
    return { success: false, error: msg };
  }
}