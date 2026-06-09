"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Star, Clock } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import HospitalMap from "../../../components/HospitalMap";
import type { Hospital } from "../../../types";
import ReviewSection from "../../../components/ReviewSection";
import { marked } from "marked";
import DOMPurify from "dompurify";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Hospital not found
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {error || "We couldn't load this hospital."}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to search
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main info */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-1">
                  Hospital Profile
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {hospital.name}
                </h1>
                {hospital.rating != null && (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i <= Math.round(hospital.rating!)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                    <span className="text-sm text-slate-500 ml-1">
                      {hospital.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  hospital.ownership === "public"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                {hospital.ownership}
              </span>
            </div>

            {/* Image */}
            {hospital.image_url && (
              <div className="mb-6 rounded-xl overflow-hidden h-48">
                <img
                  src={hospital.image_url}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contact grid */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <div>
                  <p className="font-medium text-slate-800 mb-0.5">Address</p>
                  <p>
                    {hospital.address}, {hospital.city}, {hospital.lga},{" "}
                    {hospital.state}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <Phone size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800 mb-0.5">Phone</p>
                  <p>{hospital.phone}</p>
                </div>
              </div>
              {hospital.email && (
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-slate-800 mb-0.5">Email</p>
                    <p>{hospital.email}</p>
                  </div>
                </div>
              )}
              {hospital.visiting_hours && (
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Clock
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-slate-800 mb-0.5">
                      Visiting Hours
                    </p>
                    <p>{hospital.visiting_hours}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {hospital.specialty.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-slate-600 border border-gray-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {hospital.description && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  About
                </h2>
                <div
                  className="text-slate-600 leading-7 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      marked(hospital.description) as string,
                    ),
                  }}
                />
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-[360px]">
              <HospitalMap hospitals={[hospital]} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Quick Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">State</span>
                  <span className="font-medium text-slate-800">
                    {hospital.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">LGA</span>
                  <span className="font-medium text-slate-800">
                    {hospital.lga}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">City</span>
                  <span className="font-medium text-slate-800">
                    {hospital.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      hospital.ownership === "public"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {hospital.ownership}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ReviewSection hospitalId={hospital.id} />
      </div>
    </main>
  );
}
