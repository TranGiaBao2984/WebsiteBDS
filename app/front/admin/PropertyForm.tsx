"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProperty } from "@/app/back/admin";
import { getFilterOptions, saveFilterOptions } from "@/app/back/filter-options";
import {
  DEFAULT_FILTER_OPTIONS,
  type FilterOptionsData,
} from "@/lib/filter-constants";
import type { NearbyCategory, NearbyItem, Property } from "@/lib/types";
import ImageUploader from "./ImageUploader";

interface PropertyFormProps {
  property?: Property;
}

type FilterGroupKey = "locations" | "prices" | "layouts";

interface NearbyDraftItem {
  id: string;
  category: NearbyCategory;
  isMultilingual: boolean;
  nameVi: string;
  nameEn: string;
  nameJa: string;
  distanceVi: string;
  distanceEn: string;
  distanceJa: string;
}

const NEARBY_CATEGORY_OPTIONS: {
  value: NearbyCategory;
  label: string;
  sampleName: string;
  sampleDistance: string;
}[] = [
  {
    value: "station",
    label: "Ga tàu / Trạm giao thông",
    sampleName: "JR Awa-Kamogawa Station",
    sampleDistance: "15 min by car",
  },
  {
    value: "beach",
    label: "Biển / Thiên nhiên",
    sampleName: "Beaches",
    sampleDistance: "10–15 min by car",
  },
  {
    value: "supermarket",
    label: "Siêu thị / TTTM",
    sampleName: "Supermarket",
    sampleDistance: "8 min by car",
  },
  {
    value: "restaurant",
    label: "Nhà hàng / Cửa hàng",
    sampleName: "Local shops & restaurants",
    sampleDistance: "10 min by car",
  },
  {
    value: "convenience",
    label: "Cửa hàng tiện lợi (Konbini)",
    sampleName: "7-Eleven / Lawson",
    sampleDistance: "3 min walk",
  },
  {
    value: "school",
    label: "Trường học",
    sampleName: "Elementary School",
    sampleDistance: "12 min walk",
  },
  {
    value: "hospital",
    label: "Bệnh viện / Phòng khám",
    sampleName: "General Hospital",
    sampleDistance: "10 min by car",
  },
  {
    value: "park",
    label: "Công viên",
    sampleName: "Central Park",
    sampleDistance: "5 min walk",
  },
  {
    value: "airport",
    label: "Sân bay",
    sampleName: "Haneda / Narita Airport",
    sampleDistance: "45 min by train",
  },
  {
    value: "other",
    label: "Địa điểm lân cận khác",
    sampleName: "",
    sampleDistance: "",
  },
];

function detectPriceBucket(yenAmount: number, priceOptions: string[]): string {
  if (!yenAmount || yenAmount <= 0) return "";
  let candidate = "";
  if (yenAmount < 3_000_000) candidate = "< ¥3M";
  else if (yenAmount <= 5_000_000) candidate = "¥3–5M";
  else if (yenAmount <= 10_000_000) candidate = "¥5–10M";
  else if (yenAmount <= 20_000_000) candidate = "¥10–20M";
  else candidate = "≥ ¥20M";

  return priceOptions.includes(candidate) ? candidate : "";
}

function unwrapJson(val: unknown): unknown {
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
      }
    }
    break;
  }
  return current;
}

function getLangText(val: unknown, lang: "vi" | "en" | "ja"): string {
  if (!val) return "";
  const unwrapped = unwrapJson(val);

  if (typeof unwrapped === "object" && unwrapped !== null && !Array.isArray(unwrapped)) {
    const record = unwrapped as Record<string, unknown>;
    const langVal = record[lang];
    if (typeof langVal === "string") {
      const inner = unwrapJson(langVal);
      if (typeof inner === "object" && inner !== null && !Array.isArray(inner)) {
        const innerRec = inner as Record<string, unknown>;
        return typeof innerRec[lang] === "string" ? innerRec[lang] : "";
      }
      return typeof inner === "string" ? inner : "";
    }
    return "";
  }

  if (typeof unwrapped === "string") {
    return lang === "vi" ? unwrapped : "";
  }

  return "";
}

function parseSavedNearby(property?: Property): NearbyDraftItem[] {
  if (!property) return [];
  let rawList: unknown = property.nearby;

  if (!Array.isArray(rawList)) {
    const descObj = unwrapJson(property.description);
    if (typeof descObj === "object" && descObj !== null && !Array.isArray(descObj)) {
      rawList = (descObj as Record<string, unknown>).nearby;
    }
  }

  const unwrappedList = unwrapJson(rawList);
  if (!Array.isArray(unwrappedList)) return [];

  return unwrappedList
    .map((entry, index): NearbyDraftItem | null => {
      if (!entry || typeof entry !== "object") return null;
      const rec = entry as Record<string, unknown>;
      const rawCat = String(rec.category || "other") as NearbyCategory;
      const validCat = NEARBY_CATEGORY_OPTIONS.some((o) => o.value === rawCat)
        ? rawCat
        : "other";

      const nameVal = unwrapJson(rec.name);
      const distVal = unwrapJson(rec.distance);

      let nameVi = "";
      let nameEn = "";
      let nameJa = "";
      let hasMultiName = false;

      if (typeof nameVal === "object" && nameVal !== null && !Array.isArray(nameVal)) {
        const nRec = nameVal as Record<string, unknown>;
        nameVi = typeof nRec.vi === "string" ? nRec.vi : "";
        nameEn = typeof nRec.en === "string" ? nRec.en : "";
        nameJa = typeof nRec.ja === "string" ? nRec.ja : "";
        const nonEmpty = [nameVi, nameEn, nameJa].filter(Boolean);
        hasMultiName = new Set(nonEmpty).size > 1;
        if (!hasMultiName && nonEmpty.length > 0) {
          const shared = nonEmpty[0];
          nameVi = shared;
          nameEn = shared;
          nameJa = shared;
        }
      } else if (typeof nameVal === "string") {
        nameVi = nameVal;
        nameEn = nameVal;
        nameJa = nameVal;
      }

      let distanceVi = "";
      let distanceEn = "";
      let distanceJa = "";
      let hasMultiDist = false;

      if (typeof distVal === "object" && distVal !== null && !Array.isArray(distVal)) {
        const dRec = distVal as Record<string, unknown>;
        distanceVi = typeof dRec.vi === "string" ? dRec.vi : "";
        distanceEn = typeof dRec.en === "string" ? dRec.en : "";
        distanceJa = typeof dRec.ja === "string" ? dRec.ja : "";
        const nonEmpty = [distanceVi, distanceEn, distanceJa].filter(Boolean);
        hasMultiDist = new Set(nonEmpty).size > 1;
        if (!hasMultiDist && nonEmpty.length > 0) {
          const shared = nonEmpty[0];
          distanceVi = shared;
          distanceEn = shared;
          distanceJa = shared;
        }
      } else if (typeof distVal === "string") {
        distanceVi = distVal;
        distanceEn = distVal;
        distanceJa = distVal;
      }

      return {
        id: typeof rec.id === "string" && rec.id ? rec.id : `nearby-init-${index}`,
        category: validCat,
        isMultilingual: hasMultiName || hasMultiDist,
        nameVi,
        nameEn,
        nameJa,
        distanceVi,
        distanceEn,
        distanceJa,
      };
    })
    .filter((item): item is NearbyDraftItem => item !== null);
}

function getSavedPrice(property: Property | undefined, lang: "vi" | "en" | "ja"): number | "" {
  if (!property) return "";
  const descObj = unwrapJson(property.description);

  if (typeof descObj === "object" && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    const key = `price_${lang}`;
    if (typeof record[key] === "number" && record[key] > 0) {
      return record[key];
    }
  }

  if (lang === "ja") {
    const jaVal = property.price_yen || property.price;
    return jaVal && jaVal > 0 ? jaVal : "";
  }
  if (lang === "vi") {
    return property.price_vnd && property.price_vnd > 0 ? property.price_vnd : "";
  }

  return "";
}

function getSavedMapAddress(property?: Property): string {
  if (!property) return "";
  const descObj = unwrapJson(property.description);

  if (typeof descObj === "object" && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    if (typeof record.map_address === "string") {
      return record.map_address;
    }
  }

  return "";
}

function getSavedFilterField(
  property: Property | undefined,
  field: "filter_location" | "filter_price" | "filter_layout"
): string {
  if (!property) return "";
  const descObj = unwrapJson(property.description);

  if (typeof descObj === "object" && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    if (typeof record[field] === "string" && record[field].trim()) {
      return record[field].trim();
    }
  }

  if (field === "filter_price") {
    const jaPrice = Number(property.price_yen || property.price || 0);
    return detectPriceBucket(jaPrice, DEFAULT_FILTER_OPTIONS.prices);
  }

  return "";
}

function parseImages(val: unknown): string[] {
  if (!val) return [];
  const current = unwrapJson(val);

  if (typeof current === "string") {
    const trimmed = current.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const content = trimmed.slice(1, -1);
      if (!content) return [];
      return content
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim())
        .filter(Boolean);
    }
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(current)) {
    return current
      .map((item) => {
        const unwrappedItem = unwrapJson(item);
        return typeof unwrappedItem === "string" ? unwrappedItem : "";
      })
      .filter(Boolean);
  }

  return [];
}

function parseFloorPlanImages(property?: Property): string[] {
  if (!property) return [];
  const descObj = unwrapJson(property.description);

  if (typeof descObj === "object" && descObj !== null && !Array.isArray(descObj)) {
    const record = descObj as Record<string, unknown>;
    if (Array.isArray(record.floor_plans)) {
      return parseImages(record.floor_plans);
    }
  }

  const fromUrl = parseImages(property.floor_plan_url);
  if (fromUrl.length > 0) return fromUrl;

  return parseImages(property.floor_plan);
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const uid = useId();
  const bannerRef = useRef<HTMLDivElement>(null);
  const nearbySeqRef = useRef(0);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(() => parseImages(property?.images));
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | undefined>(undefined);

  const [floorPlanImages, setFloorPlanImages] = useState<string[]>(() =>
    parseFloorPlanImages(property)
  );
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);

  const [nearbyItems, setNearbyItems] = useState<NearbyDraftItem[]>(() =>
    parseSavedNearby(property)
  );

  const [statusBanner, setStatusBanner] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>(DEFAULT_FILTER_OPTIONS);
  const [isManagingFilters, setIsManagingFilters] = useState(false);
  const [savingFilterOptions, setSavingFilterOptions] = useState(false);

  const [addingGroup, setAddingGroup] = useState<FilterGroupKey | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  const [editingItem, setEditingItem] = useState<{
    group: FilterGroupKey;
    index: number;
    value: string;
  } | null>(null);

  const [filterLocation, setFilterLocation] = useState<string>(() =>
    getSavedFilterField(property, "filter_location")
  );
  const [filterPrice, setFilterPrice] = useState<string>(() =>
    getSavedFilterField(property, "filter_price")
  );
  const [filterLayout, setFilterLayout] = useState<string>(() =>
    getSavedFilterField(property, "filter_layout")
  );

  const isEdit = Boolean(property?.id);

  useEffect(() => {
    let mounted = true;
    getFilterOptions().then((opts) => {
      if (mounted) {
        setFilterOptions(opts);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const showBanner = (type: "error" | "success", text: string) => {
    setStatusBanner({ type, text });
    requestAnimationFrame(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleAddNearbyItem = (category: NearbyCategory = "station") => {
    nearbySeqRef.current += 1;
    const preset = NEARBY_CATEGORY_OPTIONS.find((item) => item.value === category);
    setNearbyItems((prev) => [
      ...prev,
      {
        id: `nearby-${uid}-${nearbySeqRef.current}`,
        category,
        isMultilingual: false,
        nameVi: preset?.sampleName || "",
        nameEn: preset?.sampleName || "",
        nameJa: preset?.sampleName || "",
        distanceVi: preset?.sampleDistance || "",
        distanceEn: preset?.sampleDistance || "",
        distanceJa: preset?.sampleDistance || "",
      },
    ]);
  };

  const handleUpdateNearbyField = (
    id: string,
    patch: Partial<NearbyDraftItem>
  ) => {
    setNearbyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveNearbyItem = (id: string) => {
    setNearbyItems((prev) => prev.filter((item) => item.id !== id));
  };

  const persistFilterOptions = async (updated: FilterOptionsData) => {
    setFilterOptions(updated);
    setSavingFilterOptions(true);
    const res = await saveFilterOptions(updated);
    setSavingFilterOptions(false);
    if (!res.success) {
      showBanner("error", `Không thể lưu danh sách bộ lọc: ${res.error}`);
    }
  };

  const handleAddOption = async (group: FilterGroupKey) => {
    const trimmed = newOptionValue.trim();
    if (!trimmed) {
      setAddingGroup(null);
      setNewOptionValue("");
      return;
    }

    const exists = filterOptions[group].some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showBanner("error", `Thẻ "${trimmed}" đã tồn tại trong danh sách bộ lọc.`);
      return;
    }

    const updated: FilterOptionsData = {
      ...filterOptions,
      [group]: [...filterOptions[group], trimmed],
    };

    if (group === "locations") setFilterLocation(trimmed);
    if (group === "prices") setFilterPrice(trimmed);
    if (group === "layouts") setFilterLayout(trimmed);

    setAddingGroup(null);
    setNewOptionValue("");
    setStatusBanner(null);
    await persistFilterOptions(updated);
  };

  const handleSaveEditOption = async () => {
    if (!editingItem) return;
    const { group, index, value } = editingItem;
    const trimmed = value.trim();
    const oldValue = filterOptions[group][index];

    if (!trimmed || trimmed === oldValue) {
      setEditingItem(null);
      return;
    }

    const updatedList = [...filterOptions[group]];
    updatedList[index] = trimmed;

    const updated: FilterOptionsData = {
      ...filterOptions,
      [group]: updatedList,
    };

    if (group === "locations" && filterLocation === oldValue) setFilterLocation(trimmed);
    if (group === "prices" && filterPrice === oldValue) setFilterPrice(trimmed);
    if (group === "layouts" && filterLayout === oldValue) setFilterLayout(trimmed);

    setEditingItem(null);
    await persistFilterOptions(updated);
  };

  const handleDeleteOption = async (group: FilterGroupKey, index: number) => {
    const target = filterOptions[group][index];
    const updatedList = filterOptions[group].filter((_, idx) => idx !== index);

    const updated: FilterOptionsData = {
      ...filterOptions,
      [group]: updatedList,
    };

    if (group === "locations" && filterLocation === target) setFilterLocation("");
    if (group === "prices" && filterPrice === target) setFilterPrice("");
    if (group === "layouts" && filterLayout === target) setFilterLayout("");

    await persistFilterOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusBanner(null);
    setImageError(undefined);

    const oldImages = parseImages(property?.images);
    const finalImages = images.length > 0 ? images : oldImages;

    if (!isEdit && finalImages.length === 0) {
      const msg = "Vui lòng tải lên ít nhất 1 hình ảnh BĐS.";
      setImageError(msg);
      showBanner("error", msg);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const titleVi = (formData.get("titleVi") as string).trim();
    const titleEn = (formData.get("titleEn") as string).trim();
    const titleJa = (formData.get("titleJa") as string).trim();

    if (!titleVi && !titleEn && !titleJa) {
      showBanner("error", "Vui lòng nhập Tên Bất động sản cho ít nhất 1 ngôn ngữ.");
      return;
    }

    const propertyTypeVi = (formData.get("propertyTypeVi") as string).trim();
    const propertyTypeEn = (formData.get("propertyTypeEn") as string).trim();
    const propertyTypeJa = (formData.get("propertyTypeJa") as string).trim();

    if (!propertyTypeVi && !propertyTypeEn && !propertyTypeJa) {
      showBanner("error", "Vui lòng nhập Loại BĐS cho ít nhất 1 ngôn ngữ.");
      return;
    }

    const priceVi = Number(formData.get("priceVi")) || 0;
    const priceEn = Number(formData.get("priceEn")) || 0;
    const priceJa = Number(formData.get("priceJa")) || 0;

    if (!priceVi && !priceEn && !priceJa) {
      showBanner("error", "Vui lòng nhập Giá bán cho ít nhất 1 ngôn ngữ.");
      return;
    }

    setLoading(true);

    const resolvedPriceFilter =
      filterPrice || detectPriceBucket(priceJa, filterOptions.prices);

    const serializedNearby: NearbyItem[] = nearbyItems
      .map((item): NearbyItem | null => {
        const nVi = item.nameVi.trim();
        const nEn = item.nameEn.trim();
        const nJa = item.nameJa.trim();
        const dVi = item.distanceVi.trim();
        const dEn = item.distanceEn.trim();
        const dJa = item.distanceJa.trim();

        if (!nVi && !nEn && !nJa && !dVi && !dEn && !dJa) return null;

        return {
          id: item.id,
          category: item.category,
          name: item.isMultilingual
            ? { vi: nVi || nEn || nJa, en: nEn || nVi || nJa, ja: nJa || nEn || nVi }
            : nVi || nEn || nJa,
          distance: item.isMultilingual
            ? { vi: dVi || dEn || dJa, en: dEn || dVi || dJa, ja: dJa || dEn || dVi }
            : dVi || dEn || dJa,
        };
      })
      .filter((item): item is NearbyItem => item !== null);

    const inputData = {
      id: property?.id,
      titleVi,
      titleEn,
      titleJa,
      descriptionVi: (formData.get("descriptionVi") as string) || "",
      descriptionEn: (formData.get("descriptionEn") as string) || "",
      descriptionJa: (formData.get("descriptionJa") as string) || "",
      locationVi: (formData.get("addressVi") as string) || "",
      locationEn: (formData.get("addressEn") as string) || "",
      locationJa: (formData.get("addressJa") as string) || "",
      mapAddress: ((formData.get("mapAddress") as string) || "").trim(),
      filterLocation,
      filterPrice: resolvedPriceFilter,
      filterLayout,
      propertyTypeVi,
      propertyTypeEn,
      propertyTypeJa,
      priceVi,
      priceEn,
      priceJa,
      areaSqm: Number(formData.get("areaSqm")),
      buildingSize: formData.get("buildingSize") as string,
      landSize: formData.get("landSize") as string,
      layout: formData.get("layout") as string,
      structure: formData.get("structure") as string,
      yearBuilt: Number(formData.get("yearBuilt")),
      parking: formData.get("parking") as string,
      landRights: formData.get("landRights") as string,
      zoning: formData.get("zoning") as string,
      access: formData.get("access") as string,
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      images: finalImages,
      floorPlanImages,
      nearby: serializedNearby,
    };

    const res = await saveProperty(inputData);
    setLoading(false);

    if (res.success) {
      showBanner(
        "success",
        isEdit
          ? "Cập nhật bài thành công! Đang quay lại danh sách..."
          : "Đăng bài thành công! Đang quay lại danh sách..."
      );
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 700);
    } else {
      showBanner("error", `Thao tác thất bại: ${res.error}`);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#134E4A] placeholder:text-[#475569]/70 transition-all duration-200 focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/15";

  const renderFilterRow = (
    group: FilterGroupKey,
    label: string,
    selectedValue: string,
    onSelect: (val: string) => void,
    variant: "teal" | "blue"
  ) => {
    const items = filterOptions[group];

    return (
      <div className="space-y-2">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
          {label}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {items.map((item, idx) => {
            const isEditingThis =
              editingItem?.group === group && editingItem?.index === idx;
            const active = selectedValue === item;

            if (isEditingThis) {
              return (
                <div
                  key={`${group}-edit-${idx}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0F766E] bg-white px-2.5 py-1 shadow-xs"
                >
                  <input
                    type="text"
                    autoFocus
                    aria-label="Sửa tên thẻ bộ lọc"
                    value={editingItem.value}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, value: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEditOption();
                      } else if (e.key === "Escape") {
                        setEditingItem(null);
                      }
                    }}
                    className="w-28 text-xs font-medium text-[#134E4A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEditOption}
                    title="Lưu"
                    className="cursor-pointer rounded p-1 text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    title="Hủy"
                    className="cursor-pointer rounded p-1 text-[#475569] transition-colors hover:bg-[#F0FDFA] hover:text-[#134E4A]"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            const activeStyle =
              variant === "blue"
                ? "border-[#0369A1] bg-[#0369A1] font-semibold text-white shadow-xs"
                : "border-[#0F766E] bg-[#0F766E] font-semibold text-white shadow-xs";

            return (
              <div
                key={`${group}-${item}-${idx}`}
                className={`inline-flex items-center rounded-lg border text-xs font-medium transition-all duration-200 ${
                  active
                    ? activeStyle
                    : "border-[#99F6E4] bg-white text-[#134E4A] hover:border-[#14B8A6] hover:bg-[#F0FDFA]"
                }`}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? "" : item)}
                  className="cursor-pointer px-3.5 py-1.5"
                >
                  {item}
                </button>

                {isManagingFilters && (
                  <div className="flex items-center gap-1 border-l border-current/20 pr-2 pl-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({ group, index: idx, value: item })
                      }
                      title="Sửa tên"
                      className="cursor-pointer rounded p-0.5 opacity-80 transition-opacity hover:opacity-100"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(group, idx)}
                      title="Xóa"
                      className={`cursor-pointer rounded p-0.5 transition-colors ${
                        active
                          ? "text-white/90 hover:text-white"
                          : "text-rose-600 hover:text-rose-800"
                      }`}
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {addingGroup === group ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F766E] bg-white px-2.5 py-1 shadow-xs">
              <input
                type="text"
                autoFocus
                aria-label="Nhập tên thẻ bộ lọc mới"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption(group);
                  } else if (e.key === "Escape") {
                    setAddingGroup(null);
                    setNewOptionValue("");
                  }
                }}
                placeholder="Nhập tên mới..."
                className="w-32 text-xs text-[#134E4A] placeholder:text-[#475569]/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddOption(group)}
                className="cursor-pointer rounded-md bg-[#0369A1] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingGroup(null);
                  setNewOptionValue("");
                }}
                className="cursor-pointer rounded p-1 text-[#475569] transition-colors hover:bg-[#F0FDFA] hover:text-[#134E4A]"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAddingGroup(group);
                setNewOptionValue("");
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-[#0F766E]/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#0F766E] hover:bg-[#F0FDFA]"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Thêm</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-8 overflow-hidden rounded-2xl border border-[#99F6E4] bg-white/85 p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] backdrop-blur-md sm:p-8"
    >
      {/* Điểm sáng chiều sâu cho hiệu ứng Glassmorphism */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#14B8A6]/10 blur-3xl"
      />

      {/* 1. Thông tin cơ bản (3 ngôn ngữ) */}
      <div className="relative space-y-5">
        <div className="flex items-center gap-3 border-b border-[#E8F0F3] pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-xs font-bold text-white">
            1
          </span>
          <h2 className="font-serif text-lg font-bold text-[#134E4A] sm:text-xl">
            Thông tin cơ bản (Đa ngôn ngữ)
          </h2>
        </div>

        {/* Tên BĐS 3 ngôn ngữ */}
        <div className="space-y-3.5 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
            Tên Bất động sản (3 ngôn ngữ) *
          </span>
          <div>
            <label
              htmlFor={`${uid}-titleVi`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              Tiếng Việt (VI)
            </label>
            <input
              id={`${uid}-titleVi`}
              type="text"
              name="titleVi"
              defaultValue={getLangText(property?.title, "vi")}
              placeholder="Căn hộ chung cư cao cấp Shinjuku 2LDK gần ga"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-titleEn`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              English (EN)
            </label>
            <input
              id={`${uid}-titleEn`}
              type="text"
              name="titleEn"
              defaultValue={getLangText(property?.title, "en")}
              placeholder="Luxury Shinjuku 2LDK Apartment near Station"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-titleJa`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              日本語 (JA)
            </label>
            <input
              id={`${uid}-titleJa`}
              type="text"
              name="titleJa"
              defaultValue={getLangText(property?.title, "ja")}
              placeholder="新宿駅徒歩圏内 高級2LDKマンション"
              className={inputClassName}
            />
          </div>
        </div>

        {/* Giá bán 3 ngôn ngữ */}
        <div className="space-y-3.5 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
            Giá bán theo từng ngôn ngữ (3 ngôn ngữ) *
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor={`${uid}-priceVi`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                Tiếng Việt (VNĐ - ₫)
              </label>
              <input
                id={`${uid}-priceVi`}
                type="number"
                name="priceVi"
                defaultValue={getSavedPrice(property, "vi")}
                placeholder="7500000000"
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-priceEn`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                English (USD - $)
              </label>
              <input
                id={`${uid}-priceEn`}
                type="number"
                name="priceEn"
                defaultValue={getSavedPrice(property, "en")}
                placeholder="300000"
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-priceJa`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                日本語 (JPY - ¥)
              </label>
              <input
                id={`${uid}-priceJa`}
                type="number"
                name="priceJa"
                defaultValue={getSavedPrice(property, "ja")}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const detected = detectPriceBucket(val, filterOptions.prices);
                  if (detected) setFilterPrice(detected);
                }}
                placeholder="45000000"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        {/* Loại BĐS 3 ngôn ngữ */}
        <div className="space-y-3.5 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
            Loại BĐS (3 ngôn ngữ) *
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor={`${uid}-propertyTypeVi`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                Tiếng Việt (VI)
              </label>
              <input
                id={`${uid}-propertyTypeVi`}
                type="text"
                name="propertyTypeVi"
                defaultValue={getLangText(property?.property_type, "vi")}
                placeholder="Căn hộ / Nhà riêng / Đất nền"
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-propertyTypeEn`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                English (EN)
              </label>
              <input
                id={`${uid}-propertyTypeEn`}
                type="text"
                name="propertyTypeEn"
                defaultValue={getLangText(property?.property_type, "en")}
                placeholder="Apartment / House / Land"
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor={`${uid}-propertyTypeJa`}
                className="mb-1 block text-xs font-bold text-[#0F766E]"
              >
                日本語 (JA)
              </label>
              <input
                id={`${uid}-propertyTypeJa`}
                type="text"
                name="propertyTypeJa"
                defaultValue={getLangText(property?.property_type, "ja")}
                placeholder="マンション / 一戸建て / 土地"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ 3 ngôn ngữ & Ghim Google Maps */}
        <div className="space-y-3.5 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
            Địa chỉ / Vị trí (3 ngôn ngữ) *
          </span>
          <div>
            <label
              htmlFor={`${uid}-addressVi`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              Tiếng Việt (VI)
            </label>
            <input
              id={`${uid}-addressVi`}
              type="text"
              name="addressVi"
              defaultValue={getLangText(property?.location, "vi")}
              placeholder="Quận Shinjuku, Tokyo, Nhật Bản"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-addressEn`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              English (EN)
            </label>
            <input
              id={`${uid}-addressEn`}
              type="text"
              name="addressEn"
              defaultValue={getLangText(property?.location, "en")}
              placeholder="Shinjuku-ku, Tokyo, Japan"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-addressJa`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              日本語 (JA)
            </label>
            <input
              id={`${uid}-addressJa`}
              type="text"
              name="addressJa"
              defaultValue={getLangText(property?.location, "ja")}
              placeholder="東京都新宿区"
              className={inputClassName}
            />
          </div>

          <div className="border-t border-[#99F6E4]/70 pt-3">
            <label
              htmlFor={`${uid}-mapAddress`}
              className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0F766E]"
            >
              <MapPinIcon className="h-4 w-4 shrink-0" />
              <span>Địa chỉ cụ thể / Tọa độ / Link Google Maps (để ghim trên bản đồ)</span>
            </label>
            <input
              id={`${uid}-mapAddress`}
              type="text"
              name="mapAddress"
              defaultValue={getSavedMapAddress(property)}
              placeholder="Ví dụ: 1-1-1 Nishi-Shinjuku, Shinjuku-ku, Tokyo hoặc 35.6895, 139.6917 hoặc dán link Google Maps"
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-[#475569]">
              Nếu để trống, bản đồ sẽ tự động lấy theo địa chỉ đã nhập ở trên.
            </p>
          </div>
        </div>

        {/* Phân loại bộ lọc hiển thị */}
        <div className="space-y-4 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-2.5 border-b border-[#99F6E4]/70 pb-3 sm:flex-row sm:items-center">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
                Thông tin bộ lọc tìm kiếm (Properties)
              </span>
              <span className="mt-0.5 block text-xs text-[#475569]">
                {savingFilterOptions
                  ? "Đang đồng bộ danh sách bộ lọc..."
                  : "Bấm vào thẻ để chọn, hoặc bấm + Thêm / Sửa & Xóa thẻ"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsManagingFilters((prev) => !prev);
                setEditingItem(null);
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] sm:self-auto ${
                isManagingFilters
                  ? "border-[#0F766E] bg-[#0F766E] text-white shadow-xs"
                  : "border-[#99F6E4] bg-white text-[#134E4A] hover:border-[#0F766E] hover:bg-[#F0FDFA]"
              }`}
            >
              {isManagingFilters ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" />
                  <span>Xong</span>
                </>
              ) : (
                <>
                  <SettingsIcon className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Sửa / Xóa thẻ</span>
                </>
              )}
            </button>
          </div>

          {renderFilterRow(
            "locations",
            "Location (Tỉnh / Khu vực)",
            filterLocation,
            setFilterLocation,
            "teal"
          )}

          {renderFilterRow(
            "prices",
            "Price (Khoảng giá Yên Nhật)",
            filterPrice,
            setFilterPrice,
            "teal"
          )}

          {renderFilterRow(
            "layouts",
            "Layout (Nhóm bố cục)",
            filterLayout,
            setFilterLayout,
            "blue"
          )}
        </div>
      </div>

      {/* 2. Thông số kỹ thuật BĐS Nhật Bản */}
      <div className="relative space-y-5 pt-2">
        <div className="flex items-center gap-3 border-b border-[#E8F0F3] pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-xs font-bold text-white">
            2
          </span>
          <h2 className="font-serif text-lg font-bold text-[#134E4A] sm:text-xl">
            Thông số kỹ thuật BĐS Nhật Bản
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor={`${uid}-areaSqm`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Diện tích sử dụng (m²) *
            </label>
            <input
              id={`${uid}-areaSqm`}
              type="number"
              step="0.1"
              name="areaSqm"
              required
              defaultValue={property?.area_sqm || ""}
              placeholder="65.5"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-buildingSize`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Diện tích sàn (Building Size)
            </label>
            <input
              id={`${uid}-buildingSize`}
              type="text"
              name="buildingSize"
              defaultValue={property?.building_size || ""}
              placeholder="65.5 m² / 19.8 tsubo"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-landSize`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Diện tích đất (Land Size)
            </label>
            <input
              id={`${uid}-landSize`}
              type="text"
              name="landSize"
              defaultValue={property?.land_size || ""}
              placeholder="80.0 m² / 24.2 tsubo"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor={`${uid}-layout`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Bố cục phòng (Layout)
            </label>
            <input
              id={`${uid}-layout`}
              type="text"
              name="layout"
              defaultValue={property?.layout || "2LDK"}
              placeholder="2LDK / 3DK / 1K"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-structure`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Kết cấu (Structure)
            </label>
            <input
              id={`${uid}-structure`}
              type="text"
              name="structure"
              defaultValue={property?.structure || "RC (Bê tông cốt thép)"}
              placeholder="RC (Bê tông cốt thép) / Gỗ"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-yearBuilt`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Năm xây dựng (Year Built)
            </label>
            <input
              id={`${uid}-yearBuilt`}
              type="number"
              name="yearBuilt"
              defaultValue={property?.year_built || 2026}
              placeholder="2020"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor={`${uid}-landRights`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Quyền sở hữu (Land Rights)
            </label>
            <input
              id={`${uid}-landRights`}
              type="text"
              name="landRights"
              defaultValue={property?.land_rights || "Sở hữu vĩnh viễn (Ownership)"}
              placeholder="Sở hữu vĩnh viễn (Ownership)"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-access`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Vị trí ga / Giao thông (Access)
            </label>
            <input
              id={`${uid}-access`}
              type="text"
              name="access"
              defaultValue={property?.access || ""}
              placeholder="Đi bộ 5 phút ra ga Shinjuku"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-parking`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Chỗ đậu xe (Parking)
            </label>
            <input
              id={`${uid}-parking`}
              type="text"
              name="parking"
              defaultValue={property?.parking || "Có"}
              placeholder="Có (1 chỗ) / Không"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor={`${uid}-zoning`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Quy hoạch đất (Zoning)
            </label>
            <input
              id={`${uid}-zoning`}
              type="text"
              name="zoning"
              defaultValue={property?.zoning || "Khu dân cư"}
              placeholder="Khu dân cư thương mại"
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-bedrooms`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Số phòng ngủ
            </label>
            <input
              id={`${uid}-bedrooms`}
              type="number"
              name="bedrooms"
              defaultValue={property?.bedrooms ?? 2}
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-bathrooms`}
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#134E4A]"
            >
              Số phòng tắm
            </label>
            <input
              id={`${uid}-bathrooms`}
              type="number"
              name="bathrooms"
              defaultValue={property?.bathrooms ?? 1}
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* 3. Mô tả 3 ngôn ngữ, Tiện ích xung quanh (Nearby) & Hình ảnh */}
      <div className="relative space-y-5 pt-2">
        <div className="flex items-center gap-3 border-b border-[#E8F0F3] pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-xs font-bold text-white">
            3
          </span>
          <h2 className="font-serif text-lg font-bold text-[#134E4A] sm:text-xl">
            Mô tả chi tiết, Tiện ích xung quanh & Hình ảnh
          </h2>
        </div>

        <div className="space-y-3.5 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <div>
            <label
              htmlFor={`${uid}-descriptionVi`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              Mô tả chi tiết — Tiếng Việt (VI)
            </label>
            <textarea
              id={`${uid}-descriptionVi`}
              name="descriptionVi"
              rows={3}
              defaultValue={getLangText(property?.description, "vi")}
              placeholder="Mô tả tiện ích xung quanh, tình trạng pháp lý, ban công..."
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-descriptionEn`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              Description — English (EN)
            </label>
            <textarea
              id={`${uid}-descriptionEn`}
              name="descriptionEn"
              rows={3}
              defaultValue={getLangText(property?.description, "en")}
              placeholder="Describe surrounding amenities, legal status, balcony..."
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-descriptionJa`}
              className="mb-1 block text-xs font-bold text-[#0F766E]"
            >
              物件詳細 — 日本語 (JA)
            </label>
            <textarea
              id={`${uid}-descriptionJa`}
              name="descriptionJa"
              rows={3}
              defaultValue={getLangText(property?.description, "ja")}
              placeholder="周辺環境、権利形態、設備などの詳細を入力してください..."
              className={inputClassName}
            />
          </div>
        </div>

        {/* Tiện ích xung quanh (Nearby) */}
        <div className="space-y-4 rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-2.5 border-b border-[#99F6E4]/70 pb-3 sm:flex-row sm:items-center">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#134E4A]">
                Tiện ích xung quanh (Nearby)
              </span>
              <span className="mt-0.5 block text-xs text-[#475569]">
                Hiển thị giữa phần Mô tả chi tiết và Bản đồ trên trang chi tiết BĐS.
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleAddNearbyItem("station")}
              className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg bg-[#0F766E] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] sm:self-auto"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Thêm tiện ích</span>
            </button>
          </div>

          {/* Nút thêm nhanh các loại tiện ích phổ biến */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold text-[#475569]">
              Thêm nhanh:
            </span>
            {(
              [
                { cat: "station", label: "+ Ga tàu" },
                { cat: "beach", label: "+ Biển" },
                { cat: "supermarket", label: "+ Siêu thị" },
                { cat: "restaurant", label: "+ Nhà hàng / Cửa hàng" },
              ] as { cat: NearbyCategory; label: string }[]
            ).map((quick) => (
              <button
                key={quick.cat}
                type="button"
                onClick={() => handleAddNearbyItem(quick.cat)}
                className="cursor-pointer rounded-md border border-[#99F6E4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] transition-colors hover:border-[#0F766E] hover:bg-[#F0FDFA]"
              >
                {quick.label}
              </button>
            ))}
          </div>

          {nearbyItems.length > 0 ? (
            <div className="space-y-3">
              {nearbyItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-[#99F6E4] bg-white/95 p-3.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F0FDFA] text-[11px] ring-1 ring-[#99F6E4]">
                        {idx + 1}
                      </span>
                      <span>Địa điểm lân cận</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateNearbyField(item.id, {
                            isMultilingual: !item.isMultilingual,
                          })
                        }
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          item.isMultilingual
                            ? "border-[#0369A1] bg-[#0369A1] text-white"
                            : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#0F766E] hover:text-[#0F766E]"
                        }`}
                      >
                        <GlobeIcon className="h-3 w-3" />
                        <span>
                          {item.isMultilingual ? "Đang nhập 3 ngôn ngữ" : "Dịch 3 ngôn ngữ"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveNearbyItem(item.id)}
                        aria-label={`Xóa tiện ích ${idx + 1}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <TrashIcon className="h-3 w-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-[11px] font-bold text-[#475569]">
                        Biểu tượng / Loại
                      </label>
                      <select
                        aria-label={`Loại tiện ích ${idx + 1}`}
                        value={item.category}
                        onChange={(e) =>
                          handleUpdateNearbyField(item.id, {
                            category: e.target.value as NearbyCategory,
                          })
                        }
                        className={inputClassName}
                      >
                        {NEARBY_CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!item.isMultilingual ? (
                      <>
                        <div className="md:col-span-5">
                          <label className="mb-1 block text-[11px] font-bold text-[#475569]">
                            Tên địa điểm (VD: JR Awa-Kamogawa Station)
                          </label>
                          <input
                            type="text"
                            value={item.nameEn || item.nameVi}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, {
                                nameVi: e.target.value,
                                nameEn: e.target.value,
                                nameJa: e.target.value,
                              })
                            }
                            placeholder="JR Awa-Kamogawa Station"
                            className={inputClassName}
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="mb-1 block text-[11px] font-bold text-[#475569]">
                            Khoảng cách / Thời gian
                          </label>
                          <input
                            type="text"
                            value={item.distanceEn || item.distanceVi}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, {
                                distanceVi: e.target.value,
                                distanceEn: e.target.value,
                                distanceJa: e.target.value,
                              })
                            }
                            placeholder="15 min by car"
                            className={inputClassName}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 md:col-span-8 sm:grid-cols-3">
                        <div className="space-y-1.5 rounded-lg border border-[#E8F0F3] bg-[#F8FAFC] p-2.5">
                          <span className="block text-[10px] font-bold uppercase text-[#0F766E]">
                            Tiếng Việt (VI)
                          </span>
                          <input
                            type="text"
                            value={item.nameVi}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { nameVi: e.target.value })
                            }
                            placeholder="Ga JR Awa-Kamogawa"
                            className={inputClassName}
                          />
                          <input
                            type="text"
                            value={item.distanceVi}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { distanceVi: e.target.value })
                            }
                            placeholder="15 phút đi ô tô"
                            className={inputClassName}
                          />
                        </div>

                        <div className="space-y-1.5 rounded-lg border border-[#E8F0F3] bg-[#F8FAFC] p-2.5">
                          <span className="block text-[10px] font-bold uppercase text-[#0F766E]">
                            English (EN)
                          </span>
                          <input
                            type="text"
                            value={item.nameEn}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { nameEn: e.target.value })
                            }
                            placeholder="JR Awa-Kamogawa Station"
                            className={inputClassName}
                          />
                          <input
                            type="text"
                            value={item.distanceEn}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { distanceEn: e.target.value })
                            }
                            placeholder="15 min by car"
                            className={inputClassName}
                          />
                        </div>

                        <div className="space-y-1.5 rounded-lg border border-[#E8F0F3] bg-[#F8FAFC] p-2.5">
                          <span className="block text-[10px] font-bold uppercase text-[#0F766E]">
                            日本語 (JA)
                          </span>
                          <input
                            type="text"
                            value={item.nameJa}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { nameJa: e.target.value })
                            }
                            placeholder="JR安房鴨川駅"
                            className={inputClassName}
                          />
                          <input
                            type="text"
                            value={item.distanceJa}
                            onChange={(e) =>
                              handleUpdateNearbyField(item.id, { distanceJa: e.target.value })
                            }
                            placeholder="車で15分"
                            className={inputClassName}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#99F6E4] bg-white/70 py-6 text-center text-xs text-[#475569]">
              Chưa có tiện ích xung quanh nào. Bấm <strong>+ Thêm tiện ích</strong> hoặc chọn nút thêm nhanh ở trên.
            </div>
          )}
        </div>

        {/* Hình ảnh BĐS chính */}
        <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <ImageUploader
            label="Hình ảnh BĐS *"
            hint="Ảnh đầu tiên sẽ làm ảnh bìa. Tự động nén tối ưu tốc độ tải và hỗ trợ đổi thứ tự."
            value={images}
            onChange={(next) => {
              setImages(next);
              if (next.length > 0) setImageError(undefined);
            }}
            max={15}
            error={imageError}
            onBusyChange={setUploading}
          />
        </div>

        {/* Hình ảnh Sơ đồ nhà ở */}
        <div className="rounded-xl border border-[#99F6E4]/80 bg-[#F0FDFA]/55 p-4 sm:p-5">
          <ImageUploader
            label="Sơ đồ nhà ở (Floor Plan / 間取り図)"
            hint="Tải ảnh bản vẽ mặt bằng căn hộ/nhà ở (hỗ trợ tối đa 5 sơ đồ)."
            value={floorPlanImages}
            onChange={setFloorPlanImages}
            max={5}
            onBusyChange={setUploadingFloorPlan}
          />
        </div>
      </div>

      {/* Khung thông báo trạng thái inline */}
      {statusBanner && (
        <div
          ref={bannerRef}
          role="alert"
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed sm:text-sm ${
            statusBanner.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : "border-rose-200 bg-rose-50/90 text-rose-900"
          }`}
        >
          {statusBanner.type === "success" ? (
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{statusBanner.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading || uploadingFloorPlan}
        className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0369A1] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
      >
        {loading || uploading || uploadingFloorPlan ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            <span>{loading ? "Đang lưu..." : "Đang tải ảnh lên..."}</span>
          </>
        ) : (
          <>
            <SaveIcon className="h-4 w-4" />
            <span>{isEdit ? "Cập Nhật BĐS" : "Lưu & Đăng BĐS Nhật Bản"}</span>
          </>
        )}
      </button>
    </form>
  );
}