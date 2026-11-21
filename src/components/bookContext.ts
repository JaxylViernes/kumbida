import { createContext, useContext } from 'react';
import type { FilmMoment, PageId } from '../config/invitation';

export type SecretId = 'heart' | 'flower' | 'envelope' | 'explorer';
export const SECRET_IDS: SecretId[] = ['heart', 'flower', 'envelope', 'explorer'];

export interface BookApi {
  go: (i: number) => void;
  goTo: (id: PageId) => void;
  index: number;
  pageIds: PageId[];
  /** every insert has been looked at */
  visitedAll: boolean;
  found: SecretId[];
  reveal: (id: SecretId) => void;
  openMoment: (m: FilmMoment) => void;
}

export const BookContext = createContext<BookApi>({
  go: () => {},
  goTo: () => {},
  index: 0,
  pageIds: [],
  visitedAll: false,
  found: [],
  reveal: () => {},
  openMoment: () => {},
});
export const useBook = () => useContext(BookContext);

/** App-level services available everywhere (music, replaying the intro film). */
export interface AppApi {
  music: { playing: boolean; play: () => void; pause: () => void };
  replayFilm: (() => void) | null;
}
export const AppContext = createContext<AppApi>({
  music: { playing: false, play: () => {}, pause: () => {} },
  replayFilm: null,
});
export const useApp = () => useContext(AppContext);
