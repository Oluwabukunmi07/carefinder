"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Star, Clock } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import HospitalMap from "../../../components/HospitalMap";
import type { Hospital } from "../../../types";
import ReviewSection from "../../../components/ReviewSection";

export default function HospitalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      const { data, error: fetchError } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setHospital(data as Hospital);
      setLoading(false);
    };

    fetchHospital();
  }, [id]);

  const latitude = Array.isArray(hospital?.location?.coordinates)
    ? hospital?.location?.coordinates?.[1]
    : undefined;
  const longitude = Array.isArray(hospital?.location?.coordinates)
    ? hospital?.location?.coordinates?.[0]
    : undefined;

  if (loading) {
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  }

  if (error || !hospital) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Hospital not found
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {error || "We couldn't load this hospital."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to search
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold mb-1">
                  Hospital Profile
                </p>
                <h1 className="text-3xl font-bold text-gray-900">
                  {hospital.name}
                </h1>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  hospital.ownership === "public"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {hospital.ownership}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Address</p>
                  <p>
                    {hospital.address}, {hospital.city}, {hospital.lga},{" "}
                    {hospital.state}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Phone size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <p>{hospital.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Mail size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p>{hospital.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Clock size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Visiting Hours</p>
                  <p>{hospital.visiting_hours || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {hospital.specialty.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Description
              </h2>
              <p className="text-gray-700 leading-7">
                {hospital.description || "No description available."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Star size={16} className="text-yellow-500" />
              <span>Rating: {hospital.rating ?? "—"}</span>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <HospitalMap hospitals={[hospital]} />
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Quick Details
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">State:</span>{" "}
                  {hospital.state}
                </p>
                <p>
                  <span className="font-medium text-gray-800">LGA:</span>{" "}
                  {hospital.lga}
                </p>
                <p>
                  <span className="font-medium text-gray-800">City:</span>{" "}
                  {hospital.city}
                </p>
                {latitude && longitude ? (
                  <p>
                    <span className="font-medium text-gray-800">Coords:</span>{" "}
                    {latitude}, {longitude}
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        <ReviewSection hospitalId={hospital.id} />
      </div>
    </main>
  );
}
