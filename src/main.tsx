import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { applyTheme } from './lib/theme';
import './index.css';

applyTheme();

// Lighter ambient effects on modest phones so page turns stay smooth.
{
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;
  if (cores <= 4 || mem <= 3 || window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    document.documentElement.classList.add('lite');
  }
  if (window.matchMedia('(pointer: coarse)').matches) document.documentElement.classList.add('touch');
}

// Debug helper: ?fps=1 shows a live frame-rate meter (handy when testing on a phone).
if (new URLSearchParams(window.location.search).has('fps')) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:6px;top:6px;z-index:9999;font:12px monospace;background:#000a;color:#0f0;padding:2px 6px;border-radius:4px;pointer-events:none';
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
