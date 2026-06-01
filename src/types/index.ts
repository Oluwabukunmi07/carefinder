export type Specialty =
  | "emergency"
  | "maternity"
  | "pediatric"
  | "dental"
  | "cardiology"
  | "surgery"
  | "ophthalmology"
  | "psychiatry";

export type Ownership = "public" | "private";

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  state: string;
  phone: string;
  email?: string;
  specialty: Specialty[];
  ownership: Ownership;
  visiting_hours?: string;
  description?: string;
  rating: number;
  image_url?: string;
  location?: {
    type?: string;
    coordinates?: [number, number];
  } | null;
  created_at: string;
}

export interface SearchFilters {
  query: string;
  specialty: Specialty | "";
  ownership: Ownership | "";
  city: string;
  lga?: string;
  radius?: number;
  userLat?: number;
  userLng?: number;
}
