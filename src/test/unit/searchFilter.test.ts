import { describe, it, expect } from "vitest";
import type { Hospital } from "../../types";

function applyFilters(hospitals: Hospital[], filters: {
  query?: string;
  specialty?: string;
  ownership?: string;
  city?: string;
}) {
  return hospitals.filter((h) => {
    if (filters.query && !h.name.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.specialty && !h.specialty.includes(filters.specialty as never)) return false;
    if (filters.ownership && h.ownership !== filters.ownership) return false;
    if (filters.city && !h.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });
}

const mockHospitals = [
  {
    id: "1", name: "Lagos University Teaching Hospital",
    city: "Lagos", lga: "Surulere", state: "Lagos",
    address: "Ishaga Road", phone: "08012345678",
    specialty: ["emergency", "maternity"], ownership: "public",
    rating: 4.5, created_at: "",
  },
  {
    id: "2", name: "Reddington Hospital",
    city: "Lagos", lga: "Victoria Island", state: "Lagos",
    address: "12 Idowu Martins", phone: "08023456789",
    specialty: ["dental", "surgery"], ownership: "private",
    rating: 4.8, created_at: "",
  },
  {
    id: "3", name: "National Hospital Abuja",
    city: "Abuja", lga: "Municipal", state: "FCT",
    address: "Plot 132", phone: "08034567890",
    specialty: ["emergency", "pediatric"], ownership: "public",
    rating: 4.2, created_at: "",
  },
] as Hospital[];

describe("Search Filter Logic", () => {
  it("filters by query name", () => {
    const result = applyFilters(mockHospitals, { query: "reddington" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Reddington Hospital");
  });

  it("filters by specialty", () => {
    const result = applyFilters(mockHospitals, { specialty: "emergency" });
    expect(result).toHaveLength(2);
  });

  it("filters by ownership", () => {
    const result = applyFilters(mockHospitals, { ownership: "private" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Reddington Hospital");
  });

  it("filters by city", () => {
    const result = applyFilters(mockHospitals, { city: "abuja" });
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Abuja");
  });

  it("returns all when no filters", () => {
    const result = applyFilters(mockHospitals, {});
    expect(result).toHaveLength(3);
  });

  it("combines multiple filters", () => {
    const result = applyFilters(mockHospitals, { city: "Lagos", ownership: "public" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Lagos University Teaching Hospital");
  });
});