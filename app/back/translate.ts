"use server";

export interface LocalizedField {
  vi: string;
  en: string;
  ja: string;
}

export async function autoTranslateText(text: string, sourceLang: string = "vi"): Promise<LocalizedField> {
  const fallback = { vi: text, en: text, ja: text };

  if (!text || !text.trim()) {
    return { vi: "", en: "", ja: "" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AutoTranslate] Thiếu GEMINI_API_KEY. Dùng bản dịch gốc.");
    return fallback;
  }

  const prompt = `You are a professional real estate translator for Japanese properties. Translate the text into Vietnamese (vi), English (en), and Japanese (ja).
Input text (${sourceLang}): "${text}"

Return ONLY a raw JSON object (without markdown formatting) with exact keys "vi", "en", "ja".`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!res.ok) {
      console.warn(`[AutoTranslate Warning] API Status ${res.status}. Sử dụng nội dung gốc.`);
      return fallback;
    }

    const data = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      return {
        vi: parsed.vi || text,
        en: parsed.en || text,
        ja: parsed.ja || text
      };
    }
  } catch (error) {
    console.error("[AutoTranslate Error]:", error);
  }

  return fallback;
}