"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import SearchBar from "../../../components/SearchBar";
import HospitalCard from "../../../components/HospitalCard";
import HospitalMap from "../../../components/HospitalMap";
import EmailShareDialog from "../../../components/EmailShareDialog";
import type { SearchFilters, Hospital } from "../../../types";
import { supabase } from "../../../lib/supabase";
import Papa from "papaparse";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  const [copied, setCopied] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "",
  );

  const handleSearch = (newFilters: SearchFilters) => setFilters(newFilters);

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
          if (filters.query)
            query = query.or(
              `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%`,
            );
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

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    setMobileTab("list");
    setTimeout(() => {
      document.getElementById(`hospital-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

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
    const url = `${window.location.origin}/search?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentShareLink = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.ownership) params.set("ownership", filters.ownership);
    if (filters.city) params.set("city", filters.city);
    if (filters.lga) params.set("lga", filters.lga);
    if (filters.radius) params.set("radius", filters.radius.toString());
    return origin
      ? `${origin}/search?${params.toString()}`
      : `/search?${params.toString()}`;
  }, [filters, origin]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* TOP BAR */}
      <div className="flex-shrink-0">
        <SearchBar onSearch={handleSearch} />
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-2 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {hospitals.length}
            </span>{" "}
            hospital{hospitals.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center gap-2">
            {/* Mobile tab toggle */}
            <div className="flex lg:hidden gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setMobileTab("list")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  mobileTab === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setMobileTab("map")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  mobileTab === "map"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Map
              </button>
            </div>
            <button
              onClick={exportCSV}
              disabled={hospitals.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-slate-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={shareLink}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-slate-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {copied ? "✓ Copied!" : "Share"}
            </button>
            <button
              onClick={() => setEmailShareOpen(true)}
              disabled={hospitals.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Email
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden flex">
        {/* Hospital list */}
        <div
          className={`w-full lg:w-[420px] lg:flex-shrink-0 overflow-y-auto bg-gray-50 border-r border-gray-100 p-3 space-y-3 ${
            mobileTab === "map" ? "hidden lg:block" : "block"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-slate-400">Loading hospitals...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-sm font-medium text-slate-600">
                No hospitals found
              </p>
              <p className="text-xs text-slate-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            hospitals.map((hospital) => (
              <div key={hospital.id} id={`hospital-${hospital.id}`}>
                <HospitalCard
                  hospital={hospital}
                  highlighted={selectedId === hospital.id}
                />
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div
          className={`flex-1 h-full ${mobileTab === "list" ? "hidden lg:block" : "block"}`}
        >
          <HospitalMap
            hospitals={hospitals}
            onHospitalClick={handleMarkerClick}
          />
        </div>
      </div>

      <EmailShareDialog
        hospitals={hospitals}
        shareLink={currentShareLink}
        open={emailShareOpen}
        onClose={() => setEmailShareOpen(false)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-gray-400 py-20">Loading...</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
