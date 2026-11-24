-- ═══════════════════════════════════════════════════════════════════════════
--  Kumbida — row-level security, server functions, storage, seed data
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Ownership helpers (text inputs so storage paths never fail to cast) ─────
create or replace function public.owns_order(p_order_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders where id::text = p_order_id and customer_id = auth.uid());
$$;

create or replace function public.owns_invitation(p_invitation_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.invitations i join public.orders o on o.id = i.order_id
    where i.id::text = p_invitation_id and o.customer_id = auth.uid()
  );
$$;

-- ── Row-level security ─────────────────────────────────────────────────────
alter table public.profiles             enable row level security;
alter table public.templates            enable row level security;
alter table public.packages             enable row level security;
alter table public.addons               enable row level security;
alter table public.coupons              enable row level security;
alter table public.settings             enable row level security;
alter table public.orders               enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments             enable row level security;
alter table public.invitations          enable row level security;
alter table public.guests               enable row level security;
alter table public.rsvps                enable row level security;
alter table public.guestbook            enable row level security;
alter table public.order_messages       enable row level security;
alter table public.contact_messages     enable row level security;

-- profiles
create policy profiles_read on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());

-- catalog: public reads active items, admins manage
create policy templates_read on public.templates for select using (active or public.is_staff());
create policy templates_admin on public.templates for all using (public.is_admin()) with check (public.is_admin());
create policy packages_read on public.packages for select using (active or public.is_staff());
create policy packages_admin on public.packages for all using (public.is_admin()) with check (public.is_admin());
create policy addons_read on public.addons for select using (active or public.is_staff());
create policy addons_admin on public.addons for all using (public.is_admin()) with check (public.is_admin());
create policy coupons_staff_read on public.coupons for select using (public.is_staff());
create policy coupons_admin on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy settings_read on public.settings for select using (true);
create policy settings_admin on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- orders: created only through create_order(); customers read their own
create policy orders_read on public.orders for select using (customer_id = auth.uid() or public.is_staff());
create policy orders_staff_update on public.orders for update using (public.is_staff()) with check (public.is_staff());
create policy order_history_read on public.order_status_history for select using (public.owns_order(order_id::text) or public.is_staff());

-- payments: added only through submit_payment(); verified by staff
create policy payments_read on public.payments for select using (public.owns_order(order_id::text) or public.is_staff());
create policy payments_staff_update on public.payments for update using (public.is_staff()) with check (public.is_staff());

-- invitations: owner edits drafts (guard trigger enforces the rest)
create policy invitations_read on public.invitations for select using (public.owns_invitation(id::text) or public.is_staff());
create policy invitations_update on public.invitations for update
  using (public.owns_invitation(id::text) or public.is_staff())
  with check (public.owns_invitation(id::text) or public.is_staff());

-- guests: owner manages their list
create policy guests_owner on public.guests for all
  using (public.owns_invitation(invitation_id::text) or public.is_staff())
  with check (public.owns_invitation(invitation_id::text) or public.is_staff());

-- RSVPs / guestbook: inserted only through submit_rsvp() / sign_guestbook()
create policy rsvps_read on public.rsvps for select using (public.owns_invitation(invitation_id::text) or public.is_staff());
create policy rsvps_delete on public.rsvps for delete using (public.owns_invitation(invitation_id::text) or public.is_staff());
create policy guestbook_read on public.guestbook for select using (public.owns_invitation(invitation_id::text) or public.is_staff());
create policy guestbook_delete on public.guestbook for delete using (public.owns_invitation(invitation_id::text) or public.is_staff());

-- order messages
create policy order_messages_read on public.order_messages for select using (public.owns_order(order_id::text) or public.is_staff());
create policy order_messages_insert on public.order_messages for insert
  with check (sender_id = auth.uid() and (public.owns_order(order_id::text) or public.is_staff()));

-- contact form: anyone may send, staff read
create policy contact_insert on public.contact_messages for insert with check (true);
create policy contact_staff on public.contact_messages for select using (public.is_staff());
create policy contact_staff_update on public.contact_messages for update using (public.is_staff());

-- ── Helpers ────────────────────────────────────────────────────────────────
create or replace function public.name_key(p_name text)
returns text language sql immutable as $$
  select trim(regexp_replace(
    regexp_replace(lower(coalesce(p_name, '')), '\m(mr|mrs|ms|miss|dr|dra|engr|atty|hon)\.?\s+', '', 'g'),
    '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function public.coupon_discount(p_code text, p_subtotal numeric)
returns numeric language plpgsql stable security definer set search_path = public as $$
declare c public.coupons;
begin
  if p_code is null or p_code = '' then return 0; end if;
  select * into c from public.coupons where code = upper(trim(p_code));
  if not found or not c.active
     or (c.expires_at is not null and c.expires_at < now())
     or (c.max_uses is not null and c.used_count >= c.max_uses) then
    raise exception 'This coupon is not valid.' using errcode = 'P0001';
  end if;
  if c.kind = 'percent' then
    return round(p_subtotal * least(c.value, 100) / 100, 2);
  end if;
  return least(c.value, p_subtotal);
end $$;

-- Anyone can check a coupon on the order page (returns the discount for that subtotal).
create or replace function public.check_coupon(p_code text, p_subtotal numeric)
returns numeric language sql stable security definer set search_path = public as $$
  select public.coupon_discount(p_code, p_subtotal);
$$;

-- ── Ordering ───────────────────────────────────────────────────────────────
create or replace function public.create_order(
  p_template_slug text,
  p_package_slug  text,
  p_addon_slugs   text[] default '{}',
  p_coupon        text default null,
  p_event_date    date default null,
  p_phone         text default null,
  p_notes         text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t public.templates; p public.packages;
  v_addons jsonb; v_addon_total numeric; v_subtotal numeric; v_discount numeric;
  v_order public.orders; v_no text; v_inv_id uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into t from public.templates where slug = p_template_slug and active;
  if not found then raise exception 'That template is not available.'; end if;
  select * into p from public.packages where slug = p_package_slug and active;
  if not found then raise exception 'That package is not available.'; end if;

  select coalesce(jsonb_agg(jsonb_build_object('slug', a.slug, 'name', a.name, 'price', a.price) order by a.sort), '[]'::jsonb),
         coalesce(sum(a.price), 0)
    into v_addons, v_addon_total
    from public.addons a where a.active and a.slug = any (coalesce(p_addon_slugs, '{}'));

  v_subtotal := p.price + v_addon_total;
  v_discount := public.coupon_discount(p_coupon, v_subtotal);
  v_no := 'KMB-' || to_char(now() at time zone 'Asia/Manila', 'YYYY') || '-' || lpad(nextval('public.order_no_seq')::text, 4, '0');

  insert into public.orders (order_no, customer_id, template_id, package_id, template_name, package_name, package_price,
                             addons, coupon_code, subtotal, discount, total, event_date, contact_phone, customer_notes)
  values (v_no, auth.uid(), t.id, p.id, t.name, p.name, p.price,
          v_addons, nullif(upper(trim(p_coupon)), ''), v_subtotal, v_discount, v_subtotal - v_discount,
          p_event_date, nullif(trim(p_phone), ''), nullif(trim(p_notes), ''))
  returning * into v_order;

  if v_discount > 0 then
    update public.coupons set used_count = used_count + 1 where code = upper(trim(p_coupon));
  end if;

  insert into public.invitations (order_id, slug, template_slug)
  values (v_order.id, lower(v_no), t.slug)
  returning id into v_inv_id;

  return jsonb_build_object('order_id', v_order.id, 'order_no', v_order.order_no, 'invitation_id', v_inv_id, 'total', v_order.total);
end $$;

-- Customer reports a payment (proof already uploaded to payment-proofs/<order_id>/...)
create or replace function public.submit_payment(
  p_order_id uuid, p_method public.payment_method, p_amount numeric, p_reference text, p_proof_path text
) returns uuid language plpgsql security definer set search_path = public as $$
declare o public.orders; v_id uuid;
begin
  select * into o from public.orders where id = p_order_id and customer_id = auth.uid();
  if not found then raise exception 'Order not found.'; end if;
  if o.status not in ('pending_payment', 'payment_review') then raise exception 'This order is not awaiting payment.'; end if;
  if p_proof_path is null or p_proof_path not like p_order_id::text || '/%' then raise exception 'Please attach your payment proof.'; end if;
  insert into public.payments (order_id, method, amount, reference_no, proof_path)
  values (o.id, p_method, p_amount, nullif(trim(p_reference), ''), p_proof_path) returning id into v_id;
  update public.orders set status = 'payment_review' where id = o.id and status = 'pending_payment';
  return v_id;
end $$;

-- Staff verifies or rejects a payment
create or replace function public.review_payment(p_payment_id uuid, p_approve boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare pay public.payments;
begin
  if not public.is_staff() then raise exception 'Staff only.'; end if;
  select * into pay from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found.'; end if;
  update public.payments
     set status = case when p_approve then 'verified'::public.payment_status else 'rejected'::public.payment_status end,
         reject_reason = case when p_approve then null else p_reason end,
         verified_by = auth.uid(), verified_at = now()
   where id = pay.id;
  perform set_config('kumbida.status_note', coalesce(p_reason, ''), true);
  if p_approve then
    update public.orders set status = 'paid' where id = pay.order_id and status in ('pending_payment', 'payment_review');
  elsif not exists (select 1 from public.payments where order_id = pay.order_id and status in ('pending', 'verified')) then
    update public.orders set status = 'pending_payment' where id = pay.order_id and status = 'payment_review';
  end if;
end $$;

-- Staff sets any order status (with an optional note for the timeline)
create or replace function public.set_order_status(p_order_id uuid, p_status public.order_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Staff only.'; end if;
  perform set_config('kumbida.status_note', coalesce(p_note, ''), true);
  update public.orders set status = p_status where id = p_order_id;
end $$;

-- ── Invitation workflow ────────────────────────────────────────────────────
create or replace function public.submit_invitation(p_invitation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare i public.invitations; o public.orders;
begin
  select * into i from public.invitations where id = p_invitation_id;
  select * into o from public.orders where id = i.order_id;
  if not found or o.customer_id <> auth.uid() then raise exception 'Invitation not found.'; end if;
  if o.status not in ('paid', 'changes_requested') then raise exception 'Your payment needs to be verified before submitting.'; end if;
  if i.status <> 'draft' then raise exception 'This invitation was already submitted.'; end if;
  perform set_config('kumbida.trusted', 'on', true);
  update public.invitations set status = 'in_review' where id = i.id;
  perform set_config('kumbida.trusted', 'off', true);
  update public.orders set status = 'in_review' where id = o.id;
end $$;

create or replace function public.request_changes(p_invitation_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare i public.invitations;
begin
  if not public.is_staff() then raise exception 'Staff only.'; end if;
  select * into i from public.invitations where id = p_invitation_id;
  update public.invitations set status = 'draft' where id = i.id;
  perform set_config('kumbida.status_note', coalesce(p_note, ''), true);
  update public.orders set status = 'changes_requested' where id = i.order_id;
  if coalesce(trim(p_note), '') <> '' then
    insert into public.order_messages (order_id, sender_id, body) values (i.order_id, auth.uid(), p_note);
  end if;
end $$;

create or replace function public.publish_invitation(p_invitation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare i public.invitations;
begin
  if not public.is_staff() then raise exception 'Staff only.'; end if;
  select * into i from public.invitations where id = p_invitation_id;
  update public.invitations set status = 'published', published_at = coalesce(published_at, now()) where id = i.id;
  update public.orders set status = 'published' where id = i.order_id and status not in ('completed');
end $$;

-- ── Public (guest) access ──────────────────────────────────────────────────
-- Returns a published invitation (or a draft with its preview token), plus the
-- guest named by a personal-link token. Never exposes anything else.
create or replace function public.get_invitation(p_slug text, p_preview text default null, p_guest_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare i public.invitations; g public.guests;
begin
  select * into i from public.invitations where slug = lower(p_slug);
  if not found then return null; end if;
  if i.status <> 'published' and (p_preview is null or p_preview <> i.preview_token) then return null; end if;
  if p_guest_token is not null then
    select * into g from public.guests where token = p_guest_token and invitation_id = i.id;
  end if;
  return jsonb_build_object(
    'id', i.id, 'slug', i.slug, 'template_slug', i.template_slug, 'config', i.config, 'status', i.status,
    'guest', case when g.id is null then null else jsonb_build_object('name', g.name, 'seats', g.seats) end
  );
end $$;

create or replace function public.submit_rsvp(
  p_slug text, p_guest_token text, p_name text, p_attending boolean, p_guests int, p_message text
) returns void language plpgsql security definer set search_path = public as $$
declare i public.invitations; g public.guests; v_max int; v_key text;
begin
  select * into i from public.invitations where slug = lower(p_slug) and status = 'published';
  if not found then raise exception 'Invitation not found.'; end if;
  if p_guest_token is not null then
    select * into g from public.guests where token = p_guest_token and invitation_id = i.id;
  end if;
  v_max := coalesce(g.seats, (i.config -> 'rsvp' ->> 'maxGuests')::int, 2);
  if p_attending and (p_guests < 1 or p_guests > v_max) then raise exception 'Please choose between 1 and % guests.', v_max; end if;
  v_key := public.name_key(p_name);
  if v_key = '' then raise exception 'Please write your full name.'; end if;
  insert into public.rsvps (invitation_id, guest_id, name, name_key, attending, guests, message)
  values (i.id, g.id, trim(p_name), v_key, p_attending, case when p_attending then p_guests else 0 end, nullif(trim(p_message), ''));
end $$;

create or replace function public.sign_guestbook(p_slug text, p_name text, p_message text, p_shareable boolean)
returns void language plpgsql security definer set search_path = public as $$
declare i public.invitations;
begin
  select * into i from public.invitations where slug = lower(p_slug) and status = 'published';
  if not found then raise exception 'Invitation not found.'; end if;
  if p_message ~* '(https?://|www\.)' then raise exception 'Links aren''t allowed in the guestbook.'; end if;
  insert into public.guestbook (invitation_id, name, message, shareable)
  values (i.id, trim(p_name), trim(p_message), coalesce(p_shareable, false));
end $$;

-- function permissions
revoke all on function public.create_order(text, text, text[], text, date, text, text) from public, anon;
grant execute on function public.create_order(text, text, text[], text, date, text, text) to authenticated;
revoke all on function public.submit_payment(uuid, public.payment_method, numeric, text, text) from public, anon;
grant execute on function public.submit_payment(uuid, public.payment_method, numeric, text, text) to authenticated;
revoke all on function public.review_payment(uuid, boolean, text) from public, anon;
grant execute on function public.review_payment(uuid, boolean, text) to authenticated;
revoke all on function public.set_order_status(uuid, public.order_status, text) from public, anon;
grant execute on function public.set_order_status(uuid, public.order_status, text) to authenticated;
revoke all on function public.submit_invitation(uuid) from public, anon;
grant execute on function public.submit_invitation(uuid) to authenticated;
revoke all on function public.request_changes(uuid, text) from public, anon;
grant execute on function public.request_changes(uuid, text) to authenticated;
revoke all on function public.publish_invitation(uuid) from public, anon;
grant execute on function public.publish_invitation(uuid) to authenticated;
grant execute on function public.get_invitation(text, text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, boolean, int, text) to anon, authenticated;
grant execute on function public.sign_guestbook(text, text, text, boolean) to anon, authenticated;
grant execute on function public.check_coupon(text, numeric) to anon, authenticated;
revoke all on function public.coupon_discount(text, numeric) from public, anon, authenticated;

-- ── Storage ────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('invitation-media', 'invitation-media', true, 26214400,
   array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a']),
  ('payment-proofs', 'payment-proofs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('site-assets', 'site-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

-- invitation-media/<invitation_id>/<file>: owner or staff write, public read
create policy media_write on storage.objects for insert to authenticated
  with check (bucket_id = 'invitation-media' and (public.owns_invitation((storage.foldername(name))[1]) or public.is_staff()));
create policy media_modify on storage.objects for update to authenticated
  using (bucket_id = 'invitation-media' and (public.owns_invitation((storage.foldername(name))[1]) or public.is_staff()));
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'invitation-media' and (public.owns_invitation((storage.foldername(name))[1]) or public.is_staff()));

-- payment-proofs/<order_id>/<file>: private to the customer and staff
create policy proofs_write on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and public.owns_order((storage.foldername(name))[1]));
create policy proofs_read on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and (public.owns_order((storage.foldername(name))[1]) or public.is_staff()));

-- site-assets: admins manage
create policy site_assets_admin on storage.objects for all to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

-- ── Seed data (placeholder prices — edit in the admin) ─────────────────────
insert into public.templates (slug, name, tagline, description, layout_key, tags, sort) values
  ('enchanted-garden', 'Enchanted Garden', 'Pressed flowers, gold foil and a wax-sealed envelope',
   'A luxury garden invitation: wax-sealed envelope, intro film, paper-fold pages, scrapbook, RSVP and guestbook.',
   'garden', array['garden', 'romantic', 'classic'], 1)
on conflict (slug) do nothing;

insert into public.packages (slug, name, description, price, features, revision_limit, includes_video, includes_guestbook, sort) values
  ('essential', 'Essential', 'Everything you need to invite and collect RSVPs.', 1499,
   array['Live invitation link', 'RSVP tracking', 'Personal guest links', 'Save-the-date calendar', '1 revision after publishing'],
   1, false, false, 1),
  ('premium', 'Premium', 'Our most loved package: your story, photos and guestbook.', 2499,
   array['Everything in Essential', 'Photo scrapbook & film strip', 'Digital guestbook', 'Background music', '3 revisions after publishing'],
   3, false, true, 2),
  ('luxe', 'Luxe', 'The full cinematic keepsake.', 3999,
   array['Everything in Premium', 'Cinematic intro video', 'Hidden secret notes', 'Wedding-day & thank-you modes', 'Unlimited revisions until the event'],
   99, true, true, 3)
on conflict (slug) do nothing;

insert into public.addons (slug, name, description, price, sort) values
  ('rush', 'Rush delivery', 'Published within 48 hours of your complete details.', 500, 1),
  ('extra-revision', 'Extra revision', 'One more round of changes after publishing.', 300, 2),
  ('qr-cards', 'Printable QR cards', 'Print-ready cards with a QR code to your invitation.', 400, 3),
  ('video-edit', 'Intro video editing', 'We edit your clips into a 10–20 second intro film.', 1200, 4)
on conflict (slug) do nothing;

insert into public.settings (key, value) values
  ('payment', jsonb_build_object(
    'gcash', jsonb_build_object('name', 'REPLACE ME', 'number', '09XX XXX XXXX', 'qr', ''),
    'maya', jsonb_build_object('name', 'REPLACE ME', 'number', '09XX XXX XXXX', 'qr', ''),
    'bank', jsonb_build_object('bank', 'REPLACE ME', 'name', 'REPLACE ME', 'number', 'XXXX-XXXX-XXXX'),
    'instructions', 'Send the exact amount, then upload a screenshot of your receipt and its reference number.'
  )),
  ('business', jsonb_build_object(
    'name', 'Kumbida', 'email', 'hello@example.com', 'messenger', '', 'facebook', '', 'instagram', ''
  ))
on conflict (key) do nothing;
