"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
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
      setError("Signed in, but no user session was returned. Please try again.");
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
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 px-4 py-8 sm:px-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Admin Login</h1>
        <p className="text-gray-500 text-sm mb-2">
          Carefinder Admin Dashboard
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Public visitors do not need an account. Admins sign in here to manage
          hospital records.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
