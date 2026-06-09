"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { SearchFilters, Specialty } from "../types";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | "">("");
  const [ownership, setOwnership] = useState<"" | "public" | "private">("");
  const [city, setCity] = useState("");
  const [lga, setLga] = useState("");
  const [radius, setRadius] = useState<number>(10);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getUserLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setLocating(false);
        alert("Could not get your location. Please enable location access.");
      },
    );
  };

  const handleSearch = () => {
    onSearch({
      query,
      specialty,
      ownership,
      city,
      lga,
      radius: userLocation ? radius : undefined,
      userLat: userLocation?.lat,
      userLng: userLocation?.lng,
    });
  };

  const activeFilterCount = [city, lga, specialty, ownership].filter(
    Boolean,
  ).length;

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Main search row */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Hospital name, city, or LGA..."
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-gray-200 text-slate-600 hover:bg-gray-50"
          }`}
        >
          {filtersOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors text-sm font-medium flex-shrink-0"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Collapsible filters */}
      {filtersOpen && (
        <div className="px-4 sm:px-6 pb-3 border-t border-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            <input
              type="text"
              placeholder="City"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="LGA"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
            />
            <select
              aria-label="Filter by specialty"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Location row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button
              onClick={getUserLocation}
              className="flex items-center gap-1.5 text-sm text-slate-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin size={14} className="text-emerald-600" />
              {locating ? "Getting location..." : "Near me"}
            </button>
            {userLocation && (
              <>
                <span className="text-sm text-slate-500">Radius:</span>
                <select
                  aria-label="Select radius"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  ✓ Location set
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
