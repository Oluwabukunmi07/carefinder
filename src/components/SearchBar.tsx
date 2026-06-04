"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Main search row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-3">
        <input
          type="text"
          placeholder="Search by hospital name or city..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Search size={15} />
          Search
        </button>
      </div>

      {/* Filters row */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-3">
        <input
          type="text"
          placeholder="City"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="LGA"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
        />
        <select
          aria-label="Filter by specialty"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={getUserLocation}
          className="flex items-center gap-1.5 text-sm text-slate-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MapPin size={14} className="text-emerald-600" />
          {locating ? "Getting location..." : "Use my location"}
        </button>

        {userLocation !== null && (
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
  );
}
