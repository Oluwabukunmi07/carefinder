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
          if (filters.specialty)
            query = query.contains("specialty", [filters.specialty]);
          if (filters.ownership)
            query = query.eq("ownership", filters.ownership);
          if (filters.city) query = query.ilike("city", `%${filters.city}%`);
          if (filters.lga) query = query.ilike("lga", `%${filters.lga}%`);
          const { data: queryData, error } = await query;
          if (error) throw error;
          data = queryData;
        }
        setHospitals(data as Hospital[]);
      } catch (error: unknown) {
        console.error("Full error:", JSON.stringify(error));
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
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Nigeria&apos;s Hospital Directory
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              Your city. Your hospital.
              <br />
              <span className="text-emerald-600">Your health.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500">
              Search thousands of hospitals across Nigeria by name, city,
              specialty, or your current location.
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {hospitals.length}
            </span>{" "}
            hospital{hospitals.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              disabled={hospitals.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-slate-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={shareLink}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-slate-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Share
            </button>
            <button
              onClick={() => setEmailShareOpen(true)}
              disabled={hospitals.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Email
            </button>
          </div>
        </div>

        {/* Map + List */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map */}
          <div className="flex-1 rounded-2xl overflow-hidden h-[300px] lg:h-[560px] shadow-sm border border-gray-100">
            <HospitalMap hospitals={hospitals} />
          </div>

          {/* Hospital List */}
          <div className="w-full lg:w-[400px] lg:flex-shrink-0 overflow-y-auto max-h-[560px] space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-slate-400">Loading hospitals...</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-slate-400">No hospitals found.</p>
              </div>
            ) : (
              hospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))
            )}
          </div>
        </div>
      </div>

      <EmailShareDialog
        hospitals={hospitals}
        shareLink={currentShareLink}
        open={emailShareOpen}
        onClose={() => setEmailShareOpen(false)}
      />
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
