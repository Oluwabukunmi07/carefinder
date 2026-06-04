"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import type { Hospital } from "../../types";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import { Plus, LogOut, Pencil, Trash2 } from "lucide-react";

export default function AdminPage() {
  const adminLoading = useRequireAdmin();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (adminLoading) return;

    const fetchHospitals = async () => {
      const { data } = await supabase
        .from("hospitals")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setHospitals(data as Hospital[]);
    };

    void fetchHospitals();
  }, [adminLoading]);

  const deleteHospital = async (id: string) => {
    if (!confirm("Delete this hospital? This cannot be undone.")) return;
    setDeleting(id);
    const { error } = await supabase.from("hospitals").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    }
    setDeleting(null);
  };

  if (adminLoading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">
                {hospitals.length}
              </span>{" "}
              hospitals in database
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin/hospitals/new")}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Hospital
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/admin/login");
              }}
              className="flex items-center gap-2 border border-gray-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">
                    {h.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {h.city}, {h.state}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    h.ownership === "public"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {h.ownership}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Rating: {h.rating ?? "—"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push(`/admin/hospitals/${h.id}/edit`)}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 text-slate-700 px-3 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={() => deleteHospital(h.id)}
                  disabled={deleting === h.id}
                  className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {deleting === h.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  City
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rating
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {h.name}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{h.city}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        h.ownership === "public"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {h.ownership}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {h.rating ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/hospitals/${h.id}/edit`)
                        }
                        className="flex items-center gap-1.5 border border-gray-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHospital(h.id)}
                        disabled={deleting === h.id}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {deleting === h.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
