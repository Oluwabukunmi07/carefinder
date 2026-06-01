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

  const selectedHospitals = useMemo(
    () => hospitals.filter((hospital) => selectedIds.includes(hospital.id)),
    [hospitals, selectedIds],
  );

  const toggleHospital = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    setStatus("");

    if (!recipientEmail.trim()) {
      setStatus("Please enter a recipient email.");
      return;
    }

    if (selectedHospitals.length === 0) {
      setStatus("Select at least one hospital to share.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/share-email", {
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

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(data.error || "Failed to send email.");
        return;
      }

      setStatus("Email sent successfully.");
      setRecipientEmail("");
      setMessage("");
      setSelectedIds([]);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Share hospitals by email
            </h2>
            <p className="text-sm text-gray-500">
              Choose the hospitals to send, then email the list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="recipientEmail" className="mb-1 block text-sm font-medium text-gray-700">
                Recipient email
              </label>
              <input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Add a short note..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800">Tip</p>
              <p className="mt-1">
                Select the hospitals you want to include. The email will also
                contain a link to the current filtered search.
              </p>
            </div>

            {status ? (
              <p
                className={`text-sm ${
                  status.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {status}
              </p>
            ) : null}

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send email"}
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Select hospitals
              </h3>
              <button
                onClick={() =>
                  setSelectedIds(hospitals.map((hospital) => hospital.id))
                }
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Select all
              </button>
            </div>

            <div className="space-y-2">
              {hospitals.map((hospital) => (
                <label
                  key={hospital.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    title={hospital.name}
                    checked={selectedIds.includes(hospital.id)}
                    onChange={() => toggleHospital(hospital.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{hospital.name}</p>
                    <p className="text-sm text-gray-500">
                      {hospital.city}, {hospital.lga}, {hospital.state}
                    </p>
                    <p className="text-xs text-gray-400">
                      {hospital.specialty.join(", ")}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
