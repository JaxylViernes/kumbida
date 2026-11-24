/**
 * RSVP storage.
 *  - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set → saved to Supabase
 *    (see supabase/schema.sql; a unique index on name_key blocks duplicates).
 *  - Otherwise → demo mode: saved in this browser only, so the flow can be tested.
 * In both modes this device remembers its reply so it can't be sent twice.
 */

import { getInvitationMeta } from '../config/invitation';
import { deviceKey, isLive, readLocal, rpc, RpcError, writeLocal } from './backend';

export interface RsvpInput {
  name: string;
  attending: boolean;
  guests: number;
  message: string;
}

export interface StoredReply extends RsvpInput {
  at: string;
}

export type RsvpResult =
  | { ok: true; reply: StoredReply }
  | { ok: false; reason: 'duplicate' | 'network' | 'invalid'; message: string };

const DEVICE_KEY = () => deviceKey('rsvp:reply');
const DEMO_DB_KEY = () => deviceKey('rsvp:demo-db');

export const normalizeName = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|miss|dr)\.?\s+/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export type RsvpErrors = Partial<Record<keyof RsvpInput, string>>;

export function validate(input: RsvpInput, maxGuests: number): RsvpErrors {
  const errors: RsvpErrors = {};
  const name = input.name.trim();
  if (name.length < 2) errors.name = 'Please write your full name.';
  else if (name.length > 80) errors.name = 'That name is a little long.';
  else if (!/\p{L}/u.test(name)) errors.name = 'Please use letters for your name.';
  if (input.attending) {
    if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > maxGuests)
      errors.guests = `Choose between 1 and ${maxGuests}.`;
  }
  if (input.message.length > 500) errors.message = 'Please keep your note under 500 characters.';
  return errors;
}

const safeGet = readLocal;
const safeSet = writeLocal;

export const getDeviceReply = () => safeGet<StoredReply>(DEVICE_KEY());

export async function submitRsvp(raw: RsvpInput): Promise<RsvpResult> {
  const input: RsvpInput = {
    name: raw.name.trim().replace(/\s+/g, ' '),
    attending: raw.attending,
    guests: raw.attending ? raw.guests : 0,
    message: raw.message.trim(),
  };
  const nameKey = normalizeName(input.name);
  if (!nameKey) return { ok: false, reason: 'invalid', message: 'Please write your full name.' };

  if (getDeviceReply()) {
    return { ok: false, reason: 'duplicate', message: 'A reply was already sent from this device.' };
  }

  const reply: StoredReply = { ...input, at: new Date().toISOString() };

  if (isLive()) {
    const m = getInvitationMeta()!;
    try {
      await rpc('submit_rsvp', {
        p_slug: m.slug,
        p_guest_token: m.guestToken,
        p_name: input.name,
        p_attending: input.attending,
        p_guests: input.guests,
        p_message: input.message,
      });
    } catch (e) {
      if (e instanceof RpcError && e.code === '23505') {
        return {
          ok: false,
          reason: 'duplicate',
          message: 'We already have a reply under this name. Please message the couple if anything has changed.',
        };
      }
      if (e instanceof RpcError && e.code === 'P0001') return { ok: false, reason: 'invalid', message: e.message };
      console.error('[rsvp]', e);
      return { ok: false, reason: 'network', message: 'We couldn’t send your reply. Please check your connection and try again.' };
    }
  } else {
    // demo / preview: kept in this browser only
    await new Promise((r) => setTimeout(r, 900));
    const db = safeGet<Record<string, StoredReply>>(DEMO_DB_KEY()) || {};
    if (db[nameKey]) {
      return { ok: false, reason: 'duplicate', message: 'We already have a reply under this name.' };
    }
    db[nameKey] = reply;
    safeSet(DEMO_DB_KEY(), db);
  }

  safeSet(DEVICE_KEY(), reply);
  return { ok: true, reply };
}
