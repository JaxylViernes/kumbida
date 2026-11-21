import { AnimatePresence, motion } from 'framer-motion';
import { Feather, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { invitation } from '../../config/invitation';
import { guest } from '../../lib/guest';
import { myEntries, signGuestbook, validateEntry, type GuestbookEntry } from '../../lib/guestbook';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';

const LINED = {
  backgroundImage:
    'repeating-linear-gradient(180deg, transparent 0, transparent calc(1.75em - 1px), rgba(65,70,56,.2) calc(1.75em - 1px), rgba(65,70,56,.2) 1.75em)',
  lineHeight: '1.75em',
} as const;

/** The guest's message, written out in ink and pressed with a heart stamp. */
function WrittenEntry({ entry, animate }: { entry: GuestbookEntry; animate: boolean }) {
  const g = invitation.guestbook;
  const words = entry.message.split(/\s+/);
  const perWord = Math.min(0.09, 3.2 / Math.max(words.length, 1));
  const total = words.length * perWord;
  return (
    <div className="relative text-left">
      <p className="font-hand text-[clamp(19px,6cqw,25px)] text-olive" style={LINED}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            initial={animate ? { opacity: 0, clipPath: 'inset(0 100% 0 0)' } : false}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 0.2 + i * perWord, duration: 0.35, ease: 'easeOut' }}
          >
            {w + ' '}
          </motion.span>
        ))}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
      <motion.svg
        viewBox="0 0 60 60"
        className="h-14 w-14 shrink-0"
        initial={animate ? { scale: 2.2, opacity: 0, rotate: -30 } : false}
        animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
        transition={{ delay: 0.8 + total, type: 'spring', stiffness: 260, damping: 14 }}
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="26" fill="none" stroke="#a27c74" strokeWidth="1.6" strokeDasharray="2 2.4" />
        <circle cx="30" cy="30" r="21" fill="none" stroke="#a27c74" strokeWidth=".8" />
        <path d="M30 41 C19 33 17 26 21 22 C24 19 28.5 20.5 30 24 C31.5 20.5 36 19 39 22 C43 26 41 33 30 41Z" fill="#a27c74" opacity=".85" />
      </motion.svg>
      <motion.p
        className="text-right font-script text-[clamp(24px,7.4cqw,32px)] leading-none text-olive/90"
        initial={animate ? { opacity: 0, x: 8 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 + total, duration: 0.8 }}
      >
        — {entry.name}
      </motion.p>
      </div>

      <motion.p
        className="mt-3 text-center font-serif text-small italic text-ink/70"
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 + total }}
      >
        {g.thanks}
      </motion.p>
    </div>
  );
}

export default function GuestbookPage() {
  const g = invitation.guestbook;
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => myEntries());
  const [writing, setWriting] = useState(entries.length === 0);
  const [fresh, setFresh] = useState(false);
  const [name, setName] = useState(guest.name);
  const [message, setMessage] = useState('');
  const [shareable, setShareable] = useState(false);
  const [honey, setHoney] = useState('');
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [busy, setBusy] = useState(false);
  const [settled, setSettled] = useState(false);
  const [serverError, setServerError] = useState('');

  const last = entries[entries.length - 1];
  const canWriteMore = entries.length < g.maxPerDevice;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setServerError('');
    const errs = validateEntry(name, message);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    if (honey) {
      setBusy(false);
      return;
    }
    const res = await signGuestbook({ name, message, shareable });
    setBusy(false);
    if (!res.ok) {
      setServerError(res.message);
      return;
    }
    setEntries((x) => [...x, res.entry]);
    setMessage('');
    setFresh(true);
    setWriting(false);
  };

  const err = 'mt-1 font-serif text-small italic text-[#a0564c]';

  return (
    <PageShell decor="light">
      <ScriptDraw text={g.heading} className="mx-auto w-[64%] text-olive" />
      <Reveal delay={0.5}>
        <p className="-mt-[0.2cqh] font-serif text-small italic text-ink/75">{g.sub}</p>
      </Reveal>

      <motion.div
        className="relative mt-[2cqh] w-full"
        style={{ transformPerspective: 900, originY: 0 }}
        // once open, drop the 3D transform so text stays crisp
        transformTemplate={settled ? () => 'none' : undefined}
        onAnimationComplete={() => setSettled(true)}
        initial={{ rotateX: -70, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.3, 0.1, 0.2, 1] }}
      >
        <div className="drop-shadow-[0_6px_10px_rgba(60,50,30,.18)]">
          <div className="paper paper-champagne deckle relative px-[6%] py-[6%]">
            <div className="pointer-events-none absolute inset-[3%] border border-gold/35" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              {writing ? (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  className="relative space-y-[1.4cqh] text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  data-no-swipe
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honey}
                    onChange={(e) => setHoney(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                  <div>
                    <label htmlFor="gb-msg" className="sr-only">
                      Your message
                    </label>
                    <textarea
                      id="gb-msg"
                      rows={4}
                      maxLength={600}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      placeholder={g.placeholder}
                      className="field block w-full resize-none border-0 bg-transparent p-0 font-hand text-[max(18px,5.6cqw)] text-olive placeholder:text-olive/35 focus:outline-none focus:ring-0"
                      style={LINED}
                    />
                    <div className="flex justify-between">
                      {errors.message ? <p className={err}>{errors.message}</p> : <span />}
                      <span className="font-caps text-[10px] tracking-[0.1em] text-olive/40">{message.length}/600</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="pb-1.5 font-script text-[26px] leading-none text-olive/70" aria-hidden="true">
                      —
                    </span>
                    <div className="flex-1">
                      <label htmlFor="gb-name" className="sr-only">
                        Your name
                      </label>
                      <input
                        id="gb-name"
                        type="text"
                        autoComplete="name"
                        maxLength={80}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        placeholder="your name"
                        className="field w-full border-0 border-b border-olive/30 bg-transparent px-0 py-1 font-hand text-[max(18px,5.6cqw)] text-olive placeholder:text-olive/35 focus:border-gold focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                  {errors.name && <p className={err}>{errors.name}</p>}

                  <label className="flex cursor-pointer items-start gap-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={shareable}
                      onChange={(e) => setShareable(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#414638]"
                    />
                    <span className="font-serif text-small leading-snug text-ink/75">{g.shareLabel}</span>
                  </label>
                  <p className="flex items-center gap-1.5 font-serif text-small italic text-ink/55">
                    <Lock size={12} aria-hidden="true" /> {g.privacyNote}
                  </p>

                  {serverError && (
                    <p role="alert" className="font-serif text-small italic text-[#8a4a42]">
                      {serverError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[3px] bg-olive font-caps text-[12px] uppercase tracking-[0.24em] text-ivory shadow-[0_6px_14px_-8px_rgba(40,40,30,.8)]"
                  >
                    <span className="pointer-events-none absolute inset-[3px] rounded-[2px] border border-gold/40" aria-hidden="true" />
                    {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Feather size={15} aria-hidden="true" />}
                    {busy ? 'Writing…' : g.submitLabel}
                  </motion.button>
                </motion.form>
              ) : (
                last && (
                  <motion.div key="written" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status">
                    <WrittenEntry entry={last} animate={fresh} />
                    {canWriteMore && (
                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFresh(false);
                            setWriting(true);
                          }}
                          className="min-h-[40px] font-caps text-[11px] uppercase tracking-[0.22em] text-olive/70 underline decoration-gold/50 underline-offset-4"
                        >
                          Write another note
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </PageShell>
  );
}
