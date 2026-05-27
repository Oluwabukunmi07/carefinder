import type { Hospital } from "../types";
import { Phone, MapPin } from "lucide-react";

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-semibold text-gray-800">{hospital.name}</h2>
        <span
          className={`text-xs px-2 py-1 rounded font-medium ${
            hospital.ownership === "public"
              ? "bg-blue-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {hospital.ownership}
        </span>
      </div>

      <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
        <MapPin size={14} />
        <span>
          {hospital.address}, {hospital.city}, {hospital.state}
        </span>
      </div>

      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
        <Phone size={14} />
        <span>{hospital.phone}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {hospital.specialty.map((s) => (
          <span
            key={s}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
