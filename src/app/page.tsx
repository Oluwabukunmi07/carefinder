"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import SearchBar from "../components/SearchBar";
import HospitalCard from "../components/HospitalCard";
import HospitalMap from "../components/HospitalMap";
import EmailShareDialog from "../components/EmailShareDialog";
import type { SearchFilters, Hospital } from "../types";
import { supabase } from "../lib/supabase";
import Papa from "papaparse";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get("query") || "",
    specialty: (searchParams.get("specialty") ||
      "") as SearchFilters["specialty"],
    ownership: (searchParams.get("ownership") ||
      "") as SearchFilters["ownership"],
    city: searchParams.get("city") || "",
    lga: searchParams.get("lga") || "",
    radius: searchParams.get("radius")
      ? Number(searchParams.get("radius"))
      : undefined,
  }));
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailShareOpen, setEmailShareOpen] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "",
  );

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
            query = query.or(
              `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%`,
            );
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

          if (filters.lga) {
            query = query.ilike("lga", `%${filters.lga}%`);
          }

          const { data: queryData, error } = await query;
          if (error) throw error;
          data = queryData;
        }

        setHospitals(data as Hospital[]);
      } catch (error: unknown) {
        console.error("Full error:", JSON.stringify(error));
        console.error("Error string:", String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [filters]);

  const exportCSV = () => {
    if (hospitals.length === 0) return;

    const csvData = hospitals.map((h) => ({
      Name: h.name,
      Address: h.address,
      City: h.city,
      LGA: h.lga,
      State: h.state,
      Phone: h.phone,
      Email: h.email || "",
      Specialties: h.specialty.join(", "),
      Ownership: h.ownership,
      Rating: h.rating,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospitals-${filters.city || "nigeria"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLink = () => {
    const params = new URLSearchParams();

    if (filters.query) params.set("query", filters.query);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.ownership) params.set("ownership", filters.ownership);
    if (filters.city) params.set("city", filters.city);
    if (filters.lga) params.set("lga", filters.lga);
    if (filters.radius) params.set("radius", filters.radius.toString());

    const url = `${window.location.origin}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const currentShareLink = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.query) params.set("query", filters.query);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.ownership) params.set("ownership", filters.ownership);
    if (filters.city) params.set("city", filters.city);
    if (filters.lga) params.set("lga", filters.lga);
    if (filters.radius) params.set("radius", filters.radius.toString());

    return origin ? `${origin}?${params.toString()}` : `/?${params.toString()}`;
  }, [filters, origin]);

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
            Carefinder
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Find hospitals near you across Nigeria
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} found
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              disabled={hospitals.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Export CSV
            </button>
            <button
              onClick={shareLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full sm:w-24"
            >
              Share
            </button>
            <button
              onClick={() => setEmailShareOpen(true)}
              disabled={hospitals.length === 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Email
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="w-full lg:w-1/2">
            <HospitalMap hospitals={hospitals} />
          </div>

          <div className="w-full lg:w-1/2 overflow-y-auto max-h-[420px] sm:max-h-[450px]">
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
        <EmailShareDialog
          hospitals={hospitals}
          shareLink={currentShareLink}
          open={emailShareOpen}
          onClose={() => setEmailShareOpen(false)}
        />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={<div className="text-center text-gray-400">Loading...</div>}
    >
      <HomeContent />
    </Suspense>
  );
}
