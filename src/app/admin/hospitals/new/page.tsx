"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useRequireAdmin } from "../../../../lib/useRequireAdmin";

const HospitalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  lga: z.string().min(2, "LGA is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().regex(/^[0-9+\-\s()]{7,15}$/, "Invalid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  ownership: z.enum(["public", "private"]),
  rating: z.number().min(0).max(5).optional(),
  visiting_hours: z.string().optional(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type FormErrors = Partial<Record<keyof z.infer<typeof HospitalSchema>, string>> & {
  specialty?: string;
};

const SPECIALTIES = [
  "emergency",
  "maternity",
  "pediatric",
  "dental",
  "cardiology",
  "surgery",
  "ophthalmology",
  "psychiatry",
];

interface FieldProps {
  label: string;
  field: string;
  type?: string;
  placeholder?: string;
  // use unknown instead of any to satisfy lint rule
  form: Record<string, unknown>;
  errors: FormErrors;
  set: (field: string, value: string) => void;
}

const Field = ({
  label,
  field,
  type = "text",
  placeholder = "",
  form,
  errors,
  set,
}: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={String(form[field] ?? "")}
      onChange={(e) => set(field, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors[field as keyof FormErrors] && (
      <p className="text-red-500 text-xs mt-1">
        {errors[field as keyof FormErrors]}
      </p>
    )}
  </div>
);

export default function NewHospitalPage() {
  const router = useRouter();
  const adminLoading = useRequireAdmin();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    lga: "",
    state: "",
    phone: "",
    email: "",
    ownership: "public" as "public" | "private",
    rating: "",
    visiting_hours: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSpecialty = (s: string) =>
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSubmit = async () => {
    setErrors({});

    const parsed = HospitalSchema.safeParse({
      ...form,
      rating: form.rating ? Number(form.rating) : undefined,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      email: form.email || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      parsed.error.issues.forEach((e) => {
        const field = e.path[0] as keyof FormErrors;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (selectedSpecialties.length === 0) {
      setErrors({ specialty: "Select at least one specialty" });
      return;
    }

    setSaving(true);
    const { latitude, longitude, ...rest } = parsed.data;
    const { error } = await supabase.from("hospitals").insert({
      ...rest,
      specialty: selectedSpecialties,
      location: { type: "Point", coordinates: [longitude, latitude] },
    });

    if (error) {
      alert("Error saving: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
  };

  if (adminLoading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-blue-700">Add New Hospital</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <Field
            label="Hospital Name *"
            field="name"
            placeholder="Lagos University Teaching Hospital"
            form={form}
            errors={errors}
            set={set}
          />
          <Field
            label="Address *"
            field="address"
            placeholder="123 Hospital Road"
            form={form}
            errors={errors}
            set={set}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City *"
              field="city"
              placeholder="Lagos"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="LGA *"
              field="lga"
              placeholder="Surulere"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="State *"
              field="state"
              placeholder="Lagos"
              form={form}
              errors={errors}
              set={set}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership *
              </label>
              <select
                value={form.ownership}
                onChange={(e) => set("ownership", e.target.value)}
                title="Ownership"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Phone *"
              field="phone"
              placeholder="08012345678"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="Email"
              field="email"
              type="email"
              placeholder="info@hospital.com"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Latitude *"
              field="latitude"
              type="number"
              placeholder="6.5120"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="Longitude *"
              field="longitude"
              type="number"
              placeholder="3.3600"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedSpecialties.includes(s)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.specialty && (
              <p className="text-red-500 text-xs mt-2">{errors.specialty}</p>
            )}
          </div>

          <Field
            label="Visiting Hours"
            field="visiting_hours"
            placeholder="Mon-Fri 8am-6pm"
            form={form}
            errors={errors}
            set={set}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief description of the hospital..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Field
            label="Rating (0-5)"
            field="rating"
            type="number"
            placeholder="4.5"
            form={form}
            errors={errors}
            set={set}
          />

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : "Create Hospital"}
          </button>
        </div>
      </div>
    </main>
  );
}
