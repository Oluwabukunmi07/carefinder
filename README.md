# 🏥 Carefinder

> Find hospitals near you across Nigeria

Carefinder is a full-stack hospital directory web application built with Next.js and Supabase. It allows anyone to search, filter, and locate hospitals across Nigeria, export results, share lists via email or link, and enables admins to manage hospital data through a secure dashboard.

---

## 🚀 Live Demo

_Coming soon — deployment in progress_

---

## ✨ Features

### Public

- **Hospital Search** — search by name, city, or LGA with real-time filtering
- **Filter by Specialty** — emergency, maternity, pediatric, dental, cardiology, surgery, ophthalmology, psychiatry
- **Filter by Ownership** — public or private hospitals
- **Interactive Map** — Mapbox GL JS map with hospital pins and popups, split view alongside list
- **Radius Search** — find hospitals within X km of your location using PostGIS and the Browser Geolocation API
- **Hospital Detail Page** — full info including address, phone, email, specialties, visiting hours, description, and rating
- **Ratings & Reviews** — logged-in users can leave 1–5 star ratings and text reviews; admins can moderate
- **CSV Export** — export current filtered results to a CSV file using PapaParse (client-side, no server round-trip)
- **Shareable Links** — generate a human-readable URL that reproduces exact search results when opened
- **Email Sharing** — send a curated hospital list to any email address via Resend API

### Admin

- **Secure Admin Dashboard** — role-based access control via Supabase Auth and Row Level Security
- **Hospital CRUD** — create, edit, and delete hospital entries with Zod form validation
- **Markdown Editor** — write rich hospital descriptions with live preview
- **Review Moderation** — approve or hide user-submitted reviews
- **Admin Invite-Only** — new admins created by existing admins only (no public sign-up for admin role)

---

## 🛠 Tech Stack

| Area            | Technology                            |
| --------------- | ------------------------------------- |
| Framework       | Next.js 15 (App Router)               |
| Database        | Supabase (PostgreSQL + PostGIS)       |
| Auth            | Supabase Auth with Row Level Security |
| Map             | Mapbox GL JS via react-map-gl         |
| CSV Export      | PapaParse (client-side)               |
| Email Sharing   | Resend API                            |
| Form Validation | Zod                                   |
| Styling         | Tailwind CSS                          |
| Deployment      | Vercel                                |

---

## 🗄 Database Schema

```sql
-- Hospitals table
create table hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  lga text not null,
  state text not null,
  phone text not null,
  email text,
  specialty text[] not null default '{}',
  ownership text check (ownership in ('public', 'private')),
  description text,
  visiting_hours text,
  rating numeric,
  image_url text,
  location jsonb,
  created_at timestamptz default now()
);

-- Reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospitals(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating integer check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);

-- Profiles table (for role-based access)
create table profiles (
  id uuid primary key references auth.users(id),
  role text default 'user'
);
```

---

## 🔐 Row Level Security

- **Public users** can `SELECT` all hospitals and reviews without logging in
- **Authenticated users** can insert reviews and edit their own reviews only
- **Admin users** can `INSERT`, `UPDATE`, and `DELETE` hospitals and moderate reviews
- RLS is enforced at the database layer — no custom middleware needed

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Mapbox account (for the map)
- A Resend account (for email sharing)

### Installation

```bash
# Clone the repository
git clone https://github.com/oluwabukunmi07/carefinder.git
cd carefinder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage — search, map, list
│   ├── hospitals/
│   │   └── [id]/page.tsx         # Hospital detail page
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── login/page.tsx        # Admin login
│   │   └── hospitals/
│   │       ├── new/page.tsx      # Create hospital
│   │       └── [id]/edit/page.tsx # Edit hospital
│   └── api/
│       └── share-email/route.ts  # Resend email API route
├── components/
│   ├── HospitalCard.tsx          # Hospital list card
│   ├── HospitalMap.tsx           # Mapbox map component
│   ├── SearchBar.tsx             # Search + filter bar
│   └── EmailShareDialog.tsx      # Email sharing modal
├── lib/
│   └── supabase.ts               # Supabase client
└── types/
    └── index.ts                  # TypeScript types
```

---

## 🧪 Testing

```bash
# Unit + component tests
npm run test

# E2E tests
npm run test:e2e
```

Test coverage includes:

- CSV column selection logic
- PostGIS distance calculation
- Search filter logic
- HospitalCard rendering
- SearchBar interactions
- Admin form validation
- E2E: search, export CSV, share link, admin login, RLS enforcement

---

## 👤 Author

**Oluwabukunmi**

- GitHub: [@oluwabukunmi07](https://github.com/oluwabukunmi07)

---

## 📄 License

This project was built as part of the AltSchool Africa curriculum.
