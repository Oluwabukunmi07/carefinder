"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { SearchFIlters, Specialty } from "../types";

interface SearchBarProps {
  onSearch: (filters: SearchFIlters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | "">("");
  const [ownership, setOwnership] = useState<"" | "public" | "private">("");

  const handleSearch = () => {
    onSearch({ query, specialty, ownership, city: "" });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-8">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by hospital name or city..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Search size={16} />
          Search
        </button>
      </div>
      <div className="flex gap-2">
        <select
          aria-label="Filter by specialty"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value as Specialty | "")}
        >
          <option value="">All Specialties</option>
          <option value="emergency">Emergency</option>
          <option value="maternity">Maternity</option>
          <option value="pediatric">Pediatric</option>
          <option value="dental">Dental</option>
          <option value="cardiology">Cardiology</option>
          <option value="surgery">Surgery</option>
          <option value="ophthalmology">Ophthalmology</option>
          <option value="psychiatry">Psychiatry</option>
        </select>
        <select
          aria-label="Filter by ownership"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
          value={ownership}
          onChange={(e) =>
            setOwnership(e.target.value as "" | "public" | "private")
          }
        >
          <option value="">All Types</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
    </div>
  );
}
