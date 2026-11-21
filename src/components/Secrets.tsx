import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { invitation } from '../config/invitation';
import { useBook, type SecretId } from './bookContext';

/**
 * A small tappable detail that hides a secret. A soft golden glint passes over
 * it now and then — a clue, never a prompt.
 */
export function SecretTrigger({
  id,
  label,
  children,
  className = '',
}: {
  id: SecretId;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const { reveal, found } = useBook();
  const seen = found.includes(id);
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        reveal(id);
      }}
      aria-label={label}
      className={`relative inline-flex items-center justify-center ${className}`}
      whileTap={{ scale: 0.85, rotate: -6 }}
      data-no-swipe
    >
      {children}
      {!seen && <span className="secret-glint pointer-events-none absolute inset-[-30%] rounded-full" aria-hidden="true" />}
    </motion.button>
  );
}

function Sparkles() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[18%]" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const d = 60 + (i % 3) * 22;
        return (
          <motion.span
            key={i}
            className="absolute block h-2 w-2"
            style={{
              background: 'radial-gradient(circle, #fff7dc 0%, #c6a46c 55%, transparent 70%)',
              clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.3, delay: 0.35 + (i % 4) * 0.05, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/** The revealed note: a folded slip of paper that opens over the card. */
export function SecretNote({ id, onClose }: { id: SecretId; onClose: () => void }) {
  const s = invitation.secrets[id];
  const { found } = useBook();

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center rounded-[5px] bg-[rgba(45,40,28,.28)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
      data-no-swipe
    >
      <Sparkles />
      <motion.div
        className="paper relative w-[80%] max-w-[330px] rounded-[2px] px-[7%] pb-[7%] pt-[9%] text-center shadow-[0_18px_40px_-14px_rgba(40,32,18,.6)]"
        style={{ transformPerspective: 900, originY: 0 }}
        initial={{ rotateX: -95, y: -30, opacity: 0, rotate: -3 }}
        animate={{ rotateX: 0, y: 0, opacity: 1, rotate: -1.5 }}
        exit={{ rotateX: -95, y: -20, opacity: 0, transition: { duration: 0.45 } }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* fold crease */}
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[rgba(90,75,45,.18)] to-transparent" aria-hidden="true" />
        {/* tiny heart seal */}
        <motion.svg
          viewBox="0 0 40 40"
          className="absolute -top-[18px] left-1/2 h-9 w-9 -translate-x-1/2 drop-shadow-[0_2px_2px_rgba(40,35,20,.35)]"
          initial={{ scale: 1.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 240, damping: 12 }}
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="18" fill="url(#wax)" />
          <circle cx="20" cy="20" r="13" fill="url(#wax-inner)" stroke="#2c3123" strokeOpacity=".4" />
          <path d="M20 27 C13 22 12 17 15 15 C17 13.5 19.4 14.5 20 16.5 C20.6 14.5 23 13.5 25 15 C28 17 27 22 20 27Z" fill="#dfe3c8" opacity=".85" />
        </motion.svg>

        <p className="font-caps text-caps uppercase text-gold">{s.title}</p>
        <motion.p
          className="mt-3 font-hand text-[clamp(19px,6.2cqw,26px)] leading-snug text-olive"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ delay: 0.55, duration: 1.6, ease: 'easeInOut' }}
        >
          {s.body}
        </motion.p>
        {s.signoff && (
          <motion.p className="mt-2 font-script text-[clamp(22px,7cqw,30px)] text-olive/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
            {s.signoff}
          </motion.p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="whitespace-nowrap font-caps text-[9.5px] uppercase tracking-[0.16em] text-olive/55">
            {found.length} / 4 {invitation.secrets.foundLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] whitespace-nowrap rounded-full border border-olive/30 px-4 font-caps text-[11px] uppercase tracking-[0.18em] text-olive active:bg-champagne"
          >
            Fold away
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
