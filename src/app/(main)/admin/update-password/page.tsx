"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        // User is now signed in via the magic link, ready to set password
      }
    });
  }, []);

  const handleUpdatePassword = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-lg font-bold text-slate-900">Carefinder</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Set your password
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Choose a password to complete your admin account setup.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && void handleUpdatePassword()
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && void handleUpdatePassword()
                }
              />
            </div>
            <button
              onClick={() => void handleUpdatePassword()}
              disabled={loading || !password.trim() || !confirmPassword.trim()}
              className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? "Saving..." : "Set Password"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
