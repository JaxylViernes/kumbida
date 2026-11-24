import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './auth';

/** Passwordless sign-in: a magic link by email, or Google. */
export default function LoginPage() {
  const { session, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  if (!loading && session) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email address.');
    setState('sending');
    const err = await signInWithEmail(email.trim(), next);
    if (err) {
      setError(err);
      setState('idle');
    } else setState('sent');
  };

  const google = async () => {
    setError('');
    const err = await signInWithGoogle(next);
    if (err) setError(/provider is not enabled/i.test(err) ? 'Google sign-in isn’t set up yet — please use your email for now.' : err);
  };

  return (
    <main className="flex min-h-full items-center justify-center bg-ivory px-5 py-12">
      <div className="paper w-full max-w-[400px] rounded-[6px] px-7 py-9 text-center shadow-[0_20px_40px_-24px_rgba(60,50,30,.5)]">
        <p className="font-script text-[46px] leading-none text-olive">Kumbida</p>
        <p className="mt-1 font-caps text-[11px] uppercase tracking-[0.3em] text-olive/60">Sign in to your invitations</p>

        {state === 'sent' ? (
          <div className="mt-8" role="status">
            <p className="font-serif text-xl text-olive">Check your email</p>
            <p className="mt-2 font-serif text-[16px] italic leading-relaxed text-ink/75">
              We sent a sign-in link to <span className="not-italic text-olive">{email}</span>. Open it on this device to continue.
            </p>
            <button type="button" onClick={() => setState('idle')} className="mt-6 font-caps text-[11px] uppercase tracking-[0.22em] text-olive/70 underline decoration-gold/50 underline-offset-4">
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="mt-8 space-y-3 text-left" noValidate>
              <label htmlFor="email" className="block font-caps text-[11px] uppercase tracking-[0.22em] text-olive/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[4px] border border-olive/25 bg-white/70 px-3.5 py-3 font-serif text-[17px] text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === 'sending'}
                className="flex min-h-[48px] w-full items-center justify-center rounded-[4px] bg-olive font-caps text-[12px] uppercase tracking-[0.24em] text-ivory transition-opacity disabled:opacity-60"
              >
                {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </form>
            <div className="my-5 flex items-center gap-3 text-olive/40" aria-hidden="true">
              <span className="h-px flex-1 bg-current" />
              <span className="font-caps text-[10px] uppercase tracking-[0.25em]">or</span>
              <span className="h-px flex-1 bg-current" />
            </div>
            <button
              type="button"
              onClick={google}
              className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-[4px] border border-olive/30 bg-white/70 font-serif text-[17px] text-ink active:bg-champagne/60"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 font-serif text-[15px] italic text-[#8a4a42]">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
