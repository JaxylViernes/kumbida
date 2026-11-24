-- ═══════════════════════════════════════════════════════════════════════════
--  Kumbida — core schema
--  Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
--  Security model
--   • Catalog (templates, packages, add-ons, settings) is publicly readable.
--   • Customers only ever see their own orders, payments, invitations, guests,
--     RSVPs and messages. Staff/admin see everything.
--   • Anything involving money or status goes through SECURITY DEFINER
--     functions that compute prices server-side and check permissions, so a
--     customer can't set their own price or mark an order as paid.
--   • Guests (not logged in) can only read a *published* invitation and add an
--     RSVP / guestbook note to it — never read anyone else's.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ── Types ──────────────────────────────────────────────────────────────────
create type public.user_role as enum ('customer', 'staff', 'admin');
create type public.order_status as enum (
  'pending_payment', 'payment_review', 'paid', 'in_review',
  'changes_requested', 'published', 'completed', 'cancelled', 'refunded'
);
create type public.payment_status as enum ('pending', 'verified', 'rejected');
create type public.payment_method as enum ('gcash', 'maya', 'bank_transfer', 'other');
create type public.invitation_status as enum ('draft', 'in_review', 'published', 'archived');

-- ── Profiles & roles ───────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin'));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- customers may edit their name/phone, never their role or email
create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = public as $$
begin
  -- auth.uid() is null for the SQL editor / service role (trusted): allowed
  if auth.uid() is not null and not public.is_admin() and (new.role is distinct from old.role or new.email is distinct from old.email or new.id <> old.id) then
    raise exception 'not allowed to change role or email';
  end if;
  return new;
end $$;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ── Catalog ────────────────────────────────────────────────────────────────
create table public.templates (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name            text not null,
  tagline         text,
  description     text,
  layout_key      text not null default 'garden',
  theme           jsonb not null default '{}'::jsonb,   -- palette overrides
  preview_images  text[] not null default '{}',
  tags            text[] not null default '{}',
  active          boolean not null default true,
  sort            int not null default 0,
  created_at      timestamptz not null default now()
);

create table public.packages (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  description         text,
  price               numeric(10, 2) not null check (price >= 0),
  features            text[] not null default '{}',
  revision_limit      int not null default 2,
  includes_video      boolean not null default false,
  includes_guestbook  boolean not null default false,
  active              boolean not null default true,
  sort                int not null default 0,
  created_at          timestamptz not null default now()
);

create table public.addons (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  active       boolean not null default true,
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);

create table public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code = upper(code)),
  kind        text not null check (kind in ('percent', 'fixed')),
  value       numeric(10, 2) not null check (value > 0),
  max_uses    int,
  used_count  int not null default 0,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- public key/value settings (payment instructions, business info)
create table public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
