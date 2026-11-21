import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { PageId } from '../config/invitation';
import { ScriptDraw } from './ScriptDraw';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

/** A printed table of contents, tucked in like an extra insert. */
export function ContentsCard({
  pages,
  current,
  visited,
  onPick,
  onClose,
}: {
  pages: { id: PageId; label: string }[];
  current: number;
  visited: Set<number>;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const half = Math.ceil(pages.length / 2);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center rounded-[5px] bg-[rgba(45,40,28,.28)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Contents"
      data-no-swipe
    >
      <motion.div
        className="paper relative w-[93%] rounded-[2px] px-[6%] pb-[6%] pt-[4%] shadow-[0_18px_40px_-14px_rgba(40,32,18,.6)]"
        style={{ transformPerspective: 900, originY: 1 }}
        initial={{ rotateX: 80, y: 30, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        exit={{ rotateX: 80, y: 20, opacity: 0, transition: { duration: 0.35 } }}
        transition={{ type: 'spring', stiffness: 110, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-[3%] border border-gold/35" aria-hidden="true" />
        <ScriptDraw text="Contents" className="mx-auto w-[52%] text-olive" />
        <div className="mt-1 grid grid-cols-2 gap-x-[3%]">
          {[pages.slice(0, half), pages.slice(half)].map((col, c) => (
            <ol key={c} className="space-y-0.5">
              {col.map((p, k) => {
                const i = c * half + k;
                const here = i === current;
                return (
                  <li key={p.id}>
                    <motion.button
                      type="button"
                      onClick={() => onPick(i)}
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, x: c ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      aria-current={here ? 'page' : undefined}
                      className={`flex min-h-[40px] w-full items-center gap-1.5 rounded-[3px] px-1 text-left ${here ? 'bg-champagne/70' : 'active:bg-champagne/50'}`}
                    >
                      <span className="w-6 shrink-0 text-right font-serif text-[12px] text-gold">{ROMAN[i]}</span>
                      <span className={`min-w-0 flex-1 py-2 font-serif text-[14.5px] leading-tight ${here ? 'font-semibold text-olive' : 'text-ink/85'}`}>
                        {p.label}
                      </span>
                      {visited.has(i) && !here && (
                        <svg viewBox="0 0 20 18" className="h-2.5 w-2.5 shrink-0 self-center" aria-label="read">
                          <path d="M10 17 C3 12 0 8 2 4 C4 0.5 8.5 1 10 4.5 C11.5 1 16 0.5 18 4 C20 8 17 12 10 17Z" fill="#c6a46c" />
                        </svg>
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ol>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
