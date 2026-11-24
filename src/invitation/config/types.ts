/** Shared invitation types and helpers (no content here). */

/**
 * Files in /public. Write paths from the site root ('/photos/x.jpg'); this adds the
 * deploy folder automatically (e.g. /kumbida/ on GitHub Pages).
 */
export const asset = (path: string) => {
  const base = import.meta.env.BASE_URL;
  if (!path || /^(https?:|data:|blob:)/.test(path) || (base !== '/' && path.startsWith(base))) return path;
  return base + path.replace(/^\//, '');
};

export type StoryIllustration = 'meet' | 'date' | 'proposal' | 'forever';

export interface StoryMoment {
  title: string;
  when: string;
  text: string;
  note: string; // small handwritten annotation beside the photo
  photo?: string; // e.g. asset('/photos/meet.jpg') — leave empty for an illustrated placeholder
  illustration: StoryIllustration;
}

export interface Venue {
  label: string;
  date: string;
  time: string;
  name: string;
  address: string[];
  /** Optional explicit Google Maps link. If empty, a search link is built from the address. */
  mapsUrl?: string;
}

export interface FilmMoment {
  title: string;
  caption: string;
  /** Still image for the frame, e.g. '/photos/beach.jpg' */
  photo?: string;
  /** Short clip (MP4/H.264, ideally < 3 MB, ~10 s, 720p). Loaded only when opened. */
  video?: string;
  /** Optional voice message from the couple (MP3/M4A). */
  voice?: string;
  illustration: StoryIllustration;
}

export interface Secret {
  title: string;
  body: string;
  signoff?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  note?: string;
}

export type Phase = 'before' | 'day' | 'after';

export interface Swatch {
  name: string;
  hex: string;
}


export type PageId =
  | 'invitation'
  | 'savedate'
  | 'story'
  | 'moments'
  | 'film'
  | 'letter'
  | 'details'
  | 'reception'
  | 'entourage'
  | 'sponsors'
  | 'attire'
  | 'rsvp'
  | 'guestbook'
  | 'farewell'
  | 'ps'
  | 'thanks';
