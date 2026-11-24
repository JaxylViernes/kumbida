import React from 'react';
import ReactDOM from 'react-dom/client';
import { setInvitation, type InvitationConfig } from './config/invitation';
import { applyTheme } from './lib/theme';

/** Device hints used by the CSS to keep phones smooth, plus the ?fps=1 debug meter. */
function deviceHints() {
  const root = document.documentElement;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;
  if (cores <= 4 || mem <= 3 || window.matchMedia('(prefers-reduced-data: reduce)').matches) root.classList.add('lite');
  if (window.matchMedia('(pointer: coarse)').matches) root.classList.add('touch');

  if (!new URLSearchParams(window.location.search).has('fps')) return;
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;left:6px;top:6px;z-index:9999;font:12px monospace;background:#000a;color:#0f0;padding:2px 6px;border-radius:4px;pointer-events:none';
  document.body.appendChild(el);
  let frames = 0;
  let last = performance.now();
  let worst = 0;
  let prev = last;
  const tick = (now: number) => {
    frames++;
    worst = Math.max(worst, now - prev);
    prev = now;
    if (now - last >= 1000) {
      el.textContent = `${frames} fps · worst ${Math.round(worst)}ms`;
      frames = 0;
      worst = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Show one invitation full-screen. The config is set *before* the invitation's
 * code loads, so everything it computes on load sees the right couple.
 */
export async function bootInvitation(root: HTMLElement, config: InvitationConfig) {
  setInvitation(config);
  applyTheme();
  deviceHints();
  const { default: InvitationApp } = await import('./InvitationApp');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <InvitationApp />
    </React.StrictMode>,
  );
}
