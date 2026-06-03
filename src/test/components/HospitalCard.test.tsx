import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HospitalCard from "../../components/HospitalCard";
import type { Hospital } from "../../types";

const mockHospital: Hospital = {
  id: "1",
  name: "Lagos University Teaching Hospital",
  address: "Ishaga Road, Surulere",
  city: "Lagos",
  lga: "Surulere",
  state: "Lagos",
  phone: "08012345678",
  email: "luth@health.gov.ng",
  specialty: ["emergency", "maternity"],
  ownership: "public",
  rating: 4.5,
  created_at: "",
};

describe("HospitalCard", () => {
  it("renders hospital name", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText("Lagos University Teaching Hospital")).toBeInTheDocument();
  });

 it("renders hospital city", () => {
  render(<HospitalCard hospital={mockHospital} />);
  expect(screen.getByText(/Ishaga Road, Surulere, Lagos, Lagos/i)).toBeInTheDocument();
});

  it("renders hospital phone", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText(/08012345678/i)).toBeInTheDocument();
  });

  it("renders ownership badge", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText(/public/i)).toBeInTheDocument();
  });
});