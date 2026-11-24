import type { CSSProperties, ReactNode } from 'react';
import { invitation } from '../../config/invitation';

export const INK = '#5a6048';
/** current palette's gold (read at render time, so palette swaps apply) */
export const gold = () => invitation.theme.colors.gold;

/**
 * A line that draws itself. Pure CSS animation (no per-frame JavaScript),
 * so dozens of these stay smooth on modest phones.
 */
export function Draw({
  d,
  delay = 0,
  duration = 1.6,
  stroke = INK,
  width = 1,
  opacity = 1,
  animate = true,
}: {
  d: string;
  delay?: number;
  duration?: number;
  stroke?: string;
  width?: number;
  opacity?: number;
  animate?: boolean;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      className={animate ? 'svg-draw' : undefined}
      style={animate ? { animationDelay: `${delay}s`, animationDuration: `${duration}s` } : undefined}
    />
  );
}

/** Element that grows in from its own center (CSS animation). */
export function Grow({
  children,
  delay = 0,
  animate = true,
  from = 0.3,
}: {
  children: ReactNode;
  delay?: number;
  animate?: boolean;
  from?: number;
}) {
  return (
    <g
      className={animate ? 'svg-grow' : undefined}
      style={animate ? ({ animationDelay: `${delay}s`, '--grow-from': from } as CSSProperties) : undefined}
    >
      {children}
    </g>
  );
}

const LEAF = 'M0 0 C5 -6.5 15 -7.5 22 0 C15 7.5 5 6.5 0 0Z';

export function Leaf({ x, y, a, s = 1, tone = 'sage' }: { x: number; y: number; a: number; s?: number; tone?: 'sage' | 'gold' }) {
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a.toFixed(1)}) scale(${s.toFixed(3)})`}>
      <path
        d={LEAF}
        fill={tone === 'gold' ? 'url(#gold-flat)' : 'url(#leaf-sage)'}
        fillOpacity={tone === 'gold' ? 0.9 : 0.62}
        stroke={tone === 'gold' ? '#a8843f' : INK}
        strokeWidth={0.55}
      />
      <path d="M1.5 0 Q11 -0.8 19 0" stroke={tone === 'gold' ? '#8f6f34' : INK} strokeWidth={0.45} fill="none" opacity={0.7} />
    </g>
  );
}

/** Watercolor garden rose. */
export function Rose({ x, y, r, tone = 'rose', rot = 0 }: { x: number; y: number; r: number; tone?: 'rose' | 'cream'; rot?: number }) {
  const fill = tone === 'rose' ? 'url(#petal-rose)' : 'url(#petal-cream)';
  const edge = tone === 'rose' ? '#b48a82' : '#c9b48d';
  const outer = Array.from({ length: 6 }, (_, i) => i * 60 + rot);
  const inner = Array.from({ length: 4 }, (_, i) => i * 90 + rot + 30);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.6} fill={tone === 'rose' ? 'url(#wash-rose)' : 'url(#wash-gold)'} />
      {outer.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <ellipse
            key={`o${a}`}
            cx={Math.cos(rad) * r * 0.45}
            cy={Math.sin(rad) * r * 0.45}
            rx={r * 0.58}
            ry={r * 0.44}
            transform={`rotate(${a} ${Math.cos(rad) * r * 0.45} ${Math.sin(rad) * r * 0.45})`}
            fill={fill}
            stroke={edge}
            strokeWidth={0.5}
            opacity={0.95}
          />
        );
      })}
      {inner.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <ellipse
            key={`i${a}`}
            cx={Math.cos(rad) * r * 0.2}
            cy={Math.sin(rad) * r * 0.2}
            rx={r * 0.38}
            ry={r * 0.27}
            transform={`rotate(${a} ${Math.cos(rad) * r * 0.2} ${Math.sin(rad) * r * 0.2})`}
            fill={fill}
            stroke={edge}
            strokeWidth={0.45}
          />
        );
      })}
      <circle r={r * 0.2} fill={tone === 'rose' ? 'url(#rose-heart)' : '#d8c39b'} />
      <path
        d={`M${-r * 0.12} ${r * 0.02} a${r * 0.13} ${r * 0.13} 0 1 1 ${r * 0.2} ${r * 0.07} M${-r * 0.3} ${-r * 0.05} q${r * 0.1} ${-r * 0.3} ${r * 0.42} ${-r * 0.2}`}
        fill="none"
        stroke={tone === 'rose' ? '#9b6c64' : '#b19a6d'}
        strokeWidth={0.6}
        strokeLinecap="round"
      />
    </g>
  );
}

export function Bud({ x, y, a = 0, s = 1 }: { x: number; y: number; a?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d="M0 0 C-4 -3 -4 -10 0 -14 C4 -10 4 -3 0 0Z" fill="url(#petal-rose)" stroke="#b48a82" strokeWidth={0.5} />
      <path d="M0 1 C-3 -2 -5 -4 -5 -7 M0 1 C3 -2 5 -4 5 -7" stroke={INK} strokeWidth={0.6} fill="none" />
    </g>
  );
}

/** Baby's breath / gold berries cluster */
export function Sprinkle({ x, y, n = 7, spread = 10, gold = false }: { x: number; y: number; n?: number; spread?: number; gold?: boolean }) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = i * 2.39996;
    const d = spread * Math.sqrt((i + 0.5) / n);
    return [x + Math.cos(a) * d, y + Math.sin(a) * d] as const;
  });
  return (
    <g>
      {pts.map(([px, py], i) => (
        <g key={i}>
          <line x1={x} y1={y + spread * 0.9} x2={px} y2={py} stroke={INK} strokeWidth={0.35} opacity={0.6} />
          <circle cx={px} cy={py} r={gold ? 1.3 : 1.6} fill={gold ? 'url(#gold-flat)' : '#fffaf0'} stroke={gold ? '#a8843f' : '#bdb59c'} strokeWidth={0.4} />
        </g>
      ))}
    </g>
  );
}
