import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../../components/SearchBar";

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders specialty filter", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByText(/all specialties/i)).toBeInTheDocument();
  });

  it("renders ownership filter", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByText(/all types/i)).toBeInTheDocument();
  });

  it("calls onSearch when search button is clicked", () => {
    const mockSearch = vi.fn();
    render(<SearchBar onSearch={mockSearch} />);
    const button = screen.getByRole("button", { name: /search/i });
    fireEvent.click(button);
    expect(mockSearch).toHaveBeenCalled();
  });
});