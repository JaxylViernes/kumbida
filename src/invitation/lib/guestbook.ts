/**
 * Guestbook messages. Guests can only add notes (via sign_guestbook); only the
 * couple and the Kumbida team can read them. Demos keep notes in this browser.
 */
import { getInvitationMeta, invitation } from '../config/invitation';
import { deviceKey, isLive, readLocal, rpc, RpcError, writeLocal } from './backend';

export interface GuestbookEntry {
  name: string;
  message: string;
  shareable: boolean;
  at: string;
}

const DEVICE_KEY = () => deviceKey('guestbook:mine');

export const myEntries = () => readLocal<GuestbookEntry[]>(DEVICE_KEY()) || [];

export function validateEntry(name: string, message: string) {
  const errors: { name?: string; message?: string } = {};
  if (name.trim().length < 2) errors.name = 'Please sign with your name.';
  else if (name.trim().length > 80) errors.name = 'That name is a little long.';
  const m = message.trim();
  if (m.length < 3) errors.message = 'Write a few words for the couple.';
  else if (m.length > 600) errors.message = 'Please keep it under 600 characters.';
  else if (/(https?:\/\/|www\.)/i.test(m)) errors.message = 'Links aren’t allowed in the guestbook.';
  return errors;
}

export async function signGuestbook(input: { name: string; message: string; shareable: boolean }) {
  const mine = myEntries();
  if (mine.length >= invitation.guestbook.maxPerDevice) {
    return { ok: false as const, message: 'You’ve already left us some lovely notes — thank you!' };
  }
  const entry: GuestbookEntry = {
    name: input.name.trim().replace(/\s+/g, ' '),
    message: input.message.trim(),
    shareable: input.shareable,
    at: new Date().toISOString(),
  };
  if (isLive()) {
    try {
      await rpc('sign_guestbook', {
        p_slug: getInvitationMeta()!.slug,
        p_name: entry.name,
        p_message: entry.message,
        p_shareable: entry.shareable,
      });
    } catch (e) {
      if (e instanceof RpcError && e.code === 'P0001') return { ok: false as const, message: e.message };
      console.error('[guestbook]', e);
      return { ok: false as const, message: 'We couldn’t save your message. Please check your connection and try again.' };
    }
  } else {
    await new Promise((r) => setTimeout(r, 700));
  }
  writeLocal(DEVICE_KEY(), [...mine, entry]);
  return { ok: true as const, entry };
}
