"use client";

import { useMemo, useState } from "react";
import type { Hospital } from "../types";

type EmailShareDialogProps = {
  hospitals: Hospital[];
  shareLink: string;
  open: boolean;
  onClose: () => void;
};

export default function EmailShareDialog({
  hospitals,
  shareLink,
  open,
  onClose,
}: EmailShareDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("Carefinder hospital list");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);

  const selectedHospitals = useMemo(
    () => hospitals.filter((h) => selectedIds.includes(h.id)),
    [hospitals, selectedIds],
  );

  const toggleHospital = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSend = async () => {
    setStatus("");
    if (!recipientEmail.trim()) {
      setStatus("Please enter a recipient email.");
      return;
    }
    if (selectedHospitals.length === 0) {
      setStatus("Select at least one hospital.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/share-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          subject,
          message,
          shareLink,
          hospitals: selectedHospitals,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error || "Failed to send email.");
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Share hospitals by email
            </h2>
            <p className="text-sm text-slate-500 hidden sm:block">
              Choose hospitals to send, then email the list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Email sent!
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Hospital list sent to <strong>{recipientEmail}</strong>
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
            {/* Left — form */}
            <div className="flex flex-col gap-4 p-5 md:w-[45%] overflow-y-auto shrink-0">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recipient email *
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  title="Email subject"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Add a short note..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                <p className="font-medium mb-1">💡 Tip</p>
                <p>
                  Select hospitals on the right. The email includes a link to
                  your current search.
                </p>
              </div>

              {status && (
                <p
                  className={`text-sm font-medium ${status.includes("success") ? "text-emerald-600" : "text-red-500"}`}
                >
                  {status}
                </p>
              )}

              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-auto"
              >
                {sending
                  ? "Sending..."
                  : `Send to ${selectedIds.length} hospital${selectedIds.length !== 1 ? "s" : ""}`}
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-100 shrink-0" />
            <div className="block md:hidden h-px bg-gray-100 mx-5 shrink-0" />

            {/* Right — hospital list */}
            <div className="flex flex-col flex-1 min-h-0 p-5 md:overflow-y-auto">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-sm font-semibold text-slate-900">
                  Select hospitals
                  <span className="ml-2 text-emerald-600">
                    ({selectedIds.length}/{hospitals.length})
                  </span>
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedIds(hospitals.map((h) => h.id))}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[35vh] md:max-h-none">
                {hospitals.map((h) => (
                  <label
                    key={h.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(h.id)}
                      onChange={() => toggleHospital(h.id)}
                      aria-label={`Select ${h.name}`}
                      title={`Select ${h.name}`}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0 accent-emerald-600"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm leading-snug">
                        {h.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {h.city}, {h.lga}, {h.state}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {h.specialty?.slice(0, 3).join(", ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
