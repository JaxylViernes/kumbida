import { useRef } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';

const INTERACTIVE = 'input, textarea, select, button, a, label, [data-no-swipe]';

/**
 * Horizontal swipe detection that ignores vertical scrolling, taps,
 * and gestures that begin on form controls (prevents accidental page turns).
 */
export function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: RPointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: RPointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    last.current = { x: e.clientX, y: e.clientY };
    // Turn as soon as the intent is clear — no need to wait for the finger to lift.
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      start.current = null;
      if (dx < 0) onLeft();
      else onRight();
    }
  };

  const finish = (x: number, y: number, id: number) => {
    const s = start.current;
    start.current = null;
    if (!s || s.id !== id) return;
    const dx = x - s.x;
    const dy = y - s.y;
    const dt = performance.now() - s.t;
    const fast = Math.abs(dx) / Math.max(dt, 1) > 0.45;
    if (Math.abs(dx) < (fast ? 35 : 60)) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.6) return; // mostly vertical → it was a scroll
    if (dt > 2500) return;
    if (dx < 0) onLeft();
    else onRight();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: RPointerEvent) => finish(e.clientX, e.clientY, e.pointerId),
    // Browser took over (e.g. vertical scroll) — judge by the last known point.
    onPointerCancel: (e: RPointerEvent) => {
      const l = last.current;
      if (l) finish(l.x, l.y, e.pointerId);
      else start.current = null;
    },
  };
}
