# Carefinder

Finding a hospital in Nigeria shouldn't be hard. Carefinder is a hospital directory that lets anyone search, filter, and locate hospitals across the country — with the option to export results, share lists, and leave reviews.

Built as my capstone project for AltSchool Africa.

**[View Live Demo](https://carefinder-01.vercel.app)**

---

## The problem

Access to healthcare information in Nigeria is fragmented. People often don't know what hospitals are nearby, what specialties they offer, or how to reach them. Carefinder addresses this by making hospital data searchable, shareable, and exportable — no account needed.

---

## Features

**Search & Discovery**

- Search by hospital name, city, or LGA
- Filter by specialty (emergency, maternity, pediatric, dental, and more) and ownership type
- Radius-based search using your current location and PostGIS geospatial queries
- Split view — interactive Mapbox map alongside a results list

**Sharing & Export**

- Export filtered results to a CSV file (client-side, no server round-trip)
- Generate a shareable link that reproduces your exact search when opened
- Send a curated hospital list to any email via Resend

**Reviews**

- Leave a 1–5 star rating and text review on any hospital
- Reviews require an account; reading is public

**Admin Dashboard**

- Create, edit, and delete hospital entries with a Markdown editor and live preview
- Moderate user reviews
- Role-based access enforced at the database level with Supabase Row Level Security
- Admin invite-only — no public sign-up for the admin role

---

## Tech stack

| Area       | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | Next.js (App Router)               |
| Database   | Supabase (PostgreSQL + PostGIS)    |
| Auth       | Supabase Auth + Row Level Security |
| Map        | Mapbox GL JS via react-map-gl      |
| CSV Export | PapaParse                          |
| Email      | Resend API                         |
| Validation | Zod + React Hook Form              |
| Styling    | Tailwind CSS                       |
| Deployment | Vercel                             |

---

## Getting started

```bash
git clone https://github.com/oluwabukunmi07/carefinder.git
cd carefinder
npm install
cp .env.example .env.local
npm run dev
```

### Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Tests

```bash
npm run test        # unit + component tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright)
```

Coverage includes CSV export logic, search filter logic, component rendering, admin auth flow, and RLS enforcement.

---

## Author

**Oluwabukunmi** — AltSchool Africa, Frontend Engineering  
[GitHub](https://github.com/oluwabukunmi07)
