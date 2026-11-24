import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth, RequireStaff } from './auth';

const LoginPage = lazy(() => import('./LoginPage'));
const DashboardPage = lazy(() => import('./AccountPages').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('./AccountPages').then((m) => ({ default: m.AdminPage })));

/**
 * The Kumbida platform (marketing site, ordering, dashboards, admin).
 * Phase 1: sign-in, customer and admin areas wired up; pages fill in later phases.
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

function Loading() {
  return (
    <div className="flex min-h-full items-center justify-center bg-ivory">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" aria-label="Loading" />
    </div>
  );
}

export default function PlatformApp() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RequireStaff>
                  <AdminPage />
                </RequireStaff>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
