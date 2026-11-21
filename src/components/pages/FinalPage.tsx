import { AnimatePresence, motion } from 'framer-motion';
import { Clapperboard, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { invitation } from '../../config/invitation';
import { phase } from '../../lib/phase';
import { HeartFloat } from '../Ambient';
import { Wreath } from '../botanicals/Florals';
import { SECRET_IDS, useApp, useBook } from '../bookContext';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';
import { SecretTrigger } from '../Secrets';

function SendLove() {
  const [bursts, setBursts] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const id = useRef(0);
  return (
    <div className="relative flex flex-col items-center">
      <HeartFloat bursts={bursts} />
      <motion.button
        type="button"
        onClick={() => {
          const n = ++id.current;
          setCount((c) => c + 1);
          setBursts((b) => [...b.slice(-5), n]);
          if ('vibrate' in navigator) navigator.vibrate?.(8);
        }}
        whileTap={{ scale: 0.86 }}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-rose/70 bg-ivory/70 shadow-[0_4px_12px_-6px_rgba(120,80,70,.5)]"
        aria-label={`${invitation.reactions.label}${count ? ` (${count})` : ''}`}
      >
        <svg viewBox="0 0 20 18" className="h-5 w-5" aria-hidden="true">
          <path d="M10 17 C3 12 0 8 2 4 C4 0.5 8.5 1 10 4.5 C11.5 1 16 0.5 18 4 C20 8 17 12 10 17Z" fill="#D8B9B2" stroke="#a27c74" strokeWidth=".8" />
        </svg>
      </motion.button>
      <span className="mt-1 font-caps text-[10px] uppercase tracking-[0.22em] text-olive/60">
        {count ? `${count} ♡ sent` : invitation.reactions.label}
      </span>
    </div>
  );
}

/** The closing note tucked at the back of the invitation. */
export default function FinalPage() {
  const { couple, wedding, wording } = invitation;
  const closing = phase === 'after' ? invitation.thankYou.message : wording.closing;
  const words = closing.split(' ');

  return (
    <PageShell decor="none">
      <div className="relative mx-auto w-[min(56cqw,34cqh)]">
        <Wreath className="w-full" delay={0.2} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center pb-[6%]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
        >
          <span className="gold-foil font-script text-script">
            {couple.initials[0]}
            <span className="mx-[0.08em] font-serif text-[0.45em] italic">&amp;</span>
            {couple.initials[1]}
          </span>
        </motion.div>
      </div>

      <p className="mt-[1.2cqh] max-w-[92%] font-serif text-lead italic leading-snug text-olive" aria-label={closing}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.08, duration: 0.7 }}
            aria-hidden="true"
          >
            {w + (i < words.length - 1 ? ' ' : '')}
          </motion.span>
        ))}
      </p>

      <Reveal delay={2.4} className="mt-[1.4cqh]">
        <p className="font-serif text-small italic text-ink/70">{wording.closingSignoff}</p>
        <p className="gold-foil inline-block font-script text-script leading-tight">
          {couple.one.first} <span className="font-serif text-[0.5em] italic">&amp;</span> {couple.two.first}
        </p>
        <Caps className="text-olive/80">{wedding.short}</Caps>
      </Reveal>

      <Reveal delay={2.9} className="mt-[2.4cqh] flex w-full justify-center">
        <SendLove />
      </Reveal>
    </PageShell>
  );
}

/** P.S. — the little postscript card at the very back. */
export function PostscriptPage() {
  const { secrets } = invitation;
  const { go, visitedAll, found } = useBook();
  const { replayFilm } = useApp();
  return (
    <PageShell decor="light">
      <ScriptDraw text="P.S." className="mx-auto w-[62%] text-olive" size={72} />
      <Reveal delay={0.5}>
        <p className="mt-[1cqh] max-w-[88%] font-hand text-lead leading-snug text-[#a27c74]">
          A few little secrets are tucked into these pages — a heart, a flower, a tiny envelope…
        </p>
      </Reveal>
      {/* the explorer's reward */}
      <Reveal delay={0.9} className="mt-[3cqh] w-full">
        <AnimatePresence mode="wait">
          {visitedAll ? (
            <motion.div key="sealed" className="flex flex-col items-center" initial={{ opacity: 0, y: 10, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -2 }}>
              <SecretTrigger id="explorer" label="A sealed note for those who read every page — tap to open" className="h-20 w-28">
                <svg viewBox="0 0 80 56" className="h-full w-full drop-shadow-[0_4px_5px_rgba(60,50,30,.3)]" aria-hidden="true">
                  <rect x="3" y="6" width="74" height="46" rx="2" fill="#f3ead9" stroke="#c6a46c" strokeWidth=".8" />
                  <path d="M3 8 L40 32 L77 8" fill="#f8f2e6" stroke="#c6a46c" strokeWidth=".8" />
                  <circle cx="40" cy="31" r="7" fill="url(#wax)" />
                  <path d="M40 35 C36 32 35.5 30 37 29 C38 28.3 39.4 28.8 40 30 C40.6 28.8 42 28.3 43 29 C44.5 30 44 32 40 35Z" fill="#dfe3c8" opacity=".85" />
                </svg>
              </SecretTrigger>
              <p className="mt-1 font-hand text-small text-[#a27c74]">for the curious ones</p>
            </motion.div>
          ) : (
            <motion.p key="hint" className="font-serif text-small italic text-ink/55" exit={{ opacity: 0 }}>
              {secrets.explorerHint}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-[1.2cqh] flex items-center justify-center gap-1.5" aria-label={`${found.length} of 4 ${secrets.foundLabel}`}>
          {SECRET_IDS.map((s) => (
            <svg key={s} viewBox="0 0 20 18" className="h-3 w-3.5" aria-hidden="true">
              <path
                d="M10 17 C3 12 0 8 2 4 C4 0.5 8.5 1 10 4.5 C11.5 1 16 0.5 18 4 C20 8 17 12 10 17Z"
                fill={found.includes(s) ? '#c6a46c' : 'none'}
                stroke="#c6a46c"
                strokeWidth="1.2"
              />
            </svg>
          ))}
          <span className="ml-1 font-caps text-[10px] uppercase tracking-[0.2em] text-olive/55">{secrets.foundLabel}</span>
        </div>
      </Reveal>


      <Reveal delay={1.3} className="mt-[3cqh] flex flex-col items-center gap-1">
        {replayFilm && (
          <motion.button
            type="button"
            onClick={replayFilm}
            whileTap={{ scale: 0.94 }}
            className="inline-flex min-h-[40px] items-center gap-2 px-2 font-caps text-caps uppercase text-olive/70 underline decoration-gold/50 underline-offset-4"
          >
            <Clapperboard size={13} strokeWidth={1.5} aria-hidden="true" />
            {invitation.intro.replayLabel}
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={() => go(0)}
          whileTap={{ scale: 0.94 }}
          className="inline-flex min-h-[40px] items-center gap-2 px-2 font-caps text-caps uppercase text-olive/70 underline decoration-gold/50 underline-offset-4"
        >
          <RotateCcw size={13} strokeWidth={1.5} aria-hidden="true" />
          Back to the beginning
        </motion.button>
      </Reveal>
    </PageShell>
  );
}
