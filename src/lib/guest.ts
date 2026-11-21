import { invitation } from '../config/invitation';

/**
 * Personalised links:  https://your-site/?to=Maria%20Santos&seats=2
 *  - to    → shown on the envelope and pre-fills the RSVP name
 *  - seats → max number of guests this invitation allows
 */
export function readGuest() {
  const p = new URLSearchParams(window.location.search);
  const name = (p.get('to') || '').trim().slice(0, 80);
  const seatsRaw = parseInt(p.get('seats') || '', 10);
  const seats = Number.isFinite(seatsRaw) && seatsRaw > 0 ? Math.min(seatsRaw, 10) : invitation.rsvp.maxGuests;
  return { name, seats };
}

export const guest = readGuest();
