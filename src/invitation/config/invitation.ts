/**
 * The invitation being shown. Components read `invitation.*` during render.
 *
 * The content is swappable: a demo uses a template's sample, a live link loads
 * the couple's saved config, and the builder preview pushes edits in. Each
 * invitation runs in its own page (or iframe), so there is one at a time.
 */
import { enchantedGardenSample, type InvitationConfig } from '../../templates/enchanted-garden/sample';

export * from './types';
export type { InvitationConfig };

/** Present only for a real invitation loaded from the database (not for demos/previews). */
export interface InvitationMeta {
  id: string;
  slug: string;
  /** personal-link token (?g=...) and the guest it belongs to */
  guestToken: string | null;
  guest: { name: string; seats: number } | null;
}

let current: InvitationConfig = enchantedGardenSample;
let meta: InvitationMeta | null = null;
let version = 0;
const listeners = new Set<() => void>();

/** Always reads the current config (also from code that captured `invitation` earlier). */
export const invitation = new Proxy({} as InvitationConfig, {
  get: (_t, key) => (current as unknown as Record<string | symbol, unknown>)[key],
  has: (_t, key) => key in current,
  ownKeys: () => Reflect.ownKeys(current),
  getOwnPropertyDescriptor: (_t, key) => Reflect.getOwnPropertyDescriptor(current, key),
});

export function setInvitation(next: InvitationConfig, nextMeta: InvitationMeta | null = null) {
  current = next;
  meta = nextMeta;
  version++;
  listeners.forEach((l) => l());
}

export const getInvitation = () => current;
export const getInvitationMeta = () => meta;
export const getInvitationVersion = () => version;
export function subscribeInvitation(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
