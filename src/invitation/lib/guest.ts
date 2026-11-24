import { getInvitationMeta, invitation } from '../config/invitation';

/**
 * Who this invitation is addressed to.
 *  - Live invitations: the personal link (?g=<token>) names the guest and their seats;
 *    it can't be edited by hand.
 *  - Demos: ?to=Maria%20Santos&seats=2 for trying it out.
 */
export function readGuest() {
  const live = getInvitationMeta();
  if (live) return { name: live.guest?.name ?? '', seats: live.guest?.seats ?? invitation.rsvp.maxGuests };
  const p = new URLSearchParams(window.location.search);
  const name = (p.get('to') || '').trim().slice(0, 80);
  const seatsRaw = parseInt(p.get('seats') || '', 10);
  const seats = Number.isFinite(seatsRaw) && seatsRaw > 0 ? Math.min(seatsRaw, 10) : invitation.rsvp.maxGuests;
  return { name, seats };
}

export const guest = readGuest();
