import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Loader2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { invitation } from '../../config/invitation';
import { guest } from '../../lib/guest';
import { getDeviceReply, submitRsvp, validate } from '../../lib/rsvp';
import type { RsvpErrors, StoredReply } from '../../lib/rsvp';
import { PetalBurst } from '../Ambient';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';

// The draft survives page turns (pages unmount when flipped away).
const draft = {
  name: guest.name,
  attending: null as boolean | null,
  guests: 1,
  message: '',
};

export default function RsvpPage() {
  const r = invitation.rsvp;
  const [reply, setReply] = useState<StoredReply | null>(() => getDeviceReply());
  const [justSent, setJustSent] = useState(false);
  const [settled, setSettled] = useState(false);

  return (
    <PageShell decor="light">
      <ScriptDraw text={r.heading} className="mx-auto w-[74%] text-olive" />
      <Reveal delay={0.5}>
        <p className="-mt-[0.2cqh] font-serif text-small italic text-ink/75">
          The favour of a reply is requested by <span className="whitespace-nowrap not-italic text-olive">{r.deadline}</span>
        </p>
      </Reveal>

      {/* The response card unfolds out of the invitation */}
      <motion.div
        className="relative mt-[1.8cqh] w-full"
        style={{ transformPerspective: 900, originY: 0 }}
        // once open, drop the 3D transform so text stays crisp
        transformTemplate={settled ? () => 'none' : undefined}
        onAnimationComplete={() => setSettled(true)}
        initial={{ rotateX: -80, opacity: 0, y: -10 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1.2, ease: [0.3, 0.1, 0.2, 1] }}
      >
        <div className="drop-shadow-[0_6px_10px_rgba(60,50,30,.18)]">
          <div className="paper paper-champagne deckle relative px-[6%] py-[5%]">
            <div className="pointer-events-none absolute inset-[3%] border border-gold/35" aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              {reply ? (
                <ThankYou key="thanks" reply={reply} fresh={justSent} />
              ) : (
                <RsvpForm
                  key="form"
                  onDone={(rep) => {
                    setJustSent(true);
                    setReply(rep);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </PageShell>
  );
}

function RsvpForm({ onDone }: { onDone: (r: StoredReply) => void }) {
  const r = invitation.rsvp;
  const seats = guest.seats;
  const [name, setName] = useState(draft.name);
  const [attending, setAttending] = useState<boolean | null>(draft.attending);
  const [guests, setGuests] = useState(Math.min(draft.guests, seats));
  const [message, setMessage] = useState(draft.message);
  const [honey, setHoney] = useState('');
  const [errors, setErrors] = useState<RsvpErrors & { attending?: string }>({});
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const [serverError, setServerError] = useState('');

  const sync = (patch: Partial<typeof draft>) => Object.assign(draft, patch);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setServerError('');
    const input = { name, attending: attending === true, guests, message };
    const errs: RsvpErrors & { attending?: string } = validate(input, seats);
    if (attending === null) errs.attending = 'Please let us know if you can attend.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('sending');
    if (honey) {
      // bot filled the hidden field — pretend success, store nothing
      await new Promise((res) => setTimeout(res, 800));
      onDone({ ...input, at: new Date().toISOString() });
      return;
    }
    const res = await submitRsvp(input);
    setStatus('idle');
    if (res.ok) onDone(res.reply);
    else setServerError(res.message);
  };

  const label = 'block font-caps text-caps uppercase text-olive/75';
  const err = 'mt-1 font-serif text-small italic text-[#a0564c]';

  return (
    <motion.form
      noValidate
      onSubmit={submit}
      className="relative space-y-[1.6cqh] text-left"
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      data-no-swipe
    >
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="rsvp-name" className={label}>
          Name
        </label>
        <input
          id="rsvp-name"
          type="text"
          autoComplete="name"
          enterKeyHint="next"
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            sync({ name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          placeholder="Your full name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'err-name' : undefined}
          className="field mt-1 w-full border-0 border-b border-olive/30 bg-transparent px-0 py-1.5 font-serif text-ink placeholder:italic placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-0"
        />
        {errors.name && (
          <p id="err-name" className={err}>
            {errors.name}
          </p>
        )}
      </div>

      <fieldset>
        <legend className={label}>Will you attend?</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup">
          {[
            { v: true, text: r.acceptLabel },
            { v: false, text: r.declineLabel },
          ].map((o) => {
            const on = attending === o.v;
            return (
              <motion.button
                key={String(o.v)}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setAttending(o.v);
                  sync({ attending: o.v });
                  if (errors.attending) setErrors({ ...errors, attending: undefined });
                }}
                whileTap={{ scale: 0.96 }}
                className={`flex min-h-[46px] items-center gap-2 rounded-[3px] border px-2.5 py-2 text-left font-serif text-small leading-tight transition-colors duration-300 ${
                  on ? 'border-olive bg-olive text-ivory' : 'border-olive/30 bg-ivory/50 text-ink'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? 'border-ivory' : 'border-olive/50'}`}
                  aria-hidden="true"
                >
                  {on && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {o.v ? <Check size={11} strokeWidth={2.4} /> : <span className="block h-1.5 w-1.5 rounded-full bg-ivory" />}
                    </motion.span>
                  )}
                </span>
                {o.text}
              </motion.button>
            );
          })}
        </div>
        {errors.attending && <p className={err}>{errors.attending}</p>}
      </fieldset>

      <AnimatePresence initial={false}>
        {attending && (
          <motion.div
            key="guests"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div>
                <span className={label} id="guests-label">
                  Number of guests
                </span>
                <span className="font-serif text-small italic text-ink/60">
                  {seats === 1 ? 'one seat reserved for you' : `up to ${seats} seats reserved`}
                </span>
              </div>
              <div className="flex items-center gap-1" role="group" aria-labelledby="guests-label">
                <Stepper icon="minus" disabled={guests <= 1} onClick={() => (setGuests(guests - 1), sync({ guests: guests - 1 }))} />
                <span className="w-8 text-center font-serif text-title tabular-nums lining-nums text-olive" aria-live="polite">
                  {guests}
                </span>
                <Stepper icon="plus" disabled={guests >= seats} onClick={() => (setGuests(guests + 1), sync({ guests: guests + 1 }))} />
              </div>
            </div>
            {errors.guests && <p className={err}>{errors.guests}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="rsvp-msg" className={label}>
          A note for the couple <span className="normal-case tracking-normal text-ink/50">(optional)</span>
        </label>
        <textarea
          id="rsvp-msg"
          rows={2}
          maxLength={500}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            sync({ message: e.target.value });
          }}
          placeholder="Wishes, song requests, dietary needs…"
          className="field mt-1 block w-full resize-none border-0 bg-transparent px-0 py-0 font-serif leading-[1.9em] text-ink placeholder:italic placeholder:text-ink/35 focus:outline-none focus:ring-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(180deg, transparent 0, transparent calc(1.9em - 1px), rgba(65,70,56,.22) calc(1.9em - 1px), rgba(65,70,56,.22) 1.9em)',
          }}
        />
        {errors.message && <p className={err}>{errors.message}</p>}
      </div>

      {serverError && (
        <p role="alert" className="rounded-[3px] border border-[#a0564c]/30 bg-[#a0564c]/5 px-3 py-2 font-serif text-small italic text-[#8a4a42]">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={status === 'sending'}
        whileTap={{ scale: 0.97 }}
        className="relative flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[3px] bg-olive font-caps text-[12px] uppercase tracking-[0.26em] text-ivory shadow-[0_6px_14px_-8px_rgba(40,40,30,.8)] disabled:opacity-80"
      >
        <span className="pointer-events-none absolute inset-[3px] rounded-[2px] border border-gold/40" aria-hidden="true" />
        {status === 'sending' ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending
          </>
        ) : (
          r.submitLabel
        )}
      </motion.button>
    </motion.form>
  );
}

function Stepper({ icon, disabled, onClick }: { icon: 'plus' | 'minus'; disabled: boolean; onClick: () => void }) {
  const Icon = icon === 'plus' ? Plus : Minus;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.85 }}
      aria-label={icon === 'plus' ? 'Add a guest' : 'Remove a guest'}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/35 bg-ivory/60 text-olive disabled:opacity-30"
    >
      <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
    </motion.button>
  );
}

/** Wax-stamped confirmation. */
function ThankYou({ reply, fresh }: { reply: StoredReply; fresh: boolean }) {
  const r = invitation.rsvp;
  const first = reply.name.split(' ')[0];
  return (
    <motion.div
      className="relative flex flex-col items-center py-[2cqh] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="status"
    >
      {fresh && reply.attending && <PetalBurst count={16} className="top-[22%]" />}
      <motion.div
        className="relative h-[min(22cqw,13cqh)] w-[min(22cqw,13cqh)]"
        initial={fresh ? { scale: 2.4, opacity: 0, rotate: -25 } : false}
        animate={{ scale: 1, opacity: 1, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15, delay: 0.15 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_3px_3px_rgba(40,35,20,.35)]" aria-hidden="true">
          <path
            d="M50 4 C62 3 70 9 79 13 C90 19 96 31 95 45 C97 58 93 70 85 80 C76 90 63 97 50 96 C36 97 24 91 15 82 C6 72 3 60 5 48 C4 34 10 22 20 14 C29 7 39 4 50 4Z"
            fill="url(#wax)"
          />
          <circle cx="50" cy="50" r="33" fill="url(#wax-inner)" stroke="#2c3123" strokeOpacity=".5" strokeWidth="2" />
          <ellipse cx="36" cy="28" rx="13" ry="5" fill="#fff" opacity=".15" transform="rotate(-28 36 28)" />
        </svg>
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-[#e4e6cf]"
          initial={fresh ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 260, damping: 12 }}
        >
          {reply.attending ? <Check size={30} strokeWidth={2.2} /> : <Heart size={26} strokeWidth={1.8} />}
        </motion.span>
        {fresh && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-gold/60"
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ delay: 0.35, duration: 1.1, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
      </motion.div>

      <motion.h3
        className="mt-[1.8cqh] font-script text-script leading-none text-olive"
        initial={fresh ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Thank you, {first}
      </motion.h3>
      <motion.p
        className="mt-[1cqh] max-w-[92%] font-serif text-body italic text-ink/85"
        initial={fresh ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        {fresh ? (reply.attending ? r.thankYouAccept : r.thankYouDecline) : r.alreadyReplied}
      </motion.p>
      <motion.div
        initial={fresh ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="mt-[1.4cqh]"
      >
        <Caps className="text-gold">
          {reply.attending ? `Attending · ${reply.guests} ${reply.guests === 1 ? 'guest' : 'guests'}` : 'Unable to attend'}
        </Caps>
      </motion.div>
    </motion.div>
  );
}
