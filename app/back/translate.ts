"use server";

export interface LocalizedField {
  vi: string;
  en: string;
  ja: string;
}

export async function autoTranslateText(text: string): Promise<LocalizedField> {
  if (!text) return { vi: "", en: "", ja: "" };
  return {
    vi: text,
    en: text,
    ja: text,
  };
}