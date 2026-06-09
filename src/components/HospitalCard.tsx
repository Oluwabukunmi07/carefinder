import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import type { Hospital } from "../types";

interface HospitalCardProps {
  hospital: Hospital;
  highlighted?: boolean;
}

export default function HospitalCard({
  hospital,
  highlighted,
}: HospitalCardProps) {
  return (
    <Link
      href={`/hospitals/${hospital.id}`}
      className={`block bg-white rounded-2xl border p-4 hover:border-emerald-200 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        highlighted
          ? "border-emerald-400 shadow-md shadow-emerald-50 ring-2 ring-emerald-100"
          : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <h2 className="text-base font-semibold text-slate-900 leading-snug">
          {hospital.name}
        </h2>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            hospital.ownership === "public"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {hospital.ownership}
        </span>
      </div>

      <div className="flex items-start gap-1.5 text-slate-500 text-xs mb-1.5">
        <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-500" />
        <span>
          {hospital.address}, {hospital.city}, {hospital.state}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
        <Phone size={13} className="shrink-0 text-emerald-500" />
        <span>{hospital.phone}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {hospital.specialty.map((s) => (
          <span
            key={s}
            className="text-xs bg-gray-50 text-slate-600 border border-gray-100 px-2 py-0.5 rounded-full"
          >
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
