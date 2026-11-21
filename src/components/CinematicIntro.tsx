import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../config/invitation';

/**
 * A short cinematic opening: letterboxed, warm film grain, drifting light leak,
 * romantic lines, then the couple's names — and a soft fade into the invitation.
 * Uses the couple's video when configured (muted + playsInline for mobile autoplay),
 * otherwise an animated typographic film. Always skippable.
 */
export function CinematicIntro({ onDone }: { onDone: () => void }) {
  const { intro, couple, wedding } = invitation;
  const [step, setStep] = useState(0); // 0..lines.length = lines, then names
  const [ending, setEnding] = useState(false);
  const finished = useRef(false);
  const lines = intro.lines;
  const namesStep = lines.length;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setEnding(true);
    window.setTimeout(onDone, 900);
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone();
      return;
    }
    if (intro.video) return; // video drives its own timing
    const timers: number[] = [];
    let t = 900;
    lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i), t));
      t += 3300;
    });
    timers.push(window.setTimeout(() => setStep(namesStep), t));
    timers.push(window.setTimeout(finish, t + 4200));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-hidden bg-[#1c1a14]"
      initial={{ opacity: 0 }}
      animate={{ opacity: ending ? 0 : 1 }}
      transition={{ duration: ending ? 0.9 : 0.8 }}
      role="region"
      aria-label="Introduction film"
    >
      {intro.video ? (
        <video
          src={intro.video}
          poster={intro.poster || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            setStep(namesStep);
            window.setTimeout(finish, 3600);
          }}
          onError={() => setStep(namesStep)}
        />
      ) : (
        <>
          {/* warm projector light, slowly drifting */}
          <motion.div
            className="absolute inset-[-20%]"
            style={{
              background:
                'radial-gradient(40% 35% at 50% 45%, rgba(232,206,160,.28), transparent 70%), radial-gradient(30% 40% at 85% 20%, rgba(216,185,178,.25), transparent 70%)',
            }}
            animate={{ x: ['-4%', '5%', '-2%'], y: ['2%', '-3%', '1%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* light leak */}
          <motion.div
            className="absolute -left-1/2 top-0 h-full w-full"
            style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(255,190,140,.18) 48%, rgba(255,230,190,.08) 55%, transparent 70%)' }}
            animate={{ x: ['-30%', '160%'] }}
            transition={{ duration: 7, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* film texture + vignette + letterbox */}
      <div className="film-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_50%,rgba(0,0,0,.65))]" aria-hidden="true" />
      <motion.div className="absolute inset-x-0 top-0 h-[9vh] bg-black" initial={{ y: '-100%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-[9vh] bg-black" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }} />

      {/* typography */}
      <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          {(!intro.video || step === namesStep) && step < namesStep && (
            <motion.p
              key={`l${step}`}
              className="font-serif text-[clamp(24px,7vw,40px)] italic leading-snug text-[#efe3cc]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            >
              {lines[step]}
            </motion.p>
          )}
          {step === namesStep && (
            <motion.div key="names" className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              {/* soft dark halo so the names read over any bright frame */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150vw] -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'radial-gradient(closest-side, rgba(20,16,8,.62), rgba(20,16,8,.35) 55%, transparent)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4 }}
                aria-hidden="true"
              />
              <h2 className="intro-names flex flex-col items-center font-script leading-[0.95]">
                <motion.span
                  className="block text-[clamp(64px,22vw,120px)]"
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                >
                  {couple.one.first}
                </motion.span>
                <motion.span
                  className="my-[-0.1em] block font-serif text-[clamp(26px,8vw,44px)] italic"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                >
                  &amp;
                </motion.span>
                <motion.span
                  className="block text-[clamp(64px,22vw,120px)]"
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9, duration: 1.8, ease: 'easeOut' }}
                >
                  {couple.two.first}
                </motion.span>
              </h2>
              <motion.div
                className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-[#f3dfa6] to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.6, duration: 1.2 }}
              />
              <motion.p
                className="mt-3 font-caps text-[14px] font-medium uppercase tracking-[0.5em] text-[#fff3d6] [text-shadow:0_1px_8px_rgba(0,0,0,.7)]"
                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, letterSpacing: '0.5em' }}
                transition={{ delay: 1.8, duration: 1.6 }}
              >
                {wedding.short}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={finish}
        className="absolute right-4 flex min-h-[44px] items-center gap-1 rounded-full border border-white/25 bg-black/50 px-4 font-caps text-[11px] uppercase tracking-[0.3em] text-white/85"
        style={{ bottom: 'calc(9vh + 14px + env(safe-area-inset-bottom, 0px))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.94 }}
      >
        {intro.skipLabel} <ChevronsRight size={14} />
      </motion.button>
    </motion.div>
  );
}
