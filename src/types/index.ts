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
  ratin: number;
  image_url?: string;
  location?: unknown;
  created_at: string;
}

export interface SearchFIlters {
  query: string;
  specialty: Specialty | "";
  ownership: Ownership | "";
  city: string;
}
