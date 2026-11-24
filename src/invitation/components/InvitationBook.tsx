import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, CSSProperties, PointerEvent as RPointerEvent, ReactNode } from 'react';
import { invitation, type FilmMoment, type PageId } from '../config/invitation';
import { readLocal, writeLocal } from '../lib/backend';
import { phase } from '../lib/phase';
import { useSwipe } from '../hooks/useSwipe';
import { BookContext, SECRET_IDS, type SecretId } from './bookContext';
import { MomentViewer } from './MomentViewer';
import { PageLeaf } from './PageLeaf';
import { SecretNote } from './Secrets';
import MainPage from './pages/MainPage';
import SaveTheDatePage from './pages/SaveTheDatePage';
import StoryPage, { FilmPage, LetterPage, ScrapbookPage } from './pages/StoryPage';
import DetailsPage, { ReceptionPage } from './pages/DetailsPage';
import EntouragePage, { SponsorsPage } from './pages/EntouragePage';
import { ContentsCard } from './ContentsCard';
import DressCodePage from './pages/DressCodePage';
import RsvpPage from './pages/RsvpPage';
import GuestbookPage from './pages/GuestbookPage';
import FinalPage, { PostscriptPage } from './pages/FinalPage';
import ThankYouPage from './pages/ThankYouPage';

const COMPONENTS: Record<PageId, ComponentType> = {
  invitation: MainPage,
  savedate: SaveTheDatePage,
  story: StoryPage,
  moments: ScrapbookPage,
  film: FilmPage,
  letter: LetterPage,
  sponsors: SponsorsPage,
  details: DetailsPage,
  reception: ReceptionPage,
  entourage: EntouragePage,
  attire: DressCodePage,
  rsvp: RsvpPage,
  guestbook: GuestbookPage,
  farewell: FinalPage,
  ps: PostscriptPage,
  thanks: ThankYouPage,
};

// Memoised so a page never re-renders just because the book's state changed mid-turn.
const PAGES = Object.fromEntries(Object.entries(COMPONENTS).map(([k, C]) => [k, memo(C)])) as unknown as Record<PageId, ComponentType>;

/**
 * Pages reached by turning arrive already "printed": entrance animations are
 * skipped, so nothing repaints underneath a page turn.
 */
function Still({ children, animate }: { children: ReactNode; animate: boolean }) {
  // `initial` is only read when the page is first built, so toggling `animate` later never remounts it
  return (
    <AnimatePresence initial={animate}>
      <div key="still" className={`absolute inset-0 ${animate ? '' : 'still-page'}`}>
        {children}
      </div>
    </AnimatePresence>
  );
}

const SECRETS_KEY = 'invite:secrets';
type Overlay = { kind: 'secret'; id: SecretId } | { kind: 'moment'; moment: FilmMoment } | { kind: 'contents' } | null;

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];


/**
 * `shown=false` builds the whole invitation ahead of time without displaying it
 * (display:none — no animations run, nothing is painted), so revealing it later
 * costs almost nothing.
 */
export function InvitationBook({ shown = true }: { shown?: boolean }) {
  const pageIds = invitation.pageOrder[phase];
  const pages = useMemo(
    () =>
      pageIds.map((id) => ({
        id,
        label: phase === 'day' && id === 'savedate' ? invitation.weddingDay.scheduleHeading : invitation.pageLabels[id],
      })),
    [pageIds],
  );
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [found, setFound] = useState<SecretId[]>(() => (readLocal<SecretId[]>(SECRETS_KEY) || []).filter((x) => SECRET_IDS.includes(x)));
  const [overlay, setOverlay] = useState<Overlay>(null);
  // While a leaf is turning: `leaf` is the page in motion, `under` is the page lying beneath it.
  const [turn, setTurn] = useState<{ leaf: number; under: number; dir: 1 | -1 } | null>(null);
  // A page that wasn't built yet (contents jump) is built first, then the turn starts.
  const [armed, setArmed] = useState(false);
  // Pages kept built: the current one plus its neighbours, prepared quietly in advance.
  const [mounted, setMounted] = useState<number[]>([0]);
  const [hint, setHint] = useState(true);
  const busy = useRef(false);
  const animatedFirst = useRef(true); // only the very first page plays its entrance on arrival

  // The page the guest is heading to (used by the title, dots and arrows).
  const index = turn ? (turn.dir > 0 ? turn.under : turn.leaf) : current;

  const go = useCallback(
    (i: number, force = false) => {
      if (busy.current || (overlay && !force) || i < 0 || i >= pages.length || i === current) return;
      busy.current = true; // one turn at a time — swallows accidental double-swipes
      setHint(false);
      const ready = mounted.includes(i);
      if (!ready) setMounted((m) => [...m, i]);
      setArmed(ready);
      setTurn(i > current ? { leaf: current, under: i, dir: 1 } : { leaf: i, under: current, dir: -1 });
      // a page that had to be built now gets two frames to settle before turning
      if (!ready) requestAnimationFrame(() => requestAnimationFrame(() => setArmed(true)));
    },
    [current, pages.length, overlay, mounted],
  );

  // After each turn: keep only the current page and its two neighbours built.
  useEffect(() => {
    if (turn) return;
    setMounted((m) => m.filter((x) => Math.abs(x - current) <= 1));
    const want = [current - 1, current + 1].filter((x) => x >= 0 && x < pages.length);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    let handle = 0;
    const add = () => setMounted((m) => (want.every((w) => m.includes(w)) ? m : [...new Set([...m, ...want])]));
    // the first time, wait until the opening animation has settled
    if (!shown) return;
    const delay = animatedFirst.current ? 4200 : 120;
    const t = window.setTimeout(() => {
      if (idle) handle = idle(add, { timeout: 800 });
      else add();
    }, delay);
    return () => {
      window.clearTimeout(t);
      const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (handle && cancel) cancel(handle);
    };
  }, [current, turn, pages.length, shown]);

  useEffect(() => {
    setVisited((v) => (v.has(current) ? v : new Set(v).add(current)));
  }, [current]);

  const reveal = useCallback((id: SecretId) => {
    setOverlay({ kind: 'secret', id });
    setFound((f) => {
      if (f.includes(id)) return f;
      const next = [...f, id];
      writeLocal(SECRETS_KEY, next);
      return next;
    });
  }, []);

  // Stable between turns, so pages don't re-render while a leaf is moving.
  const goRef = useRef(go);
  goRef.current = go;
  const visitedAll = visited.size >= pages.length;
  const api = useMemo(
    () => ({
      go: (i: number, force?: boolean) => goRef.current(i, force),
      goTo: (id: PageId) => goRef.current(pageIds.indexOf(id)),
      index: 0,
      pageIds,
      visitedAll,
      found,
      reveal,
      openMoment: (moment: FilmMoment) => setOverlay({ kind: 'moment', moment }),
    }),
    [pageIds, visitedAll, found, reveal],
  );

  const finishTurn = useCallback(() => {
    animatedFirst.current = false;
    setTurn((t) => {
      if (t) setCurrent(t.dir > 0 ? t.under : t.leaf);
      return null;
    });
    busy.current = false;
  }, []);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => setHint(false), 7000);
    return () => window.clearTimeout(t);
  }, [shown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  const swipe = useSwipe(next, prev);

  // Subtle tilt toward a mouse pointer (desktop only — touch stays steady for reading).
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const canTilt = useMemo(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches, []);
  const srx = useSpring(rx, { stiffness: 60, damping: 18 });
  const sry = useSpring(ry, { stiffness: 60, damping: 18 });
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 5);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 4);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const pageLabel = (i: number) => `${pages[i].label}, page ${i + 1} of ${pages.length}`;
  const render = (i: number) => {
    const Page = PAGES[pages[i].id];
    // the first page plays its entrance once; every other arrival is already printed
    return (
      <Still animate={i === 0 && animatedFirst.current}>
        <Page />
      </Still>
    );
  };

  return (
    <BookContext.Provider value={api}>
      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center"
        aria-hidden={!shown || undefined}
        style={{
          display: shown ? undefined : 'none',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="card-enter card-frame relative">
          <motion.div
            className="no-select absolute inset-0"
            // the browser must not hijack sideways swipes (it would cancel them mid-gesture)
            // tilt only for mouse users: on phones a lingering 3D transform softens text rendering
            style={canTilt ? { rotateX: srx, rotateY: sry, transformPerspective: 1600, touchAction: 'none' } : { touchAction: 'none' }}
            {...swipe}
            onPointerMove={(e) => {
              swipe.onPointerMove(e);
              onMove(e);
            }}
            onPointerLeave={onLeave}
          >
            {/* the other inserts peeking from beneath */}
            <div className="paper card-shadow absolute inset-0 translate-x-[1.2%] translate-y-[1%] rotate-[1.6deg] rounded-[5px] paper-champagne" />
            <div className="paper card-shadow absolute inset-0 -translate-x-[0.6%] translate-y-[0.6%] -rotate-[1deg] rounded-[5px]" />

            {/* One keyed list: pages stay built (never remount) while they turn or wait beneath. */}
            {[...mounted]
              .sort((x, y) => x - y)
              .map((i) => {
                const isLeaf = !!turn && i === turn.leaf;
                const isUnder = !!turn && i === turn.under;
                const z = isLeaf ? 3 : isUnder ? 2 : !turn && i === current ? 2 : 1 - Math.abs(i - current) * 0.1;
                return (
                  <PageLeaf
                    key={i}
                    zIndex={Math.round(z * 10)}
                    turning={isLeaf && armed}
                    interactive={!turn && i === current}
                    from={turn && turn.dir < 0 ? 1 : 0}
                    to={turn && turn.dir < 0 ? 0 : 1}
                    onDone={finishTurn}
                    label={pageLabel(i)}
                  >
                    {render(i)}
                  </PageLeaf>
                );
              })}
          </motion.div>

          {/* notes and memories open on top of the card, never as a page-wide popup */}
          <AnimatePresence>
            {overlay?.kind === 'secret' && <SecretNote key={`s-${overlay.id}`} id={overlay.id} onClose={() => setOverlay(null)} />}
            {overlay?.kind === 'moment' && <MomentViewer key={`m-${overlay.moment.title}`} moment={overlay.moment} onClose={() => setOverlay(null)} />}
            {overlay?.kind === 'contents' && (
              <ContentsCard
                key="contents"
                pages={pages}
                current={index}
                visited={visited}
                onPick={(i) => {
                  setOverlay(null);
                  go(i, true);
                }}
                onClose={() => setOverlay(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── controls ── */}
        <nav
          className="reveal mt-4 flex w-full max-w-[440px] flex-col items-center px-2"
          style={{ animationDelay: '1s', '--ry': '12px' } as CSSProperties}
          aria-label="Invitation pages"
        >
          <div className="relative h-5 w-full text-center">
            {/* CSS-only fades: nothing here runs JavaScript while a page is turning */}
            <p
              key={hint ? 'hint' : 'title'}
              className="ui-fade absolute inset-x-0 flex items-center justify-center gap-2 font-caps text-[11px] uppercase tracking-[0.28em] text-olive/75"
              aria-live="polite"
            >
                {hint ? (
                  <>
                    <span className="hint-nudge">
                      <Hand size={13} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span className="whitespace-nowrap text-[10.5px] normal-case tracking-[0.06em]">{invitation.wording.swipeHint}</span>
                  </>
                ) : (
                  <span className="text-[10px] tracking-[0.3em] text-olive/55">tap the title for contents</span>
                )}
            </p>
          </div>

          <div className="mt-1.5 flex w-full items-center justify-between gap-2">
            <NavArrow dir="prev" disabled={index === 0} onClick={prev} />
            {/* the page title opens a printed table of contents */}
            <motion.button
              type="button"
              onClick={() => setOverlay((o) => (o?.kind === 'contents' ? null : { kind: 'contents' }))}
              whileTap={{ scale: 0.96 }}
              className="flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-full"
              aria-label={`${pages[index].label}, page ${index + 1} of ${pages.length}. Open contents`}
              aria-haspopup="dialog"
            >
              <span className="flex max-w-full items-center gap-1.5 font-caps text-[11px] uppercase tracking-[0.24em] text-olive/85">
                <span key={index} className="ui-fade flex min-w-0 items-center gap-1.5">
                  <span className="text-gold">{ROMAN[index]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{pages[index].label}</span>
                </span>
                <BookOpen size={12} strokeWidth={1.6} className="shrink-0 text-gold" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-[5px]" aria-hidden="true">
                {pages.map((p, i) => (
                  <span
                    key={p.id}
                    className={`block h-[5px] w-[5px] rounded-full transition-[transform,background-color] duration-300 ease-out ${
                      i === index ? 'scale-x-[2.4] bg-olive' : visited.has(i) ? 'bg-gold/70' : 'border border-gold/60 bg-ivory/70'
                    }`}
                    style={{ margin: i === index ? '0 4px' : undefined }}
                  />
                ))}
              </span>
            </motion.button>
            <NavArrow dir="next" disabled={index === pages.length - 1} onClick={next} />
          </div>
        </nav>
      </div>
    </BookContext.Provider>
  );
}

function NavArrow({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-ivory/75 text-olive shadow-[0_3px_10px_-5px_rgba(60,50,30,.4)] transition-opacity disabled:opacity-30"
      whileTap={disabled ? undefined : { scale: 0.88 }}
      whileHover={disabled ? undefined : { scale: 1.06 }}
    >
      <span className="absolute inset-[3px] rounded-full border border-gold/20" aria-hidden="true" />
      <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
    </motion.button>
  );
}
