export interface Property {
  id: string;
  title: string | Record<string, string>;
  description?: string | Record<string, unknown>;
  location: string | Record<string, string>;
  price?: number;
  price_yen?: number;
  price_vnd?: number;
  building_size?: string;
  land_size?: string;
  area_sqm?: number;
  layout?: string;
  structure?: string;
  year_built?: number;
  current_status?: string;
  status?: string;
  parking?: string;
  land_rights?: string;
  zoning?: string;
  access?: string;
  images?: string[];
  floor_plan?: string | string[];
  floor_plan_url?: string | string[];
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string | Record<string, string>;
  created_at?: string;
}

export interface Inquiry {
  id?: string;
  property_id: string | null;
  full_name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at?: string;
}