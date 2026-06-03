import { describe, it, expect } from "vitest";

// CSV column selection logic
function buildCSVRow(hospital: Record<string, unknown>, columns: string[]) {
  return columns.reduce((row, col) => {
    row[col] = hospital[col] ?? "";
    return row;
  }, {} as Record<string, unknown>);
}

describe("CSV Export", () => {
  const hospital = {
    name: "Lagos University Teaching Hospital",
    address: "Ishaga Road, Surulere",
    city: "Lagos",
    phone: "08012345678",
    email: "luth@health.gov.ng",
    specialty: ["emergency", "maternity"],
    ownership: "public",
    rating: 4.5,
  };

  it("includes only selected columns", () => {
    const row = buildCSVRow(hospital, ["name", "city", "phone"]);
    expect(row).toHaveProperty("name");
    expect(row).toHaveProperty("city");
    expect(row).toHaveProperty("phone");
    expect(row).not.toHaveProperty("email");
  });

  it("returns empty string for missing fields", () => {
    const row = buildCSVRow(hospital, ["name", "image_url"]);
    expect(row.image_url).toBe("");
  });

  it("handles all columns", () => {
    const columns = ["name", "address", "city", "phone", "email", "ownership", "rating"];
    const row = buildCSVRow(hospital, columns);
    expect(Object.keys(row)).toHaveLength(columns.length);
  });

  it("preserves correct values", () => {
    const row = buildCSVRow(hospital, ["name", "rating"]);
    expect(row.name).toBe("Lagos University Teaching Hospital");
    expect(row.rating).toBe(4.5);
  });
});