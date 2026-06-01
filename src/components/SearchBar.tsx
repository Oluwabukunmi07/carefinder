"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="City"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          type="text"
          placeholder="LGA"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
        />

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

        <div className="flex gap-2 items-center mt-2 flex-wrap">
          <button
            onClick={getUserLocation}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
          >
            {locating ? "Getting location..." : "Use my location"}
          </button>

          {userLocation !== null && (
            <>
              <span className="text-sm text-gray-500">Radius:</span>
              <select
                aria-label="Select radius"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
              <span className="text-sm text-green-600">Location set!</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
