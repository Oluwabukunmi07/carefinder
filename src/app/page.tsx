"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import HospitalCard from "../components/HospitalCard";
import HospitalMap from "../components/HospitalMap";
import type { SearchFilters, Hospital } from "../types";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    specialty: "",
    ownership: "",
    city: "",
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        let data;

        if (filters.userLat && filters.userLng && filters.radius) {
          const { data: radiusData, error } = await supabase.rpc(
            "hospitals_within_radius",
            {
              lat: filters.userLat,
              lng: filters.userLng,
              radius_km: filters.radius,
            },
          );
          if (error) throw error;
          data = radiusData;
        } else {
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
          if (filters.city) {
            query = query.ilike("city", `%${filters.city}%`);
          }
          const { data: queryData, error } = await query;
          if (error) throw error;
          data = queryData;
        }

        setHospitals(data as Hospital[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [filters]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-2">
          Carefinder 🏥
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Find hospitals near you across Nigeria
        </p>
        <SearchBar onSearch={handleSearch} />
        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <HospitalMap hospitals={hospitals} />
          </div>
          <div className="w-1/2 overflow-y-auto h-[450px]">
            {loading ? (
              <p className="text-center text-gray-400">Loading hospitals...</p>
            ) : hospitals.length === 0 ? (
              <p className="text-center text-gray-400">No hospitals found.</p>
            ) : (
              <div className="flex flex-col gap-3">
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
