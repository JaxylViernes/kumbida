-- RSVP table for the digital invitation.
-- Run in the Supabase SQL editor, then put the project URL + anon key in .env

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  name_key    text not null,                -- normalized name, used to block duplicates
  attending   boolean not null,
  guests      smallint not null default 0 check (guests between 0 and 10),
  message     text check (char_length(message) <= 500),
  created_at  timestamptz not null default now()
);

create unique index if not exists rsvps_name_key_unique on public.rsvps (name_key);

alter table public.rsvps enable row level security;

-- Guests may only INSERT. They cannot read the guest list.
drop policy if exists "guests can rsvp" on public.rsvps;
create policy "guests can rsvp" on public.rsvps
  for insert to anon
  with check (true);

-- Read responses from the Supabase dashboard (service role bypasses RLS).

-- ── Guestbook ────────────────────────────────────────────────────────────
-- Guests can only add messages. Nobody can read other guests' notes from the
-- invitation; the couple reads them in the Supabase dashboard.
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  message     text not null check (char_length(message) between 3 and 600),
  shareable   boolean not null default false,   -- guest consented to the couple sharing it
  created_at  timestamptz not null default now()
);

alter table public.guestbook enable row level security;

drop policy if exists "guests can sign" on public.guestbook;
create policy "guests can sign" on public.guestbook
  for insert to anon
  with check (message !~* '(https?://|www\.)');
