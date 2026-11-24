import { motion } from 'framer-motion';
import { useId } from 'react';
import { invitation } from '../config/invitation';

// Irregular poured-wax outline
const blob = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = 45 + 2.3 * Math.sin(5 * a) + 1.4 * Math.sin(9 * a + 1) + 1.1 * Math.sin(14 * a + 2);
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(' L')}Z`;
})();

const CRACK = [
  [52, -4],
  [47, 16],
  [54, 30],
  [46, 46],
  [55, 58],
  [48, 74],
  [53, 88],
  [50, 104],
];
const crackLine = `M${CRACK.map((p) => p.join(' ')).join(' L')}`;
const CLIP = [[52, -40], ...CRACK, [50, 150]];
const leftClip = `M-40 -40 L${CLIP.map((p) => p.join(' ')).join(' L')} L-40 150Z`;
const rightClip = `M140 -40 L${CLIP.map((p) => p.join(' ')).join(' L')} L140 150Z`;

/** Silk ribbon tails tucked under the seal; each falls away with its half. */
function Tail({ side }: { side: 'l' | 'r' }) {
  const d =
    side === 'l'
      ? 'M40 60 C34 82 26 98 15 118 L19 112 L24 124 C33 104 42 86 48 64Z'
      : 'M60 60 C66 82 74 98 85 118 L81 112 L76 124 C67 104 58 86 52 64Z';
  return (
    <path d={d} fill={side === 'l' ? '#c7a49c' : '#b9958d'} stroke="#a27c74" strokeOpacity=".35" strokeWidth=".5" />
  );
}

function SealFace() {
  const [a, b] = invitation.couple.initials;
  const mono = (fill: string, dx: number, dy: number, opacity = 1) => (
    <g transform={`translate(${dx} ${dy})`} opacity={opacity}>
      <text x="40" y="60" textAnchor="middle" fontFamily="'Pinyon Script', cursive" fontSize="30" fill={fill}>
        {a}
      </text>
      <text x="62" y="66" textAnchor="middle" fontFamily="'Pinyon Script', cursive" fontSize="30" fill={fill}>
        {b}
      </text>
    </g>
  );
  return (
    <>
      <path d={blob} fill="url(#wax)" />
      {/* drips / pooled rim */}
      <path d={blob} fill="none" stroke="#2f3426" strokeOpacity=".35" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="33" fill="url(#wax-inner)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#2c3123" strokeOpacity=".55" strokeWidth="2.2" />
      <circle cx="50" cy="50" r="35.5" fill="none" stroke="#c8cdb0" strokeOpacity=".35" strokeWidth="1" />
      <circle cx="50" cy="50" r="29.5" fill="none" stroke="#2c3123" strokeOpacity=".25" strokeWidth=".6" strokeDasharray="1.2 2.2" />
      {/* embossed initials: shadow, highlight, face */}
      {mono('#262a1e', 0.7, 0.9, 0.55)}
      {mono('#dfe3c8', -0.5, -0.6, 0.45)}
      {mono(invitation.theme.wax[1], 0, 0)}
      {/* sprigs */}
      <path d="M36 74 q14 6 28 0" stroke="#262a1e" strokeOpacity=".4" strokeWidth=".9" fill="none" />
      <path d="M36 73.4 q14 6 28 0" stroke="#dfe3c8" strokeOpacity=".3" strokeWidth=".6" fill="none" />
      {/* glossy highlight */}
      <ellipse cx="36" cy="28" rx="14" ry="6" fill="#fff" opacity=".16" transform="rotate(-28 36 28)" />
    </>
  );
}

/**
 * Wax seal. When `broken` turns true it shakes, cracks along a jagged line,
 * and the two halves fall away.
 */
export function WaxSeal({ broken, className = '' }: { broken: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  const ease = [0.4, 0, 0.6, 1] as const;
  return (
    <motion.svg
      viewBox="-20 -20 140 140"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={broken ? { x: [0, -1.5, 1.5, -1, 0] } : {}}
      transition={{ duration: 0.25 }}
    >
      <defs>
        <clipPath id={`l${id}`}>
          <path d={leftClip} />
        </clipPath>
        <clipPath id={`r${id}`}>
          <path d={rightClip} />
        </clipPath>
      </defs>
      <ellipse cx="52" cy="56" rx="44" ry="42" fill="#2a2b20" opacity={broken ? 0 : 0.22} style={{ transition: 'opacity .3s' }} />
      <motion.g
        clipPath={`url(#l${id})`}
        animate={broken ? { x: -16, y: 90, rotate: -32, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ delay: broken ? 0.25 : 0, duration: 0.85, ease }}
      >
        <Tail side="l" />
        <SealFace />
      </motion.g>
      <motion.g
        clipPath={`url(#r${id})`}
        animate={broken ? { x: 18, y: 100, rotate: 28, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ delay: broken ? 0.3 : 0, duration: 0.85, ease }}
      >
        <Tail side="r" />
        <SealFace />
      </motion.g>
      {/* the crack flashes just before splitting */}
      <motion.path
        d={crackLine}
        fill="none"
        stroke="#f4ecd8"
        strokeWidth="1.2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={broken ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.45, times: [0, 0.6, 1] }}
      />
      {broken &&
        [
          [44, 40, -40, 70],
          [58, 60, 36, 80],
          [50, 24, 8, 95],
          [40, 68, -26, 60],
          [62, 34, 30, 66],
        ].map(([cx, cy, dx, dy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.6 + (i % 3)}
            fill={invitation.theme.wax[1]}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: dx, y: [0, -14, dy], opacity: [0, 1, 0] }}
            transition={{ delay: 0.22, duration: 0.9, ease: 'easeOut' }}
          />
        ))}
    </motion.svg>
  );
}
