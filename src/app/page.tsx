"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import HospitalCard from "../components/HospitalCard";
import type { SearchFIlters, Hospital } from "../types";
import { supabase } from "../lib/supabase";
import HospitalMap from "../components/HospitalMap";

export default function Home() {
  const [filters, setFilters] = useState<SearchFIlters>({
    query: "",
    specialty: "",
    ownership: "",
    city: "",
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    setLoading(true);
    let query = supabase.from("hospitals").select("*");

    if (filters.query) {
      query = query.ilike("name", `%${filters.query}%`);
    }
    if (filters.specialty) {
      query = query.contains("specialty", [filters.specialty]);
    }
    if (filters.ownership) {
      query = query.eq("ownership", filters.ownership);
    }

    const { data, error } = await query;

    if (error) console.error(error);
    else setHospitals(data as Hospital[]);
    console.log("Fetched hospitals:", data);
    setLoading(false);
  }

  const handleSearch = (newFilters: SearchFIlters) => {
    setFilters(newFilters);
    console.log("Searching with:", newFilters);
  };

  useEffect(() => {
    fetchHospitals();
  }, [filters]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-2">
          Carefinder
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Find hospitals near you across Nigeria
        </p>
        <SearchBar onSearch={handleSearch} />

        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <HospitalMap hospitals={hospitals} />
          </div>
          <div className="w-1/2 overflow-y-auto" style={{ height: "450px" }}>
            {loading ? (
              <p className="text-center text-gray-400">Loading hospitals...</p>
            ) : hospitals.length === 0 ? (
              <p className="text-center text-gray-400">No hospitals found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
