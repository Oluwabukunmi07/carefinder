"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import type { Hospital } from "../../types";
import { useRequireAdmin } from "../../lib/useRequireAdmin";

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

  if (adminLoading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/hospitals/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Hospital
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        <p className="text-gray-500 mb-6">
          {hospitals.length} hospitals in database
        </p>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">City</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3 text-gray-500">{h.city}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        h.ownership === "public"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {h.ownership}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{h.rating ?? "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/hospitals/${h.id}/edit`)
                      }
                      className="bg-yellow-400 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHospital(h.id)}
                      disabled={deleting === h.id}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting === h.id ? "..." : "Delete"}
                    </button>
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
