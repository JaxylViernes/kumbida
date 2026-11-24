import { Link } from 'react-router-dom';
import { useAuth } from './auth';

/**
 * Phase 1 placeholders: confirm sign-in and roles work end to end.
 * The real customer dashboard (Phase 5) and admin panel (Phase 6) replace these.
 */
function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  return (
    <main className="min-h-full bg-ivory px-5 py-10">
      <div className="mx-auto max-w-[640px]">
        <header className="flex items-center justify-between">
          <Link to="/" className="font-script text-[34px] leading-none text-olive">
            Kumbida
          </Link>
          <button onClick={signOut} className="font-caps text-[11px] uppercase tracking-[0.22em] text-olive/70 underline decoration-gold/50 underline-offset-4">
            Sign out
          </button>
        </header>
        <h1 className="mt-8 font-serif text-[30px] text-olive">{title}</h1>
        <p className="mt-1 font-serif text-[17px] italic text-ink/70">
          Signed in as {profile?.email ?? '…'} · <span className="not-italic">{profile?.role ?? '…'}</span>
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function DashboardPage() {
  const { isStaff } = useAuth();
  return (
    <Shell title="Your invitations">
      <p className="font-serif text-[17px] text-ink/80">Orders and invitations will appear here.</p>
      {isStaff && (
        <Link to="/admin" className="mt-4 inline-block font-caps text-[12px] uppercase tracking-[0.22em] text-olive underline decoration-gold/60 underline-offset-4">
          Open admin
        </Link>
      )}
    </Shell>
  );
}

export function AdminPage() {
  return (
    <Shell title="Admin">
      <p className="font-serif text-[17px] text-ink/80">Orders, payments and templates will be managed here.</p>
    </Shell>
  );
}
