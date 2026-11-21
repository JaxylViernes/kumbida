import { motion } from 'framer-motion';
import { alongCubic, cubicPath, type Pt } from '../../lib/geometry';
import { invitation } from '../../config/invitation';
import { Bud, Draw, GOLD, Grow, INK, Leaf, Rose, Sprinkle } from './parts';

type Corner = 'tl' | 'tr' | 'bl' | 'br';
const flip: Record<Corner, string> = {
  tl: 'none',
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1,-1)',
};

/** Leaves alternating along a stem. */
function Stem({ p, n, delay, animate, size = 1 }: { p: [Pt, Pt, Pt, Pt]; n: number; delay: number; animate: boolean; size?: number }) {
  const pts = alongCubic(p[0], p[1], p[2], p[3], n, 0.1, 0.92);
  return (
    <g>
      <Draw d={cubicPath(...p)} delay={delay} duration={1.8} width={1.1} animate={animate} />
      {pts.map((q, i) => (
        <Grow key={i} delay={delay + 0.35 + i * 0.12} animate={animate}>
          <Leaf x={q.x} y={q.y} a={q.a + (i % 2 ? 48 : -48)} s={size * (1.05 - q.t * 0.45)} />
        </Grow>
      ))}
    </g>
  );
}

/**
 * Pressed-flower corner spray. Drawn for the top-left; other corners mirror it.
 */
export function FloralCorner({
  corner = 'tl',
  className = '',
  delay = 0,
  animate = true,
  lush = true,
}: {
  corner?: Corner;
  className?: string;
  delay?: number;
  animate?: boolean;
  lush?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: flip[corner] }}
      aria-hidden="true"
    >
      <ellipse cx="62" cy="46" rx="62" ry="36" fill="url(#wash-rose)" />
      <ellipse cx="128" cy="24" rx="54" ry="18" fill="url(#wash-sage)" />
      <ellipse cx="22" cy="118" rx="20" ry="56" fill="url(#wash-sage)" />

      <Stem p={[[10, 16], [62, 4], [122, 6], [194, 26]]} n={8} delay={delay} animate={animate} />
      <Stem p={[[16, 10], [3, 62], [7, 124], [26, 194]]} n={8} delay={delay + 0.15} animate={animate} />
      {lush && <Stem p={[[30, 30], [62, 40], [92, 60], [118, 92]]} n={4} delay={delay + 0.4} animate={animate} size={0.8} />}

      <Draw d="M130 22 C134 30 136 36 134 44" delay={delay + 0.8} width={0.7} animate={animate} />
      <Grow delay={delay + 1.3} animate={animate}>
        <Sprinkle x={134} y={36} n={7} spread={8} />
      </Grow>
      <Grow delay={delay + 1.4} animate={animate}>
        <Sprinkle x={34} y={142} n={6} spread={7} gold />
      </Grow>

      <Grow delay={delay + 0.9} animate={animate}>
        <Rose x={44} y={42} r={21} rot={12} />
      </Grow>
      {lush && (
        <Grow delay={delay + 1.15} animate={animate}>
          <Rose x={78} y={26} r={11} tone="cream" rot={40} />
        </Grow>
      )}
      <Grow delay={delay + 1.2} animate={animate}>
        <Rose x={22} y={84} r={10} tone="cream" rot={-20} />
      </Grow>
      <Grow delay={delay + 1.5} animate={animate}>
        <Bud x={186} y={26} a={100} s={0.9} />
      </Grow>
      <Grow delay={delay + 1.5} animate={animate}>
        <Bud x={27} y={188} a={170} s={0.85} />
      </Grow>
      <Grow delay={delay + 1.6} animate={animate}>
        <circle cx="104" cy="12" r="1.8" fill="url(#gold-flat)" />
        <circle cx="160" cy="16" r="1.4" fill="url(#gold-flat)" />
        <circle cx="10" cy="150" r="1.5" fill="url(#gold-flat)" />
      </Grow>
    </svg>
  );
}

/** A horizontal laurel sprig — used as a section ornament. */
export function Laurel({ className = '', delay = 0, gold = false }: { className?: string; delay?: number; gold?: boolean }) {
  const left = alongCubic([60, 12], [44, 9], [24, 9], [6, 13], 5, 0.12, 0.95);
  const right = alongCubic([60, 12], [76, 9], [96, 9], [114, 13], 5, 0.12, 0.95);
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true">
      <Draw d="M60 12 C44 9 24 9 6 13" delay={delay} duration={1.2} width={0.8} stroke={gold ? GOLD : INK} />
      <Draw d="M60 12 C76 9 96 9 114 13" delay={delay} duration={1.2} width={0.8} stroke={gold ? GOLD : INK} />
      {[...left, ...right].map((q, i) => (
        <Grow key={i} delay={delay + 0.3 + (i % 5) * 0.1}>
          <Leaf x={q.x} y={q.y} a={q.a + (i % 2 ? 40 : -40)} s={0.42} tone={gold ? 'gold' : 'sage'} />
        </Grow>
      ))}
      <Grow delay={delay + 0.2}>
        <circle cx="60" cy="12" r="2.4" fill="url(#gold-flat)" />
      </Grow>
    </svg>
  );
}

/** Thin gold rule with a center diamond. */
export function Divider({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`flex w-full items-center justify-center gap-2 ${className}`}
      initial={{ opacity: 0, scaleX: 0.3 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 1, ease: [0.3, 0.1, 0.2, 1] }}
      aria-hidden="true"
    >
      <span className="gold-line h-px w-[22%]" />
      <svg viewBox="0 0 24 10" className="h-[9px] w-6">
        <circle cx="3" cy="5" r="1" fill={GOLD} />
        <path d="M12 0.8 L15.6 5 L12 9.2 L8.4 5Z" fill="url(#gold-flat)" />
        <circle cx="21" cy="5" r="1" fill={GOLD} />
      </svg>
      <span className="gold-line h-px w-[22%]" />
    </motion.div>
  );
}

/** Round foliage wreath; children are rendered in the center. */
export function Wreath({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const R = 72;
  const arc = (a0: number, a1: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / (n - 1);
      const rad = (a * Math.PI) / 180;
      return { x: 100 + Math.cos(rad) * R, y: 100 + Math.sin(rad) * R, a: a + (a1 > a0 ? 90 : -90), i };
    });
  const p = (a: number) => [100 + Math.cos((a * Math.PI) / 180) * R, 100 + Math.sin((a * Math.PI) / 180) * R];
  const [lx0, ly0] = p(110);
  const [lx1, ly1] = p(250);
  const [rx0, ry0] = p(70);
  const [rx1, ry1] = p(-70);
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="86" fill="url(#wash-sage)" opacity="0.6" />
      <ellipse cx="100" cy="172" rx="50" ry="20" fill="url(#wash-rose)" />
      <Draw d={`M${lx0} ${ly0} A${R} ${R} 0 0 1 ${lx1} ${ly1}`} delay={delay} duration={2} width={1} />
      <Draw d={`M${rx0} ${ry0} A${R} ${R} 0 0 0 ${rx1} ${ry1}`} delay={delay} duration={2} width={1} />
      {arc(110, 250, 11).map((q) => (
        <Grow key={`l${q.i}`} delay={delay + 0.4 + q.i * 0.1}>
          <Leaf x={q.x} y={q.y} a={q.a + (q.i % 2 ? 42 : -42)} s={0.95 - q.i * 0.035} />
        </Grow>
      ))}
      {arc(70, -70, 11).map((q) => (
        <Grow key={`r${q.i}`} delay={delay + 0.4 + q.i * 0.1}>
          <Leaf x={q.x} y={q.y} a={q.a + (q.i % 2 ? 42 : -42)} s={0.95 - q.i * 0.035} />
        </Grow>
      ))}
      <Grow delay={delay + 1.2}>
        <Rose x={100} y={172} r={16} rot={8} />
      </Grow>
      <Grow delay={delay + 1.35}>
        <Rose x={78} y={168} r={10} tone="cream" rot={30} />
      </Grow>
      <Grow delay={delay + 1.45}>
        <Rose x={122} y={167} r={9} tone="cream" rot={-10} />
      </Grow>
      <Grow delay={delay + 1.6}>
        <Bud x={150} y={44} a={40} />
      </Grow>
      <Grow delay={delay + 1.6}>
        <Bud x={50} y={44} a={-40} />
      </Grow>
      <Grow delay={delay + 1.7}>
        <Sprinkle x={64} y={150} n={5} spread={7} gold />
        <Sprinkle x={138} y={150} n={5} spread={7} />
      </Grow>
    </svg>
  );
}

/** Gold monogram crest. */
export function Monogram({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const [a, b] = invitation.couple.initials;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="56" r="48" fill="url(#wash-gold)" />
      <Draw d="M60 12 a44 44 0 1 1 -0.01 0" stroke="url(#gold-foil)" width={1.1} delay={delay} duration={1.8} />
      <Draw d="M60 17 a39 39 0 1 1 -0.01 0" stroke="url(#gold-foil)" width={0.5} delay={delay + 0.2} duration={1.8} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.7, duration: 1.2 }}>
        <text x="44" y="70" textAnchor="middle" fontFamily="'Pinyon Script', cursive" fontSize="40" fill="url(#gold-foil)">
          {a}
        </text>
        <text x="60" y="66" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontSize="14" fill={GOLD}>
          &amp;
        </text>
        <text x="77" y="78" textAnchor="middle" fontFamily="'Pinyon Script', cursive" fontSize="40" fill="url(#gold-foil)">
          {b}
        </text>
      </motion.g>
      <g transform="translate(60 104)">
        <Grow delay={delay + 0.9}>
          <Leaf x={-4} y={0} a={200} s={0.55} tone="gold" />
          <Leaf x={4} y={0} a={-20} s={0.55} tone="gold" />
          <circle r="1.8" fill="url(#gold-flat)" />
        </Grow>
      </g>
    </svg>
  );
}
