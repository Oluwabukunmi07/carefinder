begin;

create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists pg_trgm;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  lga text not null,
  state text not null,
  phone text not null,
  email text,
  specialty text[] not null default '{}'::text[],
  ownership text not null check (ownership in ('public', 'private')),
  visiting_hours text,
  description text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  image_url text,
  location jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hospitals_name_trgm_idx
  on public.hospitals
  using gin (name gin_trgm_ops);

create index if not exists hospitals_city_trgm_idx
  on public.hospitals
  using gin (city gin_trgm_ops);

create index if not exists hospitals_lga_trgm_idx
  on public.hospitals
  using gin (lga gin_trgm_ops);

create index if not exists hospitals_specialty_gin_idx
  on public.hospitals
  using gin (specialty);

create index if not exists profiles_role_idx
  on public.profiles (role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_role text;
begin
  derived_role := coalesce(new.raw_app_meta_data->>'role', 'user');

  insert into public.profiles (id, role)
  values (new.id, derived_role)
  on conflict (id) do update
    set role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of raw_app_meta_data on auth.users
for each row execute function public.handle_auth_user();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_hospitals_updated_at on public.hospitals;
create trigger touch_hospitals_updated_at
before update on public.hospitals
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.hospitals enable row level security;

grant select, update on table public.profiles to authenticated;
grant select on table public.hospitals to anon, authenticated;
grant insert, update, delete on table public.hospitals to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.hospitals_within_radius(double precision, double precision, double precision) to anon, authenticated;

drop policy if exists "Profiles are readable by owner and admins" on public.profiles;
create policy "Profiles are readable by owner and admins"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Profiles are updateable by owner and admins" on public.profiles;
create policy "Profiles are updateable by owner and admins"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "Hospitals are publicly readable" on public.hospitals;
create policy "Hospitals are publicly readable"
on public.hospitals
for select
to anon, authenticated
using (true);

drop policy if exists "Hospitals are manageable by admins" on public.hospitals;
drop policy if exists "Hospitals insertable by admins" on public.hospitals;
create policy "Hospitals insertable by admins"
on public.hospitals
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Hospitals updatable by admins" on public.hospitals;
create policy "Hospitals updatable by admins"
on public.hospitals
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Hospitals deletable by admins" on public.hospitals;
create policy "Hospitals deletable by admins"
on public.hospitals
for delete
to authenticated
using (public.is_admin());

create or replace function public.hospitals_within_radius(
  lat double precision,
  lng double precision,
  radius_km double precision
)
returns setof public.hospitals
language sql
stable
security definer
set search_path = public
as $$
  select h.*
  from public.hospitals h
  where h.location is not null
    and h.location ? 'coordinates'
    and jsonb_typeof(h.location->'coordinates') = 'array'
    and jsonb_array_length(h.location->'coordinates') = 2
    and st_dwithin(
      st_setsrid(
        st_makepoint(
          (h.location->'coordinates'->>0)::double precision,
          (h.location->'coordinates'->>1)::double precision
        ),
        4326
      )::geography,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  order by st_distance(
    st_setsrid(
      st_makepoint(
        (h.location->'coordinates'->>0)::double precision,
        (h.location->'coordinates'->>1)::double precision
      ),
      4326
    )::geography,
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  );
$$;

commit;
