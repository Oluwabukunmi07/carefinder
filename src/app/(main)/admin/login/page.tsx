"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user ?? (await supabase.auth.getUser()).data.user;

    if (!user) {
      setError(
        "Signed in, but no user session was returned. Please try again.",
      );
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      setError("This account is not marked as an admin in profiles.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Logo */}
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
            Admin Login
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Sign in to manage hospital records and entries.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            Public visitors do not need an account.
          </p>
        </div>
      </div>
    </main>
  );
}
