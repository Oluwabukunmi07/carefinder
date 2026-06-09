"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useRequireAdmin } from "../../../../../lib/useRequireAdmin";
import { ArrowLeft } from "lucide-react";

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

type FormErrors = Partial<
  Record<keyof z.infer<typeof HospitalSchema>, string>
> & {
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
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={String(form[field] ?? "")}
      onChange={(e) => set(field, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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

    let uploadedImageUrl = "";
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("hospital-images")
        .upload(fileName, imageFile);
      if (uploadError) {
        alert("Image upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("hospital-images")
        .getPublicUrl(fileName);
      uploadedImageUrl = urlData.publicUrl;
    }

    const { latitude, longitude, ...rest } = parsed.data;
    const { error } = await supabase.from("hospitals").insert({
      ...rest,
      specialty: selectedSpecialties,
      location: { type: "Point", coordinates: [longitude, latitude] },
      image_url: uploadedImageUrl,
    });

    if (error) {
      alert("Error saving: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
  };

  if (adminLoading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">Add New Hospital</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ownership *
              </label>
              <select
                value={form.ownership}
                onChange={(e) => set("ownership", e.target.value)}
                title="Ownership"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedSpecialties.includes(s)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-gray-200 hover:border-emerald-400"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <MDEditor
              value={form.description}
              onChange={(val) => set("description", val ?? "")}
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital Image
            </label>
            <input
              type="file"
              accept="image/*"
              title="Upload hospital image"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-2"
          >
            {saving ? "Saving..." : "Create Hospital"}
          </button>
        </div>
      </div>
    </main>
  );
}
