import { Draw, gold, Grow, INK, Leaf, Rose, Sprinkle } from './parts';

/** Little garden chapel — ceremony location vignette. */
export function Chapel({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 140 80" className={className} aria-hidden="true">
      <ellipse cx="70" cy="70" rx="64" ry="12" fill="url(#wash-sage)" />
      <ellipse cx="70" cy="42" rx="30" ry="30" fill="url(#wash-gold)" />
      <Draw d="M50 74 V40 L70 24 L90 40 V74" delay={delay} />
      <Draw d="M64 25 V12 M60 16 H68" stroke={gold()} delay={delay + 0.4} />
      <Draw d="M66 22 L70 18 L74 22" delay={delay + 0.4} width={0.8} />
      <Draw d="M62 74 V58 a8 8 0 0 1 16 0 V74" delay={delay + 0.6} />
      <Draw d="M66 44 a4 4 0 0 1 8 0 v6 h-8z" delay={delay + 0.8} width={0.8} />
      <Draw d="M44 46 L50 40 M96 46 L90 40" delay={delay + 0.9} width={0.8} />
      <Draw d="M14 74 H126" delay={delay + 0.2} width={0.7} opacity={0.7} />
      {/* trees */}
      <Draw d="M28 74 V58 M28 64 l-5 -4 M28 62 l5 -5" delay={delay + 0.7} width={0.8} />
      <Draw d="M112 74 V56 M112 62 l-6 -5 M112 60 l5 -5" delay={delay + 0.7} width={0.8} />
      <Grow delay={delay + 1.2}>
        <circle cx="28" cy="52" r="11" fill="url(#wash-sage)" />
        <circle cx="112" cy="50" r="12" fill="url(#wash-sage)" />
        <Leaf x={22} y={54} a={-60} s={0.5} />
        <Leaf x={31} y={50} a={-120} s={0.5} />
        <Leaf x={106} y={52} a={-60} s={0.5} />
        <Leaf x={116} y={48} a={-120} s={0.5} />
        <Rose x={40} y={72} r={4.5} />
        <Rose x={100} y={72} r={4} tone="cream" />
      </Grow>
    </svg>
  );
}

/** Garden pavilion with string lights — reception vignette. */
export function Pavilion({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const bulbs = [30, 42, 54, 66, 78, 90, 102, 114];
  return (
    <svg viewBox="0 0 140 80" className={className} aria-hidden="true">
      <ellipse cx="70" cy="70" rx="64" ry="12" fill="url(#wash-rose)" />
      <Draw d="M36 74 V40 M104 74 V40" delay={delay} />
      <Draw d="M30 42 Q70 6 110 42" delay={delay + 0.2} />
      <Draw d="M30 42 H110" delay={delay + 0.4} width={0.8} />
      <Draw d="M48 74 V62 h44 V74 M52 62 v-3 M88 62 v-3" delay={delay + 0.6} width={0.8} />
      <Draw d="M14 74 H126" delay={delay + 0.2} width={0.7} opacity={0.7} />
      <Draw d="M22 30 Q46 46 70 34 Q94 46 118 30" delay={delay + 0.7} width={0.5} stroke={gold()} />
      <Grow delay={delay + 1.1}>
        {bulbs.map((x, i) => {
          const y = x < 70 ? 30 + Math.sin(((x - 22) / 48) * Math.PI) * 9 + 2 : 30 + Math.sin(((x - 70) / 48) * Math.PI) * 9 + 2;
          return <circle key={i} cx={x} cy={y} r={1.6} fill="#f6e2a8" stroke={gold()} strokeWidth={0.4} />;
        })}
        <Rose x={70} y={22} r={5} />
        <Leaf x={64} y={23} a={190} s={0.45} />
        <Leaf x={76} y={23} a={-10} s={0.45} />
        <Sprinkle x={58} y={58} n={4} spread={4} gold />
        <Sprinkle x={82} y={58} n={4} spread={4} />
      </Grow>
    </svg>
  );
}

export function Gown({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 80 140" className={className} aria-hidden="true">
      <ellipse cx="40" cy="100" rx="34" ry="40" fill="url(#wash-rose)" />
      <Draw d="M40 13 c0 -6 6 -6 6 -2 c0 3 -6 3 -6 7" stroke={gold()} delay={delay} width={0.9} />
      <Draw d="M20 24 L40 16 L60 24" stroke={gold()} delay={delay + 0.1} width={0.9} />
      <Draw d="M32 22 L33 34 M48 22 L47 34" delay={delay + 0.3} width={0.8} />
      <Draw d="M33 34 C36 38 44 38 47 34 L49 52 C44 55 36 55 31 52 Z" delay={delay + 0.4} />
      <Draw d="M31 52 C24 80 14 110 8 134 C30 139 50 139 72 134 C66 110 56 80 49 52" delay={delay + 0.6} duration={2} />
      <Draw d="M40 56 C39 90 36 114 33 136 M45 56 C47 90 51 112 55 135 M35 56 C30 90 24 112 20 134" delay={delay + 1} width={0.6} opacity={0.7} />
      <Grow delay={delay + 1.4}>
        <Rose x={40} y={53} r={3.4} />
      </Grow>
    </svg>
  );
}

export function Suit({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 80 140" className={className} aria-hidden="true">
      <ellipse cx="40" cy="78" rx="34" ry="46" fill="url(#wash-sage)" />
      <Draw d="M40 13 c0 -6 6 -6 6 -2 c0 3 -6 3 -6 7" stroke={gold()} delay={delay} width={0.9} />
      <Draw d="M18 26 L40 18 L62 26" stroke={gold()} delay={delay + 0.1} width={0.9} />
      <Draw d="M22 26 L40 30 L58 26 L66 38 L64 118 L44 122 L40 72 L36 122 L16 118 L14 38 Z" delay={delay + 0.3} duration={2} />
      <Draw d="M40 30 L31 46 L40 72 M40 30 L49 46 L40 72" delay={delay + 0.7} width={0.8} />
      <Draw d="M35 34 L40 37 L35 40 Z M45 34 L40 37 L45 40 Z" delay={delay + 0.9} width={0.8} stroke={INK} />
      <Draw d="M50 52 l9 -2 M20 92 h10 M50 92 h10" delay={delay + 1} width={0.7} />
      <Grow delay={delay + 1.3}>
        <circle cx="40" cy="84" r="1.3" fill={INK} />
        <circle cx="40" cy="96" r="1.3" fill={INK} />
        <Rose x={53} y={46} r={3} tone="cream" />
        <Leaf x={55} y={48} a={30} s={0.3} />
      </Grow>
    </svg>
  );
}

/** Line vignettes used as photo placeholders on the story page. */
export function StoryVignette({ kind, className = '' }: { kind: 'meet' | 'date' | 'proposal' | 'forever'; className?: string }) {
  const d = 0.4;
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden="true">
      {kind === 'meet' && (
        <>
          <Draw d="M20 66 C30 40 40 30 50 30 C60 30 70 40 80 66" delay={d} opacity={0.5} width={0.7} />
          <Draw d="M34 60 a6 6 0 1 1 0.01 0 M34 60 v-2" delay={d} />
          <Draw d="M30 70 v-8 h8 v8" delay={d + 0.2} width={0.8} />
          <Draw d="M66 60 a6 6 0 1 1 0.01 0" delay={d + 0.2} />
          <Draw d="M62 70 v-8 h8 v8" delay={d + 0.3} width={0.8} />
          <Draw d="M44 40 c2 -4 8 -4 6 1 c-1 3 -6 5 -6 7 c0 -2 -5 -4 -6 -7 c-2 -5 4 -5 6 -1" stroke="#b48a82" delay={d + 0.8} />
        </>
      )}
      {kind === 'date' && (
        <>
          <Draw d="M30 34 h18 v10 a9 9 0 0 1 -18 0z M48 37 a4 4 0 0 1 0 7" delay={d} />
          <Draw d="M56 30 h14 l-2 18 h-10z M63 48 v14 M56 62 h14" delay={d + 0.3} />
          <Draw d="M36 28 c-2 -4 2 -6 0 -10 M42 28 c-2 -4 2 -6 0 -10" delay={d + 0.6} width={0.7} opacity={0.7} />
          <Draw d="M18 64 H82" delay={d} width={0.6} opacity={0.6} />
        </>
      )}
      {kind === 'proposal' && (
        <>
          <Draw d="M50 52 a12 12 0 1 1 0.01 0" stroke={gold()} delay={d} width={1.3} />
          <Draw d="M44 30 L50 22 L56 30 L50 36 Z" delay={d + 0.4} />
          <Draw d="M44 30 H56 M50 22 L48 30 L50 36 L52 30 Z" delay={d + 0.6} width={0.6} />
          <Draw d="M30 22 l2 -4 l2 4 l-2 4z M70 26 l1.5 -3 l1.5 3 l-1.5 3z" stroke={gold()} delay={d + 0.9} width={0.7} />
        </>
      )}
      {kind === 'forever' && (
        <>
          <Draw d="M50 42 C40 28 22 28 22 42 C22 56 40 56 50 42 C60 28 78 28 78 42 C78 56 60 56 50 42" stroke={gold()} delay={d} width={1.2} duration={2.2} />
          <Grow delay={d + 1.2}>
            <Rose x={50} y={64} r={6} />
            <Leaf x={42} y={65} a={190} s={0.5} />
            <Leaf x={58} y={65} a={-10} s={0.5} />
          </Grow>
        </>
      )}
    </svg>
  );
}
