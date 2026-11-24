-- ═══════════════════════════════════════════════════════════════════════════
--  Kumbida — orders, payments, invitations, guests, RSVPs, guestbook, messages
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Orders ─────────────────────────────────────────────────────────────────
create sequence public.order_no_seq;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_no       text not null unique,
  customer_id    uuid not null references public.profiles (id) on delete restrict,
  template_id    uuid not null references public.templates (id),
  package_id     uuid not null references public.packages (id),
  -- snapshots, so later catalog edits never change an existing order
  template_name  text not null,
  package_name   text not null,
  package_price  numeric(10, 2) not null,
  addons         jsonb not null default '[]'::jsonb,       -- [{slug, name, price}]
  coupon_code    text,
  subtotal       numeric(10, 2) not null,
  discount       numeric(10, 2) not null default 0,
  total          numeric(10, 2) not null,
  status         public.order_status not null default 'pending_payment',
  event_date     date,
  contact_phone  text,
  customer_notes text,
  internal_notes text,
  assigned_to    uuid references public.profiles (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);

create table public.order_status_history (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  from_status  public.order_status,
  to_status    public.order_status not null,
  changed_by   uuid references public.profiles (id),
  note         text,
  created_at   timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

create or replace function public.track_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, auth.uid(), current_setting('kumbida.status_note', true));
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger track_order_status_ins after insert on public.orders
  for each row execute function public.track_order_status();
create trigger track_order_status_upd before update on public.orders
  for each row execute function public.track_order_status();

-- ── Payments (manual: GCash / Maya / bank transfer with proof) ─────────────
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  method         public.payment_method not null,
  amount         numeric(10, 2) not null check (amount > 0),
  reference_no   text,
  proof_path     text,                     -- storage: payment-proofs/<order_id>/<file>
  status         public.payment_status not null default 'pending',
  reject_reason  text,
  verified_by    uuid references public.profiles (id),
  verified_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id, created_at desc);
create index payments_status_idx on public.payments (status, created_at);

-- ── Invitations ────────────────────────────────────────────────────────────
create table public.invitations (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null unique references public.orders (id) on delete cascade,
  slug            text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  template_slug   text not null,
  config          jsonb not null default '{}'::jsonb,   -- full invitation content
  status          public.invitation_status not null default 'draft',
  preview_token   text not null default encode(extensions.gen_random_bytes(12), 'hex'),
  revisions_used  int not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- customers may edit content/slug of their own draft; status etc. only via functions or staff
create or replace function public.guard_invitation_update()
returns trigger language plpgsql set search_path = public as $$
begin
  -- trusted server functions (submit_invitation …) set kumbida.trusted for their own updates
  if auth.uid() is not null and not public.is_staff() and coalesce(current_setting('kumbida.trusted', true), '') <> 'on' then
    if new.status is distinct from old.status
       or new.order_id is distinct from old.order_id
       or new.template_slug is distinct from old.template_slug
       or new.preview_token is distinct from old.preview_token
       or new.revisions_used is distinct from old.revisions_used
       or new.published_at is distinct from old.published_at then
      raise exception 'not allowed';
    end if;
    if old.status not in ('draft') then
      raise exception 'this invitation is locked while it is reviewed or published';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger guard_invitation_update before update on public.invitations
  for each row execute function public.guard_invitation_update();

-- ── Guests (personal links) ────────────────────────────────────────────────
create table public.guests (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 120),
  seats          int not null default 1 check (seats between 1 and 20),
  token          text not null unique default encode(extensions.gen_random_bytes(9), 'hex'),
  created_at     timestamptz not null default now()
);
create index guests_invitation_idx on public.guests (invitation_id);

-- ── RSVPs & guestbook (per invitation) ─────────────────────────────────────
create table public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  guest_id       uuid references public.guests (id) on delete set null,
  name           text not null check (char_length(name) between 2 and 80),
  name_key       text not null,
  attending      boolean not null,
  guests         smallint not null default 0 check (guests between 0 and 20),
  message        text check (char_length(message) <= 500),
  created_at     timestamptz not null default now(),
  unique (invitation_id, name_key)
);

create table public.guestbook (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  name           text not null check (char_length(name) between 2 and 80),
  message        text not null check (char_length(message) between 3 and 600),
  shareable      boolean not null default false,
  created_at     timestamptz not null default now()
);
create index guestbook_invitation_idx on public.guestbook (invitation_id, created_at desc);

-- ── Messages ───────────────────────────────────────────────────────────────
create table public.order_messages (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  sender_id   uuid not null references public.profiles (id),
  body        text not null check (char_length(body) between 1 and 4000),
  created_at  timestamptz not null default now()
);
create index order_messages_order_idx on public.order_messages (order_id, created_at);

create table public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) between 5 and 200),
  phone       text,
  message     text not null check (char_length(message) between 5 and 4000),
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);
