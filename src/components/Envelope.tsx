import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../config/invitation';
import { guest } from '../lib/guest';
import { phase as timePhase } from '../lib/phase';
import { PetalBurst } from './Ambient';
import { FloralCorner, Laurel } from './botanicals/Florals';
import { WaxSeal } from './WaxSeal';

type Phase = 'idle' | 'breaking' | 'opening' | 'sliding' | 'presenting';

const ease = [0.55, 0.05, 0.25, 1] as const;

/** Paper grain filter used inside the envelope SVGs (static, rendered once). */
function Grain({ id }: { id: string }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4 1.1" numOctaves="2" seed="3" result="n" />
      <feColorMatrix in="n" values="0 0 0 0 .4  0 0 0 0 .33  0 0 0 0 .22  0 0 0 .5 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
  );
}

const FLAP = 'M0 0 H142 L80 58 Q71 64 62 58 Z';
const FLAP_INNER = 'M0 100 H142 L80 42 Q71 36 62 42 Z';

export function Envelope({ onOpenStart, onOpened }: { onOpenStart?: () => void; onOpened: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [flapBehind, setFlapBehind] = useState(false);
  const timers = useRef<number[]>([]);
  const { couple, wording, wedding } = invitation;
  const envelopeTitle =
    timePhase === 'after' ? invitation.thankYou.envelopeTitle : timePhase === 'day' ? invitation.weddingDay.greeting : wording.envelopeTitle;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== 'idle') return;
    onOpenStart?.();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onOpened();
      return;
    }
    setPhase('breaking');
    at(750, () => setPhase('opening'));
    at(1250, () => setFlapBehind(true));
    at(1800, () => setPhase('sliding'));
    at(3050, () => setPhase('presenting'));
    at(3600, onOpened);
  };

  const opened = phase === 'opening' || phase === 'sliding' || phase === 'presenting';
  const sliding = phase === 'sliding' || phase === 'presenting';

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center px-4"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* editorial caption above */}
      <motion.div
        className="mb-[6vh] text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={phase === 'idle' ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.9, delay: phase === 'idle' ? 0.6 : 0 }}
      >
        <Laurel className="mx-auto mb-2 h-4 w-24" gold delay={0.8} />
        <p className="font-caps text-[11px] uppercase tracking-[0.32em] text-olive/70">{wedding.short}</p>
      </motion.div>

      {/* idle float */}
      <motion.div className={phase === 'idle' ? 'env-float' : undefined}>
        <motion.div
          role="button"
          tabIndex={0}
          aria-label={`${envelopeTitle}. ${wording.envelopeHint}.`}
          onClick={open}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
          className="envelope-size no-select relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          style={{ perspective: 1100 }}
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={
            phase === 'presenting'
              ? { opacity: 0, y: 140, scale: 0.92, transition: { duration: 0.9, ease } }
              : { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease } }
          }
          whileTap={phase === 'idle' ? { scale: 0.98 } : undefined}
        >
          {/* ── back panel with rose liner ── */}
          <div className="absolute inset-0 rounded-[6px] bg-[#e6dac4] shadow-[0_2px_3px_rgba(60,50,30,.12),0_24px_40px_-18px_rgba(60,50,30,.5)]">
            <div
              className="absolute inset-[3.5%] rounded-[3px]"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 50%), repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0 6px, transparent 6px 12px), #d9bdb5',
              }}
            />
          </div>

          {/* ── the invitation card inside ── */}
          <motion.div
            className="paper absolute left-[6%] right-[6%] top-[5%] bottom-[4%] flex flex-col items-center justify-center rounded-[3px] text-center shadow-[0_2px_8px_rgba(60,50,30,.18)]"
            style={{ zIndex: 2 }}
            initial={false}
            animate={
              phase === 'presenting'
                ? { y: '-62%', scale: 1.12, z: 40 }
                : sliding
                  ? { y: '-62%', scale: 1, z: 0 }
                  : { y: '0%', scale: 1, z: 0 }
            }
            transition={{ duration: phase === 'presenting' ? 0.8 : 1.25, ease }}
          >
            <div className="pointer-events-none absolute inset-[4%] border border-gold/45" />
            <p className="font-caps text-[2.4cqw] uppercase tracking-[0.3em] text-olive/70">{wording.together}</p>
            <p className="gold-foil mt-[1cqw] font-script text-[9cqw] leading-none">
              {couple.one.first} <span className="font-serif text-[5cqw] italic">&amp;</span> {couple.two.first}
            </p>
            <p className="mt-[1.5cqw] font-caps text-[2.4cqw] uppercase tracking-[0.3em] text-olive/70">{wedding.short}</p>
          </motion.div>

          {/* ── front pocket ── */}
          <svg viewBox="0 0 142 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }} aria-hidden="true">
            <defs>
              <Grain id="env-grain" />
              <linearGradient id="pocket-side" x1="0" x2="1">
                <stop offset="0" stopColor="#efe5d3" />
                <stop offset="1" stopColor="#e6dac3" />
              </linearGradient>
              <linearGradient id="pocket-side-r" x1="1" x2="0">
                <stop offset="0" stopColor="#efe5d3" />
                <stop offset="1" stopColor="#e6dac3" />
              </linearGradient>
              <linearGradient id="pocket-bottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f6efe2" />
                <stop offset="1" stopColor="#ece2cf" />
              </linearGradient>
              <filter id="pocket-shadow" x="-10%" y="-20%" width="120%" height="140%">
                <feDropShadow dx="0" dy="-0.6" stdDeviation="0.9" floodColor="#5a4a30" floodOpacity=".25" />
              </filter>
            </defs>
            <path d="M0 3 L66 55 Q71 58 66 61 L0 100 Z" fill="url(#pocket-side)" filter="url(#pocket-shadow)" />
            <path d="M142 3 L76 55 Q71 58 76 61 L142 100 Z" fill="url(#pocket-side-r)" filter="url(#pocket-shadow)" />
            <path d="M0 100 L62 50 Q71 44 80 50 L142 100 Z" fill="url(#pocket-bottom)" filter="url(#pocket-shadow)" />
            <path d="M0 100 L62 50 Q71 44 80 50 L142 100 Z" fill="#000" filter="url(#env-grain)" opacity=".18" />
            <path d="M0 3 L66 55 Q71 58 66 61 L0 100 Z M142 3 L76 55 Q71 58 76 61 L142 100 Z" fill="#000" filter="url(#env-grain)" opacity=".16" />
            <path d="M2 99 L62 51 Q71 45 80 51 L140 99" fill="none" stroke="#c6a46c" strokeWidth=".35" opacity=".8" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* pocket decoration + lettering */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 3 }}>
            <FloralCorner corner="bl" className="-bottom-[3%] -left-[2%] w-[30%]" lush={false} delay={0.6} />
            <FloralCorner corner="br" className="-bottom-[3%] -right-[2%] w-[30%]" lush={false} delay={0.9} />
            <div className="absolute inset-x-0 bottom-[6%] text-center">
              <p className="font-script text-[8.4cqw] leading-none text-olive emboss">{envelopeTitle}</p>
              {guest.name && (
                <p className="mt-[1.6cqw] font-caps text-[2.5cqw] uppercase tracking-[0.28em] text-olive/70">
                  {wording.envelopeFor} <span className="font-serif text-[3.6cqw] normal-case italic tracking-normal text-ink">{guest.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── flap (3D) ── */}
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: '50% 0%', transformStyle: 'preserve-3d', zIndex: flapBehind ? 1 : 4 }}
            initial={false}
            animate={{ rotateX: opened ? 178 : 0 }}
            transition={{ duration: 1.05, ease }}
          >
            {/* outside */}
            <svg
              viewBox="0 0 142 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              aria-hidden="true"
            >
              <defs>
                <Grain id="flap-grain" />
                <linearGradient id="flap-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#efe6d5" />
                  <stop offset="1" stopColor="#f7f1e6" />
                </linearGradient>
                <filter id="flap-shadow" x="-10%" y="-10%" width="120%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#4a3c25" floodOpacity=".3" />
                </filter>
              </defs>
              <path d={FLAP} fill="url(#flap-fill)" filter="url(#flap-shadow)" />
              <path d={FLAP} fill="#000" filter="url(#flap-grain)" opacity=".16" />
              <path d="M1 1 L62 57.5 Q71 63 80 57.5 L141 1" fill="none" stroke="#c6a46c" strokeWidth=".45" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* inside (liner), visible once the flap passes 90° */}
            <svg
              viewBox="0 0 142 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
              aria-hidden="true"
            >
              <defs>
                <pattern id="liner" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                  <rect width="8" height="8" fill="#d9bdb5" />
                  <path d="M2 4 q2 -2.5 4 0 q-2 2.5 -4 0z" fill="#e9d6cf" />
                </pattern>
              </defs>
              <path d={FLAP_INNER} fill="url(#liner)" />
              <path d={FLAP_INNER} fill="none" stroke="#e8dcc8" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
            </svg>
          </motion.div>

          {/* ── ribbon + seal ── */}
          <div className="pointer-events-none absolute left-1/2 top-[61%] w-[19%] -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 5 }}>
            <WaxSeal broken={phase !== 'idle'} className="relative w-full drop-shadow-[0_3px_3px_rgba(40,35,20,.35)]" />
            {phase === 'idle' && (
              <span className="seal-pulse absolute inset-[-6%] rounded-full border border-gold/60" aria-hidden="true" />
            )}
          </div>

          {sliding && <PetalBurst className="z-[6]" count={20} />}
        </motion.div>
      </motion.div>

      {/* tap hint */}
      <motion.div
        className="mt-[7vh] flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'idle' ? 1 : 0 }}
        transition={{ duration: 0.8, delay: phase === 'idle' ? 1.6 : 0 }}
      >
        <span className="hint-pulse font-caps text-[11px] uppercase tracking-[0.34em] text-olive/80">{wording.envelopeHint}</span>
        <motion.span
          className="block h-6 w-px bg-gradient-to-b from-gold to-transparent"
          animate={{ scaleY: [0.4, 1, 0.4], originY: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
