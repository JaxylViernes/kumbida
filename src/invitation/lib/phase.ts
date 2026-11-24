import { invitation, type Phase } from '../config/invitation';

/**
 * Where we are relative to the wedding, in the venue's own time zone
 * (taken from the UTC offset in wedding.iso).
 *
 * Preview any phase with ?preview=before | day | after
 */
export function getPhase(now = Date.now()): Phase {
  const forced = new URLSearchParams(window.location.search).get('preview');
  if (forced === 'before' || forced === 'day' || forced === 'after') return forced;

  const iso = invitation.wedding.iso;
  const offset = iso.match(/([+-]\d{2}:\d{2}|Z)$/)?.[1] ?? 'Z';
  const date = iso.slice(0, 10);
  const dayStart = new Date(`${date}T00:00:00${offset}`).getTime();
  const dayEnd = dayStart + 24 * 3600 * 1000 + 4 * 3600 * 1000; // celebrations run late — flip at 4 AM
  if (now < dayStart) return 'before';
  if (now < dayEnd) return 'day';
  return 'after';
}

export const phase = getPhase();
