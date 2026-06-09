"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "150+", label: "Hospitals listed" },
  { value: "36", label: "States covered" },
  { value: "Free", label: "Always free to use" },
];

const FEATURES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-7 h-7"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        <path d="M11 8v6M8 11h6" strokeLinecap="round" />
      </svg>
    ),
    title: "Search & Map",
    desc: "Find hospitals by name, city, specialty, or your current location — plotted live on an interactive map.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-7 h-7"
      >
        <path
          d="M12 16V4M8 12l4 4 4-4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 20h16" strokeLinecap="round" />
      </svg>
    ),
    title: "Export & Share",
    desc: "Download hospital lists as CSV or share a filtered view directly with anyone via a simple link.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-7 h-7"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Reviews",
    desc: "Read verified patient reviews and share your own experience to help others make informed decisions.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Search by location or name",
    desc: "Type a city, state, hospital name, or specialty — or just tap 'Use my location'.",
  },
  {
    step: "2",
    title: "Browse and filter results",
    desc: "Narrow down by state, services offered, or map proximity. See contact info at a glance.",
  },
  {
    step: "3",
    title: "Save, share, or export",
    desc: "Export your results as a CSV, share a link, or leave a review for a hospital you've visited.",
  },
];

function NigeriaOutline() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.055] pointer-events-none select-none"
      aria-hidden="true"
    >
      <path
        d="M60 30 L80 20 L110 18 L140 25 L160 40 L170 60 L165 80 L175 100 L170 125 L155 145 L140 160 L120 170 L100 175 L80 168 L60 155 L45 138 L35 118 L32 95 L38 72 L48 52 Z"
        stroke="#059669"
        strokeWidth="2.5"
        fill="#059669"
      />
    </svg>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-[Outfit,sans-serif] text-gray-900">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16"
      >
        <NigeriaOutline />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1fae5 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-6">
              <span className="w-6 h-px bg-emerald-600" />
              Nigeria&apos;s Hospital Directory
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight text-gray-900 mb-6">
              Find hospitals <span className="text-emerald-600">anywhere</span>
              <br />
              in Nigeria
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
              Search, filter, export and share hospital information across all
              36 states — free, fast, and built for Nigerians.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-200"
              >
                Find Hospitals
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* STATS */}
      <section className="bg-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 divide-x divide-emerald-500">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-2 gap-1"
            >
              <span className="text-3xl font-bold tracking-tight">
                {s.value}
              </span>
              <span className="text-sm text-emerald-100">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
            What you can do
          </span>
          <h2 className="text-3xl font-bold mt-3 text-gray-900">
            Everything you need to find care
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">
              How it works
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900">
              Find a hospital in three steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-6 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-emerald-100" />
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 text-emerald-600 font-bold text-lg flex items-center justify-center mb-5 z-10 shadow-sm">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ready to find care near you?
        </h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          Browse hospitals across Nigeria — no account needed.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-9 py-4 rounded-xl transition-colors text-base shadow-lg shadow-emerald-200"
        >
          Find Hospitals
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
