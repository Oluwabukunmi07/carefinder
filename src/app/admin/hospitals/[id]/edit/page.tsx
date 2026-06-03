"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useRequireAdmin } from "../../../../../lib/useRequireAdmin";

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

type FieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function EditHospitalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const adminLoading = useRequireAdmin();

  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (adminLoading) return;

    const fetchHospital = async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/admin");
        return;
      }

      setForm({
        name: data.name ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        lga: data.lga ?? "",
        state: data.state ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        ownership: data.ownership ?? "public",
        rating: data.rating?.toString() ?? "",
        visiting_hours: data.visiting_hours ?? "",
        description: data.description ?? "",
        latitude: data.location?.coordinates?.[1]?.toString() ?? "",
        longitude: data.location?.coordinates?.[0]?.toString() ?? "",
      });
      setSelectedSpecialties(data.specialty ?? []);
      setLoading(false);
    };
    fetchHospital();
  }, [adminLoading, id, router]);

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
    const updateData: Record<string, unknown> = {
      ...rest,
      specialty: selectedSpecialties,
      location: { type: "Point", coordinates: [longitude, latitude] },
    };

    if (uploadedImageUrl) {
      updateData.image_url = uploadedImageUrl;
    }

    const { error } = await supabase
      .from("hospitals")
      .update(updateData)
      .eq("id", id);

    if (error) {
      alert("Error saving: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
  };

  if (adminLoading || loading)
    return <p className="text-center mt-20">Loading...</p>;

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
          <h1 className="text-2xl font-bold text-blue-700">Edit Hospital</h1>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <Field
            label="Hospital Name *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
          />
          <Field
            label="Address *"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            error={errors.address}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City *"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              error={errors.city}
            />
            <Field
              label="LGA *"
              value={form.lga}
              onChange={(e) => set("lga", e.target.value)}
              error={errors.lga}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="State *"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              error={errors.state}
            />
            <div>
              <label
                htmlFor="ownership"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ownership *
              </label>
              <select
                id="ownership"
                value={form.ownership}
                onChange={(e) => set("ownership", e.target.value)}
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
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={errors.phone}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              type="email"
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Latitude *"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              type="number"
              error={errors.latitude}
            />
            <Field
              label="Longitude *"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              type="number"
              error={errors.longitude}
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
            value={form.visiting_hours}
            onChange={(e) => set("visiting_hours", e.target.value)}
            error={errors.visiting_hours}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <MDEditor
              value={form.description}
              onChange={(val) => set("description", val ?? "")}
            />
          </div>

          <Field
            label="Rating (0-5)"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            type="number"
            error={errors.rating}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Image
            </label>
            <input
              type="file"
              accept="image/*"
              title="Upload hospital image"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
