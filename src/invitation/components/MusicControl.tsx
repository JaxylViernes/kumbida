import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { invitation } from '../config/invitation';

/**
 * The couple's song, as a tiny vinyl record pinned to the corner.
 * Tap the record to play / pause. The title card slides out while it plays,
 * then tucks itself away so it never covers the invitation for long.
 * Lives outside the pages, so turning pages never interrupts the music.
 */
export function MusicControl({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  const { title, artist } = invitation.music;
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    setShowLabel(true);
    const t = window.setTimeout(() => setShowLabel(false), playing ? 3800 : 2400);
    return () => window.clearTimeout(t);
  }, [playing]);

  return (
    <motion.div
      className="fixed z-50 flex items-center"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)', right: 'calc(env(safe-area-inset-right, 0px) + 10px)' }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <AnimatePresence>
        {showLabel && (
          <motion.div
            className="mr-[-14px] rounded-l-full border border-r-0 border-gold/50 bg-ivory/95 py-1.5 pl-3.5 pr-6 shadow-[0_4px_14px_-8px_rgba(60,50,30,.5)]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          >
            <p className="whitespace-nowrap font-serif text-[13px] italic leading-tight text-olive">{title}</p>
            <p className="whitespace-nowrap font-caps text-[9px] uppercase tracking-[0.22em] text-olive/60">
              {playing ? artist : 'tap to play'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          onToggle();
        }}
        aria-pressed={playing}
        aria-label={`${playing ? 'Pause' : 'Play'} ${title} by ${artist}`}
        className="relative h-[52px] w-[52px] rounded-full"
        whileTap={{ scale: 0.9 }}
      >
        {/* record */}
        <svg
          viewBox="0 0 60 60"
          className="vinyl h-full w-full drop-shadow-[0_4px_6px_rgba(40,32,18,.35)]"
          style={{ animationPlayState: playing ? 'running' : 'paused' }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="vinyl-sheen" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#4a4a3e" />
              <stop offset="1" stopColor="#1d1d17" />
            </radialGradient>
          </defs>
          <circle cx="30" cy="30" r="29" fill="url(#vinyl-sheen)" />
          {[25, 22, 19, 16].map((r) => (
            <circle key={r} cx="30" cy="30" r={r} fill="none" stroke="#fff" strokeOpacity=".07" strokeWidth=".6" />
          ))}
          <path d="M12 16 A22 22 0 0 1 30 8" stroke="#fff" strokeOpacity=".22" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="30" r="11" fill="#D8B9B2" />
          <circle cx="30" cy="30" r="11" fill="none" stroke="#c6a46c" strokeWidth=".8" />
          <text x="30" y="31.5" textAnchor="middle" fontFamily="'Pinyon Script', cursive" fontSize="8" fill="#414638">
            {invitation.couple.initials.join('')}
          </text>
          <circle cx="30" cy="30" r="1.4" fill="#2a2a22" />
        </svg>
        {/* tone arm */}
        <motion.span
          className="pointer-events-none absolute -right-0.5 -top-0.5 block h-[26px] w-[3px] origin-top rounded-full bg-gradient-to-b from-[#e9d6a8] to-[#a8843f] shadow-sm"
          animate={{ rotate: playing ? 28 : 8 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          aria-hidden="true"
        />
        {/* state badge */}
        <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border border-gold/60 bg-ivory text-olive shadow-sm" aria-hidden="true">
          {playing ? <Pause size={10} strokeWidth={2.4} /> : <Play size={10} strokeWidth={2.4} className="ml-[1px]" />}
        </span>
      </motion.button>
    </motion.div>
  );
}
