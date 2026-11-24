import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * The Kumbida platform (marketing site, ordering, dashboards, admin).
 * Phase 0: only the routing shell — the real pages arrive in later phases.
 */
function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <p className="font-script text-[48px] leading-none text-olive">Kumbida</p>
      <p className="font-serif text-lg italic text-ink/75">This page isn’t here yet.</p>
      <a href={import.meta.env.BASE_URL} className="font-caps text-[12px] uppercase tracking-[0.25em] text-olive underline decoration-gold/60 underline-offset-4">
        See our sample invitation
      </a>
    </main>
  );
}

export default function PlatformApp() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
