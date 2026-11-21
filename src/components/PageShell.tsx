import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FloralCorner } from './botanicals/Florals';

type Decor = 'lush' | 'light' | 'top' | 'none';

/**
 * One printed insert of the invitation: textured paper, fine gold borders,
 * pressed-flower corners, and an inner area that scrolls only if a small
 * screen needs it.
 */
export function PageShell({ children, decor = 'light', className = '' }: { children: ReactNode; decor?: Decor; className?: string }) {
  return (
    <div className="paper absolute inset-0 overflow-hidden rounded-[5px]">
      <div className="pointer-events-none absolute inset-[2.4%] rounded-[3px] border border-gold/50" />
      <div className="pointer-events-none absolute inset-[3.5%] rounded-[2px] border border-gold/20" />

      {decor === 'lush' && (
        <>
          <FloralCorner corner="tl" className="-left-[3%] -top-[2%] w-[38%]" />
          <FloralCorner corner="br" className="-bottom-[2%] -right-[3%] w-[38%]" delay={0.5} />
        </>
      )}
      {decor === 'light' && (
        <>
          <FloralCorner corner="tl" className="-left-[2%] -top-[1.5%] w-[30%]" lush={false} />
          <FloralCorner corner="br" className="-bottom-[1.5%] -right-[2%] w-[30%]" lush={false} delay={0.4} />
        </>
      )}
      {decor === 'top' && (
        <>
          <FloralCorner corner="tl" className="-left-[2%] -top-[1.5%] w-[32%]" lush={false} />
          <FloralCorner corner="tr" className="-right-[2%] -top-[1.5%] w-[32%]" lush={false} delay={0.3} />
        </>
      )}

      {/* Text lives strictly inside the gold border and clear of the corner flowers. */}
      <FitToPaper
        className="absolute inset-[4.2%]"
        padding={`${decor === 'none' ? '5%' : decor === 'lush' ? '11%' : '8%'} 5.5% ${decor === 'lush' ? '14%' : decor === 'light' ? '11%' : '5%'}`}
      >
        <div className={`flex flex-col items-center text-center ${className}`}>{children}</div>
      </FitToPaper>
    </div>
  );
}

/**
 * Never scrolls: if the printed content is taller than the paper (short phones,
 * an unfolded letter…), it is scaled down to fit, centred like a print.
 */
function FitToPaper({ children, className, padding }: { children: ReactNode; className: string; padding: string }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const b = box.current;
    const c = inner.current;
    if (!b || !c) return;
    const update = () => {
      const cs = getComputedStyle(b);
      const avail = b.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const need = c.offsetHeight; // layout height — unaffected by the transform
      const next = need > 0 ? Math.min(1, avail / need) : 1;
      setScale((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(b);
    ro.observe(c);
    document.fonts?.ready.then(update).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={`page-fit flex flex-col items-stretch justify-center ${className}`} style={{ padding }}>
      <div ref={inner} className="shrink-0" style={{ transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: '50% 50%' }}>
        {children}
      </div>
    </div>
  );
}

/** Gentle staggered fade-up for printed elements. */
export function Reveal({
  children,
  delay = 0,
  y = 10,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Caps({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-caps text-caps uppercase ${className}`}>{children}</p>;
}
