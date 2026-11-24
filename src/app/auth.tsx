import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** true until the first session check finishes */
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, redirectTo?: string) => Promise<string | null>;
  signInWithGoogle: (redirectTo?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const absolute = (path: string) => window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') + path;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) return setProfile(null);
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, phone, role').eq('id', s.user.id).single();
    if (error) console.error('[auth] profile', error);
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await loadProfile(data.session);
      if (alive) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // run outside the auth callback (Supabase recommends not awaiting inside it)
      setTimeout(() => loadProfile(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      loading,
      isStaff: profile?.role === 'staff' || profile?.role === 'admin',
      isAdmin: profile?.role === 'admin',
      signInWithEmail: async (email, redirectTo = '/dashboard') => {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: absolute(redirectTo) } });
        return error ? error.message : null;
      },
      signInWithGoogle: async (redirectTo = '/dashboard') => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: absolute(redirectTo) } });
        return error ? error.message : null;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshProfile: () => loadProfile(session),
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

function Checking() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" aria-label="Loading" />
    </div>
  );
}

/** Signed-in customers only; others go to /login and come back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Checking />;
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}

/** Staff/admin only. (The database enforces this too — this just hides the UI.) */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { session, profile, loading, isStaff } = useAuth();
  const loc = useLocation();
  if (loading || (session && !profile)) return <Checking />;
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!isStaff) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
