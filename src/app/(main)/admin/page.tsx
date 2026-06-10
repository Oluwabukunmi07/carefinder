"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import type { Hospital } from "../../../types";
import { useRequireAdmin } from "../../../lib/useRequireAdmin";
import {
  Plus,
  LogOut,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle,
  UserPlus,
} from "lucide-react";

interface Review {
  id: string;
  hospital_id: string;
  rating: number;
  comment: string;
  created_at: string;
  approved: boolean;
  hospital?: { name: string };
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function AdminPage() {
  const adminLoading = useRequireAdmin();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hospitals" | "reviews">(
    "hospitals",
  );
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToasts((prev) => {
      const id = Date.now();
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000,
      );
      return [...prev, { id, message, type }];
    });
  };

  useEffect(() => {
    if (adminLoading) return;

    const fetchHospitals = async () => {
      const { data } = await supabase
        .from("hospitals")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setHospitals(data as Hospital[]);
    };

    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, hospital:hospital_id(name)")
        .order("created_at", { ascending: false });
      if (data) setReviews(data as Review[]);
    };

    void fetchHospitals();
    void fetchReviews();
  }, [adminLoading]);

  const deleteHospital = async (id: string) => {
    if (!confirm("Delete this hospital? This cannot be undone.")) return;
    setDeleting(id);
    const { error } = await supabase.from("hospitals").delete().eq("id", id);
    if (error) {
      showToast("Delete failed: " + error.message, "error");
    } else {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
      showToast("Hospital deleted.");
    }
    setDeleting(null);
  };

  const toggleReviewApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("reviews")
      .update({ approved: !approved })
      .eq("id", id);
    if (error) {
      showToast("Failed to update review: " + error.message, "error");
      return;
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !approved } : r)),
    );
    showToast(approved ? "Review hidden." : "Review approved.");
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      showToast("Delete failed: " + error.message, "error");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast("Review deleted.");
  };

  const inviteAdmin = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        showToast(data.error ?? "Failed to send invite.", "error");
      } else {
        showToast("Invite sent to " + inviteEmail.trim());
        setInviteEmail("");
        setShowInviteModal(false);
      }
    } catch {
      showToast("Unexpected error sending invite.", "error");
    } finally {
      setInviting(false);
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.state.toLowerCase().includes(hospitalSearch.toLowerCase()),
  );

  const filteredReviews = reviews.filter(
    (r) =>
      r.hospital?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.comment?.toLowerCase().includes(reviewSearch.toLowerCase()),
  );

  if (adminLoading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );

  const pendingReviews = reviews.filter((r) => !r.approved).length;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50">
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
              toast.type === "success"
                ? "bg-white border border-emerald-100 text-slate-800"
                : "bg-red-50 border border-red-100 text-red-700"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            )}
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">
                {hospitals.length}
              </span>{" "}
              hospitals ·{" "}
              <span className="font-semibold text-slate-700">
                {reviews.length}
              </span>{" "}
              reviews
              {pendingReviews > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingReviews} pending
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/admin/hospitals/new")}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Hospital
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 border border-gray-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <UserPlus size={16} />
              Invite Admin
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

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "hospitals"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "reviews"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Reviews
            {pendingReviews > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {pendingReviews}
              </span>
            )}
          </button>
        </div>

        {/* Hospitals Tab */}
        {activeTab === "hospitals" && (
          <>
            {/* Search */}
            <div className="mb-4 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 w-full sm:w-80">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
                className="text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none flex-1"
              />
              {hospitalSearch && (
                <button
                  type="button"
                  onClick={() => setHospitalSearch("")}
                  aria-label="Clear hospital search"
                >
                  <X
                    size={13}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              )}
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredHospitals.map((h) => (
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
                      onClick={() =>
                        router.push(`/admin/hospitals/${h.id}/edit`)
                      }
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
              {filteredHospitals.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  No hospitals match your search.
                </p>
              )}
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
                  {filteredHospitals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        No hospitals match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredHospitals.map((h) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <>
            {/* Search */}
            <div className="mb-4 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 w-full sm:w-80">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none flex-1"
              />
              {reviewSearch && (
                <button
                  type="button"
                  onClick={() => setReviewSearch("")}
                  aria-label="Clear review search"
                  title="Clear review search"
                >
                  <X
                    size={13}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              )}
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filteredReviews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  {reviewSearch
                    ? "No reviews match your search."
                    : "No reviews yet."}
                </p>
              ) : (
                filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h2 className="font-semibold text-slate-900 text-sm">
                          {r.hospital?.name ?? "—"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {"⭐".repeat(r.rating)}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                          r.approved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {r.comment || "—"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleReviewApproval(r.id, r.approved)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                          r.approved
                            ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                        }`}
                      >
                        {r.approved ? <X size={13} /> : <Check size={13} />}
                        {r.approved ? "Hide" : "Approve"}
                      </button>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {filteredReviews.length === 0 ? (
                <p className="text-slate-400 text-sm p-6">
                  {reviewSearch
                    ? "No reviews match your search."
                    : "No reviews yet."}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Hospital
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Rating
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Comment
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 font-medium text-slate-900 max-w-[150px] truncate">
                          {r.hospital?.name ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {"⭐".repeat(r.rating)}
                        </td>
                        <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">
                          {r.comment || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              r.approved
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {r.approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                toggleReviewApproval(r.id, r.approved)
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                r.approved
                                  ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                              }`}
                            >
                              {r.approved ? (
                                <X size={12} />
                              ) : (
                                <Check size={12} />
                              )}
                              {r.approved ? "Hide" : "Approve"}
                            </button>
                            <button
                              onClick={() => deleteReview(r.id)}
                              className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Invite Admin
              </h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close invite modal"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              They&apos;ll receive an email with a link to set up their account
              and will have full admin access immediately.
            </p>
            <input
              type="email"
              placeholder="admin@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void inviteAdmin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                className="px-4 py-2 text-sm text-slate-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void inviteAdmin()}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
