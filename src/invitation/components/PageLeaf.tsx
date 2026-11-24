import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { LeafActiveContext } from './leafContext';

const TURN_SECONDS = 1.05;
/** How far the crease leans mid-turn (fraction of card width) — the corner lifts first. */
const LEAN = 0.42;
/** Keyframes sampled along the fold; the browser interpolates between them. */
const STEPS = 40;

/** cubic-bezier(0.4, 0, 0.2, 1) evaluated at time t */
function ease(t: number) {
  const x1 = 0.4, y1 = 0, x2 = 0.2, y2 = 1;
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3;
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < t) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}

const f = (n: number) => n.toFixed(2);

interface Geometry {
  W: number;
  H: number;
  /** size of the half-plane window and where the crease's anchor sits inside it */
  Ww: number;
  Hw: number;
  by: number;
}

function geometry(W: number, H: number): Geometry {
  // Large enough to cover the card at the steepest crease (~16°), and no larger:
  // a smaller window means far less GPU memory on high-density phone screens.
  const below = Math.ceil(W * 0.45 + 12);
  const Ww = Math.ceil(W + H * 0.35 + 24);
  const Hw = Math.ceil(H * 1.15 + W * 0.3 + 12) + below;
  return { W, H, Ww, Hw, by: Hw - below };
}

/** Transforms for fold progress p (0 = flat, 1 = turned away). */
function frame(g: Geometry, p: number) {
  const { W, H, Ww, by } = g;
  const k = LEAN * W * Math.sin(Math.PI * p);
  const Bx = W * (1 - p) - k / 2; // where the crease meets the bottom edge
  const By = H;
  const th = (Math.atan2(-H, k) * 180) / Math.PI; // crease direction (pointing up)
  const phi = th + 90;
  const strength = Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, p))) * 6);
  return {
    clip: `translate(${f(Bx)}px, ${f(By)}px) rotate(${f(phi)}deg) translate(${-Ww}px, ${-by}px)`,
    inner: `translate(${Ww}px, ${by}px) rotate(${f(-phi)}deg) translate(${f(-Bx)}px, ${f(-By)}px)`,
    flap: `translate(${Ww}px, ${by}px) rotate(${f(-phi)}deg) rotate(${f(th)}deg) scale(1, -1) rotate(${f(-th)}deg) translate(${f(-Bx)}px, ${f(-By)}px)`,
    shadow: `translate(${f(Bx)}px, ${f(By)}px) rotate(${f(phi)}deg) translate(0px, ${-by}px)`,
    strength,
  };
}

/**
 * One invitation insert that turns by folding over like real paper.
 *
 * A crease sweeps from the right edge to the left; its bottom end leads, so the
 * bottom-right corner peels up first. The part beyond the crease is mirrored across
 * it, showing the plain back of the paper, while the next page appears beneath.
 *
 * Built for phones:
 *  - only transforms and opacity move, played by the Web Animations API, so the
 *    browser's compositor runs the turn even while JavaScript is busy;
 *  - every layer exists *before* a turn starts (nothing is created, resized or
 *    shown at the first frame), so there is no raster spike when a swipe lands;
 *  - the clipping window is only slightly bigger than the card.
 */
export function PageLeaf({
  children,
  turning,
  from = 0,
  to = 1,
  onDone,
  zIndex,
  label,
  interactive = true,
}: {
  children: ReactNode;
  turning: boolean;
  from?: number;
  to?: number;
  onDone?: () => void;
  zIndex: number;
  label?: string;
  /** false for pages lying beneath the current one */
  interactive?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const crease = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const geo = useRef<Geometry | null>(null);
  const done = useRef(onDone);
  done.current = onDone;

  /** Lay the page flat (or folded away) with static transforms. */
  const place = (p: number) => {
    const g = geo.current;
    if (!g || !clip.current || !inner.current || !flap.current || !shadow.current || !crease.current) return;
    const k = frame(g, p);
    clip.current.style.transform = k.clip;
    inner.current.style.transform = k.inner;
    flap.current.style.transform = k.flap;
    shadow.current.style.transform = k.shadow;
    shadow.current.style.opacity = '0';
    crease.current.style.opacity = '0';
  };

  // Measure once (and on resize) and keep the layers sized permanently.
  useLayoutEffect(() => {
    const r = root.current;
    if (!r) return;
    const measure = () => {
      const g = geometry(r.offsetWidth, r.offsetHeight);
      geo.current = g;
      Object.assign(clip.current!.style, { width: `${g.Ww}px`, height: `${g.Hw}px` });
      Object.assign(inner.current!.style, { width: `${g.W}px`, height: `${g.H}px` });
      Object.assign(flap.current!.style, { width: `${g.W}px`, height: `${g.H}px` });
      shadow.current!.style.height = `${g.Hw}px`;
      if (!turningRef.current) place(0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turningRef = useRef(turning);
  turningRef.current = turning;

  useLayoutEffect(() => {
    const g = geo.current;
    const els = [clip.current, inner.current, flap.current, crease.current, shadow.current];
    if (!g || els.some((e) => !e)) return;
    if (!turning) {
      place(0);
      return;
    }
    const [c, n, fl, cr, sh] = els as HTMLElement[];
    const frames = Array.from({ length: STEPS + 1 }, (_, i) => frame(g, from + (to - from) * ease(i / STEPS)));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const opts: KeyframeAnimationOptions = { duration: reduce ? 1 : TURN_SECONDS * 1000, easing: 'linear', fill: 'forwards' };

    const anims = [
      c.animate(frames.map((k) => ({ transform: k.clip })), opts),
      n.animate(frames.map((k) => ({ transform: k.inner })), opts),
      fl.animate(frames.map((k) => ({ transform: k.flap })), opts),
      cr.animate(frames.map((k) => ({ opacity: k.strength })), opts),
      sh.animate(frames.map((k) => ({ transform: k.shadow, opacity: k.strength })), opts),
    ];
    let cancelled = false;
    anims[0].finished
      .then(() => {
        if (cancelled) return;
        place(to); // hand the final pose back to static styles
        anims.forEach((a) => a.cancel());
        done.current?.();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turning, from, to]);

  const live = interactive && !turning;

  return (
    <div
      ref={root}
      className="card-shadow absolute inset-0 rounded-[5px]"
      style={{ zIndex, pointerEvents: live ? undefined : 'none' }}
      aria-hidden={live ? undefined : true}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[5px]">
        {/* half-plane window: only the part of the page on the "kept" side of the crease */}
        <div ref={clip} className="absolute left-0 top-0 overflow-hidden" style={{ transformOrigin: '0 0', willChange: 'transform' }}>
          <section
            ref={inner}
            className={`absolute left-0 top-0 ${turning || !interactive ? 'leaf-frozen' : ''}`}
            style={{ transformOrigin: '0 0', willChange: 'transform' }}
            aria-roledescription="page"
            aria-label={label}
          >
            <LeafActiveContext.Provider value={interactive}>{children}</LeafActiveContext.Provider>
          </section>

          {/* the folded flap: plain back of the paper, mirrored across the crease (parked out of view when flat) */}
          <div ref={flap} className="paper absolute left-0 top-0" style={{ transformOrigin: '0 0', willChange: 'transform' }} aria-hidden="true">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(60,50,30,.08), rgba(255,255,255,.18))' }} />
          </div>

          {/* light rolling over the curl, hugging the crease (the window's right edge) */}
          <div
            ref={crease}
            className="pointer-events-none absolute right-0 top-0 h-full w-[90px]"
            style={{
              opacity: 0,
              willChange: 'opacity',
              background:
                'linear-gradient(270deg, rgba(60,50,30,.28) 0px, rgba(255,255,255,.75) 3px, rgba(255,255,255,.3) 22px, rgba(255,255,255,0) 90px)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* shadow the lifted flap casts on the page being revealed */}
        <div
          ref={shadow}
          className="pointer-events-none absolute left-0 top-0 w-[110px]"
          style={{
            opacity: 0,
            transformOrigin: '0 0',
            willChange: 'transform, opacity',
            background: 'linear-gradient(90deg, rgba(40,32,18,.42) 0%, rgba(40,32,18,.14) 25%, rgba(40,32,18,0) 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
