export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  building_size?: string;
  land_size?: string;
  layout?: string;
  structure?: string;
  year_built?: number;
  current_status?: string;
  parking?: string;
  land_rights?: string;
  zoning?: string;
  access?: string;
  description?: string;
  images?: string[];
  floor_plan?: string;
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