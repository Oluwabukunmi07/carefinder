import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../../components/SearchBar";

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/hospital name, city, or lga/i),
    ).toBeInTheDocument();
  });

  it("renders filters button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /filters/i }),
    ).toBeInTheDocument();
  });

  it("renders search button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch when search button is clicked", () => {
    const mockSearch = vi.fn();
    render(<SearchBar onSearch={mockSearch} />);
    const button = screen.getByRole("button", { name: /search/i });
    fireEvent.click(button);
    expect(mockSearch).toHaveBeenCalled();
  });
});
