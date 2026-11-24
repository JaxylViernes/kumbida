/**
 * Where an invitation's RSVPs and guestbook notes go:
 *  - a real invitation (/i/:slug, loaded from the database) -> Supabase functions;
 *  - demos and previews -> this browser only, so the flow can be tried safely.
 */
import { getInvitationMeta } from '../config/invitation';

export { rpc, RpcError } from '../../lib/rest';

export const isLive = () => getInvitationMeta() !== null;

/** per-invitation key for things this device remembers (its own reply, notes) */
export const deviceKey = (name: string) => `invite:${getInvitationMeta()?.slug ?? 'demo'}:${name}`;

export function readLocal<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocal(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* private mode / storage full: ignore */
  }
}
