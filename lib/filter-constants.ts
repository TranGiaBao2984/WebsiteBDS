export interface FilterOptionsData {
  locations: string[];
  prices: string[];
  layouts: string[];
}

export const DEFAULT_FILTER_OPTIONS: FilterOptionsData = {
  locations: [
    "Tokyo",
    "Chiba",
    "Kyoto",
    "Osaka",
    "Kanagawa",
    "Nagano",
    "Fukuoka",
    "Hokkaido",
  ],
  prices: ["< ¥3M", "¥3–5M", "¥5–10M", "¥10–20M", "≥ ¥20M"],
  layouts: ["1K / 1LDK", "2LDK / 3LDK", "KOMINKA (TRADITIONAL)"],
};